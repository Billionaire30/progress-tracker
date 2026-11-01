"use client";

import { useApp } from "@/lib/context";
import { MonthCard } from "@/components/MonthCard";
import { MonthGridSkeleton } from "@/components/MonthGridSkeleton";
import { SortOptions } from "@/components/SortOptions";
import { useState, useMemo, useCallback, memo } from "react";

type SortOption = "id" | "status" | "progress";

export const MonthGrid = memo(function MonthGrid() {
  const { data } = useApp();
  const [sortBy, setSortBy] = useState<SortOption>("id");

  const handleSortChange = useCallback((newSortBy: SortOption) => {
    setSortBy(newSortBy);
  }, []);

  const sortedMonths = useMemo(() => {
    const months = [...data.months];
    switch (sortBy) {
      case "id":
        return months.toSorted((a, b) => a.id - b.id);
      case "status":
        const statusOrder = { "complete": 2, "in-progress": 1, "not-started": 0 };
        return months.toSorted((a, b) => statusOrder[b.status] - statusOrder[a.status]);
      case "progress":
        return months.toSorted((a, b) => {
          const aProgress = a.tasks.length > 0 ? a.tasks.filter(t => t.done).length / a.tasks.length : 0;
          const bProgress = b.tasks.length > 0 ? b.tasks.filter(t => t.done).length / b.tasks.length : 0;
          return bProgress - aProgress;
        });
      default:
        return months;
    }
  }, [data.months, sortBy]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <SortOptions sortBy={sortBy} onSortChange={handleSortChange} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 stagger-children">
        {sortedMonths.map((month) => (
          <MonthCard key={month.id} month={month} />
        ))}
      </div>
    </div>
  );
});
