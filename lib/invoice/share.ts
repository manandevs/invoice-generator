import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { createInvoice } from "./defaults";
import { invoiceSchema, type Invoice } from "./schema";

export const SHARE_HASH_PREFIX = "#invoice=";

/**
 * The whole invoice lives in the URL hash, which browsers never send to a server.
 * Logo and signature images are left out to keep links a sensible length.
 */
export function encodeShareHash(invoice: Invoice): string {
  const payload: Invoice = { ...invoice, issuer: { ...invoice.issuer, logo: "" }, signature: "" };
  return SHARE_HASH_PREFIX + compressToEncodedURIComponent(JSON.stringify(payload));
}

export function buildShareUrl(invoice: Invoice, origin: string): string {
  return `${origin}/${encodeShareHash(invoice)}`;
}

/** Returns null when the hash isn't a share link or can't be decoded. */
export function decodeShareHash(hash: string): Invoice | null {
  if (!hash.startsWith(SHARE_HASH_PREFIX)) return null;
  try {
    const json = decompressFromEncodedURIComponent(hash.slice(SHARE_HASH_PREFIX.length));
    if (!json) return null;
    const raw = JSON.parse(json) as Partial<Invoice>;
    const base = createInvoice();
    const merged = {
      ...base,
      ...raw,
      issuer: { ...base.issuer, ...raw.issuer, logo: "" },
      client: { ...base.client, ...raw.client },
      paymentInstructions: { ...base.paymentInstructions, ...raw.paymentInstructions },
      signature: "",
    };
    // Structure must be sound; business-rule issues (e.g. a missing client) are fine to load and fix.
    const shape = invoiceSchema.safeParse(merged);
    const structural = shape.success
      ? []
      : shape.error.issues.filter((i) => i.code === "invalid_type" || i.code === "invalid_value");
    return structural.length === 0 ? (merged as Invoice) : null;
  } catch {
    return null;
  }
}

export function buildMailto(invoice: Invoice, totalLabel: string): string {
  const title = invoice.documentType === "proforma" ? "Proforma invoice" : "Invoice";
  const from = invoice.issuer.name.trim();
  const subject = `${title} ${invoice.number}${from ? ` from ${from}` : ""}`;
  const lines = [
    `Hi${invoice.client.name ? ` ${invoice.client.name}` : ""},`,
    "",
    `Please find attached ${title.toLowerCase()} ${invoice.number} for ${totalLabel}.`,
    invoice.dueDate && invoice.documentType !== "proforma" ? `Payment is due by ${invoice.dueDate}.` : "",
    "",
    "Thank you,",
    from,
  ].filter((l, i, arr) => l !== "" || arr[i - 1] !== "");
  const params = new URLSearchParams({ subject, body: lines.join("\n") });
  // URLSearchParams encodes spaces as "+", which mail clients show literally.
  return `mailto:${encodeURIComponent(invoice.client.email)}?${params.toString().replace(/\+/g, "%20")}`;
}
