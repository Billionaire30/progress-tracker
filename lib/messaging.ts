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
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";
import { Message, Conversation, MessagingSettings, MessageStatus, MessageType } from "./data";

const MESSAGES_COLLECTION = "messages";
const CONVERSATIONS_COLLECTION = "conversations";

// Get or create conversation between two users
export async function getOrCreateConversation(
  friendUserId: string
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;
    const participants = [currentUserId, friendUserId].sort();

    // Check if conversation already exists using array-contains
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    const q = query(
      conversationsRef,
      where("participants", "array-contains", currentUserId)
    );
    const querySnapshot = await getDocs(q);

    // Check if any conversation contains both users
    for (const doc of querySnapshot.docs) {
      const conv = doc.data() as Conversation;
      if (conv.participants.includes(friendUserId)) {
        return { success: true, conversationId: doc.id };
      }
    }

    // Create new conversation
    const newConversation = {
      participants,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isArchived: false,
      typingUsers: [],
      lastMessage: null,
      muteUntil: null,
    };

    const docRef = await addDoc(conversationsRef, newConversation);
    console.log("Conversation created successfully:", docRef.id);
    return { success: true, conversationId: docRef.id };
  } catch (error) {
    console.error("Error creating conversation:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create conversation";
    return { success: false, error: errorMessage };
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  toUserId: string,
  content: string,
  type: MessageType = "text",
  replyTo?: string,
  expiresAt?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;

    const message: Omit<Message, "id"> = {
      conversationId,
      fromUserId: currentUserId,
      toUserId,
      content,
      type,
      status: "sent",
      timestamp: new Date().toISOString(),
      replyTo,
      expiresAt,
      isEncrypted: false,
    };

    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const docRef = await addDoc(messagesRef, message);

    // Update conversation
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(conversationRef, {
      lastMessage: { ...message, id: docRef.id },
      updatedAt: new Date().toISOString(),
      unreadCount: increment(1),
    });

    return { success: true, messageId: docRef.id };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: "Failed to send message" };
  }
}

// Get messages for a conversation
export async function getMessages(
  conversationId: string,
  limit: number = 50
): Promise<Message[]> {
  try {
    if (!auth.currentUser) {
      return [];
    }

    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const q = query(
      messagesRef,
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);

    const messages = querySnapshot.docs
      .slice(0, limit)
      .map((doc) => doc.data() as Message)
      .reverse();

    // Mark messages as read
    await markMessagesAsRead(conversationId);

    return messages;
  } catch (error) {
    console.error("Error getting messages:", error);
    return [];
  }
}

// Real-time listener for messages
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }

  const messagesRef = collection(db, MESSAGES_COLLECTION);
  const q = query(
    messagesRef,
    where("conversationId", "==", conversationId),
    orderBy("timestamp", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs
      .map((doc) => doc.data() as Message)
      .reverse();
    callback(messages);
  });

  return unsubscribe;
}

// Mark messages as read
export async function markMessagesAsRead(
  conversationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;

    // Update unread messages
    const messagesRef = collection(db, MESSAGES_COLLECTION);
    const q = query(
      messagesRef,
      where("conversationId", "==", conversationId),
      where("toUserId", "==", currentUserId),
      where("status", "!=", "read")
    );
    const querySnapshot = await getDocs(q);

    const batch = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, { status: "read" as MessageStatus })
    );

    await Promise.all(batch);

    // Reset conversation unread count
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(conversationRef, { unreadCount: 0 });

    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { success: false, error: "Failed to mark messages as read" };
  }
}

