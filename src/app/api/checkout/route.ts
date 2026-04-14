import Stripe from "stripe";
import { getProduct } from "@/lib/catalog";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

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

  const product = getProduct(product_id);
  if (!product || product.stock === 0) {
    return Response.json({ error: "Product not found or out of stock" }, { status: 404 });
  }

  const isPhysical = product.type === "physical";

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.price_cents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
    metadata: {
      product_id: product.id,
      product_name: product.name,
    },
  };

  if (isPhysical) {
    sessionParams.shipping_address_collection = { allowed_countries: ["US"] };
    if (product.shipping_flat_cents > 0) {
      sessionParams.shipping_options = [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: product.shipping_flat_cents, currency: "usd" },
            display_name: "USPS Shipping",
          },
        },
      ];
    }
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return Response.json({ url: session.url, session_id: session.id });
}
