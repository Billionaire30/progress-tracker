"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { WeeklyLogEntry } from "@/lib/data";
import { useClickSound } from "@/lib/hooks/use-click-sound";
import { memo, useMemo } from "react";

interface WeekEntriesListProps {
  entries: WeeklyLogEntry[];
  onDelete: (id: string) => void;
}

export const WeekEntriesList = memo(function WeekEntriesList({ entries, onDelete }: WeekEntriesListProps) {
  const { playClickSound } = useClickSound();

  const entriesWithDay = useMemo(() =>
    entries.map((entry) => {
      const entryDate = new Date(entry.date);
      const dayName = entryDate.toLocaleDateString("en-US", { weekday: "short" });
      return { ...entry, dayName };
    }),
    [entries]
  );

  if (entries.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground mb-2">
          No hours logged this week yet.
        </p>
        <p className="text-xs text-muted-foreground">
          Start logging your study hours to track your progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">This week&apos;s entries</h4>
      {entriesWithDay.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
        >
          <div className="flex-1">
            <span className="font-medium tabular-nums">{entry.dayName}</span>
            <span className="mx-2">·</span>
            <span className="tabular-nums">{entry.hours} hrs</span>
            <span className="mx-2">·</span>
            <span className="text-muted-foreground">{entry.focus}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              playClickSound();
              onDelete(entry.id);
            }}
            aria-label={`Delete ${entry.dayName} entry, ${entry.hours} hours, ${entry.focus}`}
            className="min-h-[44px] min-w-[44px]"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
});
