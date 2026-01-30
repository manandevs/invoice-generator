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
import { Check } from "lucide-react";

/* types */
type StepValue = "document" | "content" | "items" | "template";

interface Step {
  value: StepValue;
  number: number;
  label: string;
  description: string;
}

interface DocumentImage {
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

/* data */
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
      "An invoice is issued after goods or services are delivered. It records the transaction and requests payment from the client.",
    features: [
      "Invoice number",
      "Issue date & due date",
      "Client & business details",
      "Line items with pricing",
      "Subtotal, tax, and total",
    ],
    recommendedFor: [
      "Completed sales",
      "Service-based businesses",
      "Regular client billing",
    ],
    hasTax: false,
    isEditable: true,
  },
  {
    id: "tax-invoice",
    src: "/images/image.png",
    label: "Tax Invoice",
    description: "Invoice including applicable tax details.",
    longDescription:
      "A tax invoice includes legally required tax information and is used for VAT/GST compliant transactions.",
    features: [
      "Tax registration number",
      "Tax breakdown (VAT/GST)",
      "Invoice & due dates",
      "Buyer & seller details",
      "Tax-compliant totals",
    ],
    recommendedFor: [
      "VAT/GST registered businesses",
      "Government or enterprise clients",
      "Tax reporting",
    ],
    hasTax: true,
    isEditable: true,
  },
  {
    id: "proforma",
    src: "/images/image.png",
    label: "Proforma Invoice",
    description: "Preliminary invoice issued before final sale.",
    longDescription:
      "A proforma invoice is a preliminary bill sent before goods or services are delivered. It helps clients review costs in advance.",
    features: [
      "Estimated pricing",
      "Valid-until date",
      "Product or service preview",
      "No payment request",
    ],
    recommendedFor: [
      "Price confirmation",
      "International trade",
      "Client approvals",
    ],
    hasTax: false,
    isEditable: false,
  },
];

