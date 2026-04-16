// Inventory layer backed by Upstash Redis (provisioned via Vercel KV or direct
// Upstash). Falls back to catalog.json stock when KV isn't configured, so the
// site keeps working in dev / preview environments without credentials.
//
// Data model:
//   stock:<product_id>  →  integer count remaining
//   event:<event_id>    →  dedup marker (TTL'd so the key space doesn't grow forever)
//
// Semantics:
//   - getStock(id): read-through with seed-on-first-read from catalog.json.
//   - decrementStock(id): atomic DECR; seeds from JSON if not yet present.
//   - markEventProcessed(id): atomic SET NX with long TTL; returns `true` if
//     this is the first time we've seen the event, `false` if a duplicate.
import { Redis } from "@upstash/redis";
import { getProduct } from "@/lib/catalog";

// 90 days — well past Stripe's webhook retry horizon.
const EVENT_TTL_SECONDS = 60 * 60 * 24 * 90;

let cachedClient: Redis | null | undefined;

function getClient(): Redis | null {
  if (cachedClient !== undefined) return cachedClient;

  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    cachedClient = null;
    return null;
  }

  cachedClient = new Redis({ url, token });
  return cachedClient;
}

export function inventoryEnabled(): boolean {
  return getClient() !== null;
}

/**
 * Returns the current stock for a product. Reads from KV when configured,
 * seeding from catalog.json on first access. Falls back to the JSON value
 * when KV is unavailable so dev environments keep working.
 */
export async function getStock(productId: string): Promise<number> {
  const fallback = getProduct(productId)?.stock ?? 0;

  const redis = getClient();
  if (!redis) return fallback;

  try {
    const raw = await redis.get<number | string | null>(`stock:${productId}`);
    if (raw === null || raw === undefined) {
      // Seed atomically — NX so concurrent readers don't race.
      await redis.set(`stock:${productId}`, fallback, { nx: true });
      return fallback;
    }
    return typeof raw === "number" ? raw : Number(raw);
  } catch (err) {
    console.error(`[inventory] getStock(${productId}) failed:`, err);
    return fallback;
  }
}

/**
 * Decrements stock atomically and returns the new value. Seeds from
 * catalog.json before decrementing if the key doesn't exist yet.
 *
 * Returns `null` when KV isn't configured so callers can distinguish
 * "not decremented" from "decremented to zero."
 */
export async function decrementStock(
  productId: string
): Promise<number | null> {
  const redis = getClient();
  if (!redis) return null;

  try {
    // Ensure seeded before decrementing — otherwise the first DECR would
    // produce -1 instead of (seed - 1).
    await getStock(productId);
    const next = await redis.decr(`stock:${productId}`);
    if (next < 0) {
      console.warn(
        `[inventory] stock:${productId} decremented below zero (now ${next}) — possible oversell`
      );
    }
    return next;
  } catch (err) {
    console.error(`[inventory] decrementStock(${productId}) failed:`, err);
    return null;
  }
}

/**
 * Records that we've handled this Stripe event. Returns `true` on the first
 * call for a given event ID, `false` on any subsequent call (i.e. a duplicate
 * webhook delivery). Falls open (returns `true`) when KV isn't configured —
 * in that degraded mode we can't dedupe, so callers proceed and accept the
 * risk of duplicate emails on Stripe retries.
 */
export async function markEventProcessed(eventId: string): Promise<boolean> {
  const redis = getClient();
  if (!redis) return true;

  try {
    const result = await redis.set(`event:${eventId}`, "1", {
      nx: true,
      ex: EVENT_TTL_SECONDS,
    });
    return result === "OK";
  } catch (err) {
    console.error(`[inventory] markEventProcessed(${eventId}) failed:`, err);
    // Fall open: we'd rather send a duplicate email than drop an order.
    return true;
  }
}
