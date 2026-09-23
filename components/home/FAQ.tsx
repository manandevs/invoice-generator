"use client";

import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { FAQS } from "@/lib/content/faqs";
import { cn } from "@/lib/utils";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" className="scroll-mt-20 bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-12 text-center text-3xl text-ink sm:text-4xl">
          <span className="text-brand">Frequently</span> asked questions
        </h2>
        <div className="border-t border-border">
          {FAQS.map((faq, i) => {
            const open = openIndex === i;
            return (
              <div key={faq.q} className="border-b border-border">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={open}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpenIndex(open ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className={cn("text-lg transition-colors", open ? "text-brand" : "text-ink hover:text-brand")}>{faq.q}</span>
                    {open ? (
                      <Minus className="size-5 shrink-0 text-brand" aria-hidden />
                    ) : (
                      <Plus className="size-5 shrink-0 text-slate-500" aria-hidden />
                    )}
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  hidden={!open}
                  className="max-w-3xl pb-6 leading-relaxed text-slate-600"
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
