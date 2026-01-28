"use client";
import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from '@/lib/utils'
import { ScrollArea } from '../ui/scroll-area'
import { Button } from '../ui/button'

const steps = [
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
]

const documentImages = [
  {
    src: "/images/image.png",
    label: "Invoice",
    description: "Standard bill for goods or services provided.",
  },
  {
    src: "/images/image.png",
    label: "Tax Invoice",
    description: "Invoice including applicable tax details.",
  },
  {
    src: "/images/image.png",
    label: "Proforma Invoice",
    description: "Preliminary invoice issued before final sale.",
  },
  {
    src: "/images/image.png",
    label: "Invoice",
    description: "Standard bill for goods or services provided.",
  },
  {
    src: "/images/image.png",
    label: "Tax Invoice",
    description: "Invoice including applicable tax details.",
  },
  {
    src: "/images/image.png",
    label: "Proforma Invoice",
    description: "Preliminary invoice issued before final sale.",
  },
]

const Hero = () => {
  const [activeStep, setActiveStep] = useState("document")

  const currentIndex = steps.findIndex(
    (step) => step.value === activeStep
  )

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].value)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].value)
    }
  }

  const getStep = (value: string) =>
    steps.find((step) => step.value === value)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-22 md:p-27.5 flex items-center justify-between">
      <div className="w-full grid grid-cols-3 p-2 bg-[#4f95e65c] rounded-2xl md:rounded-3xl backdrop-blur-xl bg-gradient-to-br from-[#4f95e6]/40 via-[#4f95e6]/10 to-transparent border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] ring-1 ring-white/20">
        <div className="min-h-140 bg-gray-50 rounded-2xl md:rounded-3xl col-span-2">
          <Tabs
            value={activeStep}
            onValueChange={setActiveStep}
            className='mx-4 pt-2'
          >
            <div className="flex justify-start items-center gap-1">
              <span className="hidden sm:inline font-urbanist text-gray-800">Steps:</span>
              <TabsList className='bg-transparent font-urbanist'>
                {steps.map((step) => (
                  <TabsTrigger
                    key={step.value}
                    value={step.value}
                    className="flex items-center justify-center gap-1 bg-gray-200 mx-1 h-8"
                  >
                    <span className={cn(
                      "flex h-6 w-6 items-center justify-center text-xs font-medium border border-gray-400 rounded-3xl"
                    )}>
                      {step.number}
                    </span>
                    <span className="hidden sm:inline">{step.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value='document'>
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="font-urbanist text-2xl font-semibold">
                    {getStep("document")?.label}
                  </CardTitle>
                  <CardDescription className="font-urbanist">
                    {getStep("document")?.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 py-2 border border-y-gray-200">
                  <ScrollArea className='h-70 pl-2 pr-4'>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {documentImages.map((item, index) => (
                        <div
                          key={index}
                          className="rounded-xl border bg-white p-4 flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition text-center"
                        >
                          <img
                            src={item.src}
                            alt={item.label}
                            className="h-20 w-auto object-contain"
                          />

                          <span className="font-urbanist text-gray-800 font-semibold'">
                            {item.label}
                          </span>
                          <p className='font-urbanist text-xs'>
                            {item.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='content'>
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="font-urbanist text-2xl font-semibold">
                    {getStep("content")?.label}
                  </CardTitle>
                  <CardDescription className="font-urbanist">
                    {getStep("content")?.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 py-2 border border-y-gray-200">
                  <ScrollArea className='h-70 pl-2 pr-4'>

                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='items'>
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="font-urbanist text-2xl font-semibold">
                    {getStep("items")?.label}
                  </CardTitle>
                  <CardDescription className="font-urbanist">
                    {getStep("items")?.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 py-2 border border-y-gray-200">
                  <ScrollArea className='h-70 pl-2 pr-4'>

                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='template'>
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="font-urbanist text-2xl font-semibold">
                    {getStep("template")?.label}
                  </CardTitle>
                  <CardDescription className="font-urbanist">
                    {getStep("template")?.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 py-2 border border-y-gray-200">
                  <ScrollArea className='h-70 pl-2 pr-4'>

                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center justify-between gap-4">
                <Button
                  onClick={handleBack}
                  disabled={currentIndex === 0}
                  className="bg-[#4F96E6] text-white text-[18px] font-urbanist max-w-35 w-full h-11 rounded-full font-medium transition disabled:opacity-50"
                >
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={currentIndex === steps.length - 1}
                  className="bg-[#4F96E6] text-white text-[18px] font-urbanist max-w-35 w-full h-11 rounded-full font-medium transition disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            </div>
          </Tabs>
        </div>

        <div className="min-h-140 bg-gray-50 rounded-2xl md:rounded-3xl col-span-1">

        </div>
      </div>
    </div>
  )
}

export default Hero