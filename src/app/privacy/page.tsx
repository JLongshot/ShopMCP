export const metadata = {
  title: "Privacy Policy — The Agent Catalog",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px" }}>
      <a href="/" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>
        &larr; The Agent Catalog
      </a>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 40 }}>
        Last updated: April 2026
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
          fontSize: 15,
          lineHeight: 1.7,
          color: "var(--muted)",
        }}
      >
        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
            What we collect
          </h2>
          <p>
            When you place an order, we collect your email address and — for physical items — your
            shipping address. This information is provided through Stripe&apos;s hosted checkout
            page and is used solely to fulfill your order.
          </p>
          <p style={{ marginTop: 12 }}>
            We do not collect any information through the site itself beyond what is submitted
            during checkout. We do not use cookies for tracking, and we do not collect analytics
            about visitors.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
            How we use it
          </h2>
          <p>
            Your email is used to send you an order confirmation and, for physical items, shipping
            updates. Your shipping address is used to mail your order. We do not use your
            information for marketing or share it with third parties for advertising purposes.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
            Third parties
          </h2>
          <p>
            We use two third-party services to process your order:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>
              <strong style={{ color: "var(--fg)" }}>Stripe</strong> — handles payment processing.
              Your card details go directly to Stripe and are never seen by us. Stripe&apos;s
              privacy policy is at stripe.com/privacy.
            </li>
            <li>
              <strong style={{ color: "var(--fg)" }}>Resend</strong> — handles transactional
              email. Your email address is passed to Resend to deliver your order confirmation.
              Resend&apos;s privacy policy is at resend.com/legal/privacy-policy.
            </li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
            Data retention
          </h2>
          <p>
            Order records are retained for as long as necessary to fulfill the order and comply
            with any applicable legal obligations. We do not sell your data — ever.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
            Contact
          </h2>
          <p>
            Questions about this policy or your data:{" "}
            <a href="mailto:ovenbeard@gmail.com" style={{ color: "var(--fg)" }}>
              ovenbeard@gmail.com
            </a>
          </p>
        </section>
      </div>

      <footer
        style={{
          marginTop: 80,
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        <a href="/" style={{ color: "var(--muted)" }}>The Agent Catalog</a>
        {" · "}
        <a href="/privacy" style={{ color: "var(--muted)" }}>Privacy</a>
        {" · "}
        <a href="/terms" style={{ color: "var(--muted)" }}>Terms</a>
        {" · "}
        <a href="mailto:ovenbeard@gmail.com" style={{ color: "var(--muted)" }}>ovenbeard@gmail.com</a>
      </footer>
    </main>
  );
}
