import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingSignUp } from "./PricingSignUp";

export const metadata: Metadata = {
  title: "Pricing",
  description: "BillFlow is free. Use the full invoice generator without an account, or create a free account to sync your business details.",
  alternates: { canonical: "/pricing" },
};

const GUEST = [
  "Invoices, tax invoices & proforma invoices",
  "Unlimited PDF downloads, no watermark",
  "4 templates, custom accent color & font",
  "Tax per line, discounts & shipping",
  "Logo, bank details & signature",
  "Draft auto-saved in your browser",
  "Print, share link & email draft",
];

const ACCOUNT = [
  "Everything in the guest plan",
  "Save your business details to your account",
  "Details filled in automatically on any device",
];

function Plan({ name, tagline, features, cta, highlight }: { name: string; tagline: string; features: string[]; cta: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`flex flex-col rounded-2xl border bg-white p-8 shadow-card ${highlight ? "border-brand ring-2 ring-brand/20" : "border-border"}`}>
      <h2 className="text-xl font-bold text-ink">{name}</h2>
      <p className="mt-1 text-slate-600">{tagline}</p>
      <p className="mt-6 flex items-baseline gap-1">
        <span className="text-5xl font-bold text-ink">$0</span>
        <span className="text-slate-600">forever</span>
      </p>
      <ul className="mt-8 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-slate-800">
            <Check className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-8">{cta}</div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <section className="bg-surface px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-ink sm:text-5xl">Free. Really.</h1>
          <p className="mt-4 text-lg text-slate-700">
            The whole generator is free and works without an account. There are no paid plans, trials or usage limits.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Plan
            name="Guest"
            tagline="No sign-up, start right away."
            features={GUEST}
            cta={
              <Button asChild variant="outline" className="h-12 w-full text-base">
                <Link href="/#generator">Create an invoice</Link>
              </Button>
            }
          />
          <Plan name="Free account" tagline="For invoicing regularly." features={ACCOUNT} cta={<PricingSignUp />} highlight />
        </div>
        <p className="mt-10 text-center text-sm text-slate-600">
          Invoices are never stored on our servers on either plan. See the{" "}
          <Link href="/privacy" className="font-medium text-brand underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
