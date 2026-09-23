"use client";

import { useEffect, useRef, useState } from "react";
import type { Invoice } from "@/lib/invoice/schema";

/** Renders the same <InvoiceDocument> used for downloads. Loaded lazily to keep the landing page light. */
export async function renderInvoiceBlob(invoice: Invoice): Promise<Blob> {
  const [{ pdf }, { InvoiceDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./InvoiceDocument"),
  ]);
  return pdf(<InvoiceDocument invoice={invoice} />).toBlob();
}

type PdfJs = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<PdfJs> | null = null;

function loadPdfJs(): Promise<PdfJs> {
  pdfjsPromise ??= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
    return pdfjs;
  });
  return pdfjsPromise;
}

export interface PageImage {
  url: string;
  width: number;
  height: number;
}

/** Draw PDF pages to images at `pixelWidth` wide. The caller owns (and must revoke) the URLs. */
export async function rasterizePdf(blob: Blob, pixelWidth: number, maxPages = Infinity): Promise<PageImage[]> {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()), verbosity: 0 });
  try {
    const doc = await task.promise;
    const out: PageImage[] = [];
    for (let n = 1; n <= Math.min(doc.numPages, maxPages); n++) {
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: pixelWidth / base.width });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      await page.render({ canvas, viewport }).promise;
      const image = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (image) out.push({ url: URL.createObjectURL(image), width: canvas.width, height: canvas.height });
    }
    return out;
  } finally {
    void task.destroy();
  }
}

interface RenderState {
  pages: PageImage[];
  blob: Blob | null;
  /** The invoice object `blob` was rendered from. */
  source: Invoice | null;
  pending: boolean;
  error: string | null;
}

/**
 * Debounced PDF render + rasterize. The previous pages stay on screen until the new ones
 * are ready, so there's no "Generating…" flash while typing.
 */
export function useInvoicePdf(
  invoice: Invoice,
  { enabled = true, delay = 400, pixelWidth = 1200, maxPages = Infinity } = {},
): RenderState {
  const [state, setState] = useState<RenderState>({ pages: [], blob: null, source: null, pending: true, error: null });
  const run = useRef(0);
  const pagesRef = useRef<PageImage[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const id = ++run.current;
    const timer = window.setTimeout(async () => {
      setState((s) => ({ ...s, pending: true }));
      try {
        const blob = await renderInvoiceBlob(invoice);
        if (id !== run.current) return;
        const pages = await rasterizePdf(blob, pixelWidth, maxPages);
        if (id !== run.current) {
          pages.forEach((p) => URL.revokeObjectURL(p.url));
          return;
        }
        const old = pagesRef.current;
        pagesRef.current = pages;
        setState({ pages, blob, source: invoice, pending: false, error: null });
        // Let the new images paint before freeing the old ones.
        window.setTimeout(() => old.forEach((p) => URL.revokeObjectURL(p.url)), 1000);
      } catch (e) {
        if (id !== run.current) return;
        console.error("Invoice preview failed", e);
        setState((s) => ({ ...s, pending: false, error: "The preview couldn't be generated. Check the logo or signature image." }));
      }
    }, state.source ? delay : 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- state.source only picks the first-render delay
  }, [invoice, enabled, delay, pixelWidth, maxPages]);

  useEffect(
    () => () => {
      run.current++;
      pagesRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    },
    [],
  );

  return state;
}

/** The exact PDF for `invoice`: reuses the preview's blob when it's current, otherwise renders now. */
export async function getInvoiceBlob(invoice: Invoice, preview?: Pick<RenderState, "blob" | "source">): Promise<Blob> {
  if (preview?.blob && preview.source === invoice) return preview.blob;
  return renderInvoiceBlob(invoice);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Print the PDF through a hidden iframe so the browser's PDF print dialog opens. */
export function printBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    frame.src = url;
    frame.onload = () => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        resolve();
      } catch {
        // Some browsers (e.g. mobile Safari) block printing a PDF in a frame; open it instead.
        const w = window.open(url, "_blank");
        if (w) resolve();
        else reject(new Error("Pop-up blocked"));
      }
      window.setTimeout(() => {
        frame.remove();
        URL.revokeObjectURL(url);
      }, 60_000);
    };
    document.body.appendChild(frame);
  });
}
