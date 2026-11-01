"use client";

import { useAppData } from "@/lib/useAppData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useClickSound } from "@/lib/hooks/use-click-sound";
import { triggerMiniConfetti } from "@/lib/confetti";
import { memo, useMemo, useCallback, useState } from "react";

const categories = {
  "CAD & Surveying": ["c1", "c2", "c3", "c4", "c5", "c6"],
  "Road & Drainage": ["c7", "c8"],
  "Structural": ["c9", "c10"],
  "Construction Management": ["c11", "c12", "c13"],
  "Professional Skills": ["c14", "c15", "c16", "c17"],
};

export const CompetencyPanel = memo(function CompetencyPanel() {
  const { data, toggleCompetency } = useAppData();
  const { playClickSound } = useClickSound();
  const [expandedCategory, setExpandedCategory] = useState<string | null>("CAD & Surveying");

  const competenciesComplete = useMemo(
    () => data.competencyChecklist.filter((c) => c.done).length,
    [data.competencyChecklist]
  );

  const handleToggle = useCallback((id: string) => {
    const competency = data.competencyChecklist.find((c) => c.id === id);
    const wasNotDone = competency && !competency.done;
    toggleCompetency(id);
    
    // Trigger confetti on completion
    if (wasNotDone) {
      triggerMiniConfetti();
    }
  }, [toggleCompetency, data.competencyChecklist]);

  const toggleCategory = useCallback((category: string) => {
    playClickSound();
    setExpandedCategory(expandedCategory === category ? null : category);
  }, [expandedCategory, playClickSound]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Clock className="h-5 w-5" />
          Competencies
        </CardTitle>
        <CardDescription className="text-sm">
          {competenciesComplete} / 17 complete
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {Object.entries(categories).map(([category, competencyIds]) => {
          const categoryCompetencies = data.competencyChecklist.filter((c) =>
            competencyIds.includes(c.id)
          );
          const categoryComplete = categoryCompetencies.filter((c) => c.done).length;
          const categoryProgress = (categoryComplete / categoryCompetencies.length) * 100;
          const isExpanded = expandedCategory === category;

          return (
            <div key={category} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-2 sm:p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs sm:text-sm font-medium truncate">{category}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {categoryComplete}/{categoryCompetencies.length}
                    </span>
                  </div>
                  <Progress value={categoryProgress} className="h-1.5" />
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {isExpanded && (
                <div className="border-t p-2 space-y-1 bg-muted/30">
                  {categoryCompetencies.map((competency) => (
                    <div
                      key={competency.id}
                      className="flex items-start gap-2 sm:gap-3 p-2 rounded"
                    >
                      <Checkbox
                        checked={competency.done}
                        onCheckedChange={() => handleToggle(competency.id)}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <p
                        className={`text-xs sm:text-sm flex-1 ${
                          competency.done ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {competency.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
});