/* main Component */
const Hero = () => {
  const [activeStep, setActiveStep] = useState<StepValue>("document");
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<StepValue[]>([]);

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
        return <ContentPreview />;
      case "items":
        return <ItemsPreview />;
      case "template":
        return <TemplatePreview />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-22 md:p-27.5 flex items-center justify-between">
      <div className="w-full grid grid-cols-3 p-2 bg-[#4f95e65c] rounded-2xl md:rounded-3xl backdrop-blur-xl bg-linear-to-br from-[#4f95e6]/40 via-[#4f95e6]/10 to-transparent border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] ring-1 ring-white/20">
        <div className="min-h-160 bg-gray-50 rounded-2xl md:rounded-3xl col-span-2">
          <Tabs
            value={activeStep}
            onValueChange={(v) => setActiveStep(v as StepValue)}
            className="mx-4 pt-2"
          >
            <div className="flex justify-start items-center gap-1">
              <span className="hidden sm:inline  text-gray-800">Steps:</span>
              <TabsList className="bg-transparent ">
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

            <TabsContent value="document">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className=" text-2xl font-semibold">
                    {getStep("document")?.label}
                  </CardTitle>
                  <CardDescription className="">
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

                          <span className=" text-gray-800 font-semibold'">
                            {item.label}
                          </span>
                          <p className=" text-xs">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className=" text-2xl font-semibold">
                    {getStep("content")?.label}
                  </CardTitle>
                  <CardDescription className="">
                    {getStep("content")?.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 py-2 border border-y-gray-200">
                  <ScrollArea className="h-90 pl-2 pr-4">
                    <div className="space-y-8">
                      {/* general info */}
                      <div className="bg-white rounded-xl p-4 border ">
                        <h3 className="text-lg font-semibold mb-4">
                          General Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Invoice Number *</Label>
                            <Input placeholder="INV-001" />
                          </div>

                          <div className="space-y-1">
                            <Label>Invoice Date</Label>
                            <Input type="date" />
                          </div>

                          <div className="space-y-1">
                            <Label>Due Date</Label>
                            <Input type="date" />
                          </div>

                          <div className="space-y-1">
                            <Label>Order / PO Number</Label>
                            <Input placeholder="PO-1001" />
                          </div>
                        </div>
                      </div>

                      {/* issuer */}
                      <div className="bg-white rounded-xl p-4 border">
                        <h3 className="text-lg font-semibold mb-4">
                          Issuer (Your Business)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Business Name *</Label>
                            <Input placeholder="My Company LLC" />
                          </div>

                          <div className="space-y-1">
                            <Label>Tax ID / VAT</Label>
                            <Input placeholder="123456789" />
                          </div>

                          <div className="space-y-1">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              placeholder="billing@company.com"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label>Phone</Label>
                            <Input placeholder="+1 234 567 890" />
                          </div>

                          <div className="space-y-1">
                            <Label>Postal Code</Label>
                            <Input placeholder="12345" />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <Label>Address</Label>
                            <Input placeholder="Street, City, Country" />
                          </div>
                        </div>
                      </div>

                      {/* recipient */}
                      {/* recipient */}
                      <div className="bg-white rounded-xl p-4 border">
                        <h3 className="text-lg font-semibold mb-4">
                          Recipient (Client)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Client Name *</Label>
                            <Input placeholder="Client Company" />
                          </div>

                          <div className="space-y-1">
                            <Label>Client Tax ID</Label>
                            <Input placeholder="987654321" />
                          </div>

                          <div className="space-y-1">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              placeholder="client@email.com"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label>Phone</Label>
                            <Input placeholder="+1 987 654 321" />
                          </div>

                          <div className="space-y-1">
                            <Label>Postal Code</Label>
                            <Input placeholder="12345" />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <Label>Address</Label>
                            <Input placeholder="123 Client Street, City, Country" />
                          </div>
                        </div>
                      </div>

                      {/* payment */}
                      <div className="bg-white rounded-xl p-4 border">
                        <h3 className="text-lg font-semibold mb-4">
                          Payment Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Payment Terms */}
                          <div className="space-y-1">
                            <Label>Payment Terms</Label>
                            <Select>
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

                          {/* Currency */}
                          <div className="space-y-1">
                            <Label>Currency</Label>
                            <Select>
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

                      {/* signature */}
                      <div className="bg-white rounded-xl p-4 border">
                        <h3 className="text-lg font-semibold mb-4">
                          Signature
                        </h3>
                        <div className="space-y-1">
                          <Button className="w-full justify-start border border-gray-300 text-gray-200">
                            + Create a signature
                          </Button>
                        </div>
                      </div>

                      {/* extras / terms and conditions */}
                      <div className="bg-white rounded-xl p-4 border">
                        <h3 className="text-lg font-semibold mb-4">Extras</h3>
                        <div className="space-y-1">
                          <Label>Terms and conditions</Label>
                          <textarea
                            className="w-full border border-gray-200 rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-[#4F96E6]"
                            rows={4}
                            placeholder="Enter terms and conditions..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className=" text-2xl font-semibold">
                    {getStep("items")?.label}
                  </CardTitle>
                  <CardDescription className="">
                    {getStep("items")?.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 py-2 border border-y-gray-200">
                  <ScrollArea className="h-90 pl-2 pr-4"></ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="template">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className=" text-2xl font-semibold">
                    {getStep("template")?.label}
                  </CardTitle>
                  <CardDescription className="">
                    {getStep("template")?.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 py-2 border border-y-gray-200">
                  <ScrollArea className="h-90 pl-2 pr-4"></ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center justify-between gap-4">
                <Button
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                  className="bg-[#4F96E6] text-white text-[18px]  max-w-35 w-full h-11 rounded-full font-medium transition disabled:opacity-50"
                >
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={currentIndex === steps.length - 1}
                  className="bg-[#4F96E6] text-white text-[18px]  max-w-35 w-full h-11 rounded-full font-medium transition disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            </div>
          </Tabs>
        </div>

        <div className="min-h-160 bg-gray-50 rounded-2xl md:rounded-3xl col-span-1 p-4 ">
          {renderRightPanel()}
        </div>
      </div>
    </div>
  );
};

export default Hero;

interface DocumentPreviewProps {
  selectedDocument: DocumentImage | null;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  selectedDocument,
}) => {
  if (!selectedDocument) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        Select a document to preview
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className=" flex flex-col items-start gap-2">
        <div className="flex justify-start items-end gap-2">
          <img
            src={selectedDocument.src}
            alt={selectedDocument.label}
            className="h-8"
          />
          <h3 className="text-xl font-semibold">{selectedDocument.label}</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {selectedDocument.longDescription}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Includes</h4>
        <ul className="space-y-1 text-sm">
          {selectedDocument.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <AiTwotoneCheckCircle className="text-[#4F96E6]" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 flex-wrap">
        {selectedDocument.recommendedFor.map((item, i) => (
          <span
            key={i}
            className="px-3 py-1 text-xs rounded-full bg-[#4F96E6]/10 text-[#4F96E6]"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-[#4F96E6]/40 bg-[#4F96E6]/5 p-4 space-y-3">
        <h4 className="text-sm font-semibold text-[#4F96E6]">Next steps</h4>

        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <AiTwotoneCheckCircle className="mt-0.5 text-[#4F96E6]" />
            Review the selected document type
          </li>
          <li className="flex items-start gap-2">
            <AiTwotoneCheckCircle className="mt-0.5 text-[#4F96E6]" />
            Click <span className="font-medium">Continue</span> to add invoice
            content
          </li>
          <li className="flex items-start gap-2">
            <AiTwotoneCheckCircle className="mt-0.5 text-[#4F96E6]" />
            Add items and choose a template in later steps
          </li>
        </ul>

        <p className="text-xs text-gray-500">
          You can come back and change the document type at any time.
        </p>
      </div>
    </div>
  );
};

const ContentPreview = () => (
  <div className="space-y-2 text-sm text-gray-600">
    <h3 className="font-semibold text-gray-900">Invoice Content</h3>
    <p>Configure dates, payment terms, and notes.</p>
  </div>
);

const ItemsPreview = () => (
  <div className="space-y-2 text-sm text-gray-600">
    <h3 className="font-semibold text-gray-900">Items</h3>
    <p>Add products or services to your invoice.</p>
  </div>
);

const TemplatePreview = () => (
  <div className="space-y-2 text-sm text-gray-600">
    <h3 className="font-semibold text-gray-900">Template</h3>
    <p>Select and preview the invoice template.</p>
  </div>
);
