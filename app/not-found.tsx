import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="grid min-h-[70vh] place-items-center bg-surface px-4 py-20">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl bg-brand-tint text-brand">
          <FileQuestion className="size-8" aria-hidden />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">404</p>
        <h1 className="mt-2 text-4xl font-bold text-ink">This page isn&apos;t on the invoice</h1>
        <p className="mt-4 text-slate-700">The link may be broken or the page may have moved. Your draft invoice is still saved.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="h-12 rounded-full px-6 text-base">
            <Link href="/#generator">
              Back to the generator <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full px-6 text-base">
            <Link href="/templates">Browse templates</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
