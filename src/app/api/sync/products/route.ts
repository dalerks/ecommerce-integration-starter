import { NextRequest, NextResponse } from "next/server";
import { fetchShopifyProducts } from "@/lib/shopify";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { shop } = await req.json();
  if (!shop) return NextResponse.json({ error: "Missing shop" }, { status: 400 });

  const { data: tokenRow } = await supabaseAdmin
    .from("oauth_tokens")
    .select("access_token")
    .eq("shop", shop)
    .single();

  if (!tokenRow) {
    return NextResponse.json({ error: "Shop not connected" }, { status: 404 });
  }

  const products = await fetchShopifyProducts(shop, tokenRow.access_token);

  const rows = products.flatMap((p) =>
    p.variants.map((v) => ({
      external_id: `${p.id}:${v.sku}`,
      title: p.title,
      sku: v.sku,
      price: parseFloat(v.price),
      inventory: v.inventory_quantity,
      synced_at: new Date().toISOString(),
    }))
  );

  const { error } = await supabaseAdmin
    .from("products")
    .upsert(rows, { onConflict: "external_id" });

  if (error) {
    console.error("Product sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }

  return NextResponse.json({ synced: rows.length });
}
