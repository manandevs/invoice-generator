import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, FileText, LayoutTemplate, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works",
  description: "Create an invoice in 4 steps: pick the document, add details, list items, then choose a design and download the PDF.",
  alternates: { canonical: "/how-it-works" },
};

// Every bullet maps to a feature that ships in the generator.
const steps = [
  {
    id: "01",
    title: "Document",
    description: "Choose a standard invoice, a tax invoice with VAT/GST details, or a proforma invoice for quotes and customs.",
    icon: FileText,
    features: ["Invoice, tax invoice or proforma", "Right title and fields for each", "Switch type any time"],
  },
  {
    id: "02",
    title: "Details",
    description: "Add your business and your client. Required fields are checked as you go, and your draft saves itself in your browser.",
    icon: ListPlus,
    features: ["Validation as you type", "Auto-saved in your browser", "Payment terms set the due date", "Logo, bank details & signature"],
  },
  {
    id: "03",
    title: "Items",
    description: "List products or services. Totals update live, with tax per line, a discount on the subtotal and shipping.",
    icon: LayoutTemplate,
    features: ["Tax calculations per line", "Discounts & shipping", "USD, EUR, GBP & PKR", "Drag to reorder"],
  },
  {
    id: "04",
    title: "Design & Download",
    description: "Pick a template and accent color while watching the live preview, then get the PDF to your client.",
    icon: Download,
    features: ["4 templates + custom color", "Print-ready A4 PDF", "Shareable link", "Pre-filled email draft", "Works on mobile"],
  },
];

export default function HowItWorksPage() {
  return (
    <section className="bg-surface px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:sticky lg:top-28 lg:col-span-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand">The workflow</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Invoicing, <span className="text-brand">simplified.</span>
            </h1>
            <p className="mt-5 max-w-sm text-lg text-slate-700">
              A professional invoice shouldn&apos;t take hours. With BillFlow it takes four short steps, and you see the finished PDF the whole
              time.
            </p>
            <Button asChild className="mt-8 h-12 rounded-full px-6 text-base">
              <Link href="/#generator">
                Create an invoice <ArrowRight />
              </Link>
            </Button>
          </div>

          <ol className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:col-span-8">
            {steps.map(({ id, title, description, icon: Icon, features }) => (
              <li key={id} className="rounded-2xl border border-border bg-white p-7 shadow-card sm:p-8">
                <div className="mb-6 flex items-start justify-between">
                  <div className="grid size-14 place-items-center rounded-2xl bg-brand-tint text-brand">
                    <Icon className="size-7" aria-hidden />
                  </div>
                  <span className="text-4xl font-bold text-slate-300" aria-hidden>
                    {id}
                  </span>
                </div>
                <h2 className="mb-3 text-2xl font-bold text-ink">
                  <span className="sr-only">Step {Number(id)}: </span>
                  {title}
                </h2>
                <p className="mb-6 leading-relaxed text-slate-700">{description}</p>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm font-medium text-slate-800">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
