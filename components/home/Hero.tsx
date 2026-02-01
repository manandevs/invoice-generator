"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { AiTwotoneCheckCircle } from "react-icons/ai";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Check, Plus, Trash2 } from "lucide-react";
import {
  DocumentImage,
  Step,
  StepValue,
  InvoiceData,
  InvoiceItem,
} from "@/lib/types";
import DocumentPreview from "./previews/DocumentPreview";
import ContentPreview from "./previews/ContentPreview";
import ItemsPreview from "./previews/ItemsPreview";
import TemplatePreview from "./previews/TemplatePreview";

/* --- DATA CONFIGURATION --- */
const steps: Step[] = [
  {
    value: "document",
    number: 1,
    label: "Document",
    description: "Invoice number, client, and basic details.",
  },
  {
    value: "content",
    number: 2,
    label: "Content",
    description: "Dates, payment terms, and notes.",
  },
  {
    value: "items",
    number: 3,
    label: "Items",
    description: "Add products or services.",
  },
  {
    value: "template",
    number: 4,
    label: "Template",
    description: "Select and preview invoice template.",
  },
];

const documentImages: DocumentImage[] = [
  {
    id: "invoice",
    src: "/images/image.png",
    label: "Invoice",
    description: "Standard bill for goods or services provided.",
    longDescription:
      "An invoice is issued after goods or services are delivered.",
    features: ["Invoice number", "Line items", "Subtotal, tax, and total"],
    recommendedFor: ["Completed sales", "Service-based businesses"],
    hasTax: false,
    isEditable: true,
  },
  {
    id: "tax-invoice",
    src: "/images/image.png",
    label: "Tax Invoice",
    description: "Invoice including applicable tax details.",
    longDescription: "A tax invoice includes legally required tax information.",
    features: ["Tax registration number", "Tax breakdown (VAT/GST)"],
    recommendedFor: ["VAT/GST registered businesses"],
    hasTax: true,
    isEditable: true,
  },
  {
    id: "proforma",
    src: "/images/image.png",
    label: "Proforma Invoice",
    description: "Preliminary invoice issued before final sale.",
    longDescription:
      "A proforma invoice is a preliminary bill sent before goods or services are delivered.",
    features: ["Estimated pricing", "Valid-until date"],
    recommendedFor: ["Price confirmation", "International trade"],
    hasTax: false,
    isEditable: false,
  },
];

