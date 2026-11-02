"use client";

import { Conversation } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Pin, Archive, MessageCircle, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  friendNames: Record<string, string>;
  friendPhotos: Record<string, string>;
  premiumTier?: "free" | "basic" | "premium" | "elite";
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  friendNames,
  friendPhotos,
  premiumTier = "free",
}: ConversationListProps) {
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const getFriendId = (conversation: Conversation) => {
    // Return the ID that's not the current user's
    return conversation.participants[0];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
        {premiumTier !== "free" && (
          <Badge variant="secondary" className="mt-2">
            {premiumTier === "elite" && <Crown className="h-3 w-3 mr-1" />}
            {premiumTier.charAt(0).toUpperCase() + premiumTier.slice(1)}
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1">
        {sortedConversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Start messaging your friends!</p>
          </div>
        ) : (
          <div className="p-2">
            {sortedConversations.map((conversation) => {
              const friendId = getFriendId(conversation);
              const friendName = friendNames[friendId] || "Unknown";
              const friendPhoto = friendPhotos[friendId];
              const isSelected = conversation.id === selectedConversationId;

              return (
                <Button
                  key={conversation.id}
                  variant={isSelected ? "secondary" : "ghost"}
                  className="w-full justify-start mb-1 h-auto py-3"
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={friendPhoto || undefined} />
                        <AvatarFallback>{friendName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{friendName}</span>
                        {conversation.isPinned && (
                          <Pin className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {conversation.lastMessage?.content || "No messages"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
