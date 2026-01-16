"use client"
import { InvoiceContext } from "@/context/invoice-contact";
import { initialInvoiceData } from "@/lib/constants";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { useState, useEffect } from "react";

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoice, setInvoice] = useState<InvoiceData>(initialInvoiceData);

  // Set the date only on the client to avoid hydration mismatch
  useEffect(() => {
    setInvoice((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0]
    }));
  }, []);

  // Helper to recalculate totals
  const calculateTotals = (items: InvoiceItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const updateInvoice = (updates: Partial<InvoiceData>) => {
    setInvoice((prev) => {
      const newState = { ...prev, ...updates };

      // If items or taxRate changed, recalculate totals
      if (updates.items || updates.taxRate !== undefined) {
        const rate = Number(newState.taxRate) || 0;
        const totals = calculateTotals(newState.items, rate);
        return { ...newState, ...totals };
      }

      return newState;
    });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    }
    updateInvoice({ items: [...invoice.items, newItem] })
  }

  const removeItem = (index: number) => {
    if (invoice.items.length > 1) {
      const newItems = invoice.items.filter((_, i) => i !== index)
      updateInvoice({ items: newItems })
    }
  }

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const items = [...invoice.items];
    
    const updatedItem = {
      ...items[index],
      [field]: value 
    };

    if (field === "quantity" || field === "rate") {
        updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate) || 0;
    }

    items[index] = updatedItem;
    updateInvoice({ items });
  }

  return (
    <InvoiceContext.Provider
      value={{ invoice, updateInvoice, addItem, removeItem, updateItem }}
    >
      {children}
    </InvoiceContext.Provider>
  )
}