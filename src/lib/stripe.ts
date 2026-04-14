import Stripe from "stripe";
import { getProduct } from "@/lib/catalog";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(
  productId: string,
  origin: string
): Promise<{ url: string; session_id: string }> {
  const product = getProduct(productId);
  if (!product || product.stock === 0) {
    throw new Error("Product not found or out of stock");
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
  return { url: session.url!, session_id: session.id };
}
