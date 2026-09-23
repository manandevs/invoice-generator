"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { LogIn, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { name: "Generator", href: "/#generator" },
  { name: "Templates", href: "/templates" },
  { name: "How it works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5 rounded-lg" aria-label="BillFlow home">
      <Image src="/brand/logo.png" alt="" width={40} height={40} className="size-10" priority />
      <span className="font-camood text-[26px] font-bold uppercase tracking-tight text-ink">BillFlow</span>
    </Link>
  );
}

function AuthButtons({ stacked = false }: { stacked?: boolean }) {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button variant="ghost" className={cn("h-10 text-[15px] text-ink", stacked && "h-12 w-full")}>
            <LogIn /> Log in
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className={cn("h-10 rounded-full px-6 text-[15px]", stacked && "h-12 w-full")}>Sign up</Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}

const Navbar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => !href.startsWith("/#") && pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/90 backdrop-blur-md supports-backdrop-filter:bg-white/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "rounded-lg px-3 py-2 text-[15px] font-medium transition-colors hover:bg-slate-100 hover:text-ink",
                      isActive(link.href) ? "text-brand" : "text-slate-700",
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <AuthButtons />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <Button variant="ghost" size="icon-lg" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
            <Menu className="size-6" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent variant="sheet-right" closeLabel="Close menu" className="flex flex-col">
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <div className="-mt-1 mb-6">
            <Logo />
          </div>
          <nav aria-label="Mobile">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-3 py-3 text-base font-medium hover:bg-slate-100",
                      isActive(link.href) ? "bg-brand-tint text-brand" : "text-ink",
                    )}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Show when="signed-out">
            <div className="mt-auto space-y-2 border-t border-border pt-4" onClick={() => setOpen(false)}>
              <AuthButtons stacked />
            </div>
          </Show>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Navbar;
