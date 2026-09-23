"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addDays, dueDateForTerms, nextInvoiceNumber } from "./calc";
import { createInvoice, emptyItem, newId } from "./defaults";
import {
  invoiceSchema,
  type Currency,
  type Invoice,
  type LineItem,
  type Party,
  type PaymentInstructions,
  type PaymentTerms,
} from "./schema";

export const STORAGE_KEY = "billflow:draft:v1";

interface InvoiceState {
  invoice: Invoice;
  step: number;
  /** The last number that was downloaded, used to suggest the next one. */
  lastUsedNumber: string | null;
  defaultCurrency: Currency;
  savedAt: number | null;

  setStep: (step: number) => void;
  update: (patch: Partial<Invoice>) => void;
  updateIssuer: (patch: Partial<Party & { logo: string }>) => void;
  updateClient: (patch: Partial<Party>) => void;
  updatePayment: (patch: Partial<PaymentInstructions>) => void;
  setIssueDate: (issueDate: string) => void;
  setPaymentTerms: (terms: PaymentTerms) => void;
  setDueDate: (dueDate: string) => void;
  setDefaultCurrency: (currency: Currency) => void;

  addItem: (afterId?: string) => string;
  updateItem: (id: string, patch: Partial<LineItem>) => void;
  duplicateItem: (id: string) => void;
  removeItem: (id: string) => void;
  moveItem: (fromId: string, toId: string) => void;

