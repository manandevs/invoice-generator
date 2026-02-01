"use client";
import React from "react";
import { motion } from "framer-motion";
import { PencilLine, LayoutTemplate, Download } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "1 - Enter the data",
      description:
        "Fill in the fields with information about the supplier, client, and product or service details.",
      icon: <PencilLine className="w-12 h-12 text-white" />,
    },
    {
      number: "2 - Choose the Template",
      description:
        "Select the design and accent colors that best suit your professional brand identity.",
      icon: <LayoutTemplate className="w-12 h-12 text-white" />,
    },
    {
      number: "3 - Download the PDF",
      description:
        "Click download and get your professional invoice ready to send or print instantly.",
      icon: <Download className="w-12 h-12 text-white" />,
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#4F96E6] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white text-4xl md:text-5xl font-bold mb-16 font-urbanist"
        >
          How to create invoices in 3 steps
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col"
            >
              <div className="aspect-video mb-6 overflow-hidden rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-xl">
                <div className="relative">
                  <div className="absolute -inset-4 bg-white/20 blur-xl rounded-full" />
                  <div className="relative">{step.icon}</div>
                </div>
              </div>
              <h3 className="text-white text-xl font-bold mb-3 font-urbanist">
                {step.number}
              </h3>
              <p className="text-white/90 text-[16px] leading-relaxed max-w-[300px] font-urbanist">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
