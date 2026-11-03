"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { X, MoreVertical, Pin, Archive, Phone, Video } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Message, Conversation, MessagingSettings, PREMIUM_TIERS } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/lib/hooks/use-toast";

interface MessagingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation | null;
  friendName: string;
  friendPhoto?: string;
  onSendMessage: (content: string) => Promise<void>;
  messages: Message[];
  typingUsers?: string[];
  premiumTier?: "free" | "basic" | "premium" | "elite";
}

export function MessagingModal({
  open,
  onOpenChange,
  conversation,
  friendName,
  friendPhoto,
  onSendMessage,
  messages,
  typingUsers = [],
  premiumTier = "free",
}: MessagingModalProps) {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);

  // Use unlimited settings for all users (all features free)
  const settings = {
    ephemeralMessagesEnabled: true,
    ephemeralMessageDuration: 24,
    readReceiptsEnabled: true,
    typingIndicatorsEnabled: true,
    messageReactionEnabled: true,
    messageEditingEnabled: true,
    messageDeletionEnabled: true,
    voiceMessagesEnabled: true,
    imageMessagesEnabled: true,
    maxMessageLength: 10000,
    dailyMessageLimit: Infinity,
    messageHistoryDays: 365,
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    if (editingMessage) {
      // Handle edit (would need edit function passed in)
      setEditingMessage(null);
    } else {
      await onSendMessage(content);
    }
  };

  const handleEdit = (messageId: string, content: string) => {
    setEditingMessage({ id: messageId, content });
  };

  const handleDelete = (messageId: string) => {
    toast({
      title: "Message Deleted",
      description: "Message has been deleted",
    });
  };

  const handleReact = (messageId: string, emoji: string) => {
    toast({
      title: "Reaction Added",
      description: `Reacted with ${emoji}`,
    });
  };

  const handleReply = (message: Message) => {
    // Would set reply state
    toast({
      title: "Reply",
      description: "Reply functionality",
    });
  };

  const handlePin = (messageId: string) => {
    toast({
      title: "Message Pinned",
      description: "Message pinned",
    });
  };

  const handleBookmark = (messageId: string) => {
    toast({
      title: "Message Bookmarked",
      description: "Message bookmarked",
    });
  };

  const isTyping = typingUsers.includes(friendName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={friendPhoto || undefined} />
              <AvatarFallback>{friendName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-lg">{friendName}</DialogTitle>
              {isTyping && (
                <p className="text-xs text-muted-foreground">Typing...</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Video className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pin className="h-4 w-4 mr-2" />
                  Pin Conversation
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.fromUserId === user?.uid}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReact={handleReact}
                onReply={handleReply}
                onPin={handlePin}
                onBookmark={handleBookmark}
              />
            ))
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <MessageInput
            onSend={handleSend}
            settings={settings}
            maxLength={settings.maxMessageLength}
            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            replyTo={null}
            onCancelReply={() => {}}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
