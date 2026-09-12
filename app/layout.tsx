import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pinkiri — Your AI CMO",
  description: "Your AI CMO for growth and marketing. Research, strategy, and specialist marketing agents in one workspace.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
