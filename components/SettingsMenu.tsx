"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { useToast } from "@/lib/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";

export function SettingsButton() {
  const { data, setData } = useApp();
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleStartDateChange = (value: string) => {
    setData({ ...data, startDate: value });
  };

  const handleWeeklyGoalChange = (value: number) => {
    setData({ ...data, weeklyGoal: value });
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsSettingsOpen(true)}
        aria-label="Settings"
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your data and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  When you began Month 1
                </p>
              </div>
              <input
                type="date"
                value={data.startDate || ""}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Hour Goal</p>
                <p className="text-sm text-muted-foreground">
                  Target hours per week
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={data.weeklyGoal || 20}
                  onChange={(e) => handleWeeklyGoalChange(parseInt(e.target.value) || 20)}
                  className="px-3 py-2 border rounded-md text-sm w-20"
                />
                <span className="text-sm text-muted-foreground">hrs</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
