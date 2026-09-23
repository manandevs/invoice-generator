"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateThumbnail } from "@/components/generator/steps/DesignStep";
import { TEMPLATE_INFO, sampleInvoice } from "@/lib/invoice/defaults";
import { TEMPLATES } from "@/lib/invoice/schema";

export function TemplateGallery() {
  const sample = useMemo(() => sampleInvoice(), []);
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {TEMPLATES.map((t) => (
        <li key={t} className="flex flex-col rounded-2xl border border-border bg-white p-3 shadow-card">
          <TemplateThumbnail invoice={sample} template={t} className="border border-border" />
          <div className="flex flex-1 flex-col p-2 pt-4">
            <h2 className="text-lg font-semibold text-ink">{TEMPLATE_INFO[t].name}</h2>
            <p className="mt-1 flex-1 text-sm text-slate-600">{TEMPLATE_INFO[t].description}</p>
            <Button asChild className="mt-4 h-11">
              <Link href={`/?template=${t}#generator`} aria-label={`Use the ${TEMPLATE_INFO[t].name} template`}>
                Use this template <ArrowRight />
              </Link>
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
