import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/shopify";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-shopify-hmac-sha256") ?? "";
  const topic = req.headers.get("x-shopify-topic") ?? "orders/unknown";
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature, process.env.WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const externalId = String(payload.id);

  // Idempotent insert — duplicate webhooks are silently ignored via unique constraint
  const { error } = await supabaseAdmin.from("webhook_events").insert({
    topic,
    external_id: externalId,
    payload,
  });

  if (error && error.code !== "23505") {
    console.error("Webhook insert error:", error);
    return NextResponse.json({ error: "Storage error" }, { status: 500 });
  }

  // Background processing would happen here (queue job, etc.)
  console.log(`[webhook] ${topic}/${externalId} received`);

  return NextResponse.json({ ok: true });
}
