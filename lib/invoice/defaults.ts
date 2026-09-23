import { addDays, todayISO } from "./calc";
import type { Currency, Invoice, LineItem, Party, TemplateId } from "./schema";

export const ACCENT_PRESETS = [
  { name: "Blue", value: "#2270C3" },
  { name: "Emerald", value: "#059669" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Orange", value: "#EA580C" },
  { name: "Red", value: "#DC2626" },
  { name: "Slate", value: "#334155" },
] as const;

export const TEMPLATE_INFO: Record<TemplateId, { name: string; description: string }> = {
  classic: { name: "Classic", description: "Accent title, clean table, totals card." },
  modern: { name: "Modern", description: "Full-width color header band." },
  minimal: { name: "Minimal", description: "Hairline rules and lots of white space." },
  bold: { name: "Bold", description: "Big title with a highlighted amount due." },
};

export const FONT_INFO = {
  sans: { name: "Sans (Helvetica)" },
  serif: { name: "Serif (Times)" },
  mono: { name: "Mono (Courier)" },
} as const;

export const CURRENCY_INFO: Record<Currency, { label: string }> = {
  USD: { label: "USD ($)" },
  EUR: { label: "EUR (€)" },
  GBP: { label: "GBP (£)" },
  PKR: { label: "PKR (Rs)" },
};

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11);
}

export function emptyItem(): LineItem {
  return { id: newId(), description: "", quantity: 1, unitPrice: 0, taxRate: null, discount: 0 };
}

export function emptyParty(): Party {
  return { name: "", taxId: "", email: "", phone: "", address: "", city: "", postalCode: "", country: "" };
}

export function createInvoice(overrides: Partial<Invoice> = {}): Invoice {
  const issueDate = todayISO();
  return {
    documentType: "invoice",
    number: "INV-0001",
    issueDate,
    dueDate: issueDate,
    validUntil: addDays(issueDate, 30),
    poNumber: "",
    paymentTerms: "due_on_receipt",
    currency: "USD",
    locale: "en-US",
    issuer: { ...emptyParty(), logo: "" },
    client: emptyParty(),
    items: [emptyItem()],
    globalDiscount: { type: "percent", value: 0 },
    shipping: 0,
    defaultTaxRate: 0,
    notes: "",
    terms: "",
    paymentInstructions: { bankName: "", accountName: "", iban: "", swift: "", other: "" },
    signature: "",
    template: "classic",
    accentColor: ACCENT_PRESETS[0].value,
    font: "sans",
    ...overrides,
  };
}

/** Realistic data used for template thumbnails on /templates. */
export function sampleInvoice(template: TemplateId = "classic"): Invoice {
  return createInvoice({
    number: "INV-0042",
    issueDate: "2026-09-01",
    dueDate: "2026-09-16",
    paymentTerms: "net_15",
    template,
    issuer: {
      ...emptyParty(),
      logo: "",
      name: "Northwind Studio",
      email: "billing@northwind.studio",
      address: "18 Harbour Street",
      city: "Bristol",
      postalCode: "BS1 4RN",
      country: "United Kingdom",
    },
    client: {
      ...emptyParty(),
      name: "Acme Corporation",
      email: "ap@acme.example",
      address: "500 Market St",
      city: "San Francisco",
      country: "USA",
    },
    items: [
      { ...emptyItem(), description: "Brand identity design", quantity: 1, unitPrice: 2400 },
      { ...emptyItem(), description: "Website design (5 pages)", quantity: 5, unitPrice: 380 },
      { ...emptyItem(), description: "Copywriting, hours", quantity: 12, unitPrice: 65 },
    ],
    defaultTaxRate: 10,
    notes: "Thank you for your business.",
    paymentInstructions: { bankName: "Northwind Bank", accountName: "Northwind Studio Ltd", iban: "GB29 NWBK 6016 1331 9268 19", swift: "NWBKGB2L", other: "" },
  });
}
