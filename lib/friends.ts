import { auth, db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { Friend, FriendRequest, PublicProfile } from "./data";
import { ensureUserDocument, getUserProfileByEmail } from "./user-management";

const FRIEND_REQUESTS_COLLECTION = "friendRequests";
const PROFILES_COLLECTION = "publicProfiles";

// Send a friend request
export async function sendFriendRequest(friendEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in to send friend requests" };
    }

    const currentUser = auth.currentUser;
    const currentUserId = currentUser.uid;

    // Ensure current user document exists
    await ensureUserDocument();

    // Find the target user by email
    const targetUserProfile = await getUserProfileByEmail(friendEmail);

    if (!targetUserProfile) {
      return { success: false, error: "User not found. Make sure they have the app installed and are signed in." };
    }

    const targetUserId = targetUserProfile.uid;

    if (targetUserId === currentUserId) {
      return { success: false, error: "You cannot send a friend request to yourself" };
    }

    // Check if already friends
    const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
    const currentUserData = currentUserDoc.data();
    const friends = currentUserData?.friends || [];

    if (friends.includes(targetUserId)) {
      return { success: false, error: "You are already friends with this user" };
    }

    // Check if request already exists
    const requestsRef = collection(db, FRIEND_REQUESTS_COLLECTION);
    const existingRequestQuery = query(
      requestsRef,
      where("fromUserId", "==", currentUserId),
      where("toUserId", "==", targetUserId),
      where("status", "==", "pending")
    );
    const existingRequestSnapshot = await getDocs(existingRequestQuery);

    if (!existingRequestSnapshot.empty) {
      return { success: false, error: "Friend request already sent" };
    }

    // Create friend request
    const requestId = `${currentUserId}_${targetUserId}_${Date.now()}`;
    const friendRequest: FriendRequest = {
      id: requestId,
      fromUserId: currentUserId,
      fromDisplayName: currentUser.displayName || "Unknown",
      fromEmail: currentUser.email || "",
      fromPhotoURL: currentUser.photoURL || undefined,
      toUserId: targetUserId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId), friendRequest);

    return { success: true };
  } catch (error) {
    console.error("Error sending friend request:", error);
    return { success: false, error: "Failed to send friend request" };
  }
}

// Accept a friend request
export async function acceptFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;

    // Get the friend request
    const requestDoc = await getDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId));
    if (!requestDoc.exists()) {
      return { success: false, error: "Friend request not found" };
    }

    const requestData = requestDoc.data() as FriendRequest;

    if (requestData.toUserId !== currentUserId) {
      return { success: false, error: "You can only accept requests sent to you" };
    }

    if (requestData.status !== "pending") {
      return { success: false, error: "This request has already been processed" };
    }

    // Add to both users' friends lists
    const fromUserRef = doc(db, "users", requestData.fromUserId);
    const toUserRef = doc(db, "users", currentUserId);

    await updateDoc(fromUserRef, {
      friends: arrayUnion(currentUserId),
    });

    await updateDoc(toUserRef, {
      friends: arrayUnion(requestData.fromUserId),
    });

    // Update request status
    await updateDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId), {
      status: "accepted",
      respondedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return { success: false, error: "Failed to accept friend request" };
  }
}

// Reject a friend request
export async function rejectFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;

    // Get the friend request
    const requestDoc = await getDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId));
    if (!requestDoc.exists()) {
      return { success: false, error: "Friend request not found" };
    }

    const requestData = requestDoc.data() as FriendRequest;

    if (requestData.toUserId !== currentUserId) {
      return { success: false, error: "You can only reject requests sent to you" };
    }

    // Update request status
    await updateDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId), {
      status: "rejected",
      respondedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    return { success: false, error: "Failed to reject friend request" };
  }
}

// Remove a friend
export async function removeFriend(friendUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;

    // Remove from both users' friends lists
    const fromUserRef = doc(db, "users", currentUserId);
    const toUserRef = doc(db, "users", friendUserId);

    await updateDoc(fromUserRef, {
      friends: arrayRemove(friendUserId),
    });

    await updateDoc(toUserRef, {
      friends: arrayRemove(currentUserId),
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing friend:", error);
    return { success: false, error: "Failed to remove friend" };
  }
}

// Get pending friend requests for current user
export async function getPendingFriendRequests(): Promise<FriendRequest[]> {
  try {
    if (!auth.currentUser) {
      return [];
    }

    const currentUserId = auth.currentUser.uid;
    const requestsRef = collection(db, FRIEND_REQUESTS_COLLECTION);
    const q = query(
      requestsRef,
      where("toUserId", "==", currentUserId),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => doc.data() as FriendRequest);
  } catch (error) {
    console.error("Error getting friend requests:", error);
    return [];
  }
}

// Get friends list for current user
export async function getFriends(): Promise<Friend[]> {
  try {
    if (!auth.currentUser) {
      return [];
    }

    const currentUserId = auth.currentUser.uid;
    const userDoc = await getDoc(doc(db, "users", currentUserId));

    if (!userDoc.exists()) {
      return [];
    }

    const userData = userDoc.data();
    const friendIds = userData?.friends || [];

    if (friendIds.length === 0) {
      return [];
    }

    // Get friend details
    const friends: Friend[] = [];
    for (const friendId of friendIds) {
      const friendDoc = await getDoc(doc(db, "users", friendId));
      if (friendDoc.exists()) {
        const friendData = friendDoc.data();
        friends.push({
          userId: friendId,
          displayName: friendData.displayName || "Unknown",
          email: friendData.email || "",
          photoURL: friendData.photoURL,
          addedAt: friendData.createdAt || new Date().toISOString(),
          lastActiveAt: friendData.lastActiveAt,
        });
      }
    }

    return friends;
  } catch (error) {
    console.error("Error getting friends:", error);
    return [];
  }
}

// Update public profile
export async function updatePublicProfile(profile: Partial<PublicProfile>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;
    const profileRef = doc(db, PROFILES_COLLECTION, currentUserId);

    await setDoc(profileRef, {
      ...profile,
      userId: currentUserId,
      lastUpdated: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error updating public profile:", error);
    return { success: false, error: "Failed to update public profile" };
  }
}

// Get friend's public profile
export async function getFriendProfile(friendUserId: string): Promise<PublicProfile | null> {
  try {
    const profileDoc = await getDoc(doc(db, PROFILES_COLLECTION, friendUserId));

    if (!profileDoc.exists()) {
      return null;
    }

    return profileDoc.data() as PublicProfile;
  } catch (error) {
    console.error("Error getting friend profile:", error);
    return null;
  }
}

// Get all friends' profiles
export async function getFriendsProfiles(): Promise<PublicProfile[]> {
  try {
    if (!auth.currentUser) {
      return [];
    }

    const friends = await getFriends();
    const profiles: PublicProfile[] = [];

    for (const friend of friends) {
      const profile = await getFriendProfile(friend.userId);
      if (profile) {
        profiles.push(profile);
      }
    }

    return profiles;
  } catch (error) {
    console.error("Error getting friends profiles:", error);
    return [];
  }
}
