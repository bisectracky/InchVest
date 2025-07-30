"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign } from "lucide-react";

// Progress Bar Component
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-teal-600 to-teal-500 rounded-full transition-all duration-500 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
);

// Quick Amount Button Component
const QuickAmountButton = ({
  amount,
  isSelected,
  onClick,
}: {
  amount: number;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <Button
    variant="outline"
    onClick={onClick}
    className={`h-12 font-semibold text-base rounded-xl transition-all duration-300 ${
      isSelected
        ? "bg-gradient-to-r from-teal-500 to-teal-400 text-white border-0 shadow-md"
        : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400"
    }`}
  >
    ${amount.toLocaleString()}
  </Button>
);

export default function AddFundsAmountPage() {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState("");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(
    null
  );

  const quickAmounts = [100, 500, 1000, 2500, 5000, 10000];

  const handleBack = () => {
    router.push("/dashboard/add_funding");
  };

  const handleQuickAmountSelect = (amount: number) => {
    setSelectedQuickAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(value);
    setSelectedQuickAmount(null);
  };

  const handleContinue = () => {
    const amount = customAmount
      ? Number.parseInt(customAmount)
      : selectedQuickAmount;
    if (amount && amount > 0) {
      console.log("Continue with amount:", amount);
      // Navigate to next step
      router.push("/dashboard/add_funding_success");
    }
  };

  const currentAmount = customAmount
    ? Number.parseInt(customAmount) || 0
    : selectedQuickAmount || 0;

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
                Add Funds
              </h1>
              <p className="text-sm text-gray-500">Step 2</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar progress={66} />
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8 pb-8">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Enter Amount
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
              How much would you like to add to your account?
            </p>
          </div>

          {/* Amount Input */}
          <Card className="bg-gradient-to-br from-white via-gray-50 to-white shadow-lg border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center">
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 text-gray-400" />
                  <input
                    type="text"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="0"
                    className="w-full text-4xl sm:text-5xl font-bold text-center bg-transparent border-0 outline-none text-gray-900 pl-12"
                  />
                </div>
                <div className="mt-2 h-1 bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Amount Buttons */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Select
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {quickAmounts.map((amount) => (
                <QuickAmountButton
                  key={amount}
                  amount={amount}
                  isSelected={selectedQuickAmount === amount}
                  onClick={() => handleQuickAmountSelect(amount)}
                />
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-4">
            <Button
              onClick={handleContinue}
              disabled={currentAmount <= 0}
              className="w-full h-12 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 disabled:from-gray-300 disabled:to-gray-200 text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
