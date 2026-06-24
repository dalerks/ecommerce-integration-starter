import { supabase } from "@/lib/supabase";

async function getSyncStatus() {
  const [{ count: productCount }, { data: recentEvents }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("webhook_events")
      .select("topic, external_id, processed, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return { productCount: productCount ?? 0, recentEvents: recentEvents ?? [] };
}

export default async function DashboardPage() {
  const { productCount, recentEvents } = await getSyncStatus();

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Ecommerce Integration Dashboard</h1>

      <section>
        <h2>Product Sync</h2>
        <p>
          <strong>{productCount}</strong> products synced from merchant store.
        </p>
      </section>

      <section>
        <h2>Recent Webhook Events</h2>
        {recentEvents.length === 0 ? (
          <p>No events yet. Connect a store and register webhooks to see events here.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Topic</th>
                <th style={{ textAlign: "left" }}>ID</th>
                <th style={{ textAlign: "left" }}>Processed</th>
                <th style={{ textAlign: "left" }}>Received</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((e) => (
                <tr key={e.external_id}>
                  <td>{e.topic}</td>
                  <td>{e.external_id}</td>
                  <td>{e.processed ? "yes" : "pending"}</td>
                  <td>{new Date(e.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
