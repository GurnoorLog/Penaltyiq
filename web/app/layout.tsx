import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Perfect Your Penalty",
  description: "Professional-grade biomechanical analysis for every kick. Master the technique that beats world-class keepers with data-driven precision.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Hanken+Grotesk:wght@400;500&family=Geist+Mono:wght@500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
