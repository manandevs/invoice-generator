"use client";

import FAQ from "@/components/home/FAQ";
import Features from "@/components/home/Features";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";

export default function Home() {
  return (
    <div className="bg-gray-50">
      <Hero />
      <HowItWorks />
      <Features />
      <FAQ />
    </div>
  );
}
