import Stripe from "stripe";
import { isTestMode as getIsTestMode } from "@/lib/stripe-mode";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const isTestMode = getIsTestMode();

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return <ErrorMessage />;
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });
  } catch {
    return <ErrorMessage />;
  }

  if (session.payment_status !== "paid") {
    return <ErrorMessage />;
  }

  const productName = session.metadata?.product_name ?? "your item";
  const shortId = session_id.slice(-8).toUpperCase();

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <p style={{ fontSize: 32, marginBottom: 16 }}>✓</p>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Thanks — Jared got your order.
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, marginBottom: 8 }}>
        <strong style={{ color: "var(--fg)" }}>{productName}</strong> is on its way to being
        fulfilled. You&apos;ll get a Stripe receipt at the email you provided.
      </p>
      <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 24 }}>
        Order reference: <code style={{ fontFamily: "monospace" }}>{shortId}</code>
      </p>
      {isTestMode && (
        <p style={{ marginTop: 48, fontSize: 12, color: "var(--muted)" }}>
          Test mode — no real money moved.
        </p>
      )}
    </main>
  );
}

function ErrorMessage() {
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Hmm.</h1>
      <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6 }}>
        We don&apos;t have a record of that payment yet. If you just completed checkout, try
        refreshing in a moment. If this keeps happening, email Jared directly.
      </p>
    </main>
  );
}
