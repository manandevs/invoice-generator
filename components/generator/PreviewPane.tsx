"use client";

import React, { useState } from "react";
import { Download, Expand, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { PageImage } from "@/lib/pdf/client";
import { cn } from "@/lib/utils";

/** A4 at 96 dpi. */
const A4_CSS_WIDTH = 794;

export interface PreviewState {
  pages: PageImage[];
  pending: boolean;
  error: string | null;
}

function Pages({ pages, zoom, className }: { pages: PageImage[]; zoom: "fit" | "100"; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {pages.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- rendered PDF page (blob URL)
        <img
          key={p.url}
          src={p.url}
          alt={`Invoice preview, page ${i + 1} of ${pages.length}`}
          width={p.width}
          height={p.height}
          className="h-auto max-w-none rounded-sm bg-white shadow-[0_1px_3px_rgb(15_23_42/0.12),0_8px_24px_rgb(15_23_42/0.08)]"
          style={{ width: zoom === "fit" ? "100%" : A4_CSS_WIDTH }}
        />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="aspect-[1/1.414] w-full animate-pulse rounded-sm bg-white p-[8%] shadow-sm" aria-label="Loading preview" role="status">
      <div className="flex justify-between">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="h-6 w-1/4 rounded bg-slate-200" />
      </div>
      <div className="mt-[10%] grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="h-2.5 w-3/4 rounded bg-slate-100" />
          <div className="h-2.5 w-1/2 rounded bg-slate-100" />
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-3/4 rounded bg-slate-100" />
          <div className="h-2.5 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-[10%] space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-3 rounded bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

function Status({ preview }: { preview: PreviewState }) {
  if (preview.error) return <span className="text-destructive">{preview.error}</span>;
  return (
    <span className="flex items-center gap-1.5" aria-live="polite">
      {preview.pending && preview.pages.length > 0 ? (
        <>
          <Loader2 className="size-3.5 animate-spin" aria-hidden /> Updating
        </>
      ) : preview.pages.length > 0 ? (
        `${preview.pages.length} ${preview.pages.length === 1 ? "page" : "pages"} · A4`
      ) : (
        "Rendering…"
      )}
    </span>
  );
}

export function PreviewPane({
  preview,
  onDownload,
  className,
}: {
  preview: PreviewState;
  onDownload: () => void;
  className?: string;
}) {
  const [zoom, setZoom] = useState<"fit" | "100">("fit");
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className={cn("flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-slate-100", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border bg-white px-3 py-2">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="font-semibold text-ink">Live preview</span>
          <Status preview={preview} />
        </div>
        <div className="flex items-center gap-1">
          <div role="radiogroup" aria-label="Zoom" className="mr-1 inline-flex rounded-lg bg-slate-100 p-0.5 text-xs">
            {(["fit", "100"] as const).map((z) => (
              <button
                key={z}
                type="button"
                role="radio"
                aria-checked={zoom === z}
                onClick={() => setZoom(z)}
                className={cn("rounded-md px-2.5 py-1.5 font-medium", zoom === z ? "bg-white text-ink shadow-xs" : "text-slate-600")}
              >
                {z === "fit" ? "Fit" : "100%"}
              </button>
            ))}
          </div>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Full screen preview" onClick={() => setFullscreen(true)}>
            <Expand />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Download PDF" onClick={onDownload}>
            <Download />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        {preview.pages.length ? <Pages pages={preview.pages} zoom={zoom} className={zoom === "100" ? "items-start" : ""} /> : <Skeleton />}
      </div>

      <FullscreenPreview open={fullscreen} onOpenChange={setFullscreen} preview={preview} onDownload={onDownload} />
    </div>
  );
}

export function FullscreenPreview({
  open,
  onOpenChange,
  preview,
  onDownload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: PreviewState;
  onDownload: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="fullscreen" hideClose aria-describedby="fullscreen-preview-desc">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
          <div>
            <DialogTitle className="text-base text-white">Invoice preview</DialogTitle>
            <DialogDescription id="fullscreen-preview-desc" className="mt-0 text-xs text-slate-300">
              Press Esc or click outside the page to close.
            </DialogDescription>
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={onDownload} className="bg-white text-ink hover:bg-slate-100">
              <Download /> Download PDF
            </Button>
            <Button type="button" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
        {/* Clicking the dark area around the pages closes the preview. */}
        <div
          className="min-h-0 flex-1 overflow-auto px-4 py-8"
          onClick={(e) => {
            if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.backdrop) onOpenChange(false);
          }}
        >
          <div data-backdrop="true" className="mx-auto max-w-[850px]">
            {preview.pages.length ? <Pages pages={preview.pages} zoom="fit" /> : <Skeleton />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Mobile: a floating button that opens the preview as a bottom sheet. */
export function MobilePreview({ preview, onDownload }: { preview: PreviewState; onDownload: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 h-12 rounded-full px-5 shadow-lg lg:hidden"
      >
        <Expand /> Preview
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent variant="sheet-bottom" className="flex h-[92dvh] flex-col p-0" closeLabel="Close preview">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 pr-14">
            <div>
              <DialogTitle className="text-base">Preview</DialogTitle>
              <DialogDescription className="mt-0 text-xs">
                <Status preview={preview} />
              </DialogDescription>
            </div>
            <Button type="button" size="sm" onClick={onDownload}>
              <Download /> Download
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-3">
            {preview.pages.length ? <Pages pages={preview.pages} zoom="fit" /> : <Skeleton />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
