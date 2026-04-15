import { createCheckoutSession } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/url";

export async function GET(req: Request) {
  const origin = req.headers.get("origin") ?? getSiteUrl();
  const product_id = new URL(req.url).searchParams.get("product_id");

  if (!product_id) {
    return Response.json({ error: "product_id is required" }, { status: 400 });
  }

  try {
    const result = await createCheckoutSession(product_id, origin);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("not found") ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin") ?? getSiteUrl();

  let product_id: string;
  try {
    const body = await req.json();
    product_id = body?.product_id;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!product_id) {
    return Response.json({ error: "product_id is required" }, { status: 400 });
  }

  try {
    const result = await createCheckoutSession(product_id, origin);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("not found") ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}
