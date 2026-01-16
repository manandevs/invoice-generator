import { InvoiceData, InvoiceItem } from "@/types/invoice";
import React, { createContext, useContext } from "react";

interface InvoiceContextType {
  invoice: InvoiceData;
  updateInvoice: (update: Partial<InvoiceData>) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => void;
}

export const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoice must be used with in an InvoiceProvider.")
  }
  return context
}