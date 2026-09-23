import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "BillFlow: free invoice generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/logo-og.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#2270C3", padding: 72, color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", background: "white", borderRadius: 24, padding: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
              <img src={logoSrc} width={72} height={72} alt="" />
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1 }}>BillFlow</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>Free invoice generator</div>
            <div style={{ fontSize: 34, marginTop: 20, opacity: 0.9 }}>Invoices, tax invoices & proformas. 4 templates. PDF in seconds.</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 300,
            height: 420,
            marginLeft: 48,
            alignSelf: "center",
            background: "white",
            borderRadius: 12,
            padding: 28,
            color: "#0f172a",
            boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
          }}
        >
          <div style={{ fontSize: 26, fontWeight: 800, color: "#2270C3" }}>INVOICE</div>
          <div style={{ fontSize: 14, color: "#475569", marginTop: 6 }}>INV-0042 · Due Sep 16</div>
          {[70, 90, 60, 80].map((w, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: i === 0 ? 34 : 14 }}>
              <div style={{ height: 10, width: `${w}%`, maxWidth: 150, background: "#e2e8f0", borderRadius: 5 }} />
              <div style={{ height: 10, width: 48, background: "#e2e8f0", borderRadius: 5 }} />
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", background: "#2270C3", color: "white", borderRadius: 8, padding: "12px 14px", fontSize: 18, fontWeight: 700 }}>
            <span>Total due</span>
            <span>$5,588.00</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
