import { auth, db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { PublicProfile } from "./data";

const USERS_COLLECTION = "users";
const PROFILES_COLLECTION = "publicProfiles";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  lastActiveAt: string;
  friends?: string[];
}

// Ensure user document exists in Firestore
export async function ensureUserDocument(): Promise<void> {
  if (!auth.currentUser) {
    console.log("No current user, skipping user document creation");
    return;
  }

  const user = auth.currentUser;
  const userRef = doc(db, USERS_COLLECTION, user.uid);

  try {
    console.log("Checking if user document exists for:", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log("User document does not exist, creating new one");
      // Create new user document
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        friends: [],
      };

      await setDoc(userRef, userProfile);
      console.log("User document created in Firestore");

      // Create public profile
      await createOrUpdatePublicProfile(user);

      // Convert pending friend requests to this user
      if (user.email) {
        await convertPendingFriendRequests(user.email, user.uid);
      }

      // Add friends from accepted requests where this user is the sender
      await addFriendsFromAcceptedRequests(user.uid);
    } else {
      console.log("User document exists, updating last active timestamp");
      // Update last active timestamp
      await setDoc(
        userRef,
        {
          lastActiveAt: new Date().toISOString(),
          ...(user.displayName && { displayName: user.displayName }),
          ...(user.photoURL && { photoURL: user.photoURL }),
        },
        { merge: true }
      );

      // Also check for new friends from accepted requests
      await addFriendsFromAcceptedRequests(user.uid);
    }
  } catch (error) {
    console.error("Error ensuring user document:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
  }
}

// Add friends from accepted friend requests where this user is the sender
async function addFriendsFromAcceptedRequests(userId: string): Promise<void> {
  try {
    const requestsRef = collection(db, "friendRequests");
    const q = query(
      requestsRef,
      where("fromUserId", "==", userId),
      where("status", "==", "accepted")
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return;
    }

    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      return;
    }

    const userData = userDoc.data();
    const currentFriends = userData?.friends || [];

    const newFriends: string[] = [];
    for (const doc of querySnapshot.docs) {
      const requestData = doc.data();
      if (requestData.toUserId && !currentFriends.includes(requestData.toUserId)) {
        newFriends.push(requestData.toUserId);
      }
    }

    if (newFriends.length > 0) {
      await updateDoc(userRef, {
        friends: arrayUnion(...newFriends),
      });
      console.log(`Added ${newFriends.length} friends from accepted requests`);
    }
  } catch (error) {
    console.error("Error adding friends from accepted requests:", error);
  }
}

// Convert pending friend requests (by email) to actual user IDs
async function convertPendingFriendRequests(email: string, userId: string): Promise<void> {
  try {
    const requestsRef = collection(db, "friendRequests");
    const q = query(requestsRef, where("toEmail", "==", email), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      await updateDoc(doc.ref, {
        toUserId: userId,
        toEmail: undefined,
      });
    }

    if (!querySnapshot.empty) {
      console.log(`Converted ${querySnapshot.size} pending friend requests`);
    }
  } catch (error) {
    console.error("Error converting pending friend requests:", error);
  }
}

// Get user profile by email
export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error("Error getting user profile by email:", error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  if (!auth.currentUser) {
    return;
  }

  const userRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);

  try {
    await setDoc(userRef, updates, { merge: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
  }
}

// Create or update public profile for leaderboard
async function createOrUpdatePublicProfile(user: any): Promise<void> {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, user.uid);

    // Get existing profile if any
    const profileDoc = await getDoc(profileRef);

    if (!profileDoc.exists()) {
      // Create new public profile with default values
      const publicProfile: PublicProfile = {
        userId: user.uid,
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL || undefined,
        overallProgress: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalHours: 0,
        level: 1,
        totalXP: 0,
        badges: [],
        monthsCompleted: 0,
        lastUpdated: new Date().toISOString(),
      };

      await setDoc(profileRef, publicProfile);
      console.log("Public profile created for:", user.uid);
    }
  } catch (error) {
    console.error("Error creating public profile:", error);
  }
}

// Update public profile with user's progress data
export async function updatePublicProfileData(data: any): Promise<void> {
  if (!auth.currentUser) {
    return;
  }

  try {
    const profileRef = doc(db, PROFILES_COLLECTION, auth.currentUser.uid);

    const publicProfile: Partial<PublicProfile> = {
      displayName: auth.currentUser.displayName || "Anonymous",
      photoURL: auth.currentUser.photoURL || undefined,
      overallProgress: Math.round(
        ((data.months.filter((m: any) => m.status === "complete").length +
          data.portfolio.filter((p: any) => p.status === "complete").length +
          data.competencyChecklist.filter((c: any) => c.done).length) /
          (12 + 5 + 17)) *
          100
      ),
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      totalHours: data.weeklyLog.reduce((sum: number, entry: any) => sum + entry.hours, 0),
      level: data.gamification?.level || 1,
      totalXP: data.gamification?.totalXP || 0,
      badges: data.gamification?.badges || [],
      monthsCompleted: data.months.filter((m: any) => m.status === "complete").length,
      lastUpdated: new Date().toISOString(),
    };

    await setDoc(profileRef, publicProfile, { merge: true });
    console.log("Public profile updated for:", auth.currentUser.uid);
  } catch (error) {
    console.error("Error updating public profile:", error);
  }
}
