"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

const TEXT =
  "An invoice is a document a seller sends to a buyer to show what they owe for goods or services. It lists what was sold, the quantities and prices, taxes, the total due, the due date and how to pay. A clear invoice helps you get paid on time, keeps your records tidy for tax season, and shows clients you run a professional business.";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  // Starts at 0.5 so unread words still meet the 3:1 contrast minimum for large text.
  const opacity = useTransform(progress, range, [0.5, 1]);
  return (
    <motion.span style={{ opacity }} className="inline">
      {word}{" "}
    </motion.span>
  );
}

/** A paragraph whose words darken as it scrolls through the viewport. */
export default function WhatIsInvoice() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = TEXT.split(" ");

  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-3xl text-ink sm:text-4xl">What is an invoice?</h2>
        <p ref={ref} className="text-2xl leading-snug text-ink sm:text-[2rem] sm:leading-[1.35]">
          {reduce
            ? TEXT
            : words.map((w, i) => (
                <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
              ))}
        </p>
      </div>
    </section>
  );
}
