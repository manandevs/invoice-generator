"use client";


import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-5xl uppercase font-bold font-alphabet tracking-wider">
              Invoice Generator
            </h1>
            <p className="text-gray-600">
              Create professional invoices quickly
            </p>
          </div>
          <Button onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>

        {showPreview ? <InvoicePreview /> : <InvoiceForm />}

      </div>
    </div>
  );
}