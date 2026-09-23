import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { FooterCurrency } from "./FooterCurrency";

const LINKS = [
  { name: "Generator", href: "/#generator" },
  { name: "Templates", href: "/templates" },
  { name: "How it works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
  { name: "Help Center", href: "/#faqs" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
];
const SOCIAL = [
  { name: "GitHub", href: "https://github.com/manandevs", icon: Github },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/manandevs", icon: Linkedin },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
          <Link href="/" className="flex items-center gap-1.5" aria-label="BillFlow home">
            <Image src="/brand/logo.png" alt="" width={36} height={36} className="size-9" />
            <span className="font-camood text-2xl font-bold uppercase tracking-tight text-ink">BillFlow</span>
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-slate-600 transition-colors hover:text-brand">
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex gap-2">
            {SOCIAL.map(({ name, href, icon: Icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`BillFlow on ${name}`}
                  className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-brand hover:text-white"
                >
                  <Icon className="size-4" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} BillFlow. Free invoice generator for freelancers and small businesses.</p>
          <FooterCurrency />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
