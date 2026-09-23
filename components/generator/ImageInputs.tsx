"use client";

import React, { useEffect, useRef, useState } from "react";
import { Eraser, ImagePlus, PenLine, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_BYTES = 1024 * 1024;
const ACCEPT = ["image/png", "image/jpeg", "image/svg+xml"];

/**
 * Read an image file and re-encode it as a PNG data URL (max 800px).
 * The PDF engine can't draw SVG, and re-encoding also keeps saved drafts small.
 */
async function fileToPngDataUrl(file: File, maxSize = 800): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    const w = img.naturalWidth || maxSize;
    const h = img.naturalHeight || maxSize;
    const scale = Math.min(1, maxSize / Math.max(w, h));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * scale));
    canvas.height = Math.max(1, Math.round(h * scale));
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ImageUpload({
  id,
  label,
  value,
  onChange,
  help,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
  help?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!ACCEPT.includes(file.type)) return setError("Use a PNG, JPG or SVG image.");
    if (file.size > MAX_BYTES) return setError("That image is over 1 MB. Try a smaller file.");
    try {
      onChange(await fileToPngDataUrl(file));
    } catch {
      setError("That image couldn't be read. Try another file.");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-sm font-medium text-slate-800">
        {label}
      </span>
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-32 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-input bg-slate-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL preview
            <img src={value} alt={`${label} preview`} className="max-h-full max-w-full object-contain p-1" />
          ) : (
            <ImagePlus className="size-6 text-slate-400" aria-hidden />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} aria-describedby={`${id}-help`}>
            <Upload /> {value ? "Replace" : "Upload"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" className="text-destructive hover:bg-red-50 hover:text-destructive" onClick={() => onChange("")}>
              <Trash2 /> Remove
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ACCEPT.join(",")}
          className="sr-only"
          aria-labelledby={`${id}-label`}
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <p id={`${id}-help`} className="text-xs text-slate-600">
          {help ?? "PNG, JPG or SVG, up to 1 MB."}
        </p>
      )}
    </div>
  );
}

/** Draw a signature with mouse, pen or finger, or upload an image. */
export function SignatureInput({ value, onChange }: { value: string; onChange: (dataUrl: string) => void }) {
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode !== "draw") return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
  }, [mode, value]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || !dirty) return;
    onChange(canvas.toDataURL("image/png"));
    setDirty(false);
  };

  if (value) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-800">Signature</span>
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-48 place-items-center rounded-lg border border-input bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL preview */}
            <img src={value} alt="Your signature" className="max-h-full max-w-full object-contain p-1" />
          </div>
          <Button type="button" variant="ghost" className="text-destructive hover:bg-red-50 hover:text-destructive" onClick={() => onChange("")}>
            <Trash2 /> Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-800">Signature (optional)</span>
        <div role="tablist" aria-label="Signature input" className="inline-flex rounded-lg bg-slate-100 p-1 text-sm">
          {(["draw", "upload"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1 font-medium", mode === m ? "bg-white text-ink shadow-xs" : "text-slate-600")}
            >
              {m === "draw" ? <PenLine className="size-4" aria-hidden /> : <Upload className="size-4" aria-hidden />}
              {m === "draw" ? "Draw" : "Upload"}
            </button>
          ))}
        </div>
      </div>
      {mode === "draw" ? (
        <>
          <canvas
            ref={canvasRef}
            aria-label="Signature pad. Draw your signature, then choose Use signature."
            className="h-32 w-full touch-none rounded-lg border border-dashed border-input bg-white"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drawing.current = true;
              const ctx = e.currentTarget.getContext("2d")!;
              const { x, y } = point(e);
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + 0.1, y + 0.1);
              ctx.stroke();
              setDirty(true);
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              const ctx = e.currentTarget.getContext("2d")!;
              const { x, y } = point(e);
              ctx.lineTo(x, y);
              ctx.stroke();
            }}
            onPointerUp={() => (drawing.current = false)}
            onPointerLeave={() => (drawing.current = false)}
          />
          <div className="flex gap-2">
            <Button type="button" onClick={save} disabled={!dirty}>
              Use signature
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!dirty}
              onClick={() => {
                const c = canvasRef.current!;
                c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
                setDirty(false);
              }}
            >
              <Eraser /> Clear
            </Button>
          </div>
        </>
      ) : (
        <ImageUpload
          id="field-signature"
          label="Signature image"
          value=""
          onChange={(v) => {
            onChange(v);
            if (v) toast.success("Signature added");
          }}
          help="A PNG with a transparent background looks best. Up to 1 MB."
        />
      )}
    </div>
  );
}
