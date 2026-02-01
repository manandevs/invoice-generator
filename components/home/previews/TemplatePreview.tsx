"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InvoiceData } from "@/lib/types";
import jsPDF from "jspdf";
import { Download, Palette, Maximize2, X, ExternalLink } from "lucide-react";

interface TemplatePreviewProps {
  data: InvoiceData;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ data }) => {
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Helper: Convert Hex to RGB for jsPDF
  const hexToRgb = (hex: string) => {
    let c: any;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = "0x" + c.join("");
      return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    }
    return [0, 0, 0]; // Default black
  };

  const formatCurrency = (amount: number) => {
    return `${data.currency} ${amount.toFixed(2)}`;
  };

  const generateDoc = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;
    const [r, g, b] = hexToRgb(data.accentColor || "#4F96E6");

    const nextLine = (h = 7) => {
      yPos += h;
    };

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text("INVOICE", pageWidth - margin, yPos, { align: "right" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(data.senderName || "Your Business Name", margin, yPos);
    nextLine(10);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const rightColX = pageWidth - margin - 50;
    const startY = yPos;

    doc.text(`Invoice #:`, rightColX, yPos);
    doc.text(data.invoiceNumber || "N/A", pageWidth - margin, yPos, {
      align: "right",
    });
    yPos += 6;
    doc.text(`Date:`, rightColX, yPos);
    doc.text(data.invoiceDate || "N/A", pageWidth - margin, yPos, {
      align: "right",
    });
    yPos += 6;
    doc.text(`Due Date:`, rightColX, yPos);
    doc.text(data.dueDate || "N/A", pageWidth - margin, yPos, {
      align: "right",
    });

    // Left Side (Address)
    yPos = startY;
    doc.text(data.senderAddress || "", margin, yPos);
    if (data.senderAddress) yPos += 5;
    if (data.senderEmail) {
      doc.text(data.senderEmail, margin, yPos);
      yPos += 5;
    }
    if (data.senderPhone) {
      doc.text(data.senderPhone, margin, yPos);
      yPos += 5;
    }

    yPos = Math.max(yPos, startY + 30) + 10;

    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", margin, yPos + 5);

    yPos += 15;
    doc.setFont("helvetica", "bold");
    doc.text(data.clientName || "Client Name", margin, yPos);
    nextLine(5);
    doc.setFont("helvetica", "normal");
    if (data.clientAddress) {
      doc.text(data.clientAddress, margin, yPos);
      nextLine(10);
    } else {
      nextLine(5);
    }

    // --- 4. Items Table ---
    const tableStartY = yPos;
    const colDesc = margin + 5;
    const colQty = pageWidth - margin - 80;
    const colPrice = pageWidth - margin - 40;
    const colTotal = pageWidth - margin - 5;

    // Table Header Background (Accent Color)
    doc.setFillColor(r, g, b);
    doc.rect(margin, yPos - 5, pageWidth - margin * 2, 10, "F");

    // Table Header Text (White)
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Description", colDesc, yPos + 2);
    doc.text("Qty", colQty, yPos + 2, { align: "right" });
    doc.text("Price", colPrice, yPos + 2, { align: "right" });
    doc.text("Amount", colTotal, yPos + 2, { align: "right" });
    doc.setTextColor(0, 0, 0); // Reset text to black
    nextLine(12);

    // Table Rows
    doc.setFont("helvetica", "normal");
    let subtotal = 0;

    data.items.forEach((item, i) => {
      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;

      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      // Zebra striping
      if (i % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPos - 5, pageWidth - margin * 2, 8, "F");
      }

      doc.text(item.description || "Item", colDesc, yPos);
      doc.text(item.quantity.toString(), colQty, yPos, { align: "right" });
      doc.text(item.price.toFixed(2), colPrice, yPos, { align: "right" });
      doc.text(itemTotal.toFixed(2), colTotal, yPos, { align: "right" });

      nextLine(8);
    });

    // --- 5. Totals ---
    nextLine(5);

    // Total Line
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - margin - 60, yPos - 2, pageWidth - margin, yPos - 2);

    const totalsX = pageWidth - margin - 50;
    doc.setFont("helvetica", "bold");
    doc.text("Total:", totalsX, yPos + 5, { align: "right" });

    doc.setTextColor(r, g, b);
    doc.setFontSize(14);
    doc.text(formatCurrency(subtotal), pageWidth - margin, yPos + 5, {
      align: "right",
    });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // --- 6. Footer (Notes) ---
    if (data.notes) {
      yPos += 20;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPos, pageWidth - margin * 2, 20, "F");

      doc.setFontSize(9);
      doc.text("Notes / Terms:", margin + 2, yPos + 5);
      doc.setFont("helvetica", "normal");
      const splitNotes = doc.splitTextToSize(
        data.notes,
        pageWidth - margin * 2 - 4,
      );
      doc.text(splitNotes, margin + 2, yPos + 10);
    }

    return doc;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const doc = generateDoc();
      const blobUrl = doc.output("bloburl");
      setPdfUrl(blobUrl.toString());
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  const handleDownload = () => {
    const doc = generateDoc();
    doc.save(`Invoice-${data.invoiceNumber || "final"}.pdf`);
  };

  const handleOpenInNewTab = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <div className="h-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Final Preview</h3>
          </div>

          <div className="flex flex-col items-center gap-2">
            {/* Full Screen Toggle Button */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenInNewTab}
                variant="outline"
                size="sm"
                disabled={!pdfUrl}
                className="text-gray-600 border-gray-300 hover:bg-gray-100 gap-2"
                title="Open in new tab"
              >
                <ExternalLink size={16} />
              </Button>

              <Button
                onClick={() => setIsFullScreen(true)}
                variant="outline"
                size="sm"
                className="text-gray-600 border-gray-300 hover:bg-gray-100 gap-2"
                title="Full Screen Preview"
              >
                <Maximize2 size={16} />
              </Button>
            </div>

            <Button
              onClick={handleDownload}
              size="sm"
              className="bg-[#4F96E6] hover:bg-[#3d7abf] text-white gap-2"
            >
              <Download size={16} />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-gray-200/50 rounded-xl overflow-hidden border border-gray-200">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Applying Template...
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Overlay Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col p-4 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-4 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <h2 className="text-white font-semibold ml-2">
              Full Screen Preview
            </h2>
            <div className="flex gap-4">
              <Button
                onClick={handleDownload}
                className="bg-[#4F96E6] hover:bg-[#3d7abf] text-white gap-2 h-9"
              >
                <Download size={16} /> Download
              </Button>
              <Button
                onClick={() => setIsFullScreen(false)}
                variant="secondary"
                className="gap-2 h-9"
              >
                <X size={16} /> Close
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
            <iframe
              src={pdfUrl}
              className="w-full h-full bg-white"
              title="Full Screen PDF Preview"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TemplatePreview;
