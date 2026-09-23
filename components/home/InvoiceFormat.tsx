import React from "react";
import { cn } from "@/lib/utils";

const LEFT = [
  { n: 1, text: "Your business logo, name, address and contact details." },
  { n: 3, text: "Item details: description, quantity, unit price and amount." },
  { n: 5, text: "Notes, terms and conditions, and how to pay you." },
];
const RIGHT = [
  { n: 2, text: "The document title, invoice number, issue date and due date." },
  { n: 4, text: "Subtotal, discount, tax and the total amount due." },
];

function Marker({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn("grid size-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-semibold text-white shadow-md ring-4 ring-white", className)}>
      {n}
    </span>
  );
}

function Callout({ n, text, side }: { n: number; text: string; side: "left" | "right" }) {
  return (
    <li className={cn("flex items-start gap-3 lg:items-center", side === "left" && "lg:flex-row-reverse lg:text-right")}>
      {/* On desktop the numbers sit on the illustration; the dashed line points at them. */}
      <Marker n={n} className="lg:hidden" />
      <span className="hidden h-px flex-1 border-t border-dashed border-slate-300 lg:block" aria-hidden />
      <p className="text-sm leading-relaxed text-slate-600 lg:max-w-52">{text}</p>
    </li>
  );
}

const bar = (w: string, tone = "bg-slate-200") => <div className={cn("h-1.5 rounded", tone)} style={{ width: w }} />;

/** An illustrated invoice with numbered parts. */
function MockInvoice() {
  return (
    <div className="relative mx-auto w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-[0_20px_60px_rgb(15_23_42/0.12)] sm:p-8" aria-hidden>
      <div className="relative flex justify-between">
        <div className="space-y-1.5">
          <div className="mb-3 grid size-9 place-items-center rounded-md bg-ink text-sm font-bold text-white">B</div>
          {bar("5rem", "bg-slate-300")}
          {bar("7rem")}
          {bar("6rem")}
        </div>
        <Marker n={1} className="absolute -left-9 top-2 sm:-left-11" />
        <div className="space-y-1.5 text-right">
          <p className="text-lg font-semibold tracking-wide text-brand">INVOICE</p>
          <div className="ml-auto">{bar("5.5rem", "bg-slate-300")}</div>
          <div className="ml-auto flex justify-end">{bar("4.5rem")}</div>
          <div className="ml-auto flex justify-end">{bar("5rem")}</div>
        </div>
        <Marker n={2} className="absolute -right-9 top-2 sm:-right-11" />
      </div>

      <div className="mt-6 space-y-1.5">
        {bar("3rem", "bg-slate-300")}
        {bar("6.5rem")}
        {bar("5rem")}
      </div>

      <div className="relative mt-6">
        <div className="flex justify-between rounded-sm bg-brand px-2 py-1.5">
          {["w-16", "w-6", "w-8", "w-10"].map((w, i) => (
            <div key={i} className={cn("h-1.5 rounded bg-white/70", w)} />
          ))}
        </div>
        {[0, 1, 2].map((r) => (
          <div key={r} className={cn("flex justify-between px-2 py-2", r % 2 === 1 && "bg-slate-50")}>
            <div className="h-1.5 w-20 rounded bg-slate-200" />
            <div className="h-1.5 w-4 rounded bg-slate-200" />
            <div className="h-1.5 w-7 rounded bg-slate-200" />
            <div className="h-1.5 w-9 rounded bg-slate-300" />
          </div>
        ))}
        <Marker n={3} className="absolute -left-9 top-8 sm:-left-11" />
      </div>

      <div className="relative ml-auto mt-4 w-40 space-y-2 rounded-md bg-slate-50 p-3">
        {[0, 1].map((r) => (
          <div key={r} className="flex justify-between">
            {bar("2.5rem")}
            {bar("2rem", "bg-slate-300")}
          </div>
        ))}
        <div className="flex justify-between rounded-sm bg-brand px-2 py-1.5">
          <div className="h-1.5 w-8 rounded bg-white/80" />
          <div className="h-1.5 w-10 rounded bg-white" />
        </div>
        <Marker n={4} className="absolute -right-9 top-6 sm:-right-11" />
      </div>

      <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4">
        <div className="space-y-1.5">
          {bar("3rem", "bg-brand/40")}
          {bar("6rem")}
          {bar("5rem")}
        </div>
        <div className="space-y-1.5">
          {bar("3.5rem", "bg-brand/40")}
          {bar("5.5rem")}
        </div>
        <Marker n={5} className="absolute -left-9 top-4 sm:-left-11" />
      </div>
    </div>
  );
}

export default function InvoiceFormat() {
  return (
    <section className="overflow-hidden bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl text-ink sm:text-4xl">Invoice format</h2>
          <p className="mt-3 text-lg text-slate-600">A professional invoice is made of these parts. BillFlow lays them out for you.</p>
        </div>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,28rem)_1fr] lg:gap-6">
          <ol className="order-2 space-y-5 lg:order-1 lg:space-y-24">
            {LEFT.map((c) => (
              <Callout key={c.n} {...c} side="left" />
            ))}
          </ol>
          <div className="order-1 px-10 lg:order-2 lg:px-0">
            <MockInvoice />
          </div>
          <ol className="order-3 space-y-5 lg:space-y-40">
            {RIGHT.map((c) => (
              <Callout key={c.n} {...c} side="right" />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
