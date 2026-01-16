import { useInvoice } from "@/context/invoice-contact";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function TaxAndTotals() {
  const { invoice, updateInvoice } = useInvoice();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax & Totals</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tax Rate */}
        <div>
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={invoice.taxRate}
            onChange={(e) => updateInvoice({ taxRate: e.target.value })}
          />
        </div>

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({invoice.taxRate}%):</span>
            <span>${invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}