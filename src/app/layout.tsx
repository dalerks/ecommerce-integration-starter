export const metadata = {
  title: "Ecommerce Integration Starter",
  description: "OAuth + webhooks + product sync — Next.js, TypeScript, Supabase",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
