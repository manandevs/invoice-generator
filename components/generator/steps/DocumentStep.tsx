"use client";

import React from "react";
import { Check, FileClock, FileText, Receipt } from "lucide-react";
import { useInvoiceStore } from "@/lib/invoice/store";
import type { DocumentType } from "@/lib/invoice/schema";
import { cn } from "@/lib/utils";

export const DOCUMENT_INFO: Record<
  DocumentType,
  {
    label: string;
    description: string;
    longDescription: string;
    features: string[];
    recommendedFor: string[];
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  invoice: {
    label: "Invoice",
    description: "Bill for goods or services you've delivered.",
    longDescription: "A standard invoice requests payment after the work is done or the goods are delivered.",
    features: ["Invoice number, dates and payment terms", "Line items with optional tax and discounts", "Subtotal, discount, tax, shipping and total"],
    recommendedFor: ["Completed sales", "Freelancers", "Service businesses"],
    icon: FileText,
  },
  tax_invoice: {
    label: "Tax Invoice",
    description: "Invoice with the tax details VAT/GST rules require.",
    longDescription:
      "A tax invoice shows your tax registration number, the tax rate on every line and a tax summary per rate.",
    features: ["Your Tax ID / VAT number (required)", "Tax % column on every line", "Tax summary grouped by rate"],
    recommendedFor: ["VAT/GST-registered businesses"],
    icon: Receipt,
  },
  proforma: {
    label: "Proforma Invoice",
    description: "A quote-style invoice sent before the sale.",
    longDescription:
      "A proforma invoice confirms prices before goods or services are delivered. It isn't a demand for payment.",
    features: ['"Valid until" date', "Estimated total", '"This is not a tax invoice" notice'],
    recommendedFor: ["Price confirmation", "Customs & international trade", "Deposits"],
    icon: FileClock,
  },
};

export function DocumentStep() {
  const documentType = useInvoiceStore((s) => s.invoice.documentType);
  const update = useInvoiceStore((s) => s.update);

  return (
    <fieldset>
      <legend className="sr-only">Document type</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(DOCUMENT_INFO) as DocumentType[]).map((type) => {
          const info = DOCUMENT_INFO[type];
          const Icon = info.icon;
          const selected = documentType === type;
          return (
            <label
              key={type}
              className={cn(
                "relative flex cursor-pointer flex-col gap-3 rounded-xl border-2 bg-white p-4 transition duration-150 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/30",
                selected ? "border-brand bg-brand-tint/50 shadow-md ring-4 ring-brand/15" : "border-border hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md motion-reduce:hover:translate-y-0",
              )}
            >
              <input
                type="radio"
                name="documentType"
                value={type}
                checked={selected}
                onChange={() => update({ documentType: type })}
                className="sr-only"
              />
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-lg",
                  selected ? "bg-brand text-white" : "bg-slate-100 text-slate-700",
                )}
              >
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold text-ink">{info.label}</span>
                <span className="mt-1 block text-sm text-slate-600">{info.description}</span>
              </span>
              {selected && (
                <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-brand text-white">
                  <Check className="size-4" aria-hidden />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Right-hand panel for step 1: what the chosen document includes. */
export function DocumentInfoPanel() {
  const documentType = useInvoiceStore((s) => s.invoice.documentType);
  const info = DOCUMENT_INFO[documentType];
  const Icon = info.icon;
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-lg bg-brand-tint text-brand">
          <Icon className="size-5" />
        </span>
        <h3 className="text-xl font-semibold text-ink">{info.label}</h3>
      </div>
      <p className="mt-3 text-slate-700">{info.longDescription}</p>
      <h4 className="mt-5 text-sm font-semibold text-ink">Includes</h4>
      <ul className="mt-2 space-y-2">
        {info.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      <h4 className="mt-5 text-sm font-semibold text-ink">Good for</h4>
      <div className="mt-2 flex flex-wrap gap-2">
        {info.recommendedFor.map((r) => (
          <span key={r} className="rounded-full bg-brand-tint px-3 py-1 text-xs font-medium text-brand">
            {r}
          </span>
        ))}
      </div>
      <p className="mt-6 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        You can switch the document type at any time. A live preview appears from the next step on.
      </p>
    </div>
  );
}
