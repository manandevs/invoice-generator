"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, FileText, ListPlus, Plus, Minus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Choose the document",
    body: "Pick a standard invoice, a tax invoice with your VAT/GST number and a tax summary, or a proforma invoice with a valid-until date.",
    icon: FileText,
  },
  {
    title: "Add your details",
    body: "Enter your business and your client, the invoice number and dates. Choose payment terms and the due date fills itself in. Add your logo, bank details and signature.",
    icon: UserRound,
  },
  {
    title: "List your items",
    body: "Add products or services with quantity and price. Set tax per line, a discount on the subtotal and shipping. Totals update as you type.",
    icon: ListPlus,
  },
  {
    title: "Design and download",
    body: "Pick one of 4 templates and your brand color, then download a print-ready PDF, print it, copy a share link or open an email draft.",
    icon: Download,
  },
];

/** A small illustration of the generator at the active step. */
function StepVisual({ active }: { active: number }) {
  const Icon = STEPS[active].icon;
  return (
    <div className="relative mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-[#0f3f75] p-6 sm:p-8" aria-hidden>
      <div className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
      <div className="relative rounded-xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center gap-2">
          {STEPS.map((_, i) => (
            <React.Fragment key={i}>
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full text-[11px] font-semibold transition",
                  i < active && "bg-brand-tint text-brand",
                  i === active && "bg-brand text-white",
                  i > active && "bg-slate-100 text-slate-500",
                )}
              >
                {i + 1}
              </span>
              {i < STEPS.length - 1 && <span className={cn("h-0.5 flex-1 rounded", i < active ? "bg-brand" : "bg-slate-200")} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-brand-tint text-brand">
            <Icon className="size-5" />
          </span>
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-2/5 rounded bg-slate-200" />
            <div className="h-2 w-3/5 rounded bg-slate-100" />
          </div>
        </div>
        <div className="mt-5 space-y-2">
          {[82, 64, 74].map((w, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="h-2 rounded bg-slate-100" style={{ width: `${w - active * 6}%` }} />
              <div className="h-2 w-10 rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <div className="rounded-md bg-brand px-3 py-1.5 text-[11px] font-semibold text-white">
            {active === STEPS.length - 1 ? "Download PDF" : "Continue"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowToCreate() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-surface px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 className="text-3xl leading-tight text-ink sm:text-4xl">How to create an invoice with an invoice generator</h2>
          <p className="mt-5 max-w-md text-lg text-slate-600">
            Making a professional invoice with BillFlow takes four short steps, and you see the finished PDF the whole time.
          </p>
          <Button asChild className="mt-7 h-11 px-5">
            <Link href="/#generator">
              Create an invoice <ArrowRight />
            </Link>
          </Button>
          <StepVisual active={active} />
        </div>

        <ol className="self-center">
          {STEPS.map((step, i) => {
            const open = active === i;
            return (
              <li key={step.title} className="border-b border-border first:border-t">
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`howto-${i}`}
                    onClick={() => setActive(i)}
                    className="flex w-full items-center gap-4 py-5 text-left"
                  >
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold transition",
                        open ? "bg-brand text-white" : "bg-white text-slate-600 ring-1 ring-border",
                      )}
                    >
                      Step {i + 1}
                    </span>
                    <span className={cn("flex-1 text-lg", open ? "text-ink" : "text-slate-700")}>{step.title}</span>
                    {open ? <Minus className="size-5 text-brand" aria-hidden /> : <Plus className="size-5 text-slate-500" aria-hidden />}
                  </button>
                </h3>
                <div id={`howto-${i}`} hidden={!open} className="pb-6 pl-[4.75rem] pr-4 leading-relaxed text-slate-600">
                  {step.body}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
