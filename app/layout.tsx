import type { Metadata } from "next";
import { Doto } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { siteConfig } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { websiteJsonLd } from "@/lib/seo";
import "./globals.css";

// Doto: dotted/LED-style variable display font. Exposed as a CSS variable so
// `.font-display` (see globals.css) can apply it to headings and brand marks.
const doto = Doto({
  subsets: ["latin"],
  variable: "--font-doto",
  display: "swap",
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  // metadataBase makes every relative OG/canonical URL absolute — required for
  // correct social previews and canonical tags.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — What should I watch next?`,
    // Per-page titles render as "Random US Office Episode · What Episode".
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "what episode should I watch",
    "random episode generator",
    "what to watch",
    "random tv episode",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — What should I watch next?`,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — What should I watch next?`,
    description: siteConfig.description,
    creator: siteConfig.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={doto.variable}>
      <body className="min-h-dvh antialiased">
        <JsonLd data={websiteJsonLd()} />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
