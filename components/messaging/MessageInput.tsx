"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Smile, Paperclip, Mic } from "lucide-react";
import { MessagingSettings } from "@/lib/data";

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  settings?: MessagingSettings;
  maxLength?: number;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled = false,
  settings,
  maxLength = 280,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && message.length <= maxLength;

  return (
    <Card className="p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className="min-h-[44px]"
          />
          {maxLength && (
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {settings?.ephemeralMessagesEnabled && (
                  <span className="text-orange-500">⏱️ Ephemeral ({settings.ephemeralMessageDuration}h)</span>
                )}
              </span>
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
          )}
        </div>

        <div className="flex gap-1">
          {settings?.imageMessagesEnabled && (
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="h-10 w-10"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          )}

          {settings?.voiceMessagesEnabled && (
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="h-10 w-10"
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-10 w-10"
          >
            <Smile className="h-4 w-4" />
          </Button>

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
