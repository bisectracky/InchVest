import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import {
  Shield,
  TrendingUp,
  Globe,
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
  BarChart3,
} from "lucide-react";

type Feature = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
};

export default function Home() {
  const features: Feature[] = [
    {
      icon: Shield,
      title: "Currency Protection",
      description:
        "Shield your savings from local currency volatility with diversified global investments.",
    },
    {
      icon: Sparkles,
      title: "AI-Powered Strategy",
      description:
        "Advanced algorithms optimize your portfolio for emerging market conditions.",
    },
    {
      icon: BarChart3,
      title: "Superior Returns",
      description:
        "Earn significantly better returns than traditional bank savings accounts.",
    },
  ];

  const benefits = [
    "Professional-grade investment tools",
    "24/7 portfolio monitoring",
    "Multi-currency diversification",
    "Regulatory compliance",
    "Secure encrypted platform",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-blue-50/30"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="text-center space-y-8">
            <Badge
              variant="outline"
              className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-4 py-2 text-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Investment Platform
            </Badge>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-tight">
                Protect Your Savings with{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  AI-Powered Investing
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-slate-600 font-medium max-w-4xl mx-auto leading-relaxed">
                Simple, secure investing designed for professionals in emerging
                markets. Protect your savings from currency instability while
                earning better returns than traditional banks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-200 text-lg"
                >
                  Get Started Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Why Choose InchVest?
          </h2>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Built specifically for professionals who need intelligent investment
            solutions in volatile economic environments.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white border-slate-200/60 shadow-lg shadow-slate-200/20 hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-300"
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1 mb-4"
                >
                  Professional Grade
                </Badge>
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-6">
                  Enterprise-level security meets simple investing
                </h2>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  Access institutional-quality investment tools designed for the
                  modern professional. Our platform combines sophisticated AI
                  algorithms with an intuitive interface that anyone can use.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 font-medium">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-slate-900/25 hover:shadow-slate-900/40 transition-all duration-200"
                >
                  Start Investing Now
                  <TrendingUp className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-3xl transform rotate-3"></div>
              <Card className="relative bg-white border-slate-200/60 shadow-2xl shadow-slate-900/10 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900">
                        Portfolio Growth
                      </h3>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                        +24.7%
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">
                          Total Value
                        </span>
                        <span className="text-2xl font-bold text-slate-900">
                          $125,430
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">US Stocks</span>
                          <span className="text-slate-700 font-medium">
                            65%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: "65%" }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Global Bonds</span>
                          <span className="text-slate-700 font-medium">
                            25%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: "25%" }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Commodities</span>
                          <span className="text-slate-700 font-medium">
                            10%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: "10%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-emerald-600 to-blue-600 border-0 overflow-hidden">
          <CardContent className="p-12 text-center relative">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
              }}
            ></div>
            <div className="relative space-y-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Globe className="w-6 h-6 text-white" />
                <Users className="w-6 h-6 text-white" />
                <Shield className="w-6 h-6 text-white" />
              </div>

              <h2 className="text-4xl font-bold text-white tracking-tight">
                Ready to Protect Your Financial Future?
              </h2>

              <p className="text-xl text-emerald-50 font-medium max-w-2xl mx-auto">
                Join thousands of professionals who trust InchVest to grow and
                protect their wealth in emerging markets.
              </p>

              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-emerald-50 font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
                >
                  Open Your Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
