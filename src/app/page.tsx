import Link from "next/link";

export default function HomePage() {
  const shop = "demo-store.myshopify.com";
  const oauthUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID ?? "YOUR_CLIENT_ID"}&scope=read_products,write_orders&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/oauth/callback`;

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Ecommerce Integration Starter</h1>
      <p>
        A production-ready template for connecting to Shopify (or any OAuth-based platform):
        OAuth install, HMAC-verified webhooks, and automated product sync into Supabase.
      </p>

      <h2>Quick Start</h2>
      <ol>
        <li>Copy <code>.env.example</code> to <code>.env.local</code> and fill in your values</li>
        <li>Run <code>npm run dev</code></li>
        <li>
          <a href={oauthUrl}>Connect your store via OAuth</a>
        </li>
        <li>
          <Link href="/dashboard">View the sync dashboard</Link>
        </li>
      </ol>
    </main>
  );
}
