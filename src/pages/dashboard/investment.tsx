"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Brain,
  BarChart3,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

// Enhanced Badge component
const Badge = ({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "recommended";
}) => {
  const baseClasses =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  const variantClasses =
    variant === "recommended"
      ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-sm"
      : "bg-gradient-to-r from-gray-200 to-gray-100 text-gray-800";

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-teal-600 to-teal-500 rounded-full transition-all duration-500 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
);

// Investment Option Component
const InvestmentOption = ({
  icon,
  title,
  description,
  expectedReturn,
  risk,
  isSelected,
  isRecommended,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  expectedReturn: string;
  risk: string;
  isSelected: boolean;
  isRecommended?: boolean;
  onClick: () => void;
}) => (
  <Card
    className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
      isSelected
        ? "bg-gradient-to-br from-blue-50 via-white to-blue-50 border-2 border-blue-500 shadow-lg"
        : "bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg"
    }`}
    onClick={onClick}
  >
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          <div
            className={`p-3 rounded-2xl ${
              isSelected
                ? "bg-gradient-to-br from-blue-500 to-blue-400"
                : "bg-gradient-to-br from-teal-500 to-teal-400"
            }`}
          >
            <div className="text-white">{icon}</div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                {title}
              </h3>
              {isRecommended && (
                <Badge variant="recommended">Recommended</Badge>
              )}
            </div>
            <p className="text-gray-600 text-sm sm:text-base mb-3">
              {description}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-blue-600 font-semibold">
                Expected: {expectedReturn}
              </span>
              <span className="text-gray-500">Risk: {risk}</span>
            </div>
          </div>
        </div>

        {/* Selection Indicator */}
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? "border-blue-500 bg-blue-500"
              : "border-gray-300 bg-white"
          }`}
        >
          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function InvestPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<
    "conservative" | "balanced"
  >("balanced");
  const [investmentAmount] = useState(2000);

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleContinue = () => {
    // Navigate to step 2 or complete investment

    console.log("Continue with:", selectedOption, "Amount:", investmentAmount);
    router.push("/dashboard/investment_confirmation");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 py-6 sm:py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2 text-black hover:bg-gray-500 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative">
              <Image
                src="/images/inchvest-logo.png"
                alt="InchVest Logo"
                width={32}
                height={32}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                AI Investment
              </h1>
              <p className="text-sm text-gray-500">Step 1 of 2</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar progress={50} />
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <div className="text-center">
            {/* AI Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 via-blue-400 to-teal-400 rounded-3xl flex items-center justify-center shadow-lg">
              <Brain className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              AI Investment Strategy
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
              Choose your investment approach for optimal returns
            </p>
          </div>

          {/* Investment Amount */}
          <Card className="bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium text-base sm:text-lg">
                  Amount to Invest
                </span>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  ${investmentAmount.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Investment Options */}
          <div className="space-y-4">
            <InvestmentOption
              icon={<TrendingUp className="w-6 h-6" />}
              title="Balanced"
              description="Moderate risk, balanced growth"
              expectedReturn="7-10%"
              risk="Medium"
              isSelected={selectedOption === "balanced"}
              isRecommended={true}
              onClick={() => setSelectedOption("balanced")}
            />
          </div>

          {/* Continue Button */}
          <div className="pt-4 pb-8">
            <Button
              onClick={handleContinue}
              className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              Continue to Step 2
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
