"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Download, FilePlus2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { calculateTotals, formatMoney, pdfFilename } from "@/lib/invoice/calc";
import { STEPS, TEMPLATES, fieldId, stepForPath, validateInvoice, type TemplateId } from "@/lib/invoice/schema";
import { buildMailto, buildShareUrl, decodeShareHash, SHARE_HASH_PREFIX } from "@/lib/invoice/share";
import { useInvoiceStore, useStoreHydrated } from "@/lib/invoice/store";
import { downloadBlob, getInvoiceBlob, printBlob, useInvoicePdf } from "@/lib/pdf/client";
import { FormContext } from "./fields";
import { SaveIndicator, Stepper } from "./Stepper";
import { DocumentInfoPanel, DocumentStep } from "./steps/DocumentStep";

// Steps 2–4 and the preview load on demand so the landing page only ships step 1.
const stepLoading = () => <div className="h-96 animate-pulse rounded-xl bg-slate-100" />;
const DetailsStep = dynamic(() => import("./steps/DetailsStep").then((m) => m.DetailsStep), { loading: stepLoading });
const ItemsStep = dynamic(() => import("./steps/ItemsStep").then((m) => m.ItemsStep), { loading: stepLoading });
const DesignStep = dynamic(() => import("./steps/DesignStep").then((m) => m.DesignStep), { loading: stepLoading });
const PreviewPane = dynamic(() => import("./PreviewPane").then((m) => m.PreviewPane));
const MobilePreview = dynamic(() => import("./PreviewPane").then((m) => m.MobilePreview));
const prefetchSteps = () =>
  Promise.all([import("./steps/DetailsStep"), import("./steps/ItemsStep"), import("./steps/DesignStep"), import("./PreviewPane")]);

const LAST = STEPS.length - 1;

/**
 * Focus the first invalid field in page order, after collapsed sections have opened.
 * Retries briefly because the step may still be loading.
 */
function focusFirst(paths: string[], attempt = 0) {
  window.setTimeout(() => {
    const els = paths
      .map((p) => document.getElementById(fieldId(p)))
      .filter((el): el is HTMLElement => !!el);
    els.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    const el = els[0];
    if (!el) {
      if (attempt < 20) focusFirst(paths, attempt + 1);
      return;
    }
    el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  }, 60);
}

