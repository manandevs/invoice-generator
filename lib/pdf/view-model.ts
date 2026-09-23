import {
  calculateTotals,
  DOCUMENT_TITLES,
  formatDate,
  formatMoney,
  formatPercent,
  TERM_LABELS,
  toMinor,
} from "@/lib/invoice/calc";
import type { Invoice, Party } from "@/lib/invoice/schema";

export interface InvoiceView {
  title: string;
  accent: string;
  meta: { label: string; value: string }[];
  from: { name: string; lines: string[]; logo: string };
  to: { name: string; lines: string[] };
  showTaxColumn: boolean;
  rows: { key: string; description: string; quantity: string; unitPrice: string; tax: string; amount: string }[];
  totals: { label: string; value: string }[];
  grandTotal: { label: string; value: string };
  notes: string;
  terms: string;
  payment: string[];
  signature: string;
  disclaimer: string;
}

/** The PDF can't render every Unicode space the Intl formatter emits, so normalize them. */
const pdfSafe = (s: string) => s.replace(/[\u00A0\u202F\u2007]/g, " ");

function partyLines(p: Party): string[] {
  const cityLine = [p.city, p.postalCode].filter((s) => s.trim()).join(" ");
  return [
    p.address,
    cityLine,
    p.country,
    p.email,
    p.phone,
    p.taxId ? `Tax ID: ${p.taxId}` : "",
  ]
    .map((s) => s.trim())
    .filter(Boolean);
}

function qty(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(3)));
}

export function buildInvoiceView(inv: Invoice): InvoiceView {
  const totals = calculateTotals(inv);
  const money = (minor: number) => pdfSafe(formatMoney(minor, inv.currency, inv.locale));
  const date = (d: string) => formatDate(d, inv.locale);
  const isProforma = inv.documentType === "proforma";
  const isTax = inv.documentType === "tax_invoice";

  const meta = [
    { label: isProforma ? "Proforma no." : "Invoice no.", value: inv.number.trim() },
    { label: "Issue date", value: date(inv.issueDate) },
    { label: isProforma ? "Valid until" : "Due date", value: date(isProforma ? inv.validUntil : inv.dueDate) },
    { label: "PO number", value: inv.poNumber.trim() },
    { label: "Terms", value: inv.paymentTerms === "custom" || isProforma ? "" : TERM_LABELS[inv.paymentTerms] },
    { label: "Currency", value: inv.currency },
  ].filter((m) => m.value);

  const rates = new Set(totals.lines.map((l) => l.taxRate));
  const showTaxColumn = isTax || (rates.size > 1 && totals.taxTotal > 0);

  const rows = totals.lines.map((l) => ({
    key: l.item.id,
    description: l.item.description.trim(),
    quantity: qty(l.item.quantity),
    unitPrice: money(toMinor(l.item.unitPrice)),
    tax: formatPercent(l.taxRate),
    amount: money(l.total),
  }));

  const totalRows: { label: string; value: string }[] = [{ label: "Subtotal", value: money(totals.subtotal) }];
  if (totals.discountTotal > 0) {
    const label =
      inv.globalDiscount.type === "percent" ? `Discount (${formatPercent(inv.globalDiscount.value)})` : "Discount";
    totalRows.push({ label, value: `-${money(totals.discountTotal)}` });
  }
  if (totals.taxTotal > 0 || isTax) {
    if (isTax && totals.taxBreakdown.length > 0) {
      for (const b of totals.taxBreakdown) {
        totalRows.push({ label: `Tax ${formatPercent(b.rate)} on ${money(b.base)}`, value: money(b.tax) });
      }
      if (totals.taxBreakdown.length > 1) totalRows.push({ label: "Total tax", value: money(totals.taxTotal) });
    } else {
      totalRows.push({ label: "Tax", value: money(totals.taxTotal) });
    }
  }
  if (totals.shipping > 0) totalRows.push({ label: "Shipping", value: money(totals.shipping) });

  const pi = inv.paymentInstructions;
  const payment = [
    pi.bankName && `Bank: ${pi.bankName}`,
    pi.accountName && `Account name: ${pi.accountName}`,
    pi.iban && `IBAN / Account no.: ${pi.iban}`,
    pi.swift && `SWIFT / BIC: ${pi.swift}`,
    pi.other,
  ]
    .map((s) => (s || "").trim())
    .filter(Boolean);

  return {
    title: DOCUMENT_TITLES[inv.documentType],
    accent: inv.accentColor,
    meta,
    from: { name: inv.issuer.name.trim(), lines: partyLines(inv.issuer), logo: inv.issuer.logo },
    to: { name: inv.client.name.trim(), lines: partyLines(inv.client) },
    showTaxColumn,
    rows,
    totals: totalRows,
    grandTotal: { label: isProforma ? "Estimated total" : "Total due", value: money(totals.grandTotal) },
    notes: inv.notes.trim(),
    terms: inv.terms.trim(),
    payment,
    signature: inv.signature,
    disclaimer: isProforma ? "This is not a tax invoice." : "",
  };
}
