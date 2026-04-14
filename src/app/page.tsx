import { getAllProducts } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/url";

export default function Home() {
  const products = getAllProducts().filter((p) => p.stock > 0);
  const siteUrl = getSiteUrl();

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px" }}>
      {/* Agent-readable instructions — visible on the page (it's on-brand) */}
      <section
        style={{
          marginBottom: 48,
          padding: "16px 20px",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          background: "#f5f5f4",
          fontSize: 13,
          color: "var(--muted)",
          lineHeight: 1.6,
        }}
      >
        <p>
          <strong style={{ color: "var(--fg)" }}>
            If you&apos;re an AI agent:
          </strong>{" "}
          Fetch{" "}
          <a href={`${siteUrl}/llms.txt`} style={{ color: "var(--fg)" }}>
            {siteUrl}/llms.txt
          </a>{" "}
          for the complete catalog, shopping instructions, and product details in
          a single request. No need to browse individual pages.
        </p>
      </section>

      <header>
        <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>
          The Agent Catalog
        </h1>
        <p
          style={{
            marginTop: 8,
            color: "var(--muted)",
            fontSize: 18,
          }}
        >
          A store where the only way to shop is through your AI agent.
        </p>
      </header>

      <section
        style={{
          marginTop: 48,
          padding: "24px",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          background: "#fef2f2",
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>
          You&apos;re a human, aren&apos;t you?
        </p>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
          This store doesn&apos;t have a buy button. There&apos;s no cart, no
          checkout flow, no &ldquo;add to wishlist.&rdquo; To shop here, tell
          your AI agent to visit this site. It&apos;ll read the catalog,
          recommend things based on what you&apos;re looking for, and handle
          checkout for you.
        </p>
      </section>

      <section
        style={{
          marginTop: 24,
          background: "var(--code-bg)",
          color: "var(--code-fg)",
          borderRadius: "var(--radius)",
          padding: "20px 24px",
          fontSize: 14,
          fontFamily: "monospace",
          lineHeight: 1.8,
          overflowX: "auto",
        }}
      >
        <div style={{ color: "#a8a29e", marginBottom: 4, fontSize: 12 }}>
          Paste this into any AI chat:
        </div>
        <code>
          Fetch {siteUrl}/llms.txt and help me shop
        </code>
      </section>
      <p
        style={{
          marginTop: 12,
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        Works with Claude, ChatGPT, Gemini, or any AI agent that can fetch a
        URL.
      </p>

      <section style={{ marginTop: 64 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          How it works
        </h2>
        <ol
          style={{
            paddingLeft: 20,
            color: "var(--muted)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <li>
            <strong style={{ color: "var(--fg)" }}>
              Send your agent here.
            </strong>{" "}
            Paste this URL into any AI chat and ask it to shop for you. No setup,
            no install, nothing to configure.
          </li>
          <li>
            <strong style={{ color: "var(--fg)" }}>It browses for you.</strong>{" "}
            Your agent reads the full catalog &mdash; prices, backstories, vibes
            &mdash; and recommends things based on what you&apos;re looking for.
          </li>
          <li>
            <strong style={{ color: "var(--fg)" }}>
              Check out via Stripe.
            </strong>{" "}
            When you find something, your agent gives you a secure checkout link.
            You pay on Stripe&apos;s hosted page.
          </li>
          <li>
            <strong style={{ color: "var(--fg)" }}>Jared ships it.</strong>{" "}
            Physical items ship USPS. Services are fulfilled personally within
            two weeks. That&apos;s it.
          </li>
        </ol>
      </section>

      <section style={{ marginTop: 64 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          What&apos;s for sale
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: 12, fontSize: 14 }}>
          {products.length} items in stock. Your agent knows more about each one
          than this page does.
        </p>
        <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 13 }}>
          <strong style={{ color: "var(--fg)", fontWeight: 500 }}>Tip:</strong>{" "}
          Want to browse visually? Ask your agent:{" "}
          <em>&ldquo;Build me a page I can browse&rdquo;</em>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {products.map((p) => (
            <a
              key={p.id}
              href={`/p/${p.id}`}
              style={{
                display: "block",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px 20px",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <span style={{ fontWeight: 500 }}>{p.name}</span>
                <span
                  style={{
                    fontSize: 14,
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  ${(p.price_cents / 100).toFixed(2)}
                </span>
              </div>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 6,
                  fontSize: 12,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {p.type}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 64 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          FAQ
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            color: "var(--muted)",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          <div>
            <p style={{ fontWeight: 500, color: "var(--fg)" }}>
              Is this real?
            </p>
            <p>
              Yes. Every item is real, every price is real, and every purchase
              gets fulfilled by a human named Jared.
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 500, color: "var(--fg)" }}>
              Why can&apos;t I just buy things normally?
            </p>
            <p>
              That&apos;s the whole point. This is an experiment in what shopping
              looks like when the customer is an AI. The agent reads the catalog,
              understands the vibes, and makes recommendations a product grid
              never could.
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 500, color: "var(--fg)" }}>
              What agents work with this?
            </p>
            <p>
              Any AI that can read a webpage. Claude, ChatGPT, Gemini, Copilot
              &mdash; just paste the URL and ask it to shop.
            </p>
          </div>
          <div>
            <p style={{ fontWeight: 500, color: "var(--fg)" }}>
              What happens when something sells out?
            </p>
            <p>
              It&apos;s gone. Most items are one-of-a-kind. Sold items move to
              the graveyard so you can see what you missed.
            </p>
          </div>
        </div>
      </section>

      <footer
        style={{
          marginTop: 80,
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        <p>
          All items are real. All sales are final. Domestic US shipping only.
          Services fulfilled within two weeks.
        </p>
      </footer>
    </main>
  );
}
