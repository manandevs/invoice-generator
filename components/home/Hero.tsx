import React from "react";
import { Check } from "lucide-react";
import Generator from "@/components/generator/Generator";

const POINTS = ["No account needed", "Saved in your browser", "Tax, discounts & shipping", "4 PDF templates"];

const Hero = () => {
  return (
    <section id="generator" className="relative scroll-mt-20 overflow-clip bg-surface pb-20 pt-12 sm:pt-16">
      {/* overflow-clip (not overflow-hidden) clips the decoration without breaking the sticky preview. */}
      {/* Faint dotted grid that fades out toward the generator. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-112 bg-[radial-gradient(circle,#cbd5e1_1px,transparent_1px)] bg-size-[22px_22px] mask-[linear-gradient(to_bottom,black,transparent)] opacity-60"
      />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-3xl -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative mx-auto max-w-10xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <h1 className="text-4xl leading-[1.1] text-ink sm:text-6xl">
            <span className="text-brand">Create invoices</span> that
            <br className="hidden sm:block" /> make you look good
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Build a professional invoice, tax invoice or proforma in 4 simple steps. Preview it live and download a print-ready
            PDF, free and without signing up.
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-700">
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
