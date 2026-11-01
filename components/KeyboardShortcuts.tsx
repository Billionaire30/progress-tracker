"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";
import { memo } from "react";

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { key: "Ctrl + L", description: "Open log hours modal" },
  { key: "Esc", description: "Close modals" },
  { key: "Ctrl + /", description: "Show keyboard shortcuts" },
];

export const KeyboardShortcuts = memo(function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        <Button onClick={() => onOpenChange(false)} className="w-full mt-4">
          Got it
        </Button>
      </DialogContent>
    </Dialog>
  );
});
