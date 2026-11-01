"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MonthGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(12)].map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-32 w-full" />
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-3/4 mb-3" />
            <Skeleton className="h-2 w-full mb-1" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
