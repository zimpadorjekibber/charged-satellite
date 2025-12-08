import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ServiceWorkerKiller } from './sw-killer';
import { StateInitializer } from '@/components/StateInitializer';


export const metadata: Metadata = {
  title: "TashiZom | Digital Dining",
  description: "Experience the taste of high altitude.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ServiceWorkerKiller />
        <StateInitializer />
        {children}
      </body>
    </html>
  );
}
