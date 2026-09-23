import React from "react";
import { describe, expect, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { createInvoice, emptyItem, sampleInvoice } from "@/lib/invoice/defaults";
import { TEMPLATES, type Invoice } from "@/lib/invoice/schema";
import { InvoiceDocument } from "./InvoiceDocument";

async function pdfText(invoice: Invoice): Promise<string[]> {
  const buffer = await renderToBuffer(<InvoiceDocument invoice={invoice} />);
  const doc = await getDocument({ data: new Uint8Array(buffer), verbosity: 0 }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    pages.push(content.items.map((it) => ("str" in it ? it.str : "")).join(" "));
  }
  return pages;
}

describe("InvoiceDocument", () => {
  it.each(TEMPLATES)("renders the %s template with every field", async (template) => {
    const inv = sampleInvoice(template);
    inv.poNumber = "PO-77";
    inv.issuer.taxId = "GB-TAX-1";
    inv.client.taxId = "US-TAX-9";
    inv.client.phone = "+1 555 0100";
    inv.client.postalCode = "94105";
    inv.terms = "Late fees apply after 30 days.";
    // Letter-spaced headings extract as "I N V O I C E", so compare without spaces.
    const text = (await pdfText(inv)).join("").replace(/\s+/g, "");
    for (const expected of [
      "INVOICE",
      "INV-0042",
      "PO-77",
      "Net 15",
      "GB-TAX-1",
      "US-TAX-9",
      "+1 555 0100",
      "94105",
      "ap@acme.example",
      "Brand identity design",
      "Subtotal",
      "Late fees apply",
      "NWBKGB2L",
      "USD",
    ]) {
      expect(text).toContain(expected.replace(/\s+/g, ""));
    }
  });

  it("never prints placeholders or blank rows", async () => {
    const inv = createInvoice({ items: [emptyItem(), { ...emptyItem(), description: "Only item", unitPrice: 5 }] });
    const text = (await pdfText(inv)).join(" ");
    for (const banned of ["N/A", "Your Business Name", "Client Name", "Item 1"]) {
      expect(text).not.toContain(banned);
    }
    expect(text).toContain("Only item");
  });

  it("titles tax and proforma invoices correctly", async () => {
    const tax = sampleInvoice();
    tax.documentType = "tax_invoice";
    tax.issuer.taxId = "VAT-1";
    const taxText = (await pdfText(tax)).join(" ");
    expect(taxText).toContain("TAX INVOICE");
    expect(taxText).toContain("Tax 10% on");

    const proforma = sampleInvoice();
    proforma.documentType = "proforma";
    proforma.validUntil = "2026-10-01";
    const proText = (await pdfText(proforma)).join(" ");
    expect(proText).toContain("PROFORMA INVOICE");
    expect(proText).toContain("Valid until");
    expect(proText).toContain("This is not a tax invoice.");
  });

  it("paginates long invoices with a repeated header and page numbers", async () => {
    const inv = sampleInvoice();
    inv.items = Array.from({ length: 45 }, (_, i) => ({
      ...emptyItem(),
      description: `Line item number ${i + 1}`,
      unitPrice: 10 + i,
    }));
    const pages = await pdfText(inv);
    expect(pages.length).toBeGreaterThanOrEqual(2);
    pages.forEach((p, i) => {
      expect(p).toContain(`Page ${i + 1} of ${pages.length}`);
      // Every page that carries table rows starts them with the column header.
      if (p.includes("Line item number")) expect(p).toContain("Unit price");
    });
    expect(pages[1]).toMatch(/^Description\s+Qty\s+Unit price/);
    const all = pages.join(" ");
    expect(all).toContain("Line item number 45");
    expect(all.match(/Total due/g)).toHaveLength(1);
  });
});
