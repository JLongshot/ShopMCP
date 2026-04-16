import Stripe from "stripe";
import { Resend } from "resend";
import { getProduct } from "@/lib/catalog";
import { decrementStock, markEventProcessed } from "@/lib/inventory";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Raw body required for signature verification — disable Next.js body parsing
export const runtime = "nodejs";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return Response.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature verification failed";
    console.error("[webhook] Signature verification failed:", message);
    return Response.json({ error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return Response.json({ received: true });
  }

  // Idempotency: only process each event.id once. Stripe retries delivery
  // until it gets a 2xx; without this, a transient email failure would
  // cause duplicate fulfillment on the retry.
  const isFirstDelivery = await markEventProcessed(event.id);
  if (!isFirstDelivery) {
    console.log(`[webhook] duplicate event ${event.id}, skipping`);
    return Response.json({ received: true, duplicate: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const productId = session.metadata?.product_id;
  const productName = session.metadata?.product_name ?? "Unknown product";
  const buyerEmail = session.customer_details?.email ?? null;
  const amountPaid = session.amount_total != null
    ? `$${(session.amount_total / 100).toFixed(2)}`
    : "unknown";

  const product = productId ? getProduct(productId) : null;
  const productType = product?.type ?? "digital";

  // Decrement inventory before notifications — if the decrement fails we
  // still want to email the operator so Jared can reconcile manually.
  if (productId) {
    const remaining = await decrementStock(productId);
    if (remaining !== null) {
      console.log(
        `[webhook] decremented stock:${productId} → ${remaining}`
      );
    }
  }

  // Build shipping block for physical items (SDK v22: shipping in collected_information)
  const shippingDetails = session.collected_information?.shipping_details;
  const shippingBlock = shippingDetails?.address
    ? [
        shippingDetails.name,
        shippingDetails.address.line1,
        shippingDetails.address.line2,
        `${shippingDetails.address.city}, ${shippingDetails.address.state} ${shippingDetails.address.postal_code}`,
      ]
        .filter(Boolean)
        .join("\n")
    : null;

  const dashboardUrl = `https://dashboard.stripe.com/payments/${session.payment_intent}`;

  // Fulfillment note for buyer email based on product type
  const fulfillmentNote =
    productType === "physical"
      ? "I'll ship it to you via USPS within two weeks. You'll get a Stripe receipt at this address."
      : productType === "service"
      ? "I'll have this fulfilled within two weeks. Jared will reach out directly to coordinate."
      : "You'll receive this within 24–48 hours. Keep an eye on your inbox.";

  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("[webhook] RESEND_API_KEY not set — skipping emails");
    } else {
      const resend = new Resend(resendKey);

      // Operator notification
      const operatorBody = [
        `New order on The Agent Catalog.`,
        ``,
        `Product: ${productName}`,
        `Amount paid: ${amountPaid}`,
        `Buyer: ${buyerEmail ?? "unknown"}`,
        shippingBlock ? `\nShip to:\n${shippingBlock}` : "",
        ``,
        `Stripe: ${dashboardUrl}`,
      ]
        .join("\n")
        .trim();

      await resend.emails.send({
        from: "orders@theagentcatalog.com",
        to: "ovenbeard@gmail.com",
        subject: `[Agent Catalog] New order — ${productName}`,
        text: operatorBody,
      });

      // Buyer confirmation
      if (buyerEmail) {
        const buyerBody = [
          `Hey — thanks for your order.`,
          ``,
          `You bought: ${productName}`,
          ``,
          fulfillmentNote,
          ``,
          `Questions? ovenbeard@gmail.com.`,
          ``,
          `— Jared`,
        ].join("\n");

        await resend.emails.send({
          from: "orders@theagentcatalog.com",
          to: buyerEmail,
          subject: `Thanks for your order — The Agent Catalog`,
          text: buyerBody,
        });
      }
    }
  } catch (emailErr) {
    // Email failure must not 500 — Stripe would retry the webhook
    console.error("[webhook] Email send failed:", emailErr);
  }

  return Response.json({ received: true });
}
