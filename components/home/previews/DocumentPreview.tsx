"use client";
import { DocumentImage } from "@/lib/types";
import React from "react";
import { AiTwotoneCheckCircle } from "react-icons/ai";

interface DocumentPreviewProps {
  selectedDocument: DocumentImage | null;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  selectedDocument,
}) => {
  if (!selectedDocument) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a document to preview
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className=" flex flex-col items-start gap-2">
        <div className="flex justify-start items-end gap-2">
          <img
            src={selectedDocument.src}
            alt={selectedDocument.label}
            className="h-8"
          />
          <h3 className="text-xl font-semibold">{selectedDocument.label}</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {selectedDocument.longDescription}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Includes</h4>
        <ul className="space-y-1 text-sm">
          {selectedDocument.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <AiTwotoneCheckCircle className="text-[#4F96E6]" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 flex-wrap">
        {selectedDocument.recommendedFor.map((item, i) => (
          <span
            key={i}
            className="px-3 py-1 text-xs rounded-full bg-[#4F96E6]/10 text-[#4F96E6]"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-[#4F96E6]/40 bg-[#4F96E6]/5 p-4 space-y-3">
        <h4 className="text-sm font-semibold text-[#4F96E6]">Next steps</h4>

        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <AiTwotoneCheckCircle className="mt-0.5 text-[#4F96E6]" />
            Review the selected document type
          </li>
          <li className="flex items-start gap-2">
            <AiTwotoneCheckCircle className="mt-0.5 text-[#4F96E6]" />
            Click <span className="font-medium">Continue</span> to add invoice
            content
          </li>
          <li className="flex items-start gap-2">
            <AiTwotoneCheckCircle className="mt-0.5 text-[#4F96E6]" />
            Add items and choose a template in later steps
          </li>
        </ul>

        <p className="text-xs text-gray-500">
          You can come back and change the document type at any time.
        </p>
      </div>
    </div>
  );
};

export default DocumentPreview;