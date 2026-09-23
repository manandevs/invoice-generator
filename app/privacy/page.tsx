import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layouts/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BillFlow handles your data: invoices stay in your browser, accounts are handled by Clerk.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 23, 2026">
      <section>
        <h2>The short version</h2>
        <p>
          BillFlow builds your invoices and their PDFs inside your browser. We don&apos;t upload, store or see your invoices, your clients&apos;
          details or your line items. An account is optional. If you create one, Clerk handles sign-in, and the only BillFlow data kept with
          it is the business details you choose to save.
        </p>
      </section>

      <section>
        <h2>Invoices and drafts (everyone)</h2>
        <ul>
          <li>
            Your current draft is saved in your browser&apos;s local storage, under the key <code>billflow:draft:v1</code>, so a page refresh
            doesn&apos;t lose your work. This includes your logo and signature if you add them.
          </li>
          <li>This data never leaves your device unless you download, print, share or email the invoice yourself.</li>
          <li>You can delete it at any time by clearing this site&apos;s data in your browser settings.</li>
        </ul>
      </section>

      <section>
        <h2>Share links</h2>
        <p>
          When you use <strong>Copy share link</strong>, the invoice is compressed into the part of the link after the <code>#</code>.
          Browsers don&apos;t send that part to our server, so we never receive it. Anyone you give the link to can read the invoice, so share
          it only with people who should see it. Logos and signatures are left out of links.
        </p>
      </section>

      <section>
        <h2>Email drafts</h2>
        <p>
          The <strong>Email</strong> button opens your own email app with a pre-filled message. BillFlow doesn&apos;t send email and
          doesn&apos;t see the message.
        </p>
      </section>

      <section>
        <h2>Accounts (optional)</h2>
        <ul>
          <li>
            Sign-up and sign-in are provided by <a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener noreferrer">Clerk</a>,
            which processes your email address, name and sign-in details to run your account, and uses cookies to keep you signed in.
          </li>
          <li>
            If you press <strong>Save to account</strong>, your business details (name, tax ID, contact details, address, payment instructions
            and default terms) are stored in your Clerk user profile so they can be filled in on any device. Your logo, signature, invoices
            and clients are not saved to your account.
          </li>
          <li>You can delete your account, and the saved details with it, from the account menu.</li>
        </ul>
      </section>

      <section>
        <h2>What we don&apos;t do</h2>
        <ul>
          <li>We don&apos;t use analytics or advertising trackers.</li>
          <li>We don&apos;t sell or share your data.</li>
          <li>Our hosting provider may keep standard, short-lived server logs (such as IP address and pages requested) for security.</li>
        </ul>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          If this policy changes, we&apos;ll update the date at the top of this page. Questions? Reach us through our{" "}
          <a href="https://github.com/manandevs" target="_blank" rel="noopener noreferrer">GitHub</a>. See also our{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
