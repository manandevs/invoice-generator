"use client";

import React, { useEffect, useRef, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { CloudDownload, CloudUpload, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { partySchema, paymentInstructionsSchema, type Party, type PaymentInstructions } from "@/lib/invoice/schema";
import { useInvoiceStore } from "@/lib/invoice/store";

/**
 * Business profile saved to the signed-in user's Clerk metadata (text only; the logo and
 * signature stay on this device because Clerk metadata is limited to 8 KB).
 */
interface SavedProfile {
  issuer: Party;
  paymentInstructions: PaymentInstructions;
  terms: string;
}

function readProfile(metadata: Record<string, unknown> | undefined): SavedProfile | null {
  const raw = metadata?.billflowProfile as Partial<SavedProfile> | undefined;
  if (!raw) return null;
  const issuer = partySchema.safeParse(raw.issuer);
  const payment = paymentInstructionsSchema.safeParse(raw.paymentInstructions);
  if (!issuer.success || !payment.success) return null;
  return { issuer: issuer.data, paymentInstructions: payment.data, terms: typeof raw.terms === "string" ? raw.terms : "" };
}

export function ProfileSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const updateIssuer = useInvoiceStore((s) => s.updateIssuer);
  const update = useInvoiceStore((s) => s.update);
  const [saving, setSaving] = useState(false);
  const autoFilled = useRef(false);

  const profile = isSignedIn ? readProfile(user.unsafeMetadata) : null;

  const apply = (p: SavedProfile) => {
    updateIssuer(p.issuer);
    update({ paymentInstructions: p.paymentInstructions, ...(p.terms ? { terms: p.terms } : {}) });
  };

  // Prefill once per visit when the business name is still empty.
  useEffect(() => {
    if (!profile || autoFilled.current) return;
    autoFilled.current = true;
    if (!useInvoiceStore.getState().invoice.issuer.name.trim()) {
      apply(profile);
      toast.success("Filled in your saved business details");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when the profile first becomes available
  }, [profile !== null]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="flex flex-col gap-3 rounded-lg bg-brand-tint/60 p-3 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2">
          <UserRound className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          Sign in to save your business details and have them filled in automatically, on any device.
        </p>
        <SignInButton mode="modal">
          <Button type="button" variant="outline" size="sm" className="shrink-0">
            Sign in
          </Button>
        </SignInButton>
      </div>
    );
  }

  const save = async () => {
    const inv = useInvoiceStore.getState().invoice;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- the logo is too large for Clerk metadata
    const { logo, ...issuer } = inv.issuer;
    setSaving(true);
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          billflowProfile: { issuer, paymentInstructions: inv.paymentInstructions, terms: inv.terms } satisfies SavedProfile,
        },
      });
      toast.success("Business details saved to your account");
    } catch {
      toast.error("Couldn't save your details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
      <p>
        {profile ? "Your saved business details fill in automatically." : "Save these details to your account to reuse them."}{" "}
        <span className="text-slate-600">Logo and signature stay on this device.</span>
      </p>
      <div className="flex shrink-0 gap-2">
        {profile && (
          <Button type="button" variant="outline" size="sm" onClick={() => apply(profile)}>
            <CloudDownload /> Fill in
          </Button>
        )}
        <Button type="button" size="sm" onClick={save} disabled={saving}>
          <CloudUpload /> {saving ? "Saving…" : profile ? "Update saved" : "Save to account"}
        </Button>
      </div>
    </div>
  );
}
