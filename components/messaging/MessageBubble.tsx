"use client";

import { Message, Reaction } from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  Check,
  CheckCheck,
  MoreVertical,
  Edit2,
  Trash2,
  Smile,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "💯"];

export function MessageBubble({
  message,
  isOwn,
  onEdit,
  onDelete,
  onReact,
}: MessageBubbleProps) {
  const { user } = useAuth();
  const [showReactions, setShowReactions] = useState(false);

  const getStatusIcon = () => {
    if (message.status === "read") {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    }
    if (message.status === "delivered") {
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    }
    return <Check className="h-3 w-3 text-muted-foreground" />;
  };

  const getReactionCount = (emoji: string) => {
    return message.reactions?.filter((r) => r.emoji === emoji).length || 0;
  };

  const hasReacted = (emoji: string) => {
    return message.reactions?.some((r) => r.emoji === emoji && r.userId === user?.uid);
  };

  return (
    <div
      className={`flex gap-3 mb-4 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={isOwn ? (user?.photoURL || undefined) : undefined} />
        <AvatarFallback>{isOwn ? "You" : "Friend"}</AvatarFallback>
      </Avatar>

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          {message.replyTo && (
            <div className="text-xs opacity-70 mb-1 border-l-2 border-current pl-2">
              Replying to a message
            </div>
          )}

          <p className="text-sm break-words">{message.content}</p>

          {message.edited && (
            <span className="text-xs opacity-70">(edited)</span>
          )}

          <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            <span className="text-xs opacity-70">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
            {isOwn && getStatusIcon()}
          </div>

          {message.reactions && message.reactions.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {Array.from(new Set(message.reactions.map((r) => r.emoji))).map(
                (emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReact?.(message.id, emoji)}
                    className={`px-2 py-1 rounded-full text-xs ${
                      hasReacted(emoji)
                        ? "bg-white/20"
                        : "bg-black/10 dark:bg-white/10"
                    }`}
                  >
                    {emoji} {getReactionCount(emoji)}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {showReactions && (
          <div className="flex gap-1 mt-2">
            {REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={() => onReact?.(message.id, emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}

        {isOwn && (onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 mt-1">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwn ? "end" : "start"}>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(message.id, message.content)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(message.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
