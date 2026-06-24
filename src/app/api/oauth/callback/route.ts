import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const shop = searchParams.get("shop");

  if (!code || !shop) {
    return NextResponse.json({ error: "Missing code or shop" }, { status: 400 });
  }

  // Exchange authorization code for access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Token exchange failed" }, { status: 502 });
  }

  const { access_token, scope } = await tokenRes.json();

  await supabaseAdmin
    .from("oauth_tokens")
    .upsert({ shop, access_token, scopes: scope }, { onConflict: "shop" });

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?shop=${shop}`
  );
}
