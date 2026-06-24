import crypto from "crypto";

export interface Product {
  id: string;
  title: string;
  variants: Array<{ sku: string; price: string; inventory_quantity: number }>;
}

export async function fetchShopifyProducts(
  shop: string,
  accessToken: string
): Promise<Product[]> {
  const res = await fetch(
    `https://${shop}/admin/api/2024-01/products.json?limit=250`,
    { headers: { "X-Shopify-Access-Token": accessToken } }
  );
  if (!res.ok) throw new Error(`Shopify products fetch failed: ${res.status}`);
  const { products } = await res.json();
  return products;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}
