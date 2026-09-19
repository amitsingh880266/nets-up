import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";

export const metadata: Metadata = {
  title: "NetsUp — Cricket Net Practice Tracker",
  description:
    "Track every ball during cricket net practice. Log Middle, Edge, Miss, Wide, and Out in one tap and see live balls faced, overs, and shot quality instantly.",
  alternates: { canonical: "/" },
};

// Structured data helps search engines understand NetsUp is a free sports/training web app.
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "NetsUp",
  alternateName: "NetsUp Cricket Net Practice Tracker",
  applicationCategory: "SportsApplication",
  operatingSystem: "Any",
  description:
    "NetsUp is a mobile-first cricket net practice tracker for recording balls faced, overs, shot quality, and dismissals in real time.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomeView />
    </>
  );
}
