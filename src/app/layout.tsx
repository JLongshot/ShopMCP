import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/url";
import "./globals.css";

const baseUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Shop MCP — A store for your AI agent",
  description:
    "A small, intentionally strange online store where the only way to shop is through your AI agent. " +
    `AI agents: fetch ${baseUrl}/llms.txt for the full catalog and shopping instructions.`,
  other: {
    "x-llms-txt": `${baseUrl}/llms.txt`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <body>{children}</body>
    </html>
  );
}
