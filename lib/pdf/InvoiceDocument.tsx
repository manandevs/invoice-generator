/* eslint-disable jsx-a11y/alt-text -- react-pdf's <Image> is drawn into the PDF and has no alt prop */
import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { FontId, Invoice, TemplateId } from "@/lib/invoice/schema";
import { buildInvoiceView, type InvoiceView } from "./view-model";

const FONTS: Record<FontId, { regular: string; bold: string }> = {
  sans: { regular: "Helvetica", bold: "Helvetica-Bold" },
  serif: { regular: "Times-Roman", bold: "Times-Bold" },
  mono: { regular: "Courier", bold: "Courier-Bold" },
};

const INK = "#111827";
const MUTED = "#4B5563";
const RULE = "#E5E7EB";
const ZEBRA = "#F6F7F9";

/** Blend a hex color toward white. t=0 → color, t=1 → white. */
function tint(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.round(((n >> shift) & 255) + (255 - ((n >> shift) & 255)) * t);
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("")}`;
}

interface Theme {
  tableHead: { bg: string; color: string; rule?: string };
  zebra: boolean;
  totalBar: { bg: string; color: string };
}

function themeFor(template: TemplateId, accent: string): Theme {
  switch (template) {
    case "modern":
      return { tableHead: { bg: tint(accent, 0.88), color: accent }, zebra: false, totalBar: { bg: accent, color: "#FFFFFF" } };
    case "minimal":
      return { tableHead: { bg: "#FFFFFF", color: INK, rule: INK }, zebra: false, totalBar: { bg: "#FFFFFF", color: accent } };
    case "bold":
      return { tableHead: { bg: INK, color: "#FFFFFF" }, zebra: true, totalBar: { bg: INK, color: "#FFFFFF" } };
    default:
      return { tableHead: { bg: accent, color: "#FFFFFF" }, zebra: true, totalBar: { bg: accent, color: "#FFFFFF" } };
  }
}

const s = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 64, paddingHorizontal: 40, fontSize: 9.5, color: INK },
  row: { flexDirection: "row" },
  between: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 7.5, color: MUTED, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 },
  // No lineHeight anywhere: in react-pdf 4.9 it doubles line spacing on Text and, inherited
  // from Page, drops `render` text (page numbers).
  muted: { color: MUTED },
  logo: { maxWidth: 140, maxHeight: 56, objectFit: "contain", marginBottom: 8 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 2 },
  metaLabel: { color: MUTED, width: 80, textAlign: "right", marginRight: 10 },
  metaValue: { minWidth: 90, textAlign: "right" },
  parties: { flexDirection: "row", marginTop: 24, marginBottom: 22 },
  party: { flex: 1, paddingRight: 16 },
  partyName: { fontSize: 11, marginBottom: 2 },
  th: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8 },
  tr: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 8 },
  cDesc: { flex: 1, paddingRight: 8 },
  cQty: { width: 44, textAlign: "right" },
  cPrice: { width: 80, textAlign: "right" },
  cTax: { width: 44, textAlign: "right" },
  cAmount: { width: 86, textAlign: "right" },
  totals: { marginTop: 14, marginLeft: "auto", width: 250 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, paddingHorizontal: 10 },
  grand: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 10, marginTop: 4 },
  extras: { marginTop: 26, flexDirection: "row", flexWrap: "wrap" },
  extraBlock: { width: "50%", paddingRight: 16, marginBottom: 14 },
  signature: { maxWidth: 160, maxHeight: 60, objectFit: "contain", marginBottom: 4 },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: MUTED,
  },
});

function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <Text key={i} style={s.muted}>
          {l}
        </Text>
      ))}
    </>
  );
}

function Meta({ v, bold }: { v: InvoiceView; bold: string }) {
  return (
    <View>
      {v.meta.map((m) => (
        <View key={m.label} style={s.metaRow}>
          <Text style={s.metaLabel}>{m.label}</Text>
          <Text style={[s.metaValue, { fontFamily: bold }]}>{m.value}</Text>
        </View>
      ))}
    </View>
  );
}

function Header({ v, template, font }: { v: InvoiceView; template: TemplateId; font: { regular: string; bold: string } }) {
  const issuer = (
    <View style={{ maxWidth: 260 }}>
      {v.from.logo ? <Image src={v.from.logo} style={s.logo} /> : null}
      {v.from.name ? <Text style={{ fontFamily: font.bold, fontSize: 13 }}>{v.from.name}</Text> : null}
    </View>
  );

  if (template === "modern") {
    return (
      <View style={{ marginTop: -40, marginHorizontal: -40, padding: 40, paddingBottom: 26, backgroundColor: v.accent, color: "#FFFFFF" }}>
        <View style={s.between}>
          <View style={{ maxWidth: 260 }}>
            {v.from.logo ? (
              <View style={{ backgroundColor: "#FFFFFF", padding: 6, borderRadius: 4, alignSelf: "flex-start", marginBottom: 8 }}>
                <Image src={v.from.logo} style={[s.logo, { marginBottom: 0 }]} />
              </View>
            ) : null}
            {v.from.name ? <Text style={{ fontFamily: font.bold, fontSize: 13 }}>{v.from.name}</Text> : null}
          </View>
          <View>
            <Text style={{ fontFamily: font.bold, fontSize: 22, textAlign: "right", marginBottom: 8, letterSpacing: 1 }}>{v.title}</Text>
            {v.meta.map((m) => (
              <View key={m.label} style={s.metaRow}>
                <Text style={[s.metaLabel, { color: "#FFFFFF", opacity: 0.85 }]}>{m.label}</Text>
                <Text style={[s.metaValue, { fontFamily: font.bold }]}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (template === "bold") {
    return (
      <View>
        <View style={s.between}>
          {issuer}
          <View style={{ backgroundColor: v.accent, color: "#FFFFFF", padding: 12, borderRadius: 4, minWidth: 170 }}>
            <Text style={{ fontSize: 7.5, letterSpacing: 0.8, textTransform: "uppercase" }}>{v.grandTotal.label}</Text>
            <Text style={{ fontFamily: font.bold, fontSize: 18, marginTop: 2 }}>{v.grandTotal.value}</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.bold, fontSize: 34, marginTop: 20, letterSpacing: -0.5 }}>{v.title}</Text>
        <View style={{ height: 5, width: 64, backgroundColor: v.accent, marginTop: 4, marginBottom: 12 }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {v.meta.map((m) => (
            <View key={m.label} style={{ marginRight: 22, marginBottom: 4 }}>
              <Text style={s.label}>{m.label}</Text>
              <Text style={{ fontFamily: font.bold }}>{m.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (template === "minimal") {
    return (
      <View style={s.between}>
        {issuer}
        <View>
          <Text style={{ fontSize: 18, letterSpacing: 3, textAlign: "right" }}>{v.title}</Text>
          <View style={{ height: 1.5, width: 40, backgroundColor: v.accent, marginLeft: "auto", marginTop: 6, marginBottom: 10 }} />
          <Meta v={v} bold={font.regular} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.between}>
      {issuer}
      <View>
        <Text style={{ fontFamily: font.bold, fontSize: 24, color: v.accent, textAlign: "right", marginBottom: 10, letterSpacing: 1 }}>
          {v.title}
        </Text>
        <Meta v={v} bold={font.bold} />
      </View>
    </View>
  );
}

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const v = buildInvoiceView(invoice);
  const font = FONTS[invoice.font] ?? FONTS.sans;
  const theme = themeFor(invoice.template, v.accent);
  const minimal = invoice.template === "minimal";
  const docTitle = [v.title, invoice.number, v.to.name].filter(Boolean).join(" ");

  return (
    <Document title={docTitle} author={v.from.name || undefined} creator="BillFlow" producer="BillFlow">
      <Page size="A4" style={[s.page, { fontFamily: font.regular }]}>
        <Header v={v} template={invoice.template} font={font} />

        <View style={s.parties}>
          <View style={s.party}>
            <Text style={s.label}>From</Text>
            {v.from.name ? <Text style={[s.partyName, { fontFamily: font.bold }]}>{v.from.name}</Text> : null}
            <Lines lines={v.from.lines} />
          </View>
          <View style={s.party}>
            <Text style={s.label}>Bill to</Text>
            {v.to.name ? <Text style={[s.partyName, { fontFamily: font.bold }]}>{v.to.name}</Text> : null}
            <Lines lines={v.to.lines} />
          </View>
        </View>

        {/* Table: the header row is `fixed`, so it repeats at the top of the table on every page. */}
        <View>
          <View
            fixed
            style={[
              s.th,
              { backgroundColor: theme.tableHead.bg, color: theme.tableHead.color, fontFamily: font.bold },
              theme.tableHead.rule ? { borderBottomWidth: 1, borderBottomColor: theme.tableHead.rule } : {},
            ]}
          >
            <Text style={s.cDesc}>Description</Text>
            <Text style={s.cQty}>Qty</Text>
            <Text style={s.cPrice}>Unit price</Text>
            {v.showTaxColumn ? <Text style={s.cTax}>Tax</Text> : null}
            <Text style={s.cAmount}>Amount</Text>
          </View>
          {v.rows.map((r, i) => (
            <View
              key={r.key}
              wrap={false}
              style={[
                s.tr,
                theme.zebra && i % 2 === 1 ? { backgroundColor: ZEBRA } : {},
                !theme.zebra ? { borderBottomWidth: 0.5, borderBottomColor: RULE } : {},
              ]}
            >
              <Text style={s.cDesc}>{r.description}</Text>
              <Text style={s.cQty}>{r.quantity}</Text>
              <Text style={s.cPrice}>{r.unitPrice}</Text>
              {v.showTaxColumn ? <Text style={s.cTax}>{r.tax}</Text> : null}
              <Text style={s.cAmount}>{r.amount}</Text>
            </View>
          ))}
        </View>

        <View wrap={false} style={[s.totals, minimal ? {} : { backgroundColor: ZEBRA, borderRadius: 4, paddingTop: 6 }]}>
          {v.totals.map((t) => (
            <View key={t.label} style={s.totalRow}>
              <Text style={s.muted}>{t.label}</Text>
              <Text>{t.value}</Text>
            </View>
          ))}
          <View
            style={[
              s.grand,
              { backgroundColor: theme.totalBar.bg, color: theme.totalBar.color, fontFamily: font.bold, fontSize: 12 },
              minimal ? { borderTopWidth: 1.5, borderTopColor: v.accent } : { borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
            ]}
          >
            <Text>{v.grandTotal.label}</Text>
            <Text>{v.grandTotal.value}</Text>
          </View>
        </View>

        {v.disclaimer ? (
          <Text style={{ marginTop: 10, textAlign: "right", color: MUTED, fontFamily: font.bold }}>{v.disclaimer}</Text>
        ) : null}

        {v.notes || v.terms || v.payment.length > 0 || v.signature ? (
          <View style={s.extras}>
            {v.payment.length > 0 ? (
              <View style={s.extraBlock} wrap={false}>
                <Text style={[s.label, { color: v.accent }]}>Payment details</Text>
                <Lines lines={v.payment} />
              </View>
            ) : null}
            {v.notes ? (
              <View style={s.extraBlock} wrap={false}>
                <Text style={[s.label, { color: v.accent }]}>Notes</Text>
                <Text style={s.muted}>{v.notes}</Text>
              </View>
            ) : null}
            {v.terms ? (
              <View style={s.extraBlock}>
                <Text style={[s.label, { color: v.accent }]}>Terms & conditions</Text>
                <Text style={s.muted}>{v.terms}</Text>
              </View>
            ) : null}
            {v.signature ? (
              <View style={s.extraBlock} wrap={false}>
                <Text style={[s.label, { color: v.accent }]}>Authorized signature</Text>
                <Image src={v.signature} style={s.signature} />
                <View style={{ borderTopWidth: 0.5, borderTopColor: MUTED, width: 160, paddingTop: 3 }}>
                  {v.from.name ? <Text style={s.muted}>{v.from.name}</Text> : null}
                </View>
              </View>
            ) : null}
          </View>
        ) : null}

        <Text fixed style={[s.footer, { textAlign: "left" }]}>
          {[v.title, invoice.number].filter(Boolean).join(" · ")}
        </Text>
        <Text
          fixed
          style={[s.footer, { left: undefined, width: 120, textAlign: "right" }]}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  );
}
