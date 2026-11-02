import { auth, db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const USERS_COLLECTION = "users";

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
    return;
  }

  const user = auth.currentUser;
  const userRef = doc(db, USERS_COLLECTION, user.uid);

  try {
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
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
    } else {
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
    }
  } catch (error) {
    console.error("Error ensuring user document:", error);
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
