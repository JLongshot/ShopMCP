export const metadata = {
  title: "Terms of Service — The Agent Catalog",
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px" }}>
      <a href="/" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>
        &larr; The Agent Catalog
      </a>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 32, marginBottom: 8 }}>
        Terms of Service
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
            The shop
          </h2>
          <p>
            The Agent Catalog is a small online shop operated by an individual (Jared). It sells
            physical goods, digital items, and personal creative services. Every item listed is
            real and every purchase is personally fulfilled by Jared.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
            Orders and payment
          </h2>
          <p>
            Orders are processed through Stripe. By completing a purchase you agree to
            Stripe&apos;s terms of service. Prices are listed in US dollars and include the item
            price only; shipping is a separate flat rate shown at checkout for physical items.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
            Sales are final
          </h2>
          <p>
            All sales are final. Refunds are only issued if your item does not arrive within a
            reasonable timeframe or is materially not as described. To request a refund, email{" "}
            <a href="mailto:ovenbeard@gmail.com" style={{ color: "var(--fg)" }}>
              ovenbeard@gmail.com
            </a>{" "}
            with your order details.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
            Shipping and fulfillment
          </h2>
          <p>
            Physical items ship USPS, domestic US only. Estimated delivery is 5–10 business days
            after shipment. We cannot ship internationally at this time.
          </p>
          <p style={{ marginTop: 12 }}>
            Services are fulfilled personally by Jared within two weeks of purchase. Digital items
            are delivered by email within 24–48 hours.
          </p>
          <p style={{ marginTop: 12 }}>
            If a fulfillment deadline cannot be met, you will be notified and offered a full
            refund.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
            Availability
          </h2>
          <p>
            Stock is real and finite. If an item sells out between when you start checkout and
            when your payment is processed, we will issue a full refund and notify you by email.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
            Jurisdiction
          </h2>
          <p>
            These terms are governed by the laws of the state in which the operator resides.
            Any disputes will be resolved in the courts of that jurisdiction.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
            Contact
          </h2>
          <p>
            Questions:{" "}
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
