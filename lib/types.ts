export type StepValue = "document" | "content" | "items" | "template";

export interface Step {
  value: StepValue;
  number: number;
  label: string;
  description: string;
}

export interface DocumentImage {
  id: string;
  src: string;
  label: string;
  description: string;
  longDescription: string;
  features: string[];
  recommendedFor: string[];
  hasTax: boolean;
  isEditable: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  poNumber: string;
  senderName: string;
  senderTaxId: string;
  senderEmail: string;
  senderPhone: string;
  senderZip: string;
  senderAddress: string;
  clientName: string;
  clientTaxId: string;
  clientEmail: string;
  clientPhone: string;
  clientZip: string;
  clientAddress: string;
  paymentTerms: string;
  currency: string;
  notes: string;
  items: InvoiceItem[];
  accentColor: string;
}