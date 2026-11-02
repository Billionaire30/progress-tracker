"use client";

import { Skeleton } from "@/components/ui/skeleton";
import LatticeLoader from "@/components/LatticeLoader";

export function LoadingSkeleton() {
  const latticeStyle = {
    '--ll-cell': '12px',
    '--ll-color': '#8b5cf6',
    '--ll-idle': '0.2',
    '--ll-peak': '1',
    '--ll-cycle': '1s'
  } as React.CSSProperties;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2" style={latticeStyle}>
          <LatticeLoader
            pattern="spin"
            grid={4}
            shape="round"
            color="#8b5cf6"
            cellSize={8}
            gap={2}
            glow={true}
            glowColor="#8b5cf6"
            className="ll-run"
          />
        </div>
      </div>

      <div className="h-32 w-full rounded-lg bg-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center" style={latticeStyle}>
          <LatticeLoader
            pattern="pulse"
            grid={4}
            shape="round"
            color="#8b5cf6"
            cellSize={10}
            gap={4}
            glow={true}
            glowColor="#8b5cf6"
            className="ll-run"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 w-full rounded-lg bg-muted/50 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center" style={latticeStyle}>
              <LatticeLoader
                pattern="ripple"
                grid={3}
                shape="round"
                color="#8b5cf6"
                cellSize={10}
                gap={4}
                glow={false}
                className="ll-run"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="h-64 w-full rounded-lg bg-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center" style={latticeStyle}>
          <LatticeLoader
            pattern="sweep"
            grid={4}
            shape="round"
            color="#8b5cf6"
            cellSize={12}
            gap={4}
            glow={true}
            glowColor="#8b5cf6"
            className="ll-run"
          />
        </div>
      </div>
    </div>
  );
}
