# ecommerce-integration-starter

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dalerks/ecommerce-integration-starter)

> Production-ready Next.js + TypeScript starter for connecting ecommerce platforms (Shopify, etc.) via OAuth, receiving HMAC-verified webhooks, and syncing product data into Supabase — deploy to Vercel in minutes.

## Business Problem Solved

Merchants need their Shopify store connected to custom portals, ERPs, fulfillment systems, or analytics tools. Every such integration requires the same three things: **OAuth to authorize access**, **webhooks to receive real-time events**, and **a sync job to pull catalog/order data**. This starter wires all three together so you ship the integration layer in days, not weeks.

## What It Does

| Feature | Description |
|---|---|
| OAuth install flow | `/api/oauth/callback` exchanges auth code for access token, stores it in Supabase |
| Webhook receiver | `/api/webhooks/orders` verifies HMAC-SHA256 signature, stores events idempotently |
| Product sync | `/api/sync/products` pulls the full product catalog and upserts into Supabase |
| Sync dashboard | `/dashboard` shows live product count and recent webhook events (server component) |

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Server components + API routes in one deploy |
| Language | TypeScript (strict) | Type-safe API payloads and DB rows |
| Database | Supabase (PostgreSQL) | Managed Postgres + auth + realtime, free tier |
| Deploy | Vercel | Zero-config Next.js hosting, edge functions |
| Auth | OAuth 2.0 + HMAC-SHA256 | Industry standard for platform integrations |

## Architecture

```
Browser / Merchant Store
         │
         │ 1. OAuth install redirect
         ▼
┌────────────────────────┐
│  /api/oauth/callback   │  Exchanges code → access_token
│                        │  Stores in oauth_tokens table
└────────────┬───────────┘
             │
             │ 2. Store registered with access token
             ▼
┌────────────────────────┐       ┌─────────────────────┐
│  /api/sync/products    │──────▶│  Supabase           │
│  POST { shop }         │       │  products table      │
│  Fetches catalog,      │       │  (upsert on sku)     │
│  upserts rows          │       └─────────────────────┘
└────────────────────────┘
             │
             │ 3. Platform sends webhook events
             ▼
┌────────────────────────┐       ┌─────────────────────┐
│  /api/webhooks/orders  │──────▶│  webhook_events      │
│  Verifies HMAC sig     │       │  (idempotent insert) │
│  Stores raw payload    │       └─────────────────────┘
└────────────────────────┘
             │
             ▼
┌────────────────────────┐
│  /dashboard            │  Server component reads
│                        │  live counts + event log
└────────────────────────┘
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── oauth/callback/route.ts     # OAuth token exchange + storage
│   │   ├── webhooks/orders/route.ts    # HMAC-verified webhook receiver
│   │   └── sync/products/route.ts      # Product catalog sync job
│   ├── dashboard/page.tsx              # Server component sync status UI
│   ├── page.tsx                        # Landing / connect flow
│   └── layout.tsx
└── lib/
    ├── supabase.ts                     # Supabase client (anon + service role)
    └── shopify.ts                      # API client + HMAC verification
supabase/
└── migrations/001_init.sql             # products, webhook_events, oauth_tokens
```

## Setup

### Prerequisites

- Node.js 20+
- Supabase project ([free tier works](https://supabase.com))
- Shopify Partner account (or any OAuth platform)

### Local Development

```bash
git clone https://github.com/dalerks/ecommerce-integration-starter
cd ecommerce-integration-starter
npm install
cp .env.example .env.local
# Fill in .env.local — see below
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

OAUTH_CLIENT_ID=your_shopify_api_key
OAUTH_CLIENT_SECRET=your_shopify_api_secret
OAUTH_REDIRECT_URI=http://localhost:3000/api/oauth/callback

WEBHOOK_SECRET=your_webhook_signing_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database

Run the migration in your Supabase SQL editor:

```bash
# paste contents of supabase/migrations/001_init.sql
```

This creates three tables: `products`, `webhook_events`, `oauth_tokens`.

### Trigger a Product Sync

```bash
curl -X POST http://localhost:3000/api/sync/products \
  -H "Content-Type: application/json" \
  -d '{"shop": "your-store.myshopify.com"}'
# {"synced": 47}
```

### Test Webhook Delivery

```bash
# Send a mock order event (skip signature for local dev with a test secret)
curl -X POST http://localhost:3000/api/webhooks/orders \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: orders/create" \
  -H "X-Shopify-Hmac-Sha256: <computed_sig>" \
  -d '{"id": 12345, "financial_status": "paid"}'
```

## Deploy to Vercel

Click the button at the top, or:

```bash
npx vercel --prod
```

Set all environment variables in the Vercel dashboard under **Settings → Environment Variables**.
