import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layouts/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using BillFlow's free invoice generator.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 23, 2026">
      <section>
        <h2>Using BillFlow</h2>
        <p>
          BillFlow is a free tool for creating invoices, tax invoices and proforma invoices as PDFs. You can use it without an account. By
          using it you agree to these terms.
        </p>
      </section>

      <section>
        <h2>Your content and your responsibility</h2>
        <ul>
          <li>You own everything you enter and every document you create.</li>
          <li>
            You&apos;re responsible for the accuracy of your invoices and for meeting the invoicing and tax rules that apply to you, such as
            required tax registration numbers, rates and wording. BillFlow calculates totals from what you enter, but it isn&apos;t tax,
            legal or accounting advice.
          </li>
          <li>Don&apos;t use BillFlow to create fraudulent or misleading documents, or to impersonate another business.</li>
        </ul>
      </section>

      <section>
        <h2>Your data</h2>
        <p>
          Drafts are stored in your browser, so clearing your browser data deletes them. Download anything you need to keep. How we handle
          data is described in the <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>Accounts</h2>
        <p>
          Accounts are optional and provided through Clerk. Keep your sign-in details secure. We may suspend accounts that are used for abuse.
        </p>
      </section>

      <section>
        <h2>No warranty</h2>
        <p>
          BillFlow is provided &quot;as is&quot;, without warranties of any kind. To the extent the law allows, we aren&apos;t liable for
          losses arising from use of the service, including errors in documents you create or loss of locally stored drafts.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          We may update the service and these terms. When the terms change, we&apos;ll update the date at the top of this page. Continuing to
          use BillFlow after a change means you accept the new terms.
        </p>
      </section>
    </LegalPage>
  );
}
