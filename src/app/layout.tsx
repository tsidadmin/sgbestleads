import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SG Best Leads — Singapore B2B lead subscriptions",
    template: "%s · SG Best Leads",
  },
  description:
    "Subscribe to fresh, verified Singapore B2B lead feeds. Weekly drops, dashboard access and CSV export. Monthly or annual plans — annual saves 17%.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
