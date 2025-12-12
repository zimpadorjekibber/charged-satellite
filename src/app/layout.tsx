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
  metadataBase: new URL('https://tashizomcafe.in'),
  title: "TashiZom | Digital Dining",
  description: "Experience the taste of high altitude.",
  manifest: '/manifest.json',
  icons: {
    icon: '/tashizom-logo.png',
    apple: '/tashizom-logo.png', // Uses the same logo for Apple home screen
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TashiZom',
  },
  openGraph: {
    title: 'TashiZom | Digital Dining',
    description: 'Experience the taste of high altitude in Spiti Valley.',
    url: 'https://tashizomcafe.in',
    siteName: 'TashiZom',
    images: [
      {
        url: '/tashizom-logo.png',
        width: 512,
        height: 512,
        alt: 'TashiZom Logo',
      },
    ],
    locale: 'en_In',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#DAA520', // Tashi Accent Gold
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
