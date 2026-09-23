import React from "react";
import { Check } from "lucide-react";
import Generator from "@/components/generator/Generator";

const POINTS = ["No account needed", "Saved in your browser", "Tax, discounts & shipping", "4 PDF templates"];

const Hero = () => {
  return (
    <section id="generator" className="scroll-mt-20 bg-surface pb-16 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">Free invoice generator</h1>
          <p className="mt-3 text-lg text-slate-700">
            Create a professional invoice, tax invoice or proforma in 4 steps, preview it live and download a print-ready PDF.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-700">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-1.5">
                <Check className="size-4 text-brand" aria-hidden />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <Generator />
      </div>
    </section>
  );
};

export default Hero;
