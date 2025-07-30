"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Wallet, AlertCircle } from "lucide-react";

// Progress Bar Component
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all duration-500 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
);

// Quick Amount Button Component
const QuickAmountButton = ({
  amount,
  isSelected,
  onClick,
  isDisabled = false,
}: {
  amount: number;
  isSelected: boolean;
  onClick: () => void;
  isDisabled?: boolean;
}) => (
  <Button
    variant="outline"
    onClick={onClick}
    disabled={isDisabled}
    className={`h-12 font-semibold text-base rounded-xl transition-all duration-300 ${
      isSelected
        ? "bg-gradient-to-r from-purple-500 to-purple-400 text-white border-0 shadow-md"
        : isDisabled
        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
        : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400"
    }`}
  >
    ${amount.toLocaleString()}
  </Button>
);

export default function WithdrawAmountPage() {
  const router = useRouter();
  const [customAmount, setCustomAmount] = useState("");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | null>(
    null
  );
  const [availableBalance] = useState(1000); // This would come from your state/API

  const quickAmounts = [100, 250, 500, 750, 1000];

  const handleBack = () => {
    router.push("/dashboard/withdraw_funding");
  };

  const handleQuickAmountSelect = (amount: number) => {
    if (amount <= availableBalance) {
      setSelectedQuickAmount(amount);
      setCustomAmount(amount.toString());
    }
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
    if (amount && amount > 0 && amount <= availableBalance) {
      console.log("Continue with withdrawal amount:", amount);
      // Navigate to next step
      // router.push("/withdraw/confirm")
      router.push("/dashboard");
    }
  };

  const currentAmount = customAmount
    ? Number.parseInt(customAmount) || 0
    : selectedQuickAmount || 0;
  const isAmountValid = currentAmount > 0 && currentAmount <= availableBalance;
  const exceedsBalance = currentAmount > availableBalance;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 py-6 sm:py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2 from-gray-400 to-gray-300 rounded-full"
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
                Withdraw Funds
              </h1>
              <p className="text-sm text-gray-500">Step 2 of 3</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar progress={66} />
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8 pb-8">
          {/* Available Balance Card */}
          <Card className="bg-gradient-to-br from-blue-50 via-blue-25 to-blue-50 border border-blue-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium text-base sm:text-lg">
                    Available Balance
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  ${availableBalance.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Enter Amount
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
              How much would you like to withdraw?
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
                    className={`w-full text-4xl sm:text-5xl font-bold text-center bg-transparent border-0 outline-none pl-12 ${
                      exceedsBalance ? "text-red-500" : "text-gray-900"
                    }`}
                  />
                </div>
                <div
                  className={`mt-2 h-1 rounded-full ${
                    exceedsBalance
                      ? "bg-gradient-to-r from-red-500 to-red-400"
                      : "bg-gradient-to-r from-purple-500 to-purple-400"
                  }`}
                />
                {exceedsBalance && (
                  <div className="flex items-center justify-center gap-2 mt-3 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Amount exceeds available balance
                    </span>
                  </div>
                )}
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
                  isDisabled={amount > availableBalance}
                  onClick={() => handleQuickAmountSelect(amount)}
                />
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <div className="pt-4">
            <Button
              onClick={handleContinue}
              disabled={!isAmountValid}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 disabled:from-gray-300 disabled:to-gray-200 text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
