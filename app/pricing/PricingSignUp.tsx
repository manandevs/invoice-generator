"use client";

import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function PricingSignUp() {
  return (
    <>
      <Show when="signed-out">
        <SignUpButton mode="modal">
          <Button className="h-12 w-full text-base">Create a free account</Button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Button asChild className="h-12 w-full text-base">
          <Link href="/#generator">You&apos;re signed in. Open the generator</Link>
        </Button>
      </Show>
    </>
  );
}
