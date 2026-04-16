import Stripe from "stripe";
import { getProduct } from "@/lib/catalog";
import { getStock } from "@/lib/inventory";

/**
 * Lazy Stripe client — only constructed on first use so modules that import
 * from this file don't blow up at load time when STRIPE_SECRET_KEY is missing
 * (common in preview/dev environments). The error surfaces at checkout time
 * with a clear message instead of an opaque module-load crash.
 */
let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your Vercel environment variables " +
        "(Dashboard → Settings → Environment Variables). Use your sk_test_… key " +
        "for test mode."
    );
  }
  _stripe = new Stripe(key);
  return _stripe;
}

export async function createCheckoutSession(
  productId: string,
  origin: string
): Promise<{ url: string; session_id: string }> {
  const product = getProduct(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const stock = await getStock(productId);
  if (stock === 0) {
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

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create(sessionParams);
  return { url: session.url!, session_id: session.id };
}
