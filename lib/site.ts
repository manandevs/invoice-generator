/** Set NEXT_PUBLIC_SITE_URL in production so canonical URLs, the sitemap and OG images point at the real domain. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const SITE_NAME = "BillFlow";
export const SITE_DESCRIPTION =
  "Free online invoice generator. Create invoices, tax invoices and proforma invoices with tax, discounts and 4 PDF templates. No sign-up needed.";
