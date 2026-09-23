"use client";

import React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calculator, Copy, GripVertical, ListOrdered, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateTotals, formatMoney, toMinor } from "@/lib/invoice/calc";
import { fieldId, type Currency, type LineItem } from "@/lib/invoice/schema";
import { useInvoiceStore } from "@/lib/invoice/store";
import { cn } from "@/lib/utils";
import { Field, FormCard, NumberInput, inputClass, useFormField } from "../fields";

const CURRENCY_SYMBOL: Record<Currency, string> = { USD: "$", EUR: "€", GBP: "£", PKR: "Rs" };


function focusField(path: string) {
  // Wait for the new row to render.
  window.setTimeout(() => document.getElementById(fieldId(path))?.focus(), 30);
}

function ItemRow({
  item,
  index,
  isLast,
  canRemove,
  amount,
  defaultTaxRate,
  symbol,
}: {
  item: LineItem;
  index: number;
  isLast: boolean;
  canRemove: boolean;
  amount: string;
  defaultTaxRate: number;
  symbol: string;
}) {
  const updateItem = useInvoiceStore((s) => s.updateItem);
  const duplicateItem = useInvoiceStore((s) => s.duplicateItem);
  const removeItem = useInvoiceStore((s) => s.removeItem);
  const addItem = useInvoiceStore((s) => s.addItem);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const desc = useFormField(`items.${index}.description`);
  const qty = useFormField(`items.${index}.quantity`);
  const price = useFormField(`items.${index}.unitPrice`);
  const tax = useFormField(`items.${index}.taxRate`);
  const rowError = desc.error ?? qty.error ?? price.error ?? tax.error;
  const n = index + 1;

  const addOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || !isLast) return;
    e.preventDefault();
    addItem(item.id);
    focusField(`items.${index + 1}.description`);
  };

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-lg border border-border bg-white p-3 transition-colors hover:border-slate-300 sm:p-4",
        isDragging && "relative z-10 shadow-lg ring-2 ring-brand/30",
        rowError && "border-destructive/50",
      )}
    >
      <div className="flex items-center gap-1.5">
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={`Reorder item ${n}`}
          className="flex h-11 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <label htmlFor={desc.id} className="sr-only">
          Item {n} description
        </label>
        <input
          id={desc.id}
          value={item.description}
          onChange={(e) => updateItem(item.id, { description: e.target.value })}
          onBlur={desc.onBlur}
          aria-invalid={!!desc.error}
          placeholder={`Item ${n}: product or service`}
          className={inputClass}
        />
        <Button type="button" variant="ghost" size="icon" aria-label={`Duplicate item ${n}`} onClick={() => duplicateItem(item.id)}>
          <Copy />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Delete item ${n}`}
          disabled={!canRemove}
          onClick={() => removeItem(item.id)}
          className="text-slate-500 hover:bg-red-50 hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[5rem_minmax(0,1fr)_6rem_minmax(0,1fr)] sm:pl-9.5">
        <div>
          <label htmlFor={qty.id} className="mb-1 block text-xs font-medium text-slate-700">
            Qty<span className="sr-only"> for item {n}</span>
          </label>
          <NumberInput id={qty.id} value={item.quantity} onValueChange={(v) => updateItem(item.id, { quantity: v ?? Number.NaN })} onBlur={qty.onBlur} error={qty.error} inputClassName="text-right" />
        </div>
        <div>
          <label htmlFor={price.id} className="mb-1 block text-xs font-medium text-slate-700">
            Unit price<span className="sr-only"> for item {n}</span>
          </label>
          <NumberInput id={price.id} value={item.unitPrice} prefix={symbol} onValueChange={(v) => updateItem(item.id, { unitPrice: v ?? Number.NaN })} onBlur={price.onBlur} error={price.error} inputClassName="text-right" />
        </div>
        <div>
          <label htmlFor={tax.id} className="mb-1 block text-xs font-medium text-slate-700">
            Tax<span className="sr-only"> percent for item {n}</span>
          </label>
          <NumberInput
            id={tax.id}
            value={item.taxRate}
            allowEmpty
            suffix="%"
            placeholder={String(defaultTaxRate)}
            onValueChange={(v) => updateItem(item.id, { taxRate: v })}
            onBlur={tax.onBlur}
            onKeyDown={addOnEnter}
            error={tax.error}
            inputClassName="text-right"
            aria-describedby="tax-default-hint"
          />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-slate-700 sm:text-right" aria-hidden>
            Amount
          </span>
          <output className="flex h-11 items-center font-semibold tabular-nums text-ink sm:justify-end" aria-label={`Amount for item ${n}`}>
            {amount}
          </output>
        </div>
      </div>
      {rowError && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive sm:pl-9.5" role="alert">
          {rowError}
        </p>
      )}
    </li>
  );
}

export function ItemsStep() {
  const inv = useInvoiceStore((s) => s.invoice);
  const update = useInvoiceStore((s) => s.update);
  const addItem = useInvoiceStore((s) => s.addItem);
  const moveItem = useInvoiceStore((s) => s.moveItem);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const totals = calculateTotals(inv);
  const money = (minor: number) => formatMoney(minor, inv.currency, inv.locale);
  const amountFor = (item: LineItem) => {
    const line = totals.lines.find((l) => l.item.id === item.id);
    return money(line ? line.total : toMinor(item.quantity * item.unitPrice));
  };
  const symbol = CURRENCY_SYMBOL[inv.currency];

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) moveItem(String(active.id), String(over.id));
  };

  const discountField = useFormField("globalDiscount.value");
  const shippingField = useFormField("shipping");
  const taxField = useFormField("defaultTaxRate");

  return (
    <div className="space-y-4">
      <FormCard
        icon={ListOrdered}
        title="Line items"
        description={`${inv.items.length} ${inv.items.length === 1 ? "row" : "rows"} · drag the handle to reorder`}
        bodyClassName="bg-surface/60"
      >
        <DndContext id="invoice-items" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={inv.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <ol className="space-y-3" aria-label="Line items">
              {inv.items.map((item, index) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  isLast={index === inv.items.length - 1}
                  canRemove={inv.items.length > 1}
                  amount={amountFor(item)}
                  defaultTaxRate={inv.defaultTaxRate}
                  symbol={symbol}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
        <div className="mt-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full border-dashed text-slate-700 hover:border-brand hover:text-brand"
            onClick={() => {
              addItem();
              focusField(`items.${inv.items.length}.description`);
            }}
          >
            <Plus /> Add item
          </Button>
          <p id="tax-default-hint" className="mt-2 text-xs text-slate-600">
            Leave Tax empty to use the default rate ({inv.defaultTaxRate || 0}%). Press Enter in the last row&apos;s Tax field to add a row.
          </p>
        </div>
      </FormCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormCard icon={SlidersHorizontal} title="Adjustments" description="Discount, tax and shipping" bodyClassName="space-y-3.5">
          <Field label="Discount on subtotal" htmlFor={discountField.id} error={discountField.error}>
            <div className="flex gap-2">
              <NumberInput
                id={discountField.id}
                className="flex-1"
                value={inv.globalDiscount.value}
                onValueChange={(v) => update({ globalDiscount: { ...inv.globalDiscount, value: v ?? Number.NaN } })}
                onBlur={discountField.onBlur}
                prefix={inv.globalDiscount.type === "fixed" ? symbol : undefined}
                suffix={inv.globalDiscount.type === "percent" ? "%" : undefined}
                error={discountField.error}
              />
              <div role="radiogroup" aria-label="Discount type" className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1">
                {(["percent", "fixed"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={inv.globalDiscount.type === t}
                    onClick={() => update({ globalDiscount: { ...inv.globalDiscount, type: t } })}
                    className={cn(
                      "min-w-11 rounded-md px-3 text-sm font-medium",
                      inv.globalDiscount.type === t ? "bg-white text-ink shadow-xs" : "text-slate-600",
                    )}
                  >
                    {t === "percent" ? "%" : symbol}
                  </button>
                ))}
              </div>
            </div>
          </Field>
          <Field label="Default tax rate" htmlFor={taxField.id} error={taxField.error} help="Applies to every item without its own rate.">
            <NumberInput id={taxField.id} value={inv.defaultTaxRate} suffix="%" onValueChange={(v) => update({ defaultTaxRate: v ?? Number.NaN })} onBlur={taxField.onBlur} error={taxField.error} />
          </Field>
          <Field label="Shipping" htmlFor={shippingField.id} error={shippingField.error} help="Added after tax.">
            <NumberInput id={shippingField.id} value={inv.shipping} prefix={symbol} onValueChange={(v) => update({ shipping: v ?? Number.NaN })} onBlur={shippingField.onBlur} error={shippingField.error} />
          </Field>
        </FormCard>

        <FormCard icon={Calculator} title="Totals" description="Updates as you type" className="self-start">
          <dl aria-live="polite">
          {[
            ["Subtotal", money(totals.subtotal)],
            ["Discount", totals.discountTotal ? `−${money(totals.discountTotal)}` : money(0)],
            ["Tax", money(totals.taxTotal)],
            ["Shipping", money(totals.shipping)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-1.5 text-slate-700">
              <dt>{label}</dt>
              <dd className="tabular-nums">{value}</dd>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between rounded-lg bg-brand px-4 py-3 text-white">
            <dt className="font-semibold">Total</dt>
            <dd className="text-xl font-bold tabular-nums">{money(totals.grandTotal)}</dd>
          </div>
          </dl>
        </FormCard>
      </div>
    </div>
  );
}
