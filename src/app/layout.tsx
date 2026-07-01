import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Screener",
  description: "AI-powered resume screening application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
