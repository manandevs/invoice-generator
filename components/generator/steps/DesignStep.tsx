"use client";

import React, { useState } from "react";
import { Check, Link2, Mail, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCENT_PRESETS, FONT_INFO, TEMPLATE_INFO } from "@/lib/invoice/defaults";
import { FONTS, TEMPLATES, fieldId, type Invoice, type TemplateId } from "@/lib/invoice/schema";
import { useInvoiceStore } from "@/lib/invoice/store";
import { useInvoicePdf } from "@/lib/pdf/client";
import { cn } from "@/lib/utils";
import { Field, SelectField, inputClass, useFormField } from "../fields";

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
    <div className="space-y-5">
      <fieldset className="rounded-xl border border-border bg-white p-4 shadow-card sm:p-5">
        <legend className="sr-only">Template</legend>
        <h3 className="font-semibold text-ink" aria-hidden>
          Template
        </h3>
        <p className="text-sm text-slate-600">Thumbnails use your own invoice.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TEMPLATES.map((t) => {
            const selected = inv.template === t;
            return (
              <label
                key={t}
                className={cn(
                  "group relative cursor-pointer rounded-xl border-2 p-2 transition focus-within:ring-3 focus-within:ring-brand/25",
                  selected ? "border-brand bg-brand-tint/50" : "border-border hover:border-slate-300",
                )}
              >
                <input type="radio" name="template" value={t} checked={selected} onChange={() => update({ template: t })} className="sr-only" />
                <TemplateThumbnail invoice={inv} template={t} className="border border-border" />
                <span className="mt-2 block text-sm font-semibold text-ink">{TEMPLATE_INFO[t].name}</span>
                <span className="block text-xs text-slate-600">{TEMPLATE_INFO[t].description}</span>
                {selected && (
                  <span className="absolute right-3 top-3 grid size-6 place-items-center rounded-full bg-brand text-white">
                    <Check className="size-4" aria-hidden />
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <fieldset className="rounded-xl border border-border bg-white p-4 shadow-card sm:p-5">
          <legend className="sr-only">Accent color</legend>
          <h3 className="font-semibold text-ink" aria-hidden>
            Accent color
          </h3>
          <div className="mt-3 flex flex-wrap gap-3">
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
                    "grid size-10 place-items-center rounded-full shadow-sm ring-offset-2 transition hover:scale-105",
                    selected && "ring-2 ring-slate-500",
                  )}
                  style={{ backgroundColor: c.value }}
                >
                  {selected && <Check className="size-5 text-white" aria-hidden />}
                </button>
              );
            })}
            <label
              className={cn(
                "relative grid size-10 cursor-pointer place-items-center overflow-hidden rounded-full shadow-sm ring-offset-2 focus-within:ring-2 focus-within:ring-brand",
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
          <Field label="Hex code" htmlFor={fieldId("accentColor")} error={accent.error ?? (/^#[0-9a-f]{6}$/i.test(hexDraft) ? undefined : "Use a hex color like #2270C3")} className="mt-4 max-w-40">
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
        </fieldset>

        <div className="space-y-4 rounded-xl border border-border bg-white p-4 shadow-card sm:p-5">
          <h3 className="font-semibold text-ink">Typography</h3>
          <SelectField
            path="font"
            label="Font"
            value={inv.font}
            onChange={(font) => update({ font })}
            options={FONTS.map((f) => ({ value: f, label: FONT_INFO[f].name }))}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4 shadow-card sm:p-5">
        <h3 className="font-semibold text-ink">Send it</h3>
        <p className="mt-1 text-sm text-slate-600">
          Download is the main button below. You can also print it, copy a share link or start an email.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
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
            <strong className="font-medium text-slate-700">Share link:</strong> the invoice is stored inside the link itself, never on our servers. Logo and signature aren&apos;t included.
          </li>
          <li>
            <strong className="font-medium text-slate-700">Email:</strong> downloads the PDF and opens a draft in your email app with the client&apos;s address, subject and message filled in. Attach the downloaded PDF before sending.
          </li>
        </ul>
      </div>
    </div>
  );
}
