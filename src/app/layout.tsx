import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/url";
import { isTestMode, BANNER_HEIGHT } from "@/lib/stripe-mode";
import { TestModeBanner } from "./test-mode-banner";
import "./globals.css";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "The Agent Catalog — A curated online shop",
  description:
    "A small curated shop selling physical goods, digital items, and personal creative services. " +
    "Explore the catalog directly, or have an AI agent shop for you.",
  other: {
    "x-llms-txt": `${baseUrl}/llms.txt`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bannerPad = isTestMode() ? BANNER_HEIGHT : 0;

  return (
    <html lang="en">
      <head>
        <link
          rel="alternate"
          type="text/markdown"
          href="/llms.txt"
          title="LLM-readable catalog and shopping instructions"
        />
      </head>
      <body style={{ paddingTop: bannerPad }}>
        <TestModeBanner />
        {children}
      </body>
    </html>
  );
}