  markDownloaded: () => void;
  newInvoice: () => void;
  loadInvoice: (invoice: Invoice) => void;
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set) => {
      const touch = (fn: (s: InvoiceState) => Partial<InvoiceState>) =>
        set((s) => ({ ...fn(s), savedAt: Date.now() }));
      const withInvoice = (fn: (inv: Invoice) => Partial<Invoice>) =>
        touch((s) => ({ invoice: { ...s.invoice, ...fn(s.invoice) } }));

      return {
        invoice: createInvoice(),
        step: 0,
        lastUsedNumber: null,
        defaultCurrency: "USD",
        savedAt: null,

        setStep: (step) => set({ step }),
        update: (patch) => withInvoice(() => patch),
        updateIssuer: (patch) => withInvoice((inv) => ({ issuer: { ...inv.issuer, ...patch } })),
        updateClient: (patch) => withInvoice((inv) => ({ client: { ...inv.client, ...patch } })),
        updatePayment: (patch) =>
          withInvoice((inv) => ({ paymentInstructions: { ...inv.paymentInstructions, ...patch } })),

        setIssueDate: (issueDate) =>
          withInvoice((inv) => ({
            issueDate,
            dueDate: dueDateForTerms(issueDate, inv.paymentTerms) ?? inv.dueDate,
          })),
        setPaymentTerms: (paymentTerms) =>
          withInvoice((inv) => ({
            paymentTerms,
            dueDate: dueDateForTerms(inv.issueDate, paymentTerms) ?? inv.dueDate,
          })),
        // Typing a due date by hand means the terms no longer describe it.
        setDueDate: (dueDate) => withInvoice(() => ({ dueDate, paymentTerms: "custom" })),
        setDefaultCurrency: (currency) =>
          touch((s) => ({ defaultCurrency: currency, invoice: { ...s.invoice, currency } })),

        addItem: (afterId) => {
          const item = emptyItem();
          withInvoice((inv) => {
            const items = [...inv.items];
            const index = afterId ? items.findIndex((i) => i.id === afterId) : -1;
            items.splice(index === -1 ? items.length : index + 1, 0, item);
            return { items };
          });
          return item.id;
        },
        updateItem: (id, patch) =>
          withInvoice((inv) => ({ items: inv.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
        duplicateItem: (id) =>
          withInvoice((inv) => {
            const index = inv.items.findIndex((i) => i.id === id);
            if (index === -1) return {};
            const items = [...inv.items];
            items.splice(index + 1, 0, { ...inv.items[index], id: newId() });
            return { items };
          }),
        removeItem: (id) =>
          withInvoice((inv) => (inv.items.length <= 1 ? {} : { items: inv.items.filter((i) => i.id !== id) })),
        moveItem: (fromId, toId) =>
          withInvoice((inv) => {
            const from = inv.items.findIndex((i) => i.id === fromId);
            const to = inv.items.findIndex((i) => i.id === toId);
            if (from === -1 || to === -1) return {};
            const items = [...inv.items];
            const [moved] = items.splice(from, 1);
            items.splice(to, 0, moved);
            return { items };
          }),

        markDownloaded: () => set((s) => ({ lastUsedNumber: s.invoice.number })),

        // Keeps your business, payment details and design; clears client and line items.
        newInvoice: () =>
          touch((s) => {
            const fresh = createInvoice({ currency: s.defaultCurrency });
            const prev = s.invoice;
            return {
              step: 0,
              invoice: {
                ...fresh,
                documentType: prev.documentType,
                number: nextInvoiceNumber(s.lastUsedNumber ?? prev.number),
                paymentTerms: prev.paymentTerms,
                dueDate: dueDateForTerms(fresh.issueDate, prev.paymentTerms) ?? fresh.issueDate,
                validUntil: addDays(fresh.issueDate, 30),
                issuer: prev.issuer,
                paymentInstructions: prev.paymentInstructions,
                terms: prev.terms,
                signature: prev.signature,
                template: prev.template,
                accentColor: prev.accentColor,
                font: prev.font,
                defaultTaxRate: prev.defaultTaxRate,
              },
            };
          }),

        loadInvoice: (invoice) => touch(() => ({ invoice, step: 1 })),
      };
    },
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Rehydrated manually after mount so server and client render the same markup.
      skipHydration: true,
      partialize: (s) => ({
        invoice: s.invoice,
        step: s.step,
        lastUsedNumber: s.lastUsedNumber,
        defaultCurrency: s.defaultCurrency,
        savedAt: s.savedAt,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<InvoiceState>;
        // Fill fields added after the draft was saved and drop anything malformed.
        const invoice = p.invoice ? { ...createInvoice(), ...p.invoice } : current.invoice;
        const repaired = invoiceSchema.safeParse(invoice).success ? invoice : repairInvoice(invoice);
        return { ...current, ...p, invoice: repaired };
      },
    },
  ),
);

/** Keep what can be kept from a stored/shared invoice that no longer matches the schema. */
function repairInvoice(raw: Invoice): Invoice {
  const base = createInvoice();
  const pick = <T,>(value: unknown, fallback: T): T =>
    typeof value === typeof fallback && value !== null ? (value as T) : fallback;
  return {
    ...base,
    ...raw,
    issuer: { ...base.issuer, ...pick(raw.issuer, base.issuer) },
    client: { ...base.client, ...pick(raw.client, base.client) },
    paymentInstructions: { ...base.paymentInstructions, ...pick(raw.paymentInstructions, base.paymentInstructions) },
    items:
      Array.isArray(raw.items) && raw.items.length > 0
        ? raw.items.map((i) => ({ ...emptyItem(), ...i, id: i?.id || newId() }))
        : base.items,
  };
}

let hydration: Promise<void> | null = null;

/** Loads the saved draft once per page, and reports when it's ready. */
export function useStoreHydrated(): boolean {
  const [hydrated, setHydrated] = useState(
    // `persist` isn't attached during server rendering, where there's no localStorage.
    () => useInvoiceStore.persist?.hasHydrated() ?? false,
  );
  useEffect(() => {
    if (hydrated) return;
    hydration ??= Promise.resolve(useInvoiceStore.persist?.rehydrate());
    let active = true;
    hydration.then(() => active && setHydrated(true));
    return () => {
      active = false;
    };
  }, [hydrated]);
  return hydrated;
}
