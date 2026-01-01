import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Health Automation",
  description: "Home Health Automation MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

