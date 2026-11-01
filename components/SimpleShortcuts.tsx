"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Keyboard, X, Zap, Command } from "lucide-react";

export function SimpleShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const shortcuts = [
    { key: "Ctrl + L", action: "Open log hours modal", icon: "📝" },
    { key: "Ctrl + /", action: "Show keyboard shortcuts", icon: "⌨️" },
    { key: "Ctrl + ,", action: "Open settings", icon: "⚙️" },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsAnimating(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110"
        title="Keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClickOutside}
    >
      <div className={`w-full max-w-md transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
        <Card className="relative shadow-2xl border-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setIsOpen(false); setIsAnimating(false); }}
          className="absolute top-3 right-3 z-10 hover:bg-destructive/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Keyboard className="h-5 w-5 text-primary" />
            </div>
            Keyboard Shortcuts
          </CardTitle>
          <p className="text-sm text-muted-foreground">Speed up your workflow with these commands</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-200 hover:shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{shortcut.icon}</span>
                  <span className="text-sm font-medium text-foreground">{shortcut.action}</span>
                </div>
                <kbd className="px-3 py-1.5 bg-background border-2 border-border rounded-md text-sm font-mono font-semibold shadow-sm group-hover:border-primary/50 transition-colors">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-primary">Pro tip:</span> Use keyboard shortcuts to navigate faster and boost your productivity!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
