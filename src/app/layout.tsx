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

import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { StateInitializer } from '@/components/StateInitializer';


export const metadata: Metadata = {
  metadataBase: new URL('https://tashizomcafe.in'),
  title: "TashiZom Kibber | Best Restaurant in Spiti Valley, Himachal Pradesh",
  description: "Experience authentic multi-cuisine dining at TashiZom, the highest year-round restaurant in Kibber, Spiti Valley. Famous for local Spitian flavors and breathtaking views.",
  keywords: ["TashiZom", "Kibber", "Spiti Valley", "Best Restaurant in Spiti", "Cafe in Kibber", "Spiti Food", "Himachal Tourism", "Kaze Restaurant"],
  manifest: '/manifest.json',
  icons: {
    icon: '/tashizom-logo.png',
    apple: '/tashizom-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TashiZom',
  },
  openGraph: {
    title: 'TashiZom Kibber | Best Restaurant in Spiti Valley',
    description: 'Experience authentic flavors at the highest year-round restaurant in Kibber, Spiti Valley.',
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
    locale: 'en_IN',
    type: 'website',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "TashiZom",
  "image": "https://tashizomcafe.in/tashizom-logo.png",
  "@id": "https://tashizomcafe.in",
  "url": "https://tashizomcafe.in",
  "telephone": "+919418612295",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Kibber Village",
    "addressLocality": "Spiti Valley",
    "addressRegion": "HP",
    "postalCode": "172114",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 32.3331,
    "longitude": 78.0094
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "opens": "08:00",
    "closes": "22:00"
  },
  "servesCuisine": ["Indian", "Italian", "Chinese", "Continental"],
  "priceRange": "$$"
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ServiceWorkerRegister />
        <StateInitializer />
        {children}
      </body>
    </html>
  );
}