export default function Generator() {
  const hydrated = useStoreHydrated();
  const invoice = useInvoiceStore((s) => s.invoice);
  const step = useInvoiceStore((s) => s.step);
  const savedAt = useInvoiceStore((s) => s.savedAt);
  const setStep = useInvoiceStore((s) => s.setStep);
  const newInvoice = useInvoiceStore((s) => s.newInvoice);
  const loadInvoice = useInvoiceStore((s) => s.loadInvoice);
  const markDownloaded = useInvoiceStore((s) => s.markDownloaded);
  const update = useInvoiceStore((s) => s.update);
  const reduceMotion = useReducedMotion();
  const topRef = useRef<HTMLDivElement>(null);

  const [attempted, setAttempted] = useState<Set<number>>(() => new Set());
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [revealToken, setRevealToken] = useState(0);
  const [confirmNew, setConfirmNew] = useState(false);
  const [busy, setBusy] = useState(false);

  const { errors, byStep } = useMemo(() => validateInvoice(invoice), [invoice]);
  const firstInvalid = byStep.findIndex((e) => Object.keys(e).length > 0);
  const reachable = firstInvalid === -1 ? LAST : firstInvalid;
  const complete = byStep.map((e) => Object.keys(e).length === 0);

  // One render feeds the pane, full screen, mobile sheet and downloads, so the preview is the PDF.
  const preview = useInvoicePdf(invoice, { enabled: hydrated && step > 0 });

  const form = useMemo(() => {
    const visible: Record<string, string> = {};
    for (const [path, message] of Object.entries(errors)) {
      if (attempted.has(stepForPath(path.split("."))) || touched.has(path)) visible[path] = message;
    }
    return {
      visible,
      revealToken,
      errorFor: (path: string) => visible[path],
      touch: (path: string) =>
        setTouched((prev) => (prev.has(path) ? prev : new Set(prev).add(path))),
    };
  }, [errors, attempted, touched, revealToken]);

  /** Show and focus the errors of `index`. Returns false if the step is valid. */
  const blockOn = useCallback(
    (index: number) => {
      const paths = Object.keys(byStep[index]);
      if (paths.length === 0) return false;
      setAttempted((prev) => new Set(prev).add(index));
      setRevealToken((t) => t + 1);
      focusFirst(paths);
      return true;
    },
    [byStep],
  );

  const goTo = useCallback(
    (index: number) => {
      setStep(index);
      const top = topRef.current;
      if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ block: "start" });
    },
    [setStep],
  );

  const next = () => {
    if (blockOn(step)) {
      toast.error("Please fix the highlighted fields to continue.");
      return;
    }
    goTo(Math.min(step + 1, LAST));
  };

  /** Everything must be valid before the invoice leaves the app. */
  const ensureValid = () => {
    if (firstInvalid === -1) return true;
    toast.error(`Please complete the ${STEPS[firstInvalid].label} step first.`);
    if (step !== firstInvalid) goTo(firstInvalid);
    window.setTimeout(() => blockOn(firstInvalid), 50);
    return false;
  };

  const withBlob = async (fn: (blob: Blob) => Promise<void> | void) => {
    if (!ensureValid() || busy) return;
    setBusy(true);
    try {
      await fn(await getInvoiceBlob(invoice, preview));
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong creating the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const download = () =>
    withBlob((blob) => {
      const name = pdfFilename(invoice);
      downloadBlob(blob, name);
      markDownloaded();
      toast.success("PDF downloaded", { description: name });
    });

  const print = () =>
    withBlob(async (blob) => {
      try {
        await printBlob(blob);
      } catch {
        toast.error("Your browser blocked printing. Download the PDF and print it from there.");
      }
    });

  const share = async () => {
    if (!ensureValid()) return;
    const url = buildShareUrl(invoice, window.location.origin);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied", {
        description: "Anyone with the link can open this invoice. The logo and signature aren't included.",
      });
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const email = () => {
    if (!invoice.client.email.trim()) {
      toast.error("Add your client's email address first.");
      goTo(1);
      setTouched((t) => new Set(t).add("client.email"));
      focusFirst(["client.email"]);
      return;
    }
    return withBlob((blob) => {
      downloadBlob(blob, pdfFilename(invoice));
      markDownloaded();
      const total = formatMoney(calculateTotals(invoice).grandTotal, invoice.currency, invoice.locale);
      window.location.href = buildMailto(invoice, total);
      toast.success("Email draft opened", {
        description: "The PDF was downloaded. Attach it to the email before sending.",
        duration: 8000,
      });
    });
  };

  // Load the other steps in the background once the page is idle.
  useEffect(() => {
    if (!hydrated) return;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(() => void prefetchSteps());
  }, [hydrated]);

  // Open shared links (#invoice=…) and "Use this template" links (?template=…).
  useEffect(() => {
    if (!hydrated) return;
    const url = new URL(window.location.href);
    let changed = false;
    if (url.hash.startsWith(SHARE_HASH_PREFIX)) {
      const shared = decodeShareHash(url.hash);
      if (shared) {
        loadInvoice(shared);
        toast.success("Shared invoice opened", { description: "It's now your draft. Edit it or download it." });
      } else {
        toast.error("That share link is incomplete or damaged.");
      }
      url.hash = "generator";
      changed = true;
    }
    const template = url.searchParams.get("template");
    if (template && (TEMPLATES as readonly string[]).includes(template)) {
      update({ template: template as TemplateId });
      toast.success(`${template[0].toUpperCase()}${template.slice(1)} template selected`);
      url.searchParams.delete("template");
      changed = true;
    }
    if (changed) {
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      document.getElementById("generator")?.scrollIntoView({ block: "start" });
    }
  }, [hydrated, loadInvoice, update]);

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-12" aria-busy="true" aria-label="Loading your invoice">
        <div className="h-[36rem] animate-pulse rounded-2xl border border-border bg-white lg:col-span-7" />
        <div className="hidden h-[36rem] animate-pulse rounded-2xl bg-slate-100 lg:col-span-5 lg:block" />
      </div>
    );
  }

  const current = STEPS[step] ?? STEPS[0];
  const stepContent = [
    <DocumentStep key="document" />,
    <DetailsStep key="details" />,
    <ItemsStep key="items" />,
    <DesignStep key="design" onPrint={print} onShare={share} onEmail={email} />,
  ][step];

  return (
    <FormContext.Provider value={form}>
      <div ref={topRef} className="grid gap-6 lg:grid-cols-12 lg:items-start">
        <div className="min-w-0 lg:col-span-7">
          <div className="rounded-2xl border border-border bg-white shadow-card">
            <div className="border-b border-border px-4 pb-5 pt-3 sm:px-6 sm:pt-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <SaveIndicator savedAt={savedAt} />
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmNew(true)} className="text-slate-700">
                  <FilePlus2 /> New invoice
                </Button>
              </div>
              <Stepper current={step} reachable={reachable} complete={complete} onSelect={goTo} />
            </div>

            <div className="bg-surface/50 p-4 sm:p-6">
              <div className="mb-4 sm:mb-5">
                {/* Hidden on phones, where the stepper already says "Step N of 4". */}
                <p className="hidden text-xs font-semibold uppercase tracking-wider text-brand sm:block">
                  Step {step + 1} of {STEPS.length}
                </p>
                <h2 className="mt-1 text-2xl leading-tight text-ink sm:text-[1.75rem]">{current.label}</h2>
                <p className="mt-1 text-[15px] text-slate-600">{current.description}</p>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: reduceMotion ? 0 : 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reduceMotion ? 0 : -12 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
                >
                  {stepContent}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
              <Button type="button" variant="outline" className="h-11 px-5" onClick={() => goTo(step - 1)} disabled={step === 0}>
                <ArrowLeft /> Back
              </Button>
              {step < LAST ? (
                <Button type="button" className="h-11 px-6 text-base" onClick={next}>
                  Continue <ArrowRight />
                </Button>
              ) : (
                <Button type="button" className="h-11 px-6 text-base" onClick={download} disabled={busy}>
                  <Download /> {busy ? "Preparing…" : "Download PDF"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* The aside stretches to the form's height so the preview can stay sticky beside it. */}
        <aside className="hidden min-w-0 lg:col-span-5 lg:block lg:self-stretch" aria-label="Preview">
          <div className="sticky top-20">
            {step === 0 ? (
              <DocumentInfoPanel />
            ) : (
              <PreviewPane preview={preview} onDownload={download} className="h-[calc(100dvh-6.5rem)] max-h-[60rem] shadow-card" />
            )}
          </div>
        </aside>
      </div>

      {step > 0 && <MobilePreview preview={preview} onDownload={download} />}

      <Dialog open={confirmNew} onOpenChange={setConfirmNew}>
        <DialogContent>
          <DialogTitle>Start a new invoice?</DialogTitle>
          <DialogDescription>
            The client, items and notes will be cleared. Your business details, payment instructions and design are kept.
            Download the current invoice first if you still need it.
          </DialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                newInvoice();
                setAttempted(new Set());
                setTouched(new Set());
                setConfirmNew(false);
                toast.success("New invoice started", { description: `Number ${useInvoiceStore.getState().invoice.number}` });
              }}
            >
              Start new invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FormContext.Provider>
  );
}
