"use client";

import type React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, CreditCard, Bitcoin } from "lucide-react";

// Enhanced Badge component
const Badge = ({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "popular";
}) => {
  const baseClasses =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  const variantClasses =
    variant === "popular"
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

// Deposit Method Option Component
const DepositMethodOption = ({
  icon,
  title,
  description,
  fee,
  time,
  isPopular = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  fee: string;
  time: string;
  isPopular?: boolean;
  onClick: () => void;
}) => (
  <Card className="bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
    <CardContent className="p-6" onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon */}
          <div className="p-3 bg-gradient-to-br from-gray-600 to-gray-500 rounded-2xl flex-shrink-0">
            <div className="text-white">{icon}</div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
              {isPopular && <Badge variant="popular">Popular</Badge>}
            </div>
            <p className="text-gray-600 text-base mb-3">{description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Fee: {fee}</span>
              <span>Time: {time}</span>
            </div>
          </div>
        </div>

        {/* Select Button */}
        <Button
          variant="outline"
          className="bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 text-white border-0 font-semibold px-6 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          Select
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function AddFundsPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard");
  };

  /*  const handleBankTransfer = () => {
    console.log("Bank Transfer selected");
    // Navigate to bank transfer flow
    // router.push("/add-funds/bank-transfer")
  };

  const handleCardDeposit = () => {
    console.log("Card Deposit selected");
    // Navigate to card deposit flow
    // router.push("/add-funds/card")
  };
*/

  const handleCryptoDeposit = () => {
    console.log("Crypto Deposit selected");
    // Navigate to crypto deposit flow
    router.push("/dashboard/add_funding_amount");
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
                Add Funds
              </h1>
              <p className="text-sm text-gray-500">Step 1</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar progress={33} />
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8 pb-8">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Choose Deposit Method
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
              Select how you'd like to add funds to your account
            </p>
          </div>

          {/* Deposit Methods <DepositMethodOption
              icon={<Building2 className="w-6 h-6" />}
              title="Bank Transfer"
              description="Transfer from your bank account"
              fee="Free"
              time="1-2 business days"
              isPopular={true}
              onClick={handleBankTransfer}
            />

            <DepositMethodOption
              icon={<CreditCard className="w-6 h-6" />}
              title="Debit/Credit Card"
              description="Instant deposit with any card"
              fee="2.9%"
              time="Instant"
              onClick={handleCardDeposit}
            />*/}
          <div className="space-y-4">
            <DepositMethodOption
              icon={<Bitcoin className="w-6 h-6" />}
              title="Cryptocurrency"
              description="Deposit USDC, USDT, or ETH"
              fee="Network fees only"
              time="5-15 minutes"
              onClick={handleCryptoDeposit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
