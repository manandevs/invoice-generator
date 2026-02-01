"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { InvoiceData } from "@/lib/types";
import jsPDF from "jspdf";
import { Download } from "lucide-react";

interface ContentPreviewProps {
  data: InvoiceData;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({ data }) => {
  const [pdfUrl, setPdfUrl] = useState<string>("");

  // Function to generate the jsPDF instance
  const generateDoc = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 7;
    let yPos = 20;

    const nextLine = (h = lineHeight) => {
      yPos += h;
    };

    // 1. Header (Company Name & Title)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - margin, yPos, { align: "right" });

    doc.setFontSize(14);
    doc.text(data.senderName || "Your Business Name", margin, yPos);
    nextLine(10);

    // 2. Invoice Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const leftColX = margin;
    const rightColX = pageWidth - margin - 50;
    const startY = yPos;

    // Right Side Data
    doc.text(`Invoice #:`, rightColX, yPos);
    doc.text(data.invoiceNumber || "N/A", pageWidth - margin, yPos, { align: "right" });
    yPos += 6;

    doc.text(`Date:`, rightColX, yPos);
    doc.text(data.invoiceDate || "N/A", pageWidth - margin, yPos, { align: "right" });
    yPos += 6;

    doc.text(`Due Date:`, rightColX, yPos);
    doc.text(data.dueDate || "N/A", pageWidth - margin, yPos, { align: "right" });
    yPos += 6;

    if (data.poNumber) {
      doc.text(`PO #:`, rightColX, yPos);
      doc.text(data.poNumber, pageWidth - margin, yPos, { align: "right" });
    }

    // Left Side (Sender Details)
    yPos = startY;
    doc.text(data.senderAddress || "", leftColX, yPos);
    if (data.senderAddress) yPos += 5;

    if (data.senderZip) {
      doc.text(`${data.senderZip}`, leftColX, yPos);
      yPos += 5;
    }
    if (data.senderEmail) {
      doc.text(`Email: ${data.senderEmail}`, leftColX, yPos);
      yPos += 5;
    }
    if (data.senderPhone) {
      doc.text(`Phone: ${data.senderPhone}`, leftColX, yPos);
      yPos += 5;
    }
    if (data.senderTaxId) {
      doc.text(`Tax ID: ${data.senderTaxId}`, leftColX, yPos);
      yPos += 5;
    }

    yPos = Math.max(yPos, startY + 30) + 10;

    // 3. Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    nextLine(10);

    // 4. Bill To
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", margin, yPos);
    nextLine(6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(data.clientName || "Client Name", margin, yPos);
    nextLine(6);

    doc.setFontSize(10);
    if (data.clientAddress) {
      doc.text(data.clientAddress, margin, yPos);
      nextLine(5);
    }
    if (data.clientZip) {
      doc.text(data.clientZip, margin, yPos);
      nextLine(5);
    }
    if (data.clientEmail) {
      doc.text(data.clientEmail, margin, yPos);
      nextLine(5);
    }
    if (data.clientTaxId) {
      doc.text(`Tax ID: ${data.clientTaxId}`, margin, yPos);
      nextLine(5);
    }

    nextLine(10);

    // 5. Payment Info
    const boxY = yPos;
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, boxY, pageWidth - margin * 2, 25, "F");

    yPos += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Payment Details", margin + 5, yPos);

    yPos += 7;
    doc.setFont("helvetica", "normal");
    doc.text(`Terms: ${data.paymentTerms || "Due on receipt"}`, margin + 5, yPos);
    doc.text(`Currency: ${data.currency || "USD"}`, margin + 60, yPos);

    yPos = boxY + 35;

    // 6. Notes
    if (data.notes) {
      doc.setFont("helvetica", "bold");
      doc.text("Notes / Terms:", margin, yPos);
      nextLine(6);
      doc.setFont("helvetica", "normal");

      const splitNotes = doc.splitTextToSize(data.notes, pageWidth - margin * 2);
      doc.text(splitNotes, margin, yPos);
    }

    return doc;
  };

  // Effect to update the PDF preview URL when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const doc = generateDoc();
      // FIX: Cast to unknown then string, or use .toString() if it returns a URL object
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
        <h3 className="font-semibold text-gray-900">PDF Preview</h3>
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
        {/* The static PDF is displayed here via iframe */}
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

export default ContentPreview;