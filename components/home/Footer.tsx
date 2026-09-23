import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { FooterCurrency } from "./FooterCurrency";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { name: "Generator", href: "/#generator" },
      { name: "Templates", href: "/templates" },
      { name: "How it works", href: "/how-it-works" },
      { name: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help Center", href: "/#faqs" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  },
];

const SOCIAL = [
  { name: "GitHub", href: "https://github.com/manandevs", icon: Github },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/manandevs", icon: Linkedin },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-white px-4 pb-8 pt-14 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-1.5" aria-label="BillFlow home">
              <Image src="/brand/logo.png" alt="" width={40} height={40} className="size-10" />
              <span className="font-camood text-2xl font-bold uppercase tracking-tight text-ink">BillFlow</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-600">
              Simple, professional invoicing for freelancers and small businesses. Free, in your browser.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="mb-4 text-sm font-semibold text-ink">{col.title}</h2>
              <ul className="space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-slate-600 transition-colors hover:text-brand">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="mb-4 text-sm font-semibold text-ink">Connect</h2>
            <ul className="flex gap-3">
              {SOCIAL.map(({ name, href, icon: Icon }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`BillFlow on ${name}`}
                    className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-brand hover:text-white"
                  >
                    <Icon className="size-4" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} BillFlow. All rights reserved.</p>
          <FooterCurrency />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
