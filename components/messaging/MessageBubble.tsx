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
  Reply,
  Copy,
  Pin,
  Bookmark,
  Share2,
  FileText,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { toast } from "@/lib/hooks/use-toast";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onPin?: (messageId: string) => void;
  onBookmark?: (messageId: string) => void;
}

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🎉", "🔥", "💯", "👏", "🙌", "✨", "💪", "🎯", "🚀", "💡"];

export function MessageBubble({
  message,
  isOwn,
  onEdit,
  onDelete,
  onReact,
  onReply,
  onPin,
  onBookmark,
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

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleReply = () => {
    onReply?.(message);
  };

  const handlePin = () => {
    onPin?.(message.id);
    toast({
      title: "Message Pinned",
      description: "Message has been pinned",
    });
  };

  const handleBookmark = () => {
    onBookmark?.(message.id);
    toast({
      title: "Message Bookmarked",
      description: "Message has been bookmarked",
    });
  };

  const handleExport = () => {
    const text = `[${formatDistanceToNow(new Date(message.timestamp), { addSuffix: false })}] ${message.content}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `message-${message.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported",
      description: "Message exported as text file",
    });
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
              ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg"
              : "bg-gradient-to-br from-muted to-muted/80 shadow-lg"
          }`}
        >
          {message.replyTo && (
            <div className="text-xs opacity-70 mb-1 border-l-2 border-current pl-2">
              <Reply className="h-3 w-3 inline mr-1" />
              Replying to a message
            </div>
          )}

          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>

          {message.edited && (
            <span className="text-xs opacity-70 italic">(edited)</span>
          )}

          {message.expiresAt && (
            <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Auto-delete in {formatDistanceToNow(new Date(message.expiresAt), { addSuffix: true })}
            </div>
          )}

          <div className={`flex items-center gap-2 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
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
                    className={`px-2 py-1 rounded-full text-xs transition-all ${
                      hasReacted(emoji)
                        ? "bg-white/30 scale-110"
                        : "bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20"
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
                className="h-7 w-7 p-0 hover:bg-muted transition-transform hover:scale-110"
                onClick={() => onReact?.(message.id, emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOwn ? "end" : "start"}>
            <DropdownMenuItem onClick={handleReply}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePin}>
              <Pin className="h-4 w-4 mr-2" />
              Pin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleBookmark}>
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {isOwn && onEdit && (
              <DropdownMenuItem onClick={() => onEdit(message.id, message.content)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {isOwn && onDelete && (
              <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
