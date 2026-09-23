import { z } from "zod";

export const DOCUMENT_TYPES = ["invoice", "tax_invoice", "proforma"] as const;
export const PAYMENT_TERMS = ["due_on_receipt", "net_7", "net_15", "net_30", "custom"] as const;
export const CURRENCIES = ["USD", "EUR", "GBP", "PKR"] as const;
export const TEMPLATES = ["classic", "modern", "minimal", "bold"] as const;
export const FONTS = ["sans", "serif", "mono"] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export type PaymentTerms = (typeof PAYMENT_TERMS)[number];
export type Currency = (typeof CURRENCIES)[number];
export type TemplateId = (typeof TEMPLATES)[number];
export type FontId = (typeof FONTS)[number];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const optionalText = z.string().trim().max(500).default("");
const optionalEmail = z
  .string()
  .trim()
  .default("")
  .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email address");
const optionalDate = z
  .string()
  .default("")
  .refine((v) => v === "" || ISO_DATE.test(v), "Enter a valid date");
const dataUrl = z
  .string()
  .default("")
  .refine((v) => v === "" || v.startsWith("data:image/"), "Invalid image");

export const partySchema = z.object({
  name: optionalText,
  taxId: optionalText,
  email: optionalEmail,
  phone: optionalText,
  address: optionalText,
  city: optionalText,
  postalCode: optionalText,
  country: optionalText,
});

export const lineItemSchema = z.object({
  id: z.string().min(1),
  description: z.string().max(500).default(""),
  quantity: z.number({ error: "Enter a quantity" }).gt(0, "Quantity must be more than 0"),
  unitPrice: z.number({ error: "Enter a price" }).min(0, "Price can't be negative"),
  /** Percent. `null` falls back to the invoice's default tax rate. */
  taxRate: z.number().min(0, "Tax must be 0–100%").max(100, "Tax must be 0–100%").nullable().default(null),
  /** Fixed amount taken off this line. */
  discount: z.number().min(0, "Discount can't be negative").default(0),
});

export const paymentInstructionsSchema = z.object({
  bankName: optionalText,
  accountName: optionalText,
  iban: optionalText,
  swift: optionalText,
  other: optionalText,
});

export const invoiceSchema = z
  .object({
    documentType: z.enum(DOCUMENT_TYPES).default("invoice"),
    number: z.string().trim().min(1, "Invoice number is required").max(40),
    issueDate: z.string().regex(ISO_DATE, "Issue date is required"),
    dueDate: optionalDate,
    validUntil: optionalDate,
    poNumber: optionalText,
    paymentTerms: z.enum(PAYMENT_TERMS).default("due_on_receipt"),
    currency: z.enum(CURRENCIES).default("USD"),
    locale: z.string().default("en-US"),
    issuer: partySchema.extend({ logo: dataUrl }),
    client: partySchema,
    items: z.array(lineItemSchema).min(1),
    globalDiscount: z
      .object({
        type: z.enum(["percent", "fixed"]),
        value: z.number().min(0, "Discount can't be negative"),
      })
      .default({ type: "percent", value: 0 }),
    shipping: z.number().min(0, "Shipping can't be negative").default(0),
    defaultTaxRate: z.number().min(0, "Tax must be 0–100%").max(100, "Tax must be 0–100%").default(0),
    notes: z.string().max(2000).default(""),
    terms: z.string().max(2000).default(""),
    paymentInstructions: paymentInstructionsSchema,
    signature: dataUrl,
    template: z.enum(TEMPLATES).default("classic"),
    accentColor: z.string().regex(HEX_COLOR, "Use a hex color like #2270C3"),
    font: z.enum(FONTS).default("sans"),
  })
  .superRefine((inv, ctx) => {
    if (!inv.issuer.name.trim()) {
      ctx.addIssue({ code: "custom", path: ["issuer", "name"], message: "Your business name is required" });
    }
    if (!inv.client.name.trim()) {
      ctx.addIssue({ code: "custom", path: ["client", "name"], message: "Client name is required" });
    }
    if (inv.documentType === "tax_invoice" && !inv.issuer.taxId.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["issuer", "taxId"],
        message: "A tax invoice needs your Tax ID / VAT number",
      });
    }
    if (inv.dueDate && inv.issueDate && inv.dueDate < inv.issueDate) {
      ctx.addIssue({ code: "custom", path: ["dueDate"], message: "Due date can't be before the issue date" });
    }
    if (inv.documentType === "proforma" && inv.validUntil && inv.issueDate && inv.validUntil < inv.issueDate) {
      ctx.addIssue({ code: "custom", path: ["validUntil"], message: "Valid-until can't be before the issue date" });
    }
    inv.items.forEach((item, i) => {
      if (!isBlankItem(item) && !item.description.trim()) {
        ctx.addIssue({ code: "custom", path: ["items", i, "description"], message: "Add a description" });
      }
    });
    if (inv.items.every(isBlankItem)) {
      ctx.addIssue({
        code: "custom",
        path: ["items", 0, "description"],
        message: "Add at least one item",
      });
    }
    if (inv.globalDiscount.type === "percent" && inv.globalDiscount.value > 100) {
      ctx.addIssue({ code: "custom", path: ["globalDiscount", "value"], message: "Discount can't exceed 100%" });
    }
  });

export type Party = z.infer<typeof partySchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type PaymentInstructions = z.infer<typeof paymentInstructionsSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;

/** A row the user never touched. Blank rows are ignored everywhere (validation, totals, PDF). */
export function isBlankItem(item: Pick<LineItem, "description" | "unitPrice">): boolean {
  return item.description.trim() === "" && item.unitPrice === 0;
}

export const STEPS = [
  { id: "document", label: "Document", description: "Pick the kind of document you're sending." },
  { id: "details", label: "Details", description: "Numbers, dates, your business and your client." },
  { id: "items", label: "Items", description: "Products or services, tax, discounts and shipping." },
  { id: "design", label: "Design & Download", description: "Choose a template, then download or share." },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

/** Which wizard step owns a validation path. */
export function stepForPath(path: readonly PropertyKey[]): number {
  const head = path[0];
  if (head === "documentType") return 0;
  if (head === "items" || head === "globalDiscount" || head === "shipping" || head === "defaultTaxRate") return 2;
  if (head === "template" || head === "accentColor" || head === "font") return 3;
  return 1;
}

export type FieldErrors = Record<string, string>;

export function pathKey(path: readonly PropertyKey[]): string {
  return path.map(String).join(".");
}

/** DOM id for the input bound to a path, so errors can focus it. */
export function fieldId(path: string): string {
  return `field-${path.replace(/\./g, "-")}`;
}

/** Validate the whole invoice and group the first message per field by step. */
export function validateInvoice(invoice: Invoice): { errors: FieldErrors; byStep: FieldErrors[] } {
  const byStep: FieldErrors[] = STEPS.map(() => ({}));
  const errors: FieldErrors = {};
  const result = invoiceSchema.safeParse(invoice);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = pathKey(issue.path);
      if (errors[key]) continue;
      errors[key] = issue.message;
      byStep[stepForPath(issue.path)][key] = issue.message;
    }
  }
  return { errors, byStep };
}
