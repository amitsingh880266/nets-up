import type { Metadata, Viewport } from "next";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "NetsUp — Cricket Net Practice Tracker";
const description =
  "Track every ball during cricket net practice and analyze your batting performance with real-time session statistics. The fastest way to count balls, overs, and shot quality at the nets.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | NetsUp",
  },
  description,
  applicationName: "NetsUp",
  keywords: [
    "cricket net practice",
    "cricket practice tracker",
    "cricket ball counter",
    "cricket net session tracker",
    "batting practice tracker",
    "cricket training app",
    "cricket stats app",
    "cricket coaching app",
    "track balls faced cricket",
    "cricket overs counter",
    "cricket batting analytics",
    "net session tracker app",
  ],
  authors: [{ name: "NetsUp" }],
  category: "sports",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "NetsUp",
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
