"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  Settings,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react";

// Success Animation Component
const SuccessIcon = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      {/* Animated background circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full transition-all duration-1000 ${
            isVisible ? "scale-100 opacity-30" : "scale-0 opacity-0"
          }`}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`w-24 h-24 bg-gradient-to-br from-green-300 to-emerald-300 rounded-full transition-all duration-700 delay-200 ${
            isVisible ? "scale-100 opacity-50" : "scale-0 opacity-0"
          }`}
        />
      </div>

      {/* Main success icon */}
      <div
        className={`relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 delay-400 ${
          isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      >
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
    </div>
  );
};

// Next Step Item Component
const NextStepItem = ({
  icon,
  title,
  description,
  iconColor = "blue",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconColor?: "blue" | "green" | "purple";
}) => {
  const iconStyles = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-400",
    green: "bg-gradient-to-br from-green-500 to-emerald-400",
    purple: "bg-gradient-to-br from-purple-500 to-purple-400",
  };

  return (
    <div className="flex items-start gap-4 p-4">
      <div className={`p-3 rounded-2xl ${iconStyles[iconColor]} flex-shrink-0`}>
        <div className="text-white">{icon}</div>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">
          {title}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base">{description}</p>
      </div>
    </div>
  );
};

export default function InvestSuccessPage() {
  const router = useRouter();
  const [investmentAmount] = useState(2000);

  const handleBack = () => {
    router.push("/dashboard/investment_confirmation");
  };

  const handleViewDashboard = () => {
    router.push("/dashboard");
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
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8 pb-8">
          {/* Success Section */}
          <div className="text-center py-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <SuccessIcon />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              AI Investment Activated!
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
              Your AI investment manager is now optimizing your $
              {investmentAmount.toLocaleString()} portfolio
            </p>
          </div>

          {/* What Happens Next Card */}
          <Card className="bg-gradient-to-br from-white via-gray-50 to-white shadow-lg border-0">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                What Happens Next
              </h3>
              <div className="space-y-2">
                <NextStepItem
                  icon={<Settings className="w-6 h-6" />}
                  title="AI Portfolio Creation"
                  description="Building your optimized portfolio (2-4 hours)"
                  iconColor="blue"
                />
                <NextStepItem
                  icon={<TrendingUp className="w-6 h-6" />}
                  title="Daily Optimization"
                  description="AI monitors and adjusts your investments automatically"
                  iconColor="green"
                />
                <NextStepItem
                  icon={<BarChart3 className="w-6 h-6" />}
                  title="Monthly Reports"
                  description="Detailed performance reports sent to your email"
                  iconColor="purple"
                />
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 text-base sm:text-lg mb-1">
                    AI is now active
                  </h3>
                  <p className="text-blue-700 text-sm sm:text-base">
                    Expected to start generating returns within 24-48 hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Dashboard Button */}
          <div className="pt-4">
            <Button
              onClick={handleViewDashboard}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
