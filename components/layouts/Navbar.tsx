"use client";

import Link from 'next/link';
import React, { useState } from 'react';
import { FaUser } from "react-icons/fa6";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from '../ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const springConfig = { type: "spring" as const, stiffness: 260, damping: 30 };

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const NAV_LINKS = [
    { name: "How it works", href: "/#how-it-works" },
    { name: "Pricing", href: "/pricing" },
    { name: "FAQs", href: "/faqs" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...springConfig, delay: 0.1 }}
      className="absolute top-0 inset-x-0 z-50"
    >
      <div
        className={cn(
          isOpen && "bg-white",
          "max-w-400 mx-auto px-2 sm:px-4 lg:px-6 h-22 md:h-27.5 flex items-center justify-between"
        )}
      >

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={springConfig}
          className='lg:hidden block'
        >
          <Link href="/" className="flex items-center">
            <Image
              src={"/images/logo.png"}
              alt='logo'
              width={200}
              height={200}
              className='w-14 h-14'
            />
            <h1 className="text-[28px] md:text-[33px] font-bold text-[#1C1C1C] uppercase font-camood tracking-tight">
              BillFlow
            </h1>
          </Link>
        </motion.div>

        <div className="hidden lg:flex items-center gap-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springConfig}
          >
            <Link href="/" className="flex items-center">
              <Image
                src={"/images/logo.png"}
                alt='logo'
                width={200}
                height={200}
                className='w-12 h-12'
              />
              <h1 className="text-[28px] md:text-[33px] font-bold text-[#1C1C1C] uppercase font-camood tracking-tight">
                BillFlow
              </h1>
            </Link>
          </motion.div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[#1C1C1C] font-urbanist font-medium hover:text-[#4F96E6] transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          <motion.button
            whileHover="hover"
            className="flex items-center gap-2.5 transition-opacity"
          >
            <motion.div variants={{ hover: { x: -3 } }} transition={springConfig}>
              <FaUser size={18} className="text-[#1C1C1C]" />
            </motion.div>
            <motion.span
              variants={{ hover: { opacity: 0.6 } }}
              className="text-[#1C1C1C] text-[16px] font-semibold font-urbanist"
            >
              Login
            </motion.span>
          </motion.button>

          <Button className='bg-[#4F96E6] text-white text-[18px] font-urbanist w-50 h-12 rounded-full font-medium transition'>
            Sign up
          </Button>
        </div>

        {/* Mobile Toggle Button */}
        <div className="md:hidden flex items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#1C1C1C] p-2 transition-all"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={springConfig}
                >
                  <HiX size={32} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={springConfig}
                >
                  <HiMenuAlt3 size={32} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ opacity: 0, y: -10, clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 1 }}
            className="absolute top-22 left-0 w-full bg-white shadow-2xl py-8 flex flex-col items-center gap-8 md:hidden"
          >
            <div className="flex flex-col items-center gap-6 w-full">
              {NAV_LINKS.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, ...springConfig }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-[#1C1C1C] font-urbanist font-medium hover:text-[#4F96E6] transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, ...springConfig }}
              className="flex items-center gap-2.5"
            >
              <FaUser size={20} className="text-[#1C1C1C]" />
              <span className="text-[#1C1C1C] text-[18px] font-semibold font-urbanist">
                Login
              </span>
            </motion.button>

            <Button className='bg-[#4F96E6] text-white text-[18px] font-urbanist w-50 h-12 rounded-full font-medium transition'>
              Sign up
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;