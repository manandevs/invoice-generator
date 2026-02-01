"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <Image src="/images/logo.png" alt="logo" width={48} height={48} className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-[#1C1C1C] uppercase font-camood tracking-tight ml-2">
                BillFlow
              </h1>
            </Link>
            <p className="text-gray-500 text-sm font-urbanist leading-relaxed">
              Empowering small businesses and freelancers with simple, professional invoicing tools.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1C1C] mb-6 font-urbanist">Product</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-urbanist">
              <li><Link href="#" className="hover:text-[#4F96E6] transition-colors">Generator</Link></li>
              <li><Link href="#" className="hover:text-[#4F96E6] transition-colors">Templates</Link></li>
              <li><Link href="/pricing" className="hover:text-[#4F96E6] transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1C1C] mb-6 font-urbanist">Support</h4>
            <ul className="space-y-4 text-sm text-gray-500 font-urbanist">
              <li><Link href="#faqs" className="hover:text-[#4F96E6] transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-[#4F96E6] transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-[#4F96E6] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1C1C] mb-6 font-urbanist">Connect</h4>
            <div className="flex gap-4">
              {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map((Icon, i) => (
                <Link key={i} href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#4F96E6] hover:text-white transition-all">
                  <Icon size={16} />
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400 font-urbanist">
            © {new Date().getFullYear()} BillFlow Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-400 font-urbanist">
            <Link href="#">English (US)</Link>
            <Link href="#">USD ($)</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;