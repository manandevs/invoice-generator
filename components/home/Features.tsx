"use client";
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Globe, MousePointer2 } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "Fast & Intuitive",
      desc: "Create professional invoices in under 60 seconds with our optimized workflow.",
      icon: <Zap className="text-[#4F96E6]" />,
    },
    {
      title: "Multi-Currency",
      desc: "Support for USD, EUR, GBP, and PKR to bill your clients worldwide.",
      icon: <Globe className="text-[#4F96E6]" />,
    },
    {
      title: "No Account Required",
      desc: "Start invoicing immediately without the hassle of a lengthy sign-up process.",
      icon: <MousePointer2 className="text-[#4F96E6]" />,
    },
    {
      title: "Secure & Private",
      desc: "Your data stays in your browser. We don't store your sensitive invoice details.",
      icon: <ShieldCheck className="text-[#4F96E6]" />,
    },
  ];

  return (
    <section className="py-24 bg-gray-50 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1C1C1C] font-urbanist mb-4">Why choose BillFlow?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to get paid faster and look more professional.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-[#4F96E6]/10 rounded-2xl flex items-center justify-center mb-6">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1C1C1C] mb-3 font-urbanist">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-urbanist">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;