import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { PremiumTier, PREMIUM_TIERS } from "./data";

// Get user's current premium tier
export async function getUserPremiumTier(): Promise<"free" | "basic" | "premium" | "elite"> {
  try {
    if (!auth.currentUser) {
      return "free";
    }

    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const userData = userDoc.data();

    return userData?.premiumTier || "free";
  } catch (error) {
    console.error("Error getting premium tier:", error);
    return "free";
  }
}

// Upgrade user to a premium tier
export async function upgradeToTier(
  tierId: "free" | "basic" | "premium" | "elite"
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;
    const tier = PREMIUM_TIERS.find((t) => t.id === tierId);

    if (!tier) {
      return { success: false, error: "Invalid tier" };
    }

    if (tierId === "free") {
      // Downgrade to free
      await updateDoc(doc(db, "users", currentUserId), {
        premiumTier: "free",
        premiumExpiresAt: null,
      });
    } else {
      // Upgrade - in production, this would process payment via Stripe
      const now = new Date();
      const expiresAt = new Date(
        now.setMonth(now.getMonth() + (tier.interval === "yearly" ? 12 : 1))
      );

      await updateDoc(doc(db, "users", currentUserId), {
        premiumTier: tierId,
        premiumActivatedAt: new Date().toISOString(),
        premiumExpiresAt: expiresAt.toISOString(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error upgrading tier:", error);
    return { success: false, error: "Failed to upgrade tier" };
  }
}

// Check if user has access to a specific feature
export function hasFeatureAccess(
  userTier: "free" | "basic" | "premium" | "elite",
  feature: keyof PremiumTier["messagingFeatures"]
): boolean {
  const tierConfig = PREMIUM_TIERS.find((t) => t.id === userTier);
  if (!tierConfig) return false;

  return tierConfig.messagingFeatures[feature] === true;
}

// Check if premium subscription is active
export async function isPremiumActive(): Promise<boolean> {
  try {
    if (!auth.currentUser) {
      return false;
    }

    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const userData = userDoc.data();

    if (!userData?.premiumExpiresAt) {
      return false;
    }

    const expiresAt = new Date(userData.premiumExpiresAt);
    return expiresAt > new Date();
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
}

// Get tier configuration
export function getTierConfig(tierId: "free" | "basic" | "premium" | "elite") {
  return PREMIUM_TIERS.find((t) => t.id === tierId) || PREMIUM_TIERS[0];
}

// Check if user can send a message (respecting daily limits)
export async function canSendMessage(): Promise<{ canSend: boolean; remaining?: number; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { canSend: false, error: "You must be signed in" };
    }

    const tier = await getUserPremiumTier();
    const tierConfig = getTierConfig(tier);

    if (tierConfig.messagingFeatures.dailyMessageLimit === Infinity) {
      return { canSend: true, remaining: Infinity };
    }

    // Count messages sent today
    const today = new Date().toISOString().split('T')[0];
    // In production, this would query the messages collection
    // For now, we'll return true
    return { canSend: true, remaining: tierConfig.messagingFeatures.dailyMessageLimit };
  } catch (error) {
    console.error("Error checking message limit:", error);
    return { canSend: false, error: "Failed to check message limit" };
  }
}