// Edit a message
export async function editMessage(
  messageId: string,
  newContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;

    // Check if user owns the message
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    const messageDoc = await getDoc(messageRef);

    if (!messageDoc.exists()) {
      return { success: false, error: "Message not found" };
    }

    const messageData = messageDoc.data() as Message;

    if (messageData.fromUserId !== currentUserId) {
      return { success: false, error: "You can only edit your own messages" };
    }

    // Check time limit (10 minutes)
    const messageTime = new Date(messageData.timestamp).getTime();
    const currentTime = new Date().getTime();
    const timeDiff = (currentTime - messageTime) / 1000 / 60; // minutes

    if (timeDiff > 10) {
      return { success: false, error: "Message can only be edited within 10 minutes" };
    }

    await updateDoc(messageRef, {
      content: newContent,
      edited: true,
      editedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error editing message:", error);
    return { success: false, error: "Failed to edit message" };
  }
}

// Delete a message
export async function deleteMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;

    // Check if user owns the message
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    const messageDoc = await getDoc(messageRef);

    if (!messageDoc.exists()) {
      return { success: false, error: "Message not found" };
    }

    const messageData = messageDoc.data() as Message;

    if (messageData.fromUserId !== currentUserId) {
      return { success: false, error: "You can only delete your own messages" };
    }

    await deleteDoc(messageRef);

    return { success: true };
  } catch (error) {
    console.error("Error deleting message:", error);
    return { success: false, error: "Failed to delete message" };
  }
}

// Add reaction to message
export async function addReaction(
  messageId: string,
  emoji: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const currentUserId = auth.currentUser.uid;

    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    const messageDoc = await getDoc(messageRef);

    if (!messageDoc.exists()) {
      return { success: false, error: "Message not found" };
    }

    const messageData = messageDoc.data() as Message;
    const reactions = messageData.reactions || [];

    // Check if user already reacted with this emoji
    const existingReaction = reactions.find(
      (r) => r.emoji === emoji && r.userId === currentUserId
    );

    if (existingReaction) {
      // Remove reaction
      await updateDoc(messageRef, {
        reactions: arrayRemove(existingReaction),
      });
    } else {
      // Add reaction
      await updateDoc(messageRef, {
        reactions: arrayUnion({
          emoji,
          userId: currentUserId,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding reaction:", error);
    return { success: false, error: "Failed to add reaction" };
  }
}

// Set typing indicator
export async function setTypingIndicator(
  conversationId: string,
  isTyping: boolean
): Promise<void> {
  try {
    if (!auth.currentUser) {
      return;
    }

    const currentUserId = auth.currentUser.uid;

    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);

    if (isTyping) {
      await updateDoc(conversationRef, {
        typingUsers: arrayUnion(currentUserId),
      });
    } else {
      await updateDoc(conversationRef, {
        typingUsers: arrayRemove(currentUserId),
      });
    }
  } catch (error) {
    console.error("Error setting typing indicator:", error);
  }
}

// Get all conversations for current user
export async function getConversations(): Promise<Conversation[]> {
  try {
    if (!auth.currentUser) {
      return [];
    }

    const currentUserId = auth.currentUser.uid;
    const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
    const q = query(
      conversationsRef,
      where("participants", "array-contains", currentUserId),
      orderBy("updatedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => doc.data() as Conversation);
  } catch (error) {
    console.error("Error getting conversations:", error);
    return [];
  }
}

// Real-time listener for conversations
export function subscribeToConversations(
  callback: (conversations: Conversation[]) => void
): () => void {
  if (!auth.currentUser) {
    return () => {};
  }

  const currentUserId = auth.currentUser.uid;
  const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
  const q = query(
    conversationsRef,
    where("participants", "array-contains", currentUserId),
    orderBy("updatedAt", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => doc.data() as Conversation);
    callback(conversations);
  });

  return unsubscribe;
}

// Pin/Unpin conversation
export async function togglePinConversation(
  conversationId: string,
  isPinned: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(conversationRef, { isPinned });

    return { success: true };
  } catch (error) {
    console.error("Error toggling pin:", error);
    return { success: false, error: "Failed to toggle pin" };
  }
}

// Archive/Unarchive conversation
export async function toggleArchiveConversation(
  conversationId: string,
  isArchived: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "You must be signed in" };
    }

    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(conversationRef, { isArchived });

    return { success: true };
  } catch (error) {
    console.error("Error toggling archive:", error);
    return { success: false, error: "Failed to toggle archive" };
  }
}
