"use client";

import React, { useContext, useEffect, useState } from "react";
import { TERM_LABELS } from "@/lib/invoice/calc";
import { CURRENCY_INFO } from "@/lib/invoice/defaults";
import { CURRENCIES, PAYMENT_TERMS, fieldId } from "@/lib/invoice/schema";
import { useInvoiceStore } from "@/lib/invoice/store";
import { FormContext, Section, SelectField, TextAreaField, TextField } from "../fields";
import { ImageUpload, SignatureInput } from "../ImageInputs";
import { ProfileSync } from "../ProfileSync";

const SECTIONS = {
  general: { title: "General", prefixes: ["number", "issueDate", "dueDate", "validUntil", "poNumber", "paymentTerms", "currency"] },
  from: { title: "From (your business)", prefixes: ["issuer."] },
  to: { title: "Bill to", prefixes: ["client."] },
  payment: { title: "Payment instructions", prefixes: ["paymentInstructions."] },
  extras: { title: "Notes, terms & signature", prefixes: ["notes", "terms", "signature"] },
} as const;

type SectionId = keyof typeof SECTIONS;

const inSection = (id: SectionId, path: string) =>
  SECTIONS[id].prefixes.some((p) => (p.endsWith(".") ? path.startsWith(p) : path === p));

export function DetailsStep() {
  const inv = useInvoiceStore((s) => s.invoice);
  const update = useInvoiceStore((s) => s.update);
  const updateIssuer = useInvoiceStore((s) => s.updateIssuer);
  const updateClient = useInvoiceStore((s) => s.updateClient);
  const updatePayment = useInvoiceStore((s) => s.updatePayment);
  const setIssueDate = useInvoiceStore((s) => s.setIssueDate);
  const setPaymentTerms = useInvoiceStore((s) => s.setPaymentTerms);
  const setDueDate = useInvoiceStore((s) => s.setDueDate);
  const { visible, revealToken } = useContext(FormContext);

  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    general: true,
    from: true,
    to: true,
    payment: false,
    extras: false,
  });

  // After a blocked Continue, open every section that has something to fix.
  useEffect(() => {
    if (!revealToken) return;
    setOpen((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(SECTIONS) as SectionId[]) {
        if (Object.keys(visible).some((p) => inSection(id, p))) next[id] = true;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to a new Continue attempt
  }, [revealToken]);

  const errorCount = (id: SectionId) => Object.keys(visible).filter((p) => inSection(id, p)).length;
  const section = (id: SectionId, description?: string) => ({
    title: SECTIONS[id].title,
    description,
    open: open[id],
    onToggle: () => setOpen((o) => ({ ...o, [id]: !o[id] })),
    errorCount: errorCount(id),
  });

  const isProforma = inv.documentType === "proforma";
  const isTax = inv.documentType === "tax_invoice";
  const grid = "grid gap-4 sm:grid-cols-2";

  return (
    <div className="space-y-4">
      <Section {...section("general", "Number, dates, terms and currency")}>
        <div className={grid}>
          <TextField
            path="number"
            label={isProforma ? "Proforma number" : "Invoice number"}
            required
            value={inv.number}
            onChange={(number) => update({ number })}
            placeholder="INV-0001"
            autoComplete="off"
          />
          <TextField path="issueDate" label="Issue date" required type="date" value={inv.issueDate} onChange={setIssueDate} />
          {isProforma ? (
            <TextField
              path="validUntil"
              label="Valid until"
              type="date"
              value={inv.validUntil}
              onChange={(validUntil) => update({ validUntil })}
              help="How long these prices are guaranteed."
            />
          ) : (
            <>
              <SelectField
                path="paymentTerms"
                label="Payment terms"
                value={inv.paymentTerms}
                onChange={setPaymentTerms}
                options={PAYMENT_TERMS.map((t) => ({ value: t, label: TERM_LABELS[t] }))}
                help="Sets the due date for you."
              />
              <TextField path="dueDate" label="Due date" type="date" value={inv.dueDate} onChange={setDueDate} min={inv.issueDate} />
            </>
          )}
          <TextField path="poNumber" label="PO / order number" value={inv.poNumber} onChange={(poNumber) => update({ poNumber })} placeholder="PO-1001" />
          <SelectField
            path="currency"
            label="Currency"
            value={inv.currency}
            onChange={(currency) => update({ currency })}
            options={CURRENCIES.map((c) => ({ value: c, label: CURRENCY_INFO[c].label }))}
          />
        </div>
      </Section>

      <Section {...section("from", inv.issuer.name || "Your business details")}>
        <div className="space-y-4">
          <ProfileSync />
          <ImageUpload id={fieldId("issuer.logo")} label="Logo" value={inv.issuer.logo} onChange={(logo) => updateIssuer({ logo })} />
          <div className={grid}>
            <TextField path="issuer.name" label="Business name" required value={inv.issuer.name} onChange={(name) => updateIssuer({ name })} placeholder="Northwind Studio" autoComplete="organization" />
            <TextField
              path="issuer.taxId"
              label="Tax ID / VAT number"
              required={isTax}
              value={inv.issuer.taxId}
              onChange={(taxId) => updateIssuer({ taxId })}
              placeholder="GB123456789"
              help={isTax ? "Required on a tax invoice." : undefined}
            />
            <TextField path="issuer.email" label="Email" type="email" value={inv.issuer.email} onChange={(email) => updateIssuer({ email })} placeholder="billing@company.com" autoComplete="email" />
            <TextField path="issuer.phone" label="Phone" type="tel" value={inv.issuer.phone} onChange={(phone) => updateIssuer({ phone })} placeholder="+1 234 567 890" autoComplete="tel" />
            <TextField path="issuer.address" label="Street address" className="sm:col-span-2" value={inv.issuer.address} onChange={(address) => updateIssuer({ address })} autoComplete="street-address" />
            <TextField path="issuer.city" label="City" value={inv.issuer.city} onChange={(city) => updateIssuer({ city })} autoComplete="address-level2" />
            <TextField path="issuer.postalCode" label="Postal code" value={inv.issuer.postalCode} onChange={(postalCode) => updateIssuer({ postalCode })} autoComplete="postal-code" />
            <TextField path="issuer.country" label="Country" value={inv.issuer.country} onChange={(country) => updateIssuer({ country })} autoComplete="country-name" />
          </div>
        </div>
      </Section>

      <Section {...section("to", inv.client.name || "Who you're billing")}>
        <div className={grid}>
          <TextField path="client.name" label="Client name" required value={inv.client.name} onChange={(name) => updateClient({ name })} placeholder="Acme Corporation" />
          <TextField path="client.taxId" label="Client Tax ID" value={inv.client.taxId} onChange={(taxId) => updateClient({ taxId })} />
          <TextField path="client.email" label="Email" type="email" value={inv.client.email} onChange={(email) => updateClient({ email })} placeholder="accounts@client.com" help="Used for the email draft in the last step." />
          <TextField path="client.phone" label="Phone" type="tel" value={inv.client.phone} onChange={(phone) => updateClient({ phone })} />
          <TextField path="client.address" label="Street address" className="sm:col-span-2" value={inv.client.address} onChange={(address) => updateClient({ address })} />
          <TextField path="client.city" label="City" value={inv.client.city} onChange={(city) => updateClient({ city })} />
          <TextField path="client.postalCode" label="Postal code" value={inv.client.postalCode} onChange={(postalCode) => updateClient({ postalCode })} />
          <TextField path="client.country" label="Country" value={inv.client.country} onChange={(country) => updateClient({ country })} />
        </div>
      </Section>

      <Section {...section("payment", "Bank details printed on the invoice")}>
        <div className={grid}>
          <TextField path="paymentInstructions.bankName" label="Bank name" value={inv.paymentInstructions.bankName} onChange={(bankName) => updatePayment({ bankName })} />
          <TextField path="paymentInstructions.accountName" label="Account name" value={inv.paymentInstructions.accountName} onChange={(accountName) => updatePayment({ accountName })} />
          <TextField path="paymentInstructions.iban" label="IBAN / account number" value={inv.paymentInstructions.iban} onChange={(iban) => updatePayment({ iban })} />
          <TextField path="paymentInstructions.swift" label="SWIFT / BIC" value={inv.paymentInstructions.swift} onChange={(swift) => updatePayment({ swift })} />
          <TextAreaField
            path="paymentInstructions.other"
            label="Other payment options"
            className="sm:col-span-2"
            rows={2}
            value={inv.paymentInstructions.other}
            onChange={(other) => updatePayment({ other })}
            placeholder="e.g. PayPal: billing@company.com"
          />
        </div>
      </Section>

      <Section {...section("extras", "Optional")}>
        <div className="space-y-4">
          <TextAreaField path="notes" label="Notes" value={inv.notes} onChange={(notes) => update({ notes })} placeholder="Thank you for your business!" />
          <TextAreaField path="terms" label="Terms & conditions" value={inv.terms} onChange={(terms) => update({ terms })} placeholder="Payment is due within 15 days. Late payments incur a 2% monthly fee." />
          <SignatureInput value={inv.signature} onChange={(signature) => update({ signature })} />
        </div>
      </Section>
    </div>
  );
}
