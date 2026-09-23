import React from "react";
import { Calculator, Globe, MousePointer2, Save, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    title: "Fast & guided",
    desc: "Four short steps with validation as you go, so nothing required is missed.",
    icon: Zap,
  },
  {
    title: "Accurate totals",
    desc: "Per-line tax rates, discounts and shipping, calculated in cents so every total adds up.",
    icon: Calculator,
  },
  {
    title: "Multi-currency",
    desc: "Bill in USD, EUR, GBP or PKR, formatted correctly on the PDF.",
    icon: Globe,
  },
  {
    title: "No account required",
    desc: "Everything works without signing up. A free account only adds syncing your business details.",
    icon: MousePointer2,
  },
  {
    title: "Auto-saved draft",
    desc: "Your invoice is saved in this browser as you type, so a refresh doesn't lose your work.",
    icon: Save,
  },
  {
    title: "Private by design",
    desc: "Invoices are built in your browser. We never upload or store your invoice or client details.",
    icon: ShieldCheck,
  },
];

const Features = () => {
  return (
    <section className="bg-surface px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-ink sm:text-4xl">Why choose BillFlow?</h2>
          <p className="mx-auto max-w-2xl text-slate-700">Everything you need to get paid faster and look more professional.</p>
        </div>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, desc, icon: Icon }) => (
            <li key={title} className="rounded-2xl border border-border bg-white p-7 shadow-card">
              <div className="mb-5 grid size-12 place-items-center rounded-xl bg-brand-tint text-brand">
                <Icon className="size-6" aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-bold text-ink">{title}</h3>
              <p className="text-[15px] leading-relaxed text-slate-700">{desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Features;
