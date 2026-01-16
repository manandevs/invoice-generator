import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { InvoiceItem as InvoiceItemType } from "@/types/invoice";
import { useInvoice } from "@/context/invoice-contact";

interface InvoiceItemProps {
  item: InvoiceItemType;
  index: number;
  canRemove: boolean;
}

export default function InvoiceItem({
  item,
  index,
  canRemove,
}: InvoiceItemProps) {
  const { updateItem, removeItem } = useInvoice();

  return (
    <div className="grid grid-cols-12 gap-4 p-4 border rounded-lg">
      <div className="col-span-5">
        <Label>Description</Label>
        <Input
          value={item.description}
          onChange={(e) => updateItem(index, "description", e.target.value)}
          placeholder="Item description"
        />
      </div>

      <div className="col-span-2">
        <Label>Quantity</Label>
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => updateItem(index, "quantity", e.target.value)}
        />
      </div>

      <div className="col-span-2">
        <Label>Rate ($)</Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={item.rate}
          onChange={(e) => updateItem(index, "rate", e.target.value)}
        />
      </div>

      <div className="col-span-2">
        <Label>Amount</Label>
        <Input 
          value={(item.amount || 0).toFixed(2)} 
          readOnly 
          className="bg-gray-50" 
        />
      </div>

      <div className="col-span-1 flex items-end">
        <Button
          variant="outline"
          size="icon"
          disabled={!canRemove}
          onClick={() => removeItem(index)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}