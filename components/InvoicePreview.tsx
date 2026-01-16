"use client";

import jsPDF from "jspdf";
import { Card, CardContent } from "./ui/card";
import { useInvoice } from "@/context/invoice-contact";
import { ExternalLink, Download } from "lucide-react"; // Imported icons for better UI

export default function InvoicePreview() {
  const { invoice } = useInvoice();

  // 1. Extract PDF generation logic to a helper function
  const generatePdfDocument = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("INVOICE", 14, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, y);
    doc.text(`Date: ${invoice.date}`, 196, y, { align: "right" });
    y += 10;

    doc.setFontSize(12);
    doc.text("From:", 14, y);
    doc.text("To:", 110, y);
    y += 6;

    doc.setFontSize(11);
    doc.text(invoice.fromName || "Sender Name", 14, y);
    doc.text(invoice.toName || "Client Name", 110, y);
    y += 5;

    doc.text(invoice.fromEmail || "", 14, y);
    doc.text(invoice.toEmail || "", 110, y);
    y += 10;

    doc.text("Description", 14, y);
    doc.text("Qty", 110, y, { align: "right" });
    doc.text("Rate", 140, y, { align: "right" });
    doc.text("Amount", 190, y, { align: "right" });
    y += 4;

    doc.line(14, y, 196, y);
    y += 6;

    invoice.items.forEach((item) => {
      doc.text(item.description || "-", 14, y);
      doc.text(String(item.quantity), 110, y, { align: "right" });
      doc.text(`$${Number(item.rate).toFixed(2)}`, 140, y, { align: "right" });
      doc.text(`$${item.amount.toFixed(2)}`, 190, y, { align: "right" });
      y += 6;
    });

    y += 6;
    doc.line(110, y, 196, y);
    y += 6;

    doc.text("Subtotal:", 140, y);
    doc.text(`$${invoice.subtotal.toFixed(2)}`, 190, y, { align: "right" });
    y += 6;

    doc.text(`Tax (${invoice.taxRate}%):`, 140, y);
    doc.text(`$${invoice.taxAmount.toFixed(2)}`, 190, y, { align: "right" });
    y += 6;

    doc.setFontSize(12);
    doc.text("Total:", 140, y);
    doc.text(`$${invoice.total.toFixed(2)}`, 190, y, { align: "right" });

    return doc;
  };

  // 2. Handle Download
  const handleDownloadPDF = () => {
    const doc = generatePdfDocument();
    doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
  };

  // 3. Handle Open in New Tab
  const handleOpenNewTab = () => {
    const doc = generatePdfDocument();
    // output('bloburl') creates a blob URI that browsers can open
    const pdfBlobUrl = doc.output('bloburl');
    window.open(pdfBlobUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Invoice Preview</h1>
          
          <div className="flex gap-3">
            {/* New "View PDF" Button */}
            <button
              onClick={handleOpenNewTab}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View PDF
            </button>

            {/* Existing Download Button */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Invoice Card */}
        <Card>
          <CardContent className="p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">INVOICE</h2>
                <p className="text-gray-600">#{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Date: {invoice.date}</p>
              </div>
            </div>

            {/* From/To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-2">From:</h3>
                <p className="font-medium">{invoice.fromName || "Sender Name"}</p>
                <p className="text-gray-600">{invoice.fromEmail}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">To:</h3>
                <p className="font-medium">{invoice.toName || "Client Name"}</p>
                <p className="text-gray-600">{invoice.toEmail}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8 border-collapse">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-2">Description</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Rate</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id || index} className="border-b">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">
                      ${Number(item.rate).toFixed(2)}
                    </td>
                    <td className="py-2 text-right">
                      ${item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>${invoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}