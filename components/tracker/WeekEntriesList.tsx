"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { StudySession } from "@/types/domain";

interface WeekEntriesListProps {
  entries: StudySession[];
  onDelete: (id: string) => void;
  onEdit?: (session: StudySession) => void;
}

export function WeekEntriesList({ entries, onDelete, onEdit }: WeekEntriesListProps) {
  const entriesWithDay = entries.map((entry) => {
    const entryDate = new Date(entry.date);
    const dayName = entryDate.toLocaleDateString("en-US", { weekday: "short" });
    return { ...entry, dayName };
  });

  if (entries.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          No hours logged this week yet.
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
            <span className="text-muted-foreground">{entry.note}</span>
          </div>
          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(entry)}
                className="min-h-[44px] min-w-[44px]"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(entry.id)}
              className="min-h-[44px] min-w-[44px]"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
