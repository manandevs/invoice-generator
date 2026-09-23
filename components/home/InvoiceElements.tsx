import React from "react";

const ELEMENTS = [
  {
    title: "Business logo",
    body: "Your logo makes the invoice instantly recognizable and reinforces your brand every time a client opens it.",
  },
  {
    title: "Invoice number",
    body: "A unique, sequential number makes each invoice easy to track and reference. BillFlow suggests the next one for you.",
  },
  {
    title: "Business name and details",
    body: "Your legal business name, address and contact details, plus your Tax ID or VAT number when it's a tax invoice.",
  },
  {
    title: "Product or service description",
    body: "Clear line items with quantity and unit price, so the client knows exactly what they're paying for.",
  },
  {
    title: "Invoice and due dates",
    body: "The issue date and the payment due date, set by your payment terms, tell the client when to pay.",
  },
  {
    title: "Terms and payment details",
    body: "Payment terms, late fees and your bank details, so there's nothing to chase and no reason to delay payment.",
  },
];

export default function InvoiceElements() {
  return (
    <section className="bg-surface px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-14 text-3xl text-ink sm:text-4xl">What should an invoice include?</h2>
        <ul className="grid gap-x-16 gap-y-12 sm:grid-cols-2">
          {ELEMENTS.map((e) => (
            <li key={e.title} className="flex gap-5">
              <span className="mt-1 size-6 shrink-0 rounded-full bg-brand shadow-[0_0_0_6px_var(--brand-tint)]" aria-hidden />
              <div>
                <h3 className="text-xl text-ink">{e.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{e.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
