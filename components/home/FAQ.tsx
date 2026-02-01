"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Is BillFlow really free to use?",
    a: "Yes! Our basic invoice generator is completely free. You can create, preview, and download as many invoices as you need without any hidden costs.",
  },
  {
    q: "Can I customize the colors of my invoice?",
    a: "Absolutely. In the 'Template' step, you can choose from various accent colors to match your business branding.",
  },
  {
    q: "Do you store my client's information?",
    a: "No. BillFlow operates primarily on the client side. We do not store your personal data or your client's details on our servers.",
  },
  {
    q: "How do I download the invoice as a PDF?",
    a: "Once you fill in the details, head to the Template tab. You can preview your work and click the 'Download PDF' button in the preview pane.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faqs" className="py-24 bg-white px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-bold text-[#1C1C1C] font-urbanist mb-12 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-bold text-lg text-[#1C1C1C] font-urbanist">{faq.q}</span>
                <ChevronDown className={`text-[#4F96E6] transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-gray-600 font-urbanist leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;