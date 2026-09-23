"use client";

import React, { useState } from "react";
import { Check, LayoutTemplate, Link2, Mail, Palette, Printer, Send, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCENT_PRESETS, FONT_INFO, TEMPLATE_INFO } from "@/lib/invoice/defaults";
import { FONTS, TEMPLATES, fieldId, type Invoice, type TemplateId } from "@/lib/invoice/schema";
import { useInvoiceStore } from "@/lib/invoice/store";
import { useInvoicePdf } from "@/lib/pdf/client";
import { cn } from "@/lib/utils";
import { Field, FormCard, SelectField, inputClass, useFormField } from "../fields";

/** A first-page thumbnail of the user's own invoice in one template. */
export function TemplateThumbnail({ invoice, template, className }: { invoice: Invoice; template: TemplateId; className?: string }) {
  // Longer debounce than the main preview; only re-renders when the invoice content changes.
  const source = useStableInvoice({ ...invoice, template });
  const { pages } = useInvoicePdf(source, { pixelWidth: 420, maxPages: 1, delay: 700 });
  return (
    <div className={cn("aspect-[1/1.414] overflow-hidden rounded-md bg-white", className)}>
      {pages[0] ? (
        // eslint-disable-next-line @next/next/no-img-element -- rendered PDF page (blob URL)
        <img src={pages[0].url} alt="" className="h-full w-full object-cover object-top" />
      ) : (
        <div className="h-full w-full animate-pulse bg-slate-100" />
      )}
    </div>
  );
}

/** Keep the same object while the serialized invoice is unchanged, so effects don't refire every render. */
function useStableInvoice(invoice: Invoice): Invoice {
  const key = JSON.stringify(invoice);
  const [state, setState] = useState({ key, invoice });
  if (state.key !== key) {
    setState({ key, invoice });
    return invoice;
  }
  return state.invoice;
}

export function DesignStep({
  onPrint,
  onShare,
  onEmail,
}: {
  onPrint: () => void;
  onShare: () => void;
  onEmail: () => void;
}) {
  const inv = useInvoiceStore((s) => s.invoice);
  const update = useInvoiceStore((s) => s.update);
  const accent = useFormField("accentColor");
  const [hexDraft, setHexDraft] = useState(inv.accentColor);
  const [lastAccent, setLastAccent] = useState(inv.accentColor);
  if (lastAccent !== inv.accentColor) {
    setLastAccent(inv.accentColor);
    setHexDraft(inv.accentColor);
  }

  const setAccent = (value: string) => update({ accentColor: value.toUpperCase() });
  const isPreset = ACCENT_PRESETS.some((p) => p.value.toUpperCase() === inv.accentColor.toUpperCase());

  return (
    <div className="space-y-4">
      <FormCard icon={LayoutTemplate} title="Template" description="Thumbnails use your own invoice" labelledById="design-template-title">
        <div role="radiogroup" aria-labelledby="design-template-title" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TEMPLATES.map((t) => {
            const selected = inv.template === t;
            return (
              <label
                key={t}
                className={cn(
                  "group relative flex cursor-pointer flex-col rounded-xl border bg-white p-2 transition duration-150",
                  "has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/30",
                  selected
                    ? "border-brand bg-brand-tint/40 shadow-md ring-4 ring-brand/15"
                    : "border-border hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md motion-reduce:hover:translate-y-0",
                )}
              >
                <input type="radio" name="template" value={t} checked={selected} onChange={() => update({ template: t })} className="sr-only" />
                <span className="relative block overflow-hidden rounded-md">
                  <TemplateThumbnail
                    invoice={inv}
                    template={t}
                    className={cn("border transition", selected ? "border-brand/40" : "border-border group-hover:border-slate-300")}
                  />
                  {!selected && (
                    <span className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:bg-ink/5 group-hover:opacity-100" aria-hidden>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink shadow">Use {TEMPLATE_INFO[t].name}</span>
                    </span>
                  )}
                </span>
                <span className="mt-2 flex items-center justify-between gap-1 px-0.5">
                  <span className={cn("text-sm font-semibold", selected ? "text-brand" : "text-ink")}>{TEMPLATE_INFO[t].name}</span>
                  {selected && <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-medium text-white">Selected</span>}
                </span>
                <span className="mt-0.5 block px-0.5 text-xs leading-snug text-slate-600">{TEMPLATE_INFO[t].description}</span>
                {selected && (
                  <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-brand text-white shadow ring-2 ring-white">
                    <Check className="size-4" aria-hidden />
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </FormCard>

      <div className="grid gap-4 md:grid-cols-2">
        <FormCard icon={Palette} title="Accent color" description="Title, table header and total" labelledById="design-accent-title">
          <div role="group" aria-labelledby="design-accent-title" className="flex flex-wrap gap-2.5">
            {ACCENT_PRESETS.map((c) => {
              const selected = inv.accentColor.toUpperCase() === c.value.toUpperCase();
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-label={`${c.name} accent`}
                  aria-pressed={selected}
                  onClick={() => setAccent(c.value)}
                  className={cn(
                    "grid size-9 place-items-center rounded-full shadow-sm ring-offset-2 transition hover:scale-105 motion-reduce:hover:scale-100",
                    selected && "ring-2 ring-slate-500",
                  )}
                  style={{ backgroundColor: c.value }}
                >
                  {selected && <Check className="size-4 text-white" aria-hidden />}
                </button>
              );
            })}
            <label
              className={cn(
                "relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full shadow-sm ring-offset-2 focus-within:ring-2 focus-within:ring-brand",
                !isPreset && "ring-2 ring-slate-500",
              )}
              style={{ background: "conic-gradient(#ef4444, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #ef4444)" }}
            >
              <span className="sr-only">Custom accent color</span>
              <input
                type="color"
                value={inv.accentColor}
                onChange={(e) => setAccent(e.target.value)}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
              />
              {!isPreset && <span className="size-4 rounded-full border-2 border-white" style={{ backgroundColor: inv.accentColor }} />}
            </label>
          </div>
          <Field
            label="Hex code"
            htmlFor={fieldId("accentColor")}
            error={accent.error ?? (/^#[0-9a-f]{6}$/i.test(hexDraft) ? undefined : "Use a hex color like #2270C3")}
            className="mt-4 max-w-40"
          >
            <input
              id={fieldId("accentColor")}
              value={hexDraft}
              maxLength={7}
              spellCheck={false}
              onChange={(e) => {
                const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
                setHexDraft(v);
                if (/^#[0-9a-f]{6}$/i.test(v)) setAccent(v);
              }}
              className={cn(inputClass, "font-mono uppercase")}
            />
          </Field>
        </FormCard>

        <FormCard icon={Type} title="Typography" description="Font used in the PDF" className="self-start">
          <SelectField
            path="font"
            label="Font"
            value={inv.font}
            onChange={(font) => update({ font })}
            options={FONTS.map((f) => ({ value: f, label: FONT_INFO[f].name }))}
          />
        </FormCard>
      </div>

      <FormCard icon={Send} title="Send it" description="Download is the main button below">
        <div className="grid gap-2 sm:grid-cols-3">
          <Button type="button" variant="outline" className="h-11" onClick={onPrint}>
            <Printer /> Print
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={onShare}>
            <Link2 /> Copy share link
          </Button>
          <Button type="button" variant="outline" className="h-11" onClick={onEmail}>
            <Mail /> Email
          </Button>
        </div>
        <ul className="mt-3 space-y-1 text-xs text-slate-600">
          <li>
            <strong className="font-medium text-slate-700">Share link:</strong> the invoice is stored inside the link itself, never on our
            servers. Logo and signature aren&apos;t included.
          </li>
          <li>
            <strong className="font-medium text-slate-700">Email:</strong> downloads the PDF and opens a draft in your email app with the
            client&apos;s address, subject and message filled in. Attach the downloaded PDF before sending.
          </li>
        </ul>
      </FormCard>
    </div>
  );
}
