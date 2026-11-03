"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, Smile, Paperclip, Mic, Image, Code, Bold, Italic, User, Clock, X, Reply } from "lucide-react";
import { MessagingSettings } from "@/lib/data";

interface MessageInputProps {
  onSend: (content: string, type?: string) => void;
  disabled?: boolean;
  settings?: MessagingSettings;
  maxLength?: number;
  placeholder?: string;
  replyTo?: { id: string; content: string; author: string } | null;
  onCancelReply?: () => void;
}

const EMOJIS = ["😀", "😂", "😍", "🎉", "🔥", "💯", "👍", "❤️", "😮", "🙏", "✨", "💪", "🎯", "🚀", "💡"];

export function MessageInput({
  onSend,
  disabled = false,
  settings,
  maxLength = 2000,
  placeholder = "Type a message...",
  replyTo,
  onCancelReply,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const insertFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = message.substring(start, end);

    let formatted = "";
    switch (format) {
      case "bold":
        formatted = `**${text}**`;
        break;
      case "italic":
        formatted = `*${text}*`;
        break;
      case "code":
        formatted = `\`${text}\``;
        break;
      case "mention":
        formatted = `@${text}`;
        break;
    }

    setMessage((prev) => prev.substring(0, start) + formatted + prev.substring(end));
    setShowFormatting(false);
    textareaRef.current?.focus();
  };

  const handleFileUpload = () => {
    // In production, this would open a file picker
    alert("File upload feature - integrate with storage service");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In production, this would start/stop voice recording
  };

  const canSend = message.trim().length > 0 && message.length <= maxLength;

  return (
    <Card className="p-4">
      {replyTo && (
        <div className="flex items-center justify-between mb-3 p-2 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Reply className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Replying to {replyTo.author}:</span>
            <span className="font-medium truncate max-w-[200px]">{replyTo.content}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCancelReply}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className="min-h-[80px] resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {settings?.ephemeralMessagesEnabled && (
                <span className="text-xs text-orange-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Ephemeral ({settings.ephemeralMessageDuration}h)
                </span>
              )}
              <span
                className={`text-xs ${
                  charCount > maxLength * 0.9
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}
              >
                {charCount}/{maxLength}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  className="h-10 w-10"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3">
                <div className="grid grid-cols-5 gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="text-2xl hover:bg-muted rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={showFormatting} onOpenChange={setShowFormatting}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  className="h-10 w-10"
                >
                  <Code className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertFormatting("bold")}
                  >
                    <Bold className="h-4 w-4 mr-2" />
                    Bold
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertFormatting("italic")}
                  >
                    <Italic className="h-4 w-4 mr-2" />
                    Italic
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertFormatting("code")}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Code
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => insertFormatting("mention")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Mention
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="h-10 w-10"
              onClick={handleFileUpload}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="h-10 w-10"
              onClick={handleFileUpload}
            >
              <Image className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              className={`h-10 w-10 ${isRecording ? "text-red-500" : ""}`}
              onClick={toggleRecording}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!canSend || disabled}
            size="icon"
            className="h-10 w-10"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
