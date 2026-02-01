"use client";
import React from "react";
import { motion } from "framer-motion";
import { PencilLine, LayoutTemplate, Download, CheckCircle2 } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      id: "01",
      title: "Enter the data",
      description:
        "Fill in the fields with information about the supplier, client, and product or service details. Our smart forms validate as you type.",
      icon: <PencilLine className="w-8 h-8 text-[#4F96E6]" />,
      features: ["Auto-save progress", "Currency detection", "Tax calculations"],
    },
    {
      id: "02",
      title: "Choose the Template",
      description:
        "Select the design that best suits your professional brand. Customize accent colors to match your business identity perfectly.",
      icon: <LayoutTemplate className="w-8 h-8 text-[#4F96E6]" />,
      features: ["Modern layouts", "Custom branding", "Real-time preview"],
    },
    {
      id: "03",
      title: "Download the PDF",
      description:
        "Click download and get your professional invoice ready. Send it directly to your clients or print it for your records.",
      icon: <Download className="w-8 h-8 text-[#4F96E6]" />,
      features: ["Print-ready PDF", "Direct email sharing", "Mobile optimized"],
    },
  ];

  return (
    <section 
      id="how-it-works" 
      className="relative min-h-screen flex items-center bg-[#4F96E6] pt-32 pb-8 px-6 overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Heading */}
          <div className="lg:col-span-4 text-white">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl md:text-6xl font-bold font-urbanist leading-tight mb-8">
                Invoicing <br />
                <span className="text-blue-100">Simplified.</span>
              </h2>
              <p className="text-lg text-blue-50 font-urbanist mb-10 max-w-sm">
                Creating professional invoices shouldn't take hours. With BillFlow, it takes seconds. 
                Follow these three simple steps to get paid faster.
              </p>
              
              <div className="flex items-center gap-4">
                <span className="text-sm uppercase tracking-widest font-semibold text-white/60 font-urbanist">
                  The Workflow
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Large Step Cards */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className={`${
                    index === 2 ? "md:col-span-2" : "md:col-span-1"
                  } group bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-blue-900/20 hover:shadow-blue-900/30 transition-all duration-500 border border-white/20`}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-16 h-16 bg-[#4F96E6]/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      {step.icon}
                    </div>
                    <span className="text-4xl font-bold text-gray-100 font-urbanist">
                      {step.id}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#1C1C1C] mb-4 font-urbanist group-hover:text-[#4F96E6] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 font-urbanist leading-relaxed mb-8">
                    {step.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {step.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm font-medium text-gray-700 font-urbanist">
                        <CheckCircle2 size={16} className="text-[#4F96E6]" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorks;