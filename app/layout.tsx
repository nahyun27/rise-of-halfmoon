import type { Metadata, Viewport } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION as DESCRIPTION, SITE_NAME, SITE_TITLE as TITLE, SITE_URL } from "../constants/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Rise of the Half Moon",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Rise of the Half Moon",
    "half moon game",
    "moon phase game",
    "moon phase card game",
    "Google Doodle moon game",
    "lunar cycle game",
    "daily puzzle game",
    "browser card game",
  ],
  authors: [{ name: "nahyun27", url: "https://github.com/nahyun27" }],
  creator: "nahyun27",
  category: "game",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

// Structured data so search engines know this page is a free, playable browser game
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: SITE_NAME,
  url: SITE_URL,
  description: DESCRIPTION,
  genre: ["Card game", "Puzzle", "Strategy"],
  gamePlatform: "Web browser",
  applicationCategory: "Game",
  operatingSystem: "Any",
  playMode: "SinglePlayer",
  inLanguage: "en",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
  author: { "@type": "Person", name: "nahyun27", url: "https://github.com/nahyun27" },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#05060f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable}`}>
      <body className="antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        {children}
      </body>
    </html>
  );
}
