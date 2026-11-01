"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coins, ShoppingBag, Check, Lock, Sparkles, Gift } from "lucide-react";
import { useState } from "react";
import { triggerConfetti } from "@/lib/confetti";

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: "theme" | "feature" | "badge" | "custom";
  icon: string;
  category: string;
  rarity: "common" | "rare" | "legendary";
  purchased: boolean;
}

const REWARDS: Omit<Reward, "purchased">[] = [
  {
    id: "theme-dark-pro",
    name: "Dark Pro Theme",
    description: "Premium dark theme with enhanced contrast",
    cost: 50,
    type: "theme",
    icon: "🌙",
    category: "Themes",
    rarity: "common",
  },
  {
    id: "theme-neon",
    name: "Neon Glow Theme",
    description: "Cyberpunk-inspired neon theme",
    cost: 100,
    type: "theme",
    icon: "💡",
    category: "Themes",
    rarity: "rare",
  },
  {
    id: "theme-minimal",
    name: "Minimalist Zen",
    description: "Clean, distraction-free theme",
    cost: 75,
    type: "theme",
    icon: "🎋",
    category: "Themes",
    rarity: "common",
  },
  {
    id: "badge-streak-master",
    name: "Streak Master Badge",
    description: "Exclusive badge for 30+ day streaks",
    cost: 200,
    type: "badge",
    icon: "🔥",
    category: "Badges",
    rarity: "rare",
  },
  {
    id: "badge-hour-hero",
    name: "Hour Hero Badge",
    description: "Badge for logging 100+ hours",
    cost: 150,
    type: "badge",
    icon: "⏰",
    category: "Badges",
    rarity: "rare",
  },
  {
    id: "feature-pomodoro-pro",
    name: "Pomodoro Pro",
    description: "Advanced Pomodoro with custom intervals",
    cost: 120,
    type: "feature",
    icon: "🍅",
    category: "Features",
    rarity: "common",
  },
  {
    id: "feature-analytics-plus",
    name: "Analytics Plus",
    description: "Advanced analytics with AI insights",
    cost: 180,
    type: "feature",
    icon: "📊",
    category: "Features",
    rarity: "rare",
  },
  {
    id: "custom-emoji-set",
    name: "Premium Emoji Set",
    description: "Custom emoji pack for rewards",
    cost: 80,
    type: "custom",
    icon: "✨",
    category: "Custom",
    rarity: "common",
  },
  {
    id: "legendary-champion",
    name: "Champion Status",
    description: "Legendary user status with gold border",
    cost: 500,
    type: "badge",
    icon: "👑",
    category: "Badges",
    rarity: "legendary",
  },
  {
    id: "feature-calendar-sync",
    name: "Calendar Sync",
    description: "Sync with Google/Outlook calendars",
    cost: 250,
    type: "feature",
    icon: "📅",
    category: "Features",
    rarity: "rare",
  },
];

export function RewardsStore() {
  const { data, setData } = useApp();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);

  const currency = data.gamification?.currency || 0;
  const purchasedRewards = data.gamification?.purchasedRewards || [];

  const rewards: Reward[] = REWARDS.map((reward) => ({
    ...reward,
    purchased: purchasedRewards.includes(reward.id),
  }));

  const handlePurchase = (reward: Reward) => {
    if (currency < reward.cost) {
      alert("Not enough currency!");
      return;
    }

    if (reward.purchased) {
      alert("You already own this reward!");
      return;
    }

    const updatedData = {
      ...data,
      gamification: {
        level: data.gamification?.level || 1,
        xp: data.gamification?.xp || 0,
        xpToNextLevel: data.gamification?.xpToNextLevel || 100,
        totalXP: data.gamification?.totalXP || 0,
        badges: data.gamification?.badges || [],
        currentStreakBonus: data.gamification?.currentStreakBonus || 1,
        dailyChallenges: data.gamification?.dailyChallenges || [],
        weeklyChallengesCompleted: data.gamification?.weeklyChallengesCompleted || 0,
        currency: currency - reward.cost,
        purchasedRewards: [...purchasedRewards, reward.id],
      },
    };

    setData(updatedData);
    setSelectedReward(reward);
    setShowPurchaseSuccess(true);
    triggerConfetti();
  };

  const getRarityColor = (rarity: Reward["rarity"]) => {
    switch (rarity) {
      case "common":
        return "border-gray-300 dark:border-gray-600";
      case "rare":
        return "border-blue-400 dark:border-blue-500";
      case "legendary":
        return "border-yellow-400 dark:border-yellow-500";
    }
  };

  const getRarityBadge = (rarity: Reward["rarity"]) => {
    switch (rarity) {
      case "common":
        return <Badge variant="secondary">Common</Badge>;
      case "rare":
        return <Badge className="bg-blue-500">Rare</Badge>;
      case "legendary":
        return <Badge className="bg-yellow-500">Legendary</Badge>;
    }
  };

  const categories = Array.from(new Set(rewards.map((r) => r.category)));

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-purple-500" />
          Rewards Store
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency Display */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Coins className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Balance</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{currency} 🪙</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Earn currency by</p>
            <p className="text-xs text-muted-foreground">completing quests</p>
          </div>
        </div>

        {/* Rewards by Category */}
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <h3 className="font-medium text-lg">{category}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rewards
                .filter((r) => r.category === category)
                .map((reward) => (
                  <Card
                    key={reward.id}
                    className={`border-2 ${getRarityColor(reward.rarity)} ${
                      reward.purchased ? "bg-green-50 dark:bg-green-950/20" : ""
                    } hover:shadow-lg transition-shadow`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-3xl">{reward.icon}</span>
                        {getRarityBadge(reward.rarity)}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{reward.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{reward.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          <Coins className="h-4 w-4" />
                          {reward.cost}
                        </div>
                        {reward.purchased ? (
                          <Button size="sm" variant="outline" disabled className="gap-1">
                            <Check className="h-3 w-3" />
                            Owned
                          </Button>
                        ) : currency >= reward.cost ? (
                          <Button
                            size="sm"
                            onClick={() => handlePurchase(reward)}
                            className="gap-1"
                          >
                            <Sparkles className="h-3 w-3" />
                            Buy
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="gap-1">
                            <Lock className="h-3 w-3" />
                            {reward.cost - currency} more
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}

        {/* Purchase Success Dialog */}
        <Dialog open={showPurchaseSuccess} onOpenChange={setShowPurchaseSuccess}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-500" />
                Reward Unlocked!
              </DialogTitle>
            </DialogHeader>
            {selectedReward && (
              <div className="space-y-4 text-center">
                <div className="text-6xl">{selectedReward.icon}</div>
                <div>
                  <h3 className="text-xl font-bold">{selectedReward.name}</h3>
                  <p className="text-muted-foreground">{selectedReward.description}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    Successfully purchased for {selectedReward.cost} 🪙
                  </p>
                </div>
                <Button onClick={() => setShowPurchaseSuccess(false)} className="w-full">
                  Awesome!
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
