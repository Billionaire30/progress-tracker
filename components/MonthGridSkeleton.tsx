"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import LatticeLoader from "@/components/LatticeLoader";

export function MonthGridSkeleton() {
  const latticeStyle = {
    '--ll-cell': '6px',
    '--ll-color': '#8b5cf6',
    '--ll-idle': '0.2',
    '--ll-peak': '1',
    '--ll-cycle': '1s'
  } as React.CSSProperties;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(12)].map((_, i) => (
        <Card key={i} className="h-full flex flex-col overflow-hidden">
          <div className="h-36 w-full bg-muted/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center" style={latticeStyle}>
              <LatticeLoader
                pattern="dots"
                grid={3}
                shape="round"
                color="#8b5cf6"
                cellSize={6}
                gap={3}
                glow={false}
                className="ll-run"
              />
            </div>
          </div>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-3" />
            <Skeleton className="h-2 w-full mb-1" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
