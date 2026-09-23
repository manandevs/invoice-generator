import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

import { cn } from "@/lib/utils";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/home/Footer";

const camood = localFont({
  src: "../public/fonts/camood.otf",
  variable: "--font-camood",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME}: Free Invoice Generator`, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Brand icons live in /public/brand with the other brand images.
  icons: {
    icon: [{ url: "/brand/icon.png", type: "image/png", sizes: "192x192" }],
    apple: [{ url: "/brand/apple-icon.png", sizes: "180x180" }],
  },
  keywords: ["invoice generator", "free invoice", "tax invoice", "proforma invoice", "invoice PDF", "invoice template"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME}: Free Invoice Generator`,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}: Free Invoice Generator`,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#1F68B8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/Suisse-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Geist-Variable.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Gambarino-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      {/* Browser extensions inject attributes into <body>; don't treat that as a hydration error. */}
      <body suppressHydrationWarning className={cn(camood.variable, "font-sans antialiased")}>
        <ClerkProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <Toaster position="bottom-center" richColors closeButton />
        </ClerkProvider>
      </body>
    </html>
  );
}
