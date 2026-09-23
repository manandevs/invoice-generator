export const FAQS = [
  {
    q: "Is BillFlow really free to use?",
    a: "Yes. The whole generator is free: every document type, all 4 templates, unlimited invoices and PDF downloads, with no watermark.",
  },
  {
    q: "Do I need an account?",
    a: "No. Everything works without signing up. A free account lets you save your business details and have them filled in automatically on any device.",
  },
  {
    q: "Do you store my invoices or my clients' details?",
    a: "No. Invoices are built and turned into PDFs in your browser, and your draft is saved only in your browser's local storage. If you sign in and choose to save your business details, only those details (not invoices or clients) are stored with your account.",
  },
  {
    q: "What's the difference between an invoice, a tax invoice and a proforma?",
    a: "An invoice requests payment for delivered work. A tax invoice adds your Tax ID/VAT number, a tax column and a tax summary by rate. A proforma invoice is a preliminary bill with a \"valid until\" date and isn't a demand for payment.",
  },
  {
    q: "How are tax and discounts calculated?",
    a: "Each line can have its own tax rate, or use the default rate. A discount on the subtotal is spread across lines before tax. Shipping is added after tax. All math is done in cents so totals are exact.",
  },
  {
    q: "How do I send the invoice to my client?",
    a: "In the Design & Download step you can download the PDF, print it, copy a share link, or use Email: it downloads the PDF and opens a pre-filled draft in your email app, and you attach the downloaded file before sending.",
  },
] as const;
