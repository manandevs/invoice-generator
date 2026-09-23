import type { Metadata } from "next";
import FAQ from "@/components/home/FAQ";
import Hero from "@/components/home/Hero";
import HowToCreate from "@/components/home/HowToCreate";
import InvoiceElements from "@/components/home/InvoiceElements";
import InvoiceFormat from "@/components/home/InvoiceFormat";
import TemplateShowcase from "@/components/home/TemplateShowcase";
import WhatIsInvoice from "@/components/home/WhatIsInvoice";
import { FAQS } from "@/lib/content/faqs";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "BillFlow: Free Invoice Generator with PDF Download" },
  alternates: { canonical: "/" },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD must be inline; "<" is escaped so the content can't close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero />
      <TemplateShowcase />
      <WhatIsInvoice />
      <HowToCreate />
      <InvoiceFormat />
      <InvoiceElements />
      <FAQ />
    </>
  );
}
