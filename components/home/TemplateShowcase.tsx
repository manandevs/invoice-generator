"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TEMPLATE_INFO, sampleInvoice } from "@/lib/invoice/defaults";
import { TEMPLATES } from "@/lib/invoice/schema";

// The PDF engine only loads once this band scrolls into view.
const TemplateThumbnail = dynamic(() => import("@/components/generator/steps/DesignStep").then((m) => m.TemplateThumbnail), {
  ssr: false,
  loading: () => <div className="aspect-[1/1.414] w-full animate-pulse rounded-md bg-slate-100" />,
});

const DOC_LABELS = ["Classic invoice", "Modern invoice", "Minimal invoice", "Bold invoice"];

export default function TemplateShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [visible, setVisible] = useState(false);
  const sample = useMemo(() => sampleInvoice(), []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("li");
    track.scrollBy({ left: dir * ((card?.clientWidth ?? 280) + 20), behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="bg-ink py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <h2 className="max-w-xl text-3xl leading-tight sm:text-4xl">
            Invoice templates: simple, stylish and surprisingly effortless
          </h2>
          <Button asChild className="h-11 shrink-0 bg-white px-5 text-ink hover:bg-slate-100">
            <Link href="/templates">
              Explore templates <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Previous templates"
            className="absolute -left-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg transition hover:scale-105 md:grid lg:hidden"
          >
            <ChevronLeft className="size-5" />
          </button>
          <ul
            ref={trackRef}
            className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {TEMPLATES.map((t, i) => (
              <li key={t} className="w-[70%] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]">
                <Link
                  href={`/?template=${t}#generator`}
                  className="group relative block rounded-xl bg-white p-3 text-ink transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  {visible ? (
                    <TemplateThumbnail invoice={sample} template={t} className="border border-border" />
                  ) : (
                    <div className="aspect-[1/1.414] w-full rounded-md bg-slate-100" />
                  )}
                  <span className="mt-3 flex items-center justify-between px-1 text-sm font-medium">
                    {DOC_LABELS[i]}
                    <ArrowUpRight className="size-4 text-slate-500 transition group-hover:text-brand" aria-hidden />
                  </span>
                  <span className="sr-only">. {TEMPLATE_INFO[t].description} Use this template.</span>
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="More templates"
            className="absolute -right-3 top-1/2 z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lg transition hover:scale-105 md:grid lg:hidden"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
