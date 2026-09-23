import { isBlankItem, type Currency, type Invoice, type LineItem, type PaymentTerms } from "./schema";

/** All money math happens in integer minor units (cents) so totals are exact. */
export function toMinor(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  // toFixed strips binary noise first: 3.335 * 100 is 333.49999999999994.
  return Math.round(Number((amount * 100).toFixed(6)));
}

export function fromMinor(minor: number): number {
  return minor / 100;
}

const num = (n: number | null | undefined) => (typeof n === "number" && Number.isFinite(n) ? n : 0);

export interface LineResult {
  item: LineItem;
  /** qty × price, before the line discount. */
  gross: number;
  lineDiscount: number;
  /** gross − line discount: the amount shown in the Amount column. */
  total: number;
  /** Share of the invoice-level discount allocated to this line. */
  allocatedDiscount: number;
  taxRate: number;
  tax: number;
}

export interface TaxBucket {
  rate: number;
  base: number;
  tax: number;
}

export interface Totals {
  lines: LineResult[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shipping: number;
  grandTotal: number;
  taxBreakdown: TaxBucket[];
}

/**
 * Split `amount` across `weights` so the parts are integers that sum exactly to `amount`
 * (largest-remainder method).
 */
export function allocate(amount: number, weights: number[]): number[] {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (amount === 0 || totalWeight === 0) return weights.map(() => 0);
  const raw = weights.map((w) => (amount * w) / totalWeight);
  const parts = raw.map(Math.floor);
  let remainder = amount - parts.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (let k = 0; remainder > 0; k = (k + 1) % order.length, remainder--) {
    parts[order[k].i] += 1;
  }
  return parts;
}

type CalcInput = Pick<Invoice, "items" | "globalDiscount" | "shipping" | "defaultTaxRate">;

/**
 * Totals for an invoice, in minor units.
 * Tax is charged on each line after its line discount and its share of the invoice discount.
 * Shipping is not taxed. grandTotal = subtotal − discountTotal + taxTotal + shipping.
 */
export function calculateTotals(invoice: CalcInput): Totals {
  const defaultRate = num(invoice.defaultTaxRate);
  const items = invoice.items.filter((i) => !isBlankItem(i));

  const base = items.map((item) => {
    const gross = Math.round(num(item.quantity) * toMinor(num(item.unitPrice)));
    const lineDiscount = Math.min(toMinor(num(item.discount)), gross);
    return { item, gross, lineDiscount, total: gross - lineDiscount };
  });

  const subtotal = base.reduce((a, l) => a + l.total, 0);

  const gd = invoice.globalDiscount ?? { type: "percent", value: 0 };
  const rawDiscount =
    gd.type === "percent"
      ? Math.round((subtotal * Math.min(num(gd.value), 100)) / 100)
      : toMinor(num(gd.value));
  const discountTotal = Math.max(0, Math.min(rawDiscount, subtotal));
  const allocated = allocate(
    discountTotal,
    base.map((l) => l.total),
  );

  const lines: LineResult[] = base.map((l, i) => {
    const taxRate = l.item.taxRate ?? defaultRate;
    const taxable = l.total - allocated[i];
    return { ...l, allocatedDiscount: allocated[i], taxRate, tax: Math.round((taxable * num(taxRate)) / 100) };
  });

  const buckets = new Map<number, TaxBucket>();
  for (const l of lines) {
    if (l.taxRate <= 0) continue;
    const b = buckets.get(l.taxRate) ?? { rate: l.taxRate, base: 0, tax: 0 };
    b.base += l.total - l.allocatedDiscount;
    b.tax += l.tax;
    buckets.set(l.taxRate, b);
  }

  const taxTotal = lines.reduce((a, l) => a + l.tax, 0);
  const shipping = Math.max(0, toMinor(num(invoice.shipping)));

  return {
    lines,
    subtotal,
    discountTotal,
    taxTotal,
    shipping,
    grandTotal: subtotal - discountTotal + taxTotal + shipping,
    taxBreakdown: [...buckets.values()].sort((a, b) => a.rate - b.rate),
  };
}

export function formatMoney(minor: number, currency: Currency, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(fromMinor(minor));
}

export function formatPercent(rate: number): string {
  return `${Number(rate.toFixed(3))}%`;
}

export const TERM_DAYS: Record<Exclude<PaymentTerms, "custom">, number> = {
  due_on_receipt: 0,
  net_7: 7,
  net_15: 15,
  net_30: 30,
};

export const TERM_LABELS: Record<PaymentTerms, string> = {
  due_on_receipt: "Due on receipt",
  net_7: "Net 7",
  net_15: "Net 15",
  net_30: "Net 30",
  custom: "Custom",
};

/** Add days to an ISO yyyy-mm-dd date without timezone drift. */
export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

export function dueDateForTerms(issueDate: string, terms: PaymentTerms): string | null {
  if (terms === "custom" || !issueDate) return null;
  return addDays(issueDate, TERM_DAYS[terms]);
}

export function todayISO(now = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function formatDate(isoDate: string, locale = "en-US"): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

/** INV-0009 → INV-0010, keeping zero padding. Numbers without trailing digits get "-2". */
export function nextInvoiceNumber(current: string): string {
  const trimmed = current.trim();
  if (!trimmed) return "INV-0001";
  const match = trimmed.match(/^(.*?)(\d+)$/);
  if (!match) return `${trimmed}-2`;
  const [, prefix, digits] = match;
  const next = String(Number(digits) + 1).padStart(digits.length, "0");
  return prefix + next;
}

export const DOCUMENT_TITLES = {
  invoice: "INVOICE",
  tax_invoice: "TAX INVOICE",
  proforma: "PROFORMA INVOICE",
} as const;

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function pdfFilename(invoice: Pick<Invoice, "documentType" | "number" | "client">): string {
  const parts = [invoice.documentType.replace("_", "-"), invoice.number, invoice.client.name]
    .map(slugify)
    .filter(Boolean);
  return `${parts.join("-") || "invoice"}.pdf`;
}
