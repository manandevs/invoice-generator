import { describe, expect, it } from "vitest";
import {
  addDays,
  allocate,
  calculateTotals,
  dueDateForTerms,
  formatMoney,
  nextInvoiceNumber,
  pdfFilename,
} from "./calc";
import { createInvoice, emptyItem } from "./defaults";

const item = (description: string, quantity: number, unitPrice: number, taxRate: number | null = null) => ({
  ...emptyItem(),
  description,
  quantity,
  unitPrice,
  taxRate,
});

describe("calculateTotals", () => {
  it("avoids float drift (0.1 + 0.2)", () => {
    const t = calculateTotals(createInvoice({ items: [item("a", 1, 0.1), item("b", 1, 0.2)] }));
    expect(t.subtotal).toBe(30);
    expect(t.grandTotal).toBe(30);
  });

  it("rounds unit prices to the cent before multiplying, matching what the PDF shows", () => {
    // 3.335 is shown as $3.34, so 3 × $3.34 = $10.02
    const t = calculateTotals(createInvoice({ items: [item("a", 3, 3.335)] }));
    expect(t.lines[0].total).toBe(1002);
    const half = calculateTotals(createInvoice({ items: [item("b", 1.5, 3.33)] }));
    expect(half.lines[0].total).toBe(500); // 499.5 rounds up
  });

  it("applies line discounts before the subtotal", () => {
    const t = calculateTotals(createInvoice({ items: [{ ...item("a", 2, 50), discount: 15 }] }));
    expect(t.lines[0].gross).toBe(10000);
    expect(t.lines[0].total).toBe(8500);
    expect(t.subtotal).toBe(8500);
  });

  it("caps a line discount at the line amount", () => {
    const t = calculateTotals(createInvoice({ items: [{ ...item("a", 1, 10), discount: 50 }] }));
    expect(t.lines[0].total).toBe(0);
  });

  it("applies a percent discount and taxes the discounted amount", () => {
    const t = calculateTotals(
      createInvoice({
        items: [item("a", 1, 100)],
        globalDiscount: { type: "percent", value: 10 },
        defaultTaxRate: 20,
      }),
    );
    expect(t.subtotal).toBe(10000);
    expect(t.discountTotal).toBe(1000);
    expect(t.taxTotal).toBe(1800);
    expect(t.grandTotal).toBe(10800);
  });

  it("never discounts below zero with a fixed discount", () => {
    const t = calculateTotals(
      createInvoice({ items: [item("a", 1, 10)], globalDiscount: { type: "fixed", value: 25 } }),
    );
    expect(t.discountTotal).toBe(1000);
    expect(t.grandTotal).toBe(0);
  });

  it("handles multiple tax rates with a per-rate breakdown", () => {
    const t = calculateTotals(
      createInvoice({
        items: [item("food", 2, 10, 5), item("service", 1, 100, 20), item("default", 1, 50)],
        defaultTaxRate: 20,
      }),
    );
    expect(t.taxBreakdown).toEqual([
      { rate: 5, base: 2000, tax: 100 },
      { rate: 20, base: 15000, tax: 3000 },
    ]);
    expect(t.taxTotal).toBe(3100);
  });

  it("spreads a fixed discount across mixed-rate lines exactly", () => {
    const t = calculateTotals(
      createInvoice({
        items: [item("a", 1, 10, 0), item("b", 1, 10, 10), item("c", 1, 10, 20)],
        globalDiscount: { type: "fixed", value: 1 },
      }),
    );
    const allocated = t.lines.reduce((a, l) => a + l.allocatedDiscount, 0);
    expect(allocated).toBe(100);
    expect(t.grandTotal).toBe(t.subtotal - t.discountTotal + t.taxTotal + t.shipping);
  });

  it("adds untaxed shipping and keeps the total identity", () => {
    const t = calculateTotals(
      createInvoice({ items: [item("a", 3, 19.99)], defaultTaxRate: 8.25, shipping: 7.5 }),
    );
    expect(t.subtotal).toBe(5997);
    expect(t.taxTotal).toBe(Math.round(5997 * 0.0825));
    expect(t.shipping).toBe(750);
    expect(t.grandTotal).toBe(t.subtotal - t.discountTotal + t.taxTotal + t.shipping);
  });

  it("ignores blank rows and non-numeric input", () => {
    const t = calculateTotals(
      createInvoice({ items: [emptyItem(), item("a", Number.NaN, 5), item("b", 2, 5)] }),
    );
    expect(t.lines).toHaveLength(2);
    expect(t.subtotal).toBe(1000);
  });
});

describe("allocate", () => {
  it("sums exactly to the amount", () => {
    expect(allocate(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(allocate(7, [0, 0])).toEqual([0, 0]);
    expect(allocate(5, [2, 0, 3]).reduce((a, b) => a + b, 0)).toBe(5);
  });
});

describe("dates and numbering", () => {
  it("sets the due date from payment terms", () => {
    expect(dueDateForTerms("2026-01-20", "net_15")).toBe("2026-02-04");
    expect(dueDateForTerms("2026-01-20", "due_on_receipt")).toBe("2026-01-20");
    expect(dueDateForTerms("2026-01-20", "custom")).toBeNull();
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
  });

  it("increments invoice numbers keeping padding", () => {
    expect(nextInvoiceNumber("INV-0001")).toBe("INV-0002");
    expect(nextInvoiceNumber("INV-0999")).toBe("INV-1000");
    expect(nextInvoiceNumber("2026/99")).toBe("2026/100");
    expect(nextInvoiceNumber("ACME")).toBe("ACME-2");
    expect(nextInvoiceNumber("")).toBe("INV-0001");
  });

  it("builds a slugified filename", () => {
    const inv = createInvoice({ documentType: "tax_invoice", number: "INV 0007" });
    inv.client.name = "Café Müller & Co.";
    expect(pdfFilename(inv)).toBe("tax-invoice-inv-0007-cafe-muller-co.pdf");
  });

  it("formats money in the chosen currency", () => {
    expect(formatMoney(123456, "USD")).toBe("$1,234.56");
    expect(formatMoney(5, "EUR")).toBe("€0.05");
    expect(formatMoney(-1000, "GBP")).toBe("-£10.00");
  });
});
