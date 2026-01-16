import BasicDetails from "./BasicDetails";
import ContactDetails from "./ContactDetails";
import ItemsList from "./ItemsList";
import TaxAndTotals from "./TaxAndTotals";

export default function InvoiceForm() {
  return (
    <div className="space-y-6">
      <BasicDetails />
      <ContactDetails />
      <ItemsList />
      <TaxAndTotals />
    </div>
  );
}