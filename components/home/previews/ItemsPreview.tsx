"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InvoiceData } from "@/lib/types";
import jsPDF from "jspdf";
import { Download } from "lucide-react";

interface ItemsPreviewProps {
  data: InvoiceData;
}

const ItemsPreview: React.FC<ItemsPreviewProps> = ({ data }) => {
  const [pdfUrl, setPdfUrl] = useState<string>("");

  const formatCurrency = (amount: number) => {
    return `${data.currency} ${amount.toFixed(2)}`;
  };

  const generateDoc = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    const nextLine = (h = 7) => {
      yPos += h;
    };

    // --- 1. Header ---
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - margin, yPos, { align: "right" });

    doc.setFontSize(14);
    doc.text(data.senderName || "Your Business Name", margin, yPos);
    nextLine(10);

    // --- 2. Details ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const rightColX = pageWidth - margin - 50;
    const startY = yPos;

    // Right Side
    doc.text(`Invoice #:`, rightColX, yPos);
    doc.text(data.invoiceNumber || "N/A", pageWidth - margin, yPos, { align: "right" });
    yPos += 6;
    doc.text(`Date:`, rightColX, yPos);
    doc.text(data.invoiceDate || "N/A", pageWidth - margin, yPos, { align: "right" });
    yPos += 6;
    doc.text(`Due Date:`, rightColX, yPos);
    doc.text(data.dueDate || "N/A", pageWidth - margin, yPos, { align: "right" });
    
    // Left Side (Address)
    yPos = startY;
    doc.text(data.senderAddress || "", margin, yPos);
    if (data.senderAddress) yPos += 5;
    if (data.senderEmail) { doc.text(data.senderEmail, margin, yPos); yPos += 5; }
    
    yPos = Math.max(yPos, startY + 30) + 10;

    // --- 3. Bill To ---
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", margin, yPos);
    nextLine(6);
    doc.setFont("helvetica", "normal");
    doc.text(data.clientName || "Client Name", margin, yPos);
    nextLine(6);
    if(data.clientAddress) { doc.text(data.clientAddress, margin, yPos); nextLine(10); } else { nextLine(4); }

    // --- 4. Items Table (Manual Drawing) ---
    const tableStartY = yPos;
    const colDesc = margin;
    const colQty = pageWidth - margin - 80;
    const colPrice = pageWidth - margin - 40;
    const colTotal = pageWidth - margin;

    // Table Header
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Description", colDesc, yPos + 2);
    doc.text("Qty", colQty, yPos + 2, { align: "right" });
    doc.text("Price", colPrice, yPos + 2, { align: "right" });
    doc.text("Amount", colTotal, yPos + 2, { align: "right" });
    nextLine(12);

    // Table Rows
    doc.setFont("helvetica", "normal");
    let subtotal = 0;

    data.items.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;

      // Handle page break if low on space
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(item.description || "Item", colDesc, yPos);
      doc.text(item.quantity.toString(), colQty, yPos, { align: "right" });
      doc.text(item.price.toFixed(2), colPrice, yPos, { align: "right" });
      doc.text(itemTotal.toFixed(2), colTotal, yPos, { align: "right" });
      
      // Light line between rows
      doc.setDrawColor(240, 240, 240);
      doc.line(margin, yPos + 3, pageWidth - margin, yPos + 3);
      
      nextLine(10);
    });

    // --- 5. Totals ---
    nextLine(5);
    const totalsX = pageWidth - margin - 50;
    
    doc.setFont("helvetica", "bold");
    doc.text("Total:", totalsX, yPos, { align: "right" });
    doc.text(formatCurrency(subtotal), pageWidth - margin, yPos, { align: "right" });

    // --- 6. Footer (Notes) ---
    if (data.notes) {
       yPos += 20;
       if (yPos > 270) { doc.addPage(); yPos = 20; }
       doc.setFontSize(9);
       doc.setTextColor(100);
       doc.text("Notes:", margin, yPos);
       const splitNotes = doc.splitTextToSize(data.notes, pageWidth - (margin * 2));
       doc.text(splitNotes, margin, yPos + 5);
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
    doc.save(`Invoice-${data.invoiceNumber || "draft"}.pdf`);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">PDF Preview (With Items)</h3>
        <Button
          onClick={handleDownload}
          size="sm"
          className="bg-[#4F96E6] hover:bg-[#3d7abf] text-white gap-2"
        >
          <Download size={16} />
          Download PDF
        </Button>
      </div>

      <div className="flex-1 bg-gray-200/50 rounded-xl overflow-hidden border border-gray-200">
        {pdfUrl ? (
          <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Generating Preview...
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsPreview;