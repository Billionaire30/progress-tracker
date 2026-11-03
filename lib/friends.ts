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
    console.log("Attempting to send friend request to:", friendEmail);

    if (!auth.currentUser) {
      console.error("No current user");
      return { success: false, error: "You must be signed in to send friend requests" };
    }

    const currentUser = auth.currentUser;
    const currentUserId = currentUser.uid;
    console.log("Current user ID:", currentUserId);

    // Ensure current user document exists
    await ensureUserDocument();
    console.log("User document ensured");

    // Find the target user by email (they may not have signed in yet)
    const targetUserProfile = await getUserProfileByEmail(friendEmail);
    console.log("Target user profile found:", !!targetUserProfile);

    let targetUserId: string;

    if (targetUserProfile) {
      // User exists in database
      targetUserId = targetUserProfile.uid;

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
    } else {
      // User doesn't exist yet - use email as temporary ID
      targetUserId = `pending_${friendEmail}`;

      // Check if request already exists for this email
      const requestsRef = collection(db, FRIEND_REQUESTS_COLLECTION);
      const existingRequestQuery = query(
        requestsRef,
        where("fromUserId", "==", currentUserId),
        where("toEmail", "==", friendEmail),
        where("status", "==", "pending")
      );
      const existingRequestSnapshot = await getDocs(existingRequestQuery);

      if (!existingRequestSnapshot.empty) {
        return { success: false, error: "Friend request already sent" };
      }
    }

    // Check if request already exists (for existing users)
    if (targetUserProfile) {
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
      toEmail: friendEmail, // Store email for pending users
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    console.log("Creating friend request with ID:", requestId);
    await setDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId), friendRequest);
    console.log("Friend request created successfully");

    return { success: true };
  } catch (error) {
    console.error("Error sending friend request:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return { success: false, error: `Failed to send friend request: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Accept a friend request
export async function acceptFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Attempting to accept friend request:", requestId);

    if (!auth.currentUser) {
      console.error("No current user");
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;
    const currentUserEmail = auth.currentUser.email;
    console.log("Current user ID:", currentUserId);
    console.log("Current user email:", currentUserEmail);

    // Get the friend request
    console.log("Fetching friend request document");
    const requestDoc = await getDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId));
    if (!requestDoc.exists()) {
      console.error("Friend request not found");
      return { success: false, error: "Friend request not found" };
    }

    const requestData = requestDoc.data() as FriendRequest;
    console.log("Friend request data:", requestData);

    // Check if this request is for the current user (by email match if needed)
    const isForCurrentUser =
      requestData.toUserId === currentUserId ||
      (requestData.toEmail && requestData.toEmail === currentUserEmail);

    console.log("Is request for current user?", isForCurrentUser);

    if (!isForCurrentUser) {
      return { success: false, error: "You can only accept requests sent to you" };
    }

    if (requestData.status !== "pending") {
      console.error("Request status is not pending:", requestData.status);
      return { success: false, error: "This request has already been processed" };
    }

    // Ensure current user document exists
    console.log("Ensuring current user document exists");
    await ensureUserDocument();

    // Only add to current user's friends list (sender will be added when they sync)
    console.log("Adding to current user's friends list");
    const currentUserRef = doc(db, "users", currentUserId);
    await updateDoc(currentUserRef, {
      friends: arrayUnion(requestData.fromUserId),
    });

    // Update request status
    console.log("Updating request status to accepted");
    await updateDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId), {
      toUserId: currentUserId, // Ensure it's set to the actual user ID
      status: "accepted",
      respondedAt: new Date().toISOString(),
    });

    console.log("Friend request accepted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error accepting friend request:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return { success: false, error: `Failed to accept friend request: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Reject a friend request
export async function rejectFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("Attempting to reject friend request:", requestId);

    if (!auth.currentUser) {
      console.error("No current user");
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;
    const currentUserEmail = auth.currentUser.email;

    // Get the friend request
    const requestDoc = await getDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId));
    if (!requestDoc.exists()) {
      console.error("Friend request not found");
      return { success: false, error: "Friend request not found" };
    }

    const requestData = requestDoc.data() as FriendRequest;

    // Check if this request is for the current user (by email match if needed)
    const isForCurrentUser =
      requestData.toUserId === currentUserId ||
      (requestData.toEmail && requestData.toEmail === currentUserEmail);

    if (!isForCurrentUser) {
      return { success: false, error: "You can only reject requests sent to you" };
    }

    // Update request status
    await updateDoc(doc(db, FRIEND_REQUESTS_COLLECTION, requestId), {
      status: "rejected",
      respondedAt: new Date().toISOString(),
    });

    console.log("Friend request rejected successfully");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return { success: false, error: `Failed to reject friend request: ${error instanceof Error ? error.message : 'Unknown error'}` };
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
    const currentUserEmail = auth.currentUser.email;

    console.log("Getting pending friend requests for user:", currentUserId, currentUserEmail);

    // Get requests by user ID
    const requestsRef = collection(db, FRIEND_REQUESTS_COLLECTION);
    const q1 = query(
      requestsRef,
      where("toUserId", "==", currentUserId),
      where("status", "==", "pending")
    );
    const querySnapshot1 = await getDocs(q1);
    console.log("Found", querySnapshot1.size, "requests by user ID");

    // Get requests by email (for users who just signed in)
    let querySnapshot2;
    if (currentUserEmail) {
      const q2 = query(
        requestsRef,
        where("toEmail", "==", currentUserEmail),
        where("status", "==", "pending")
      );
      querySnapshot2 = await getDocs(q2);
      console.log("Found", querySnapshot2?.size || 0, "requests by email");
    }

    const requests = querySnapshot1.docs.map((doc) => doc.data() as FriendRequest);
    if (querySnapshot2) {
      requests.push(...querySnapshot2.docs.map((doc) => doc.data() as FriendRequest));
    }

    console.log("Total pending requests:", requests.length);
    return requests;
  } catch (error) {
    console.error("Error getting friend requests:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
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

// Get all public profiles for leaderboard
export async function getAllPublicProfiles(): Promise<PublicProfile[]> {
  try {
    const profilesRef = collection(db, PROFILES_COLLECTION);
    const querySnapshot = await getDocs(profilesRef);

    const profiles: PublicProfile[] = [];
    querySnapshot.forEach((doc) => {
      const profile = doc.data() as PublicProfile;
      // Don't include current user's profile (it's added separately)
      if (profile.userId !== auth.currentUser?.uid) {
        profiles.push(profile);
      }
    });

    return profiles;
  } catch (error) {
    console.error("Error getting all public profiles:", error);
    return [];
  }
}
