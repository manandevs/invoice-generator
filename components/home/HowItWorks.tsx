import React from "react";
import { Download, FileText, LayoutTemplate, ListPlus } from "lucide-react";

const steps = [
  {
    title: "Document",
    description: "Choose an invoice, a tax invoice with VAT/GST details, or a proforma invoice.",
    icon: FileText,
  },
  {
    title: "Details",
    description: "Add your business, your client, dates and payment terms. The due date is set for you.",
    icon: ListPlus,
  },
  {
    title: "Items",
    description: "List products or services. Tax, discounts, shipping and totals are calculated to the cent.",
    icon: LayoutTemplate,
  },
  {
    title: "Design & Download",
    description: "Pick one of 4 templates and an accent color, then download, print, share or email it.",
    icon: Download,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="bg-brand px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-3xl font-bold text-white sm:text-4xl md:text-5xl">How to create an invoice in 4 steps</h2>
        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="rounded-2xl border border-white/20 bg-black/15 p-6">
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-white text-brand">
                  <Icon className="size-6" aria-hidden />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  {index + 1}. {step.title}
                </h3>
                <p className="leading-relaxed text-white">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
