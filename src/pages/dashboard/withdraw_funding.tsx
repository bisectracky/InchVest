"use client";

import { useState } from "react";

import type React from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Bitcoin,
  Wallet,
} from "lucide-react";

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
      className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all duration-500 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
);

// Withdrawal Method Option Component
const WithdrawalMethodOption = ({
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
          className="bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 text-white border-0 font-semibold px-6 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
        >
          Select
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function WithdrawPage() {
  const router = useRouter();
  const [availableBalance] = useState(1000); // This would come from your state/API

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleBankTransfer = () => {
    console.log("Bank Transfer selected");
    // Navigate to bank transfer flow
    // router.push("/withdraw/bank-transfer")
  };

  const handleDebitCard = () => {
    console.log("Debit Card selected");
    // Navigate to debit card flow
    // router.push("/withdraw/debit-card")
  };

  const handleCryptoWithdraw = () => {
    console.log("Crypto Withdraw selected");
    // Navigate to crypto withdraw flow
    router.push("/dashboard/withdraw_funding_amount");
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
            className="p-2 bg-gradient-to-br from-gray-400 to-gray-300 hover:bg-gray-100 rounded-full"
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
              <p className="text-sm text-gray-500">Step 1 of 3</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar progress={33} />
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8 pb-8">
          {/* Available Balance Card */}
          <Card className="bg-gradient-to-br from-blue-50 via-blue-25 to-blue-50 border border-blue-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium text-base sm:text-lg">
                    Available Balance
                  </span>
                </div>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                  ${availableBalance.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Choose Withdrawal Method
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
              Select how you'd like to receive your funds
            </p>
          </div>

          {/* Withdrawal Methods */}
          <div className="space-y-4">
            <WithdrawalMethodOption
              icon={<Building2 className="w-6 h-6" />}
              title="Bank Account (DISABLED)"
              description="Transfer to your linked bank account"
              fee="Free"
              time="1-2 business days"
              isPopular={true}
              onClick={handleBankTransfer}
            />

            <WithdrawalMethodOption
              icon={<CreditCard className="w-6 h-6" />}
              title="Debit Card (DISABLED)"
              description="Instant withdrawal to debit card"
              fee="$2.50"
              time="Instant"
              onClick={handleDebitCard}
            />

            <WithdrawalMethodOption
              icon={<Bitcoin className="w-6 h-6" />}
              title="Cryptocurrency"
              description="Withdraw as USDC to your wallet"
              fee="Network fees only"
              time="5-15 minutes"
              onClick={handleCryptoWithdraw}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
