"use client";

import { Button } from "@/components/ui/button";
import { Plus, Settings, Download } from "lucide-react";
import { useApp } from "@/lib/context";
import { useClickSound } from "@/lib/hooks/use-click-sound";

interface QuickActionsProps {
  onLogHours: () => void;
  onOpenSettings: () => void;
}

export function QuickActions({ onLogHours, onOpenSettings }: QuickActionsProps) {
  const { exportData } = useApp();
  const { playClickSound } = useClickSound();

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          playClickSound();
          onLogHours();
        }}
        size="sm"
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Log Hours
      </Button>
      <Button
        onClick={() => {
          playClickSound();
          exportData();
        }}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
      <Button
        onClick={() => {
          playClickSound();
          onOpenSettings();
        }}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    </div>
  );
}
