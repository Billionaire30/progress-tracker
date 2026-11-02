"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Star } from "lucide-react";
import { PremiumTier, PREMIUM_TIERS } from "@/lib/data";
import { useState } from "react";

interface PremiumTierSelectorProps {
  currentTier?: "free" | "basic" | "premium" | "elite";
  onSelectTier: (tier: PremiumTier) => void;
}

export function PremiumTierSelector({ currentTier = "free", onSelectTier }: PremiumTierSelectorProps) {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case "elite":
        return <Crown className="h-5 w-5" />;
      case "premium":
        return <Sparkles className="h-5 w-5" />;
      case "basic":
        return <Star className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getDisplayPrice = (tier: PremiumTier) => {
    if (tier.price === 0) return "Free";
    if (billingInterval === "yearly") {
      const yearlyPrice = Math.round(tier.price * 12 * 0.8); // 20% discount for yearly
      return `$${yearlyPrice}/year`;
    }
    return `$${tier.price}/month`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2">
        <Button
          variant={billingInterval === "monthly" ? "default" : "outline"}
          onClick={() => setBillingInterval("monthly")}
        >
          Monthly
        </Button>
        <Button
          variant={billingInterval === "yearly" ? "default" : "outline"}
          onClick={() => setBillingInterval("yearly")}
        >
          Yearly (Save 20%)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PREMIUM_TIERS.map((tier) => {
          const isCurrent = tier.id === currentTier;
          const isPopular = tier.id === "premium";

          return (
            <Card
              key={tier.id}
              className={`relative ${isCurrent ? "border-primary" : ""} ${
                isPopular ? "border-2 border-primary shadow-lg" : ""
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getTierIcon(tier.id)}
                    {tier.name}
                  </CardTitle>
                  {isCurrent && <Badge variant="secondary">Current</Badge>}
                </div>
                <CardDescription className="text-2xl font-bold">
                  {getDisplayPrice(tier)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent}
                  onClick={() => onSelectTier(tier)}
                  style={{ backgroundColor: isCurrent ? undefined : tier.color }}
                >
                  {isCurrent ? "Current Plan" : "Upgrade"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include a 7-day free trial. Cancel anytime.</p>
      </div>
    </div>
  );
}
