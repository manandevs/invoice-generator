"use client";

import React from "react";
import { toast } from "sonner";
import { CURRENCY_INFO } from "@/lib/invoice/defaults";
import { CURRENCIES, type Currency } from "@/lib/invoice/schema";
import { useInvoiceStore, useStoreHydrated } from "@/lib/invoice/store";

/** Sets the default currency for new invoices and the current draft. */
export function FooterCurrency() {
  const hydrated = useStoreHydrated();
  const currency = useInvoiceStore((s) => s.defaultCurrency);
  const setDefaultCurrency = useInvoiceStore((s) => s.setDefaultCurrency);

  return (
    <label className="flex items-center gap-2 text-xs text-slate-600">
      Default currency
      <select
        value={currency}
        disabled={!hydrated}
        onChange={(e) => {
          setDefaultCurrency(e.target.value as Currency);
          toast.success(`Currency set to ${e.target.value}`);
        }}
        className="h-9 rounded-lg border border-input bg-white px-2 text-sm text-ink"
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {CURRENCY_INFO[c].label}
          </option>
        ))}
      </select>
    </label>
  );
}
