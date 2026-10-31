"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useClickSound } from "@/lib/hooks/use-click-sound";
import { memo, useCallback } from "react";

type SortOption = "id" | "status" | "progress";

interface SortOptionsProps {
  sortBy: SortOption;
  onSortChange: (sortBy: SortOption) => void;
}

export const SortOptions = memo(function SortOptions({ sortBy, onSortChange }: SortOptionsProps) {
  const { playClickSound } = useClickSound();

  const handleSortId = useCallback(() => {
    playClickSound();
    onSortChange("id");
  }, [onSortChange, playClickSound]);
  const handleSortStatus = useCallback(() => {
    playClickSound();
    onSortChange("status");
  }, [onSortChange, playClickSound]);
  const handleSortProgress = useCallback(() => {
    playClickSound();
    onSortChange("progress");
  }, [onSortChange, playClickSound]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <ArrowUpDown className="h-4 w-4" />
        Sort by:
      </span>
      <Button
        variant={sortBy === "id" ? "default" : "outline"}
        size="sm"
        onClick={handleSortId}
      >
        ID
      </Button>
      <Button
        variant={sortBy === "status" ? "default" : "outline"}
        size="sm"
        onClick={handleSortStatus}
      >
        Status
      </Button>
      <Button
        variant={sortBy === "progress" ? "default" : "outline"}
        size="sm"
        onClick={handleSortProgress}
      >
        Progress
      </Button>
    </div>
  );
});