// Available Accent Colors
const colorOptions = [
  { name: "Blue", value: "#4F96E6" },
  { name: "Emerald", value: "#10B981" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Orange", value: "#F97316" },
  { name: "Red", value: "#EF4444" },
  { name: "Gray", value: "#374151" },
];

/* --- MAIN COMPONENT --- */
const Hero = () => {
  const [activeStep, setActiveStep] = useState<StepValue>("document");
  const [selectedDoc, setSelectedDoc] = useState<number | null>(0);
  const [completedSteps, setCompletedSteps] = useState<StepValue[]>([]);

  // -- State for Invoice Form Data --
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    poNumber: "",
    senderName: "",
    senderTaxId: "",
    senderEmail: "",
    senderPhone: "",
    senderZip: "",
    senderAddress: "",
    clientName: "",
    clientTaxId: "",
    clientEmail: "",
    clientPhone: "",
    clientZip: "",
    clientAddress: "",
    paymentTerms: "",
    currency: "USD",
    notes: "",
    items: [{ id: "1", description: "", quantity: 1, price: 0 }],
    accentColor: "#4F96E6", // Default Color
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof InvoiceData, value: string) => {
    setInvoiceData((prev) => ({ ...prev, [name]: value }));
  };

  // Item Logic
  const handleAddItem = () => {
    setInvoiceData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Math.random().toString(36).substr(2, 9),
          description: "",
          quantity: 1,
          price: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (id: string) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number,
  ) => {
    setInvoiceData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0,
    );
  };

  // Color Selection Logic
  const handleColorChange = (color: string) => {
    setInvoiceData((prev) => ({ ...prev, accentColor: color }));
  };

  // Navigation Logic
  const currentIndex = steps.findIndex((step) => step.value === activeStep);
  const selectedDocument: DocumentImage | null =
    selectedDoc !== null ? documentImages[selectedDoc] : null;

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setCompletedSteps((prev) => {
        if (!prev.includes(activeStep)) return [...prev, activeStep];
        return prev;
      });
      setActiveStep(steps[currentIndex + 1].value);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].value);
    }
  };

  const getStep = (value: StepValue) =>
    steps.find((step) => step.value === value);

  const renderRightPanel = () => {
    switch (activeStep) {
      case "document":
        return <DocumentPreview selectedDocument={selectedDocument} />;
      case "content":
        return <ContentPreview data={invoiceData} />;
      case "items":
        return <ItemsPreview data={invoiceData} />;
      case "template":
        return <TemplatePreview data={invoiceData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-22 md:p-27.5 flex items-center justify-between">
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 p-2 bg-[#4f95e6c2] rounded-2xl md:rounded-3xl backdrop-blur-xl bg-linear-to-br from-[#4f95e6]/40 via-[#4f95e6]/10 to-transparent border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] ring-1 ring-white/20">
        <div className="min-h-160 bg-gray-50 rounded-2xl md:rounded-3xl col-span-1 lg:col-span-2">
          <Tabs
            value={activeStep}
            onValueChange={(v) => setActiveStep(v as StepValue)}
            className="mx-4 pt-2"
          >
            {/* Steps Indicator */}
            <div className="flex justify-start items-center gap-1">
              <span className="hidden sm:inline text-gray-800">Steps:</span>
              <TabsList className="bg-transparent">
                {steps.map((step) => (
                  <TabsTrigger
                    key={step.value}
                    value={step.value}
                    className="flex items-center justify-center gap-1 bg-gray-200 mx-1 h-8"
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center text-xs font-medium border rounded-3xl",
                        completedSteps.includes(step.value)
                          ? "border-gray-400 bg-[#4f95e65c]"
                          : "border-gray-400",
                      )}
                    >
                      {completedSteps.includes(step.value) ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        step.number
                      )}
                    </span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* TAB 1: DOCUMENT */}
            <TabsContent value="document">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-2xl font-semibold">
                    {getStep("document")?.label}
                  </CardTitle>
                  <CardDescription>
                    {getStep("document")?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 py-2 border border-y-gray-200">
                  <ScrollArea className="h-90 pl-2 pr-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {documentImages.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedDoc(index)}
                          className={cn(
                            "relative rounded-xl border-2 p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 text-center group overflow-hidden",
                            selectedDoc === index
                              ? "border-[#4F96E6] bg-[#4F96E6]/5 shadow-md"
                              : "bg-white shadow-sm border-gray-100 hover:border-gray-200 hover:shadow-md",
                          )}
                        >
                          {selectedDoc === index && (
                            <div className="absolute top-0 right-0 p-1.5 bg-[#4F96E6] rounded-bl-xl shadow-sm z-10 animate-in fade-in zoom-in duration-200">
                              <AiTwotoneCheckCircle
                                size={16}
                                className="text-white"
                              />
                            </div>
                          )}
                          <img
                            src={item.src}
                            alt={item.label}
                            className="h-20 w-auto object-contain"
                          />
                          <span className="text-gray-800 font-semibold">
                            {item.label}
                          </span>
                          <p className="text-xs">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: CONTENT */}
            <TabsContent value="content">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-2xl font-semibold">
                    {getStep("content")?.label}
                  </CardTitle>
                  <CardDescription>
                    {getStep("content")?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 py-2 border border-y-gray-200">
                  <ScrollArea className="h-90 pl-2 pr-4">
                    <div className="space-y-8">
                      {/* General Info */}
                      <div className="bg-white rounded-xl p-4 border ">
                        <h3 className="text-lg font-semibold mb-4">
                          General Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Invoice Number *</Label>
                            <Input
                              name="invoiceNumber"
                              value={invoiceData.invoiceNumber}
                              onChange={handleInputChange}
                              placeholder="INV-001"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Invoice Date</Label>
                            <Input
                              type="date"
                              name="invoiceDate"
                              value={invoiceData.invoiceDate}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Due Date</Label>
                            <Input
                              type="date"
                              name="dueDate"
                              value={invoiceData.dueDate}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Order / PO Number</Label>
                            <Input
                              name="poNumber"
                              value={invoiceData.poNumber}
                              onChange={handleInputChange}
                              placeholder="PO-1001"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Issuer */}
                      <div className="bg-white rounded-xl p-4 border">
                        <h3 className="text-lg font-semibold mb-4">
                          Issuer (Your Business)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Business Name *</Label>
                            <Input
                              name="senderName"
                              value={invoiceData.senderName}
                              onChange={handleInputChange}
                              placeholder="My Company LLC"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Tax ID / VAT</Label>
                            <Input
                              name="senderTaxId"
                              value={invoiceData.senderTaxId}
                              onChange={handleInputChange}
                              placeholder="123456789"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              name="senderEmail"
                              value={invoiceData.senderEmail}
                              onChange={handleInputChange}
                              placeholder="billing@company.com"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Phone</Label>
                            <Input
                              name="senderPhone"
                              value={invoiceData.senderPhone}
                              onChange={handleInputChange}
                              placeholder="+1 234 567 890"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Postal Code</Label>
                            <Input
                              name="senderZip"
                              value={invoiceData.senderZip}
                              onChange={handleInputChange}
                              placeholder="12345"
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <Label>Address</Label>
                            <Input
                              name="senderAddress"
                              value={invoiceData.senderAddress}
                              onChange={handleInputChange}
                              placeholder="Street, City, Country"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Recipient */}
                      <div className="bg-white rounded-xl p-4 border">
                        <h3 className="text-lg font-semibold mb-4">
                          Recipient (Client)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Client Name *</Label>
                            <Input
                              name="clientName"
                              value={invoiceData.clientName}
                              onChange={handleInputChange}
                              placeholder="Client Company"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Client Tax ID</Label>
                            <Input
                              name="clientTaxId"
                              value={invoiceData.clientTaxId}
                              onChange={handleInputChange}
                              placeholder="987654321"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              name="clientEmail"
                              value={invoiceData.clientEmail}
                              onChange={handleInputChange}
                              placeholder="client@email.com"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Phone</Label>
                            <Input
                              name="clientPhone"
                              value={invoiceData.clientPhone}
                              onChange={handleInputChange}
                              placeholder="+1 987 654 321"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Postal Code</Label>
                            <Input
                              name="clientZip"
                              value={invoiceData.clientZip}
                              onChange={handleInputChange}
                              placeholder="12345"
                            />
                          </div>
                          <div className="space-y-1 md:col-span-2">
                            <Label>Address</Label>
                            <Input
                              name="clientAddress"
                              value={invoiceData.clientAddress}
                              onChange={handleInputChange}
                              placeholder="123 Client Street, City, Country"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Payment & Extras */}
                      <div className="bg-white rounded-xl p-4 border">
                        <h3 className="text-lg font-semibold mb-4">
                          Payment Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Payment Terms</Label>
                            <Select
                              value={invoiceData.paymentTerms}
                              onValueChange={(val) =>
                                handleSelectChange("paymentTerms", val)
                              }
                            >
                              <SelectTrigger className="min-w-full">
                                <SelectValue placeholder="Select Payment Term" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Due on receipt">
                                  Due on receipt
                                </SelectItem>
                                <SelectItem value="Net 7">Net 7</SelectItem>
                                <SelectItem value="Net 15">Net 15</SelectItem>
                                <SelectItem value="Net 30">Net 30</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Currency</Label>
                            <Select
                              value={invoiceData.currency}
                              onValueChange={(val) =>
                                handleSelectChange("currency", val)
                              }
                            >
                              <SelectTrigger className="min-w-full">
                                <SelectValue placeholder="Select Currency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="PKR">PKR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 border">
                        <h3 className="text-lg font-semibold mb-4">Extras</h3>
                        <div className="space-y-1">
                          <Label>Terms and conditions</Label>
                          <textarea
                            className="w-full border border-gray-200 rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#4F96E6]"
                            rows={4}
                            name="notes"
                            value={invoiceData.notes}
                            onChange={handleInputChange}
                            placeholder="Enter terms and conditions..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: ITEMS */}
            <TabsContent value="items">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-2xl font-semibold">
                    {getStep("items")?.label}
                  </CardTitle>
                  <CardDescription>
                    {getStep("items")?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 py-2 border border-y-gray-200">
                  <ScrollArea className="h-90 pl-2 pr-4">
                    <div className="space-y-4">
                      {/* Items List */}
                      <div className="space-y-3">
                        {invoiceData.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2"
                          >
                            <div className="grid grid-cols-12 gap-3 w-full">
                              <div className="col-span-6 space-y-1">
                                <Label className="text-xs text-gray-500">
                                  Description
                                </Label>
                                <Input
                                  value={item.description}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Item name"
                                  className="h-9"
                                />
                              </div>
                              <div className="col-span-2 space-y-1">
                                <Label className="text-xs text-gray-500">
                                  Qty
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "quantity",
                                      Number(e.target.value),
                                    )
                                  }
                                  className="h-9"
                                />
                              </div>
                              <div className="col-span-3 space-y-1">
                                <Label className="text-xs text-gray-500">
                                  Price
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  value={item.price}
                                  onChange={(e) =>
                                    handleItemChange(
                                      item.id,
                                      "price",
                                      Number(e.target.value),
                                    )
                                  }
                                  placeholder="0.00"
                                  className="h-9"
                                />
                              </div>
                              <div className="col-span-1 flex items-end justify-center pb-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                  disabled={invoiceData.items.length === 1}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={handleAddItem}
                        variant="outline"
                        className="w-full border-dashed border-gray-300 text-gray-500 hover:border-[#4F96E6] hover:text-[#4F96E6]"
                      >
                        <Plus size={16} className="mr-2" /> Add New Item
                      </Button>
                      <div className="bg-[#4F96E6]/5 rounded-xl p-4 border border-[#4F96E6]/20 flex justify-between items-center">
                        <span className="font-medium text-gray-700">
                          Total Amount
                        </span>
                        <span className="text-xl font-bold text-[#4F96E6]">
                          {invoiceData.currency} {calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: TEMPLATE (NEW) */}
            <TabsContent value="template">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-2xl font-semibold">
                    {getStep("template")?.label}
                  </CardTitle>
                  <CardDescription>
                    {getStep("template")?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 py-2 border border-y-gray-200">
                  <ScrollArea className="h-90 pl-2 pr-4">
                    <div className="space-y-6">
                      {/* Color Selector */}
                      <div className="bg-white rounded-xl p-6 border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">
                          Accent Color
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {colorOptions.map((color) => (
                            <div
                              key={color.value}
                              onClick={() => handleColorChange(color.value)}
                              className={cn(
                                "h-12 w-12 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm border border-gray-100",
                                invoiceData.accentColor === color.value
                                  ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                                  : "",
                              )}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            >
                              {invoiceData.accentColor === color.value && (
                                <Check className="text-white w-6 h-6 drop-shadow-md" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#4F96E6]/5 rounded-xl p-4 border border-[#4F96E6]/20">
                        <h4 className="font-medium text-[#4F96E6] mb-2">
                          Ready to Download?
                        </h4>
                        <p className="text-sm text-gray-600">
                          Your invoice is ready! Check the preview on the right.
                          If everything looks good, click the download button in
                          the preview pane.
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FOOTER NAVIGATION */}
            <div className="flex items-center justify-between gap-4 my-4">
              <div className="flex items-center justify-between gap-4 w-full">
                <Button
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                  className="bg-[#4F96E6] text-white text-[18px] max-w-35 w-full h-11 rounded-full font-medium transition disabled:opacity-50"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentIndex === steps.length - 1}
                  className="bg-[#4F96E6] text-white text-[18px] max-w-35 w-full h-11 rounded-full font-medium transition disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            </div>
          </Tabs>
        </div>

        {/* RIGHT PANEL PREVIEW */}
        <div className="min-h-160 bg-gray-50 rounded-2xl md:rounded-3xl col-span-1 p-4">
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
};

export default Hero;
