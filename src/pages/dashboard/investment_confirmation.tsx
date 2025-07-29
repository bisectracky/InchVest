"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, AlertTriangle, Zap } from "lucide-react";

// Enhanced Badge component
const Badge = ({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "strategy";
}) => {
  const baseClasses =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  const variantClasses =
    variant === "strategy"
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

// Detail Row Component
const DetailRow = ({
  label,
  value,
  isHighlighted = false,
}: {
  label: string;
  value: string | React.ReactNode;
  isHighlighted?: boolean;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <span className="text-gray-600 font-medium">{label}</span>
    <span
      className={`font-semibold ${
        isHighlighted ? "text-2xl text-gray-900" : "text-gray-900"
      }`}
    >
      {value}
    </span>
  </div>
);

// Info Card Component
const InfoCard = ({
  icon,
  title,
  description,
  variant = "info",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: "info" | "warning" | "success";
}) => {
  const variantStyles = {
    info: "bg-gradient-to-br from-blue-50 via-white to-blue-50 border-blue-200",
    warning:
      "bg-gradient-to-br from-yellow-50 via-white to-orange-50 border-yellow-200",
    success:
      "bg-gradient-to-br from-green-50 via-white to-emerald-50 border-green-200",
  };

  const iconStyles = {
    info: "text-blue-600",
    warning: "text-yellow-600",
    success: "text-green-600",
  };

  const textStyles = {
    info: "text-blue-800",
    warning: "text-yellow-800",
    success: "text-green-800",
  };

  return (
    <Card className={`${variantStyles[variant]} border shadow-sm`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${iconStyles[variant]}`}>{icon}</div>
          <div className="flex-1">
            <h3
              className={`font-semibold text-base mb-1 ${textStyles[variant]}`}
            >
              {title}
            </h3>
            <p className={`text-sm ${textStyles[variant]} opacity-90`}>
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function InvestConfirmPage() {
  const router = useRouter();
  const [isActivating, setIsActivating] = useState(false);
  const [investmentAmount] = useState(2000);
  const [strategy] = useState("Balanced");

  const handleBack = () => {
    router.push("/dashboard/investment");
  };

  const handleActivate = async () => {
    setIsActivating(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Navigate to success page or dashboard
    router.push("/dashboard");
    setIsActivating(false);
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
            className="p-2 hover:bg-gray-100 rounded-full"
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
              <p className="text-sm text-gray-500">Step 2 of 2</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar progress={100} />
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Confirm Investment
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
              Review your investment details before activating AI
            </p>
          </div>

          {/* Investment Details Card */}
          <Card className="bg-gradient-to-br from-white via-gray-50 to-white shadow-lg border-0">
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-1">
                <DetailRow
                  label="Investment Amount"
                  value={`$${investmentAmount.toLocaleString()}`}
                  isHighlighted={true}
                />
                <DetailRow
                  label="Strategy"
                  value={<Badge variant="strategy">{strategy}</Badge>}
                />
                <DetailRow label="Expected Annual Return" value="7-10%" />
                <DetailRow label="Risk Level" value="Medium" />
                <DetailRow label="Management Fee" value="0.5% annually" />
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="space-y-4">
            <InfoCard
              icon={<Shield className="w-5 h-5" />}
              title="Protected Investment"
              description="Your funds are FDIC insured and can be withdrawn at any time without penalties."
              variant="success"
            />

            <InfoCard
              icon={<AlertTriangle className="w-5 h-5" />}
              title="Investment Risk"
              description="All investments carry risk. Past performance doesn't guarantee future results."
              variant="warning"
            />
          </div>

          {/* Activate Button */}
          <div className="pt-4 pb-8">
            <Button
              onClick={handleActivate}
              disabled={isActivating}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-green-400 disabled:to-green-300 text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isActivating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Activating AI Investment...
                </div>
              ) : (
                <div className="flex justify-center items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Activate AI Investment
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
