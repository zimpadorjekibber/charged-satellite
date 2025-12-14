import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TashiZom Home Stay | Premium Himalayan Experience",
  description: "Experience the serenity of the Himalayas at TashiZom Home Stay. Premium rooms, seasonal pricing, and authentic hospitality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased bg-stone-50 text-stone-900`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
