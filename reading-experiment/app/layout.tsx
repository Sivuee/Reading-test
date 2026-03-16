import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reading Experiment",
  description: "Attention and reading behaviour measurement",
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
