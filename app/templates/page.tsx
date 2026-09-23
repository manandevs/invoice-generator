import type { Metadata } from "next";
import { TemplateGallery } from "./TemplateGallery";

export const metadata: Metadata = {
  title: "Invoice templates",
  description: "Four free invoice templates: Classic, Modern, Minimal and Bold. Pick one, set your accent color and download a PDF.",
  alternates: { canonical: "/templates" },
};

export default function TemplatesPage() {
  return (
    <section className="bg-surface px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-bold text-ink sm:text-5xl">Invoice templates</h1>
          <p className="mt-4 text-lg text-slate-700">
            Every template works with every document type, currency and accent color. The previews below are real PDFs made with sample data.
          </p>
        </div>
        <TemplateGallery />
      </div>
    </section>
  );
}
