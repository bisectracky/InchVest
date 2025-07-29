"use client";
import type React from "react";
import Link from "next/link";
import Image from "next/image";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Minus,
  Send,
  ArrowDownToLine,
  Shield,
  CheckCircle,
  Clock,
  Sparkles,
  User,
  LogOut,
  Wallet,
  Menu,
} from "lucide-react";
// Simple Badge component
const Badge = ({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary";
}) => {
  const baseClasses =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";
  const variantClasses =
    variant === "secondary"
      ? "border-transparent bg-gray-100 text-gray-800"
      : "border-transparent bg-blue-100 text-blue-800";

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
};

// Responsive chart component
const SimpleChart = () => (
  <div className="h-32 sm:h-40 flex items-end justify-between px-2 sm:px-4">
    {[20, 60, 75, 70, 35].map((height, i) => (
      <div
        key={i}
        className="bg-gradient-to-b bg-green-700 bg-green-600  w-6 sm:w-8 md:w-10 rounded-t transition-all duration-300"
        style={{ height: `${height}%` }}
      />
    ))}
  </div>
);

export default function Dashboard() {
  const [balance] = useState(2000);
  const [isReady] = useState(true);
  const [signature, setSignature] = useState<string | null>(null);
  const [showWalletActions, setShowWalletActions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user] = useState({
    wallet: { address: "0x1234...5678" },
    email: { address: "user@example.com" },
  });
  const [authenticated] = useState(true);
  const [ready] = useState(true);
  const [client] = useState(true);

  const handleSignMessage = async () => {
    try {
      const message = "Hello from Privy + Pimlico!";
      const mockSig = "0x" + Math.random().toString(16).substring(2, 66);
      setSignature(mockSig);
      console.log("Signature:", mockSig);
    } catch (err) {
      console.error("Signing failed:", err);
    }
  };

  const handleSendTransaction = async () => {
    try {
      const userOpHash = "0x" + Math.random().toString(16).substring(2, 66);
      console.log("UserOp sent:", userOpHash);
      alert(`Transaction sent!\nUserOp Hash:\n${userOpHash}`);
    } catch (err) {
      console.error("Transaction failed:", err);
      alert("Transaction failed. See console.");
    }
  };

  const handleAddFunds = () => {
    console.log("Add funds clicked");
  };

  const handleSendMoney = () => {
    handleSendTransaction();
  };

  const handleWithdraw = () => {
    console.log("Withdraw clicked");
  };

  const handleStartInvesting = () => {
    console.log("Start investing clicked");
  };

  const logout = () => {
    console.log("Logout clicked");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <Image
              src="/images/inchvest-logo.png"
              alt="InchVest Logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <p className="text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container with responsive max-width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between py-4 sm:py-6 lg:py-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative flex-shrink-0">
              <Image
                src="/images/inchvest-logo.png"
                alt="InchVest Logo"
                width={48}
                height={48}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                InchVest
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Investment Dashboard
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWalletActions(!showWalletActions)}
              className="p-2  text-green-600 hover:text-green-800"
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="p-2 text-red-600 hover:text-red-800"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <Card className="bg-gradient-to-br from-green-600 via-grey to-blue-500 text-white shadow-2xl rounded-3xl overflow-hidden">
              <Link href="/" passHref>
                <Button
                  className="bg-white/20 text-white border border-white/30 font-medium px-6 py-2 rounded-full hover:bg-white/30 hover:text-white transition-all duration-300"
                  size="sm"
                >
                  Back to Home
                </Button>
              </Link>
            </Card>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <Card className="mb-4 sm:hidden bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowWalletActions(!showWalletActions)}
                  className="justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  Account Info
                </Button>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="justify-start text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* User Info Card (Collapsible) */}
            {showWalletActions && (
              <Card className="bg-gradient-to-b bg-green-700 bg-green-500 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 white" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium white">
                          Wallet Address
                        </p>
                        <p className="text-xs sm:text-sm text-white font-mono break-all">
                          {user?.wallet?.address}
                        </p>
                      </div>
                    </div>
                    {user?.email && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 white" />
                        <div className="flex-1">
                          <p className="text-sm font-medium white">Email</p>
                          <p className="text-xs sm:text-sm white">
                            {user.email.address}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button
                        onClick={handleSignMessage}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs sm:text-sm bg-transparent"
                      >
                        Sign Message
                      </Button>
                      <Button
                        onClick={handleSendTransaction}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs sm:text-sm bg-transparent"
                      >
                        Test Transaction
                      </Button>
                    </div>
                    {signature && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-xs sm:text-sm">
                        <p className="font-medium text-gray-700 mb-1">
                          Last Signature:
                        </p>
                        <code className="text-gray-600 break-all block">
                          {signature.slice(0, 50)}...
                        </code>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Total Balance Card */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center">
                  <p className="text-gray-600 text-sm sm:text-base mb-2">
                    Total Balance
                  </p>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    ${balance.toLocaleString()}
                  </h2>
                  {isReady && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 border-green-700"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ready to Start
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Balance Chart */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">
                  Balance Overview
                </h3>
                <SimpleChart />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="group relative flex flex-col justify-center items-center gap-2 h-20 sm:h-24 bg-gradient-to-br from-green-400 via-green-300 to-emerald-200 hover:from-green-500 hover:via-green-400 hover:to-emerald-300 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
                onClick={handleAddFunds}
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon with animation */}
                <div className="relative z-10 p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-green-800 group-hover:text-green-900 transition-colors duration-300" />
                </div>

                {/* Text */}
                <span className="relative z-10 text-xs sm:text-sm font-semibold text-green-800 group-hover:text-green-900 transition-colors duration-300">
                  Add Funds
                </span>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Button>

              <Button
                variant="outline"
                className="group relative flex flex-col justify-center items-center gap-2 h-20 sm:h-24 bg-gradient-to-br from-blue-400 via-blue-300 to-cyan-200 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-300 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
                onClick={handleSendMoney}
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon with animation */}
                <div className="relative z-10 p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300 group-hover:rotate-12">
                  <Send className="w-5 h-5 sm:w-6 sm:h-6 text-blue-800 group-hover:text-blue-900 transition-colors duration-300" />
                </div>

                {/* Text */}
                <span className="relative z-10 text-xs sm:text-sm font-semibold text-blue-800 group-hover:text-blue-900 transition-colors duration-300">
                  Send Money
                </span>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Button>

              <Button
                variant="outline"
                className="group relative flex flex-col justify-center items-center gap-2 h-20 sm:h-24 bg-gradient-to-br from-purple-400 via-purple-300 to-pink-200 hover:from-purple-500 hover:via-purple-400 hover:to-pink-300 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden"
                onClick={handleWithdraw}
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon with animation */}
                <div className="relative z-10 p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300 group-hover:-translate-y-1">
                  <ArrowDownToLine className="w-5 h-5 sm:w-6 sm:h-6 text-purple-800 group-hover:text-purple-900 transition-colors duration-300" />
                </div>

                {/* Text */}
                <span className="relative z-10 text-xs sm:text-sm font-semibold text-purple-800 group-hover:text-purple-900 transition-colors duration-300">
                  Withdraw
                </span>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Button>
            </div>
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Recent Activity */}
            <Card className="from-orange-400 to-green-500 text-white shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Recent Activity
                  </h3>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Minus className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        Withdraw
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Today 2:30 PM
                      </p>
                    </div>
                    <p className="font-semibold text-red-400 text-sm sm:text-base">
                      -$12.60
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Plus className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        Deposit
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Today 2:30 PM
                      </p>
                    </div>
                    <p className="font-semibold text-green-600 text-sm sm:text-base">
                      +$2,512.60
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Progress */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">
                  Your Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700 text-sm sm:text-base">
                        Account Status
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {authenticated ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700 text-sm sm:text-base">
                        Investment Status
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-800"
                    >
                      Inactive
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700 text-sm sm:text-base">
                        Security Level
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {client ? "High" : "Medium"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Investment CTA */}
            <Card className="bg-gradient-to-br from-green-600 via-grey to-blue-500 text-white shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-5">
                  {/* Icon Circle */}
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>

                  {/* Text and Button */}
                  <div className="flex-1">
                    <h3 className="font-extrabold text-xl sm:text-2xl mb-1 drop-shadow-sm">
                      Start AI Investment
                    </h3>
                    <p className="text-white/90 text-sm sm:text-base mb-5 leading-relaxed">
                      Let our AI optimize your returns automatically.
                    </p>

                    <Button
                      className="bg-gradient-to-r from-green-600 via-orange-200 to-blue-500 text-gray-900 font-semibold px-6 py-2 rounded-full shadow-md hover:brightness-110 hover:scale-105 transition-all duration-300"
                      size="sm"
                      onClick={handleStartInvesting}
                    >
                      Start Investing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8 sm:h-12"></div>
      </div>
    </div>
  );
}
