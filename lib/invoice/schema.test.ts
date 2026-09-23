import { describe, expect, it } from "vitest";
import { createInvoice, emptyItem } from "./defaults";
import { decodeShareHash, encodeShareHash } from "./share";
import { stepForPath, validateInvoice, type Invoice } from "./schema";

function valid(overrides: Partial<Invoice> = {}): Invoice {
  const inv = createInvoice(overrides);
  inv.issuer = { ...inv.issuer, name: "Northwind", ...overrides.issuer };
  inv.client = { ...inv.client, name: "Acme", ...overrides.client };
  if (!overrides.items) inv.items = [{ ...emptyItem(), description: "Design", unitPrice: 100 }];
  return inv;
}

describe("invoice schema", () => {
  it("accepts a complete invoice", () => {
    expect(validateInvoice(valid()).errors).toEqual({});
  });

  it("requires number, issuer name, client name and an item", () => {
    const inv = createInvoice({ number: " " });
    const { errors, byStep } = validateInvoice(inv);
    expect(errors["number"]).toBeDefined();
    expect(errors["issuer.name"]).toBeDefined();
    expect(errors["client.name"]).toBeDefined();
    expect(errors["items.0.description"]).toBe("Add at least one item");
    expect(Object.keys(byStep[1])).toEqual(expect.arrayContaining(["number", "issuer.name", "client.name"]));
    expect(Object.keys(byStep[2])).toContain("items.0.description");
  });

  it("rejects invalid emails but allows empty ones", () => {
    expect(validateInvoice(valid({ client: { ...createInvoice().client, name: "Acme", email: "notanemail" } })).errors[
      "client.email"
    ]).toBe("Enter a valid email address");
    expect(validateInvoice(valid()).errors["client.email"]).toBeUndefined();
  });

  it("requires the issuer tax ID on a tax invoice", () => {
    expect(validateInvoice(valid({ documentType: "tax_invoice" })).errors["issuer.taxId"]).toBeDefined();
    const withId = valid({ documentType: "tax_invoice" });
    withId.issuer.taxId = "GB123";
    expect(validateInvoice(withId).errors).toEqual({});
  });

  it("rejects a due date before the issue date", () => {
    const inv = valid({ issueDate: "2026-05-10", dueDate: "2026-05-01" });
    expect(validateInvoice(inv).errors["dueDate"]).toBeDefined();
  });

  it("validates item rules", () => {
    const inv = valid({
      items: [
        { ...emptyItem(), description: "", unitPrice: 5 },
        { ...emptyItem(), description: "x", quantity: 0 },
        { ...emptyItem(), description: "y", unitPrice: -1 },
        { ...emptyItem(), description: "z", taxRate: 120 },
      ],
    });
    const { errors } = validateInvoice(inv);
    expect(errors["items.0.description"]).toBe("Add a description");
    expect(errors["items.1.quantity"]).toBeDefined();
    expect(errors["items.2.unitPrice"]).toBeDefined();
    expect(errors["items.3.taxRate"]).toBeDefined();
  });

  it("ignores blank rows as long as one real item exists", () => {
    const inv = valid({ items: [emptyItem(), { ...emptyItem(), description: "Real", unitPrice: 1 }, emptyItem()] });
    expect(validateInvoice(inv).errors).toEqual({});
  });

  it("maps paths to wizard steps", () => {
    expect(stepForPath(["documentType"])).toBe(0);
    expect(stepForPath(["client", "email"])).toBe(1);
    expect(stepForPath(["items", 2, "quantity"])).toBe(2);
    expect(stepForPath(["accentColor"])).toBe(3);
  });
});

describe("share links", () => {
  it("round-trips an invoice without images", () => {
    const inv = valid();
    inv.issuer.logo = "data:image/png;base64,AAAA";
    const decoded = decodeShareHash(encodeShareHash(inv));
    expect(decoded).not.toBeNull();
    expect(decoded!.issuer.logo).toBe("");
    expect(decoded!.items[0].description).toBe("Design");
    expect(decoded!.client.name).toBe("Acme");
  });

  it("rejects garbage", () => {
    expect(decodeShareHash("#invoice=not-valid")).toBeNull();
    expect(decodeShareHash("#something-else")).toBeNull();
  });
});
