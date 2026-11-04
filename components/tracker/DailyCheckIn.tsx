"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore, selectActiveHabits } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Flame, BookOpen, Clock } from "lucide-react";
import { getToday } from "@/lib/timezone";
import { Habit as NewHabit } from "@/types/domain";

interface DailyCheckInProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyCheckIn({ open, onOpenChange }: DailyCheckInProps) {
  const habits = useAppStore(selectActiveHabits);
  const habitLogs = useAppStore((state) => state.habitLogs);
  const addStudySession = useAppStore((state) => state.addStudySession);
  const deleteStudySession = useAppStore((state) => state.deleteStudySession);
  const toggleHabitLog = useAppStore((state) => state.toggleHabitLog);

  const [logHoursValue, setLogHoursValue] = useState("0");
  const [logFocus, setLogFocus] = useState("");

  const today = getToday();
  const todayHabits = habits.filter(h => h.status !== "archived" && h.status !== "paused");
  const completedToday = todayHabits.filter(h => {
    const logs = habitLogs.filter(log => log.habitId === h.id && log.completed);
    return logs.some(log => log.date === today);
  }).length;
  const totalToday = todayHabits.length;
  const allDone = completedToday === totalToday && totalToday > 0;

  const handleQuickLog = useCallback((hours: number) => {
    addStudySession({
      date: today,
      hours,
      note: logFocus || "Quick log from daily check-in",
    });
  }, [today, logFocus, addStudySession]);

  const toggleHabit = useCallback((habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habitLogs.some(
      log => log.habitId === habitId && log.date === today && log.completed
    );

    toggleHabitLog(habitId, today);

    // Handle study linkage
    if (habit.contributesToStudy && habit.studyUnitHours) {
      if (!isCompleted) {
        addStudySession({
          date: today,
          hours: habit.studyUnitHours,
          note: `Auto-logged from habit: ${habit.name}`,
          sourceHabitId: habitId,
        });
      } else {
        const sessions = useAppStore.getState().studySessions;
        const sessionToRemove = sessions.find(
          s => s.date === today && s.sourceHabitId === habitId
        );
        if (sessionToRemove) {
          deleteStudySession(sessionToRemove.id);
        }
      }
    }
  }, [habits, habitLogs, today, toggleHabitLog, addStudySession, deleteStudySession]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Check-in
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">
              {completedToday} / {totalToday}
            </div>
            <p className="text-sm text-muted-foreground">
              {allDone ? "✓ Done for today!" : "Habits completed today"}
            </p>
          </div>

          {/* Habits */}
          <div className="space-y-3">
            {todayHabits.map((habit) => {
              const isCompleted = habitLogs.some(
                log => log.habitId === habit.id && log.date === today && log.completed
              );
              const streak = habitLogs.filter(log => log.habitId === habit.id && log.completed).length;

              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                      : "border-border bg-muted/50 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? "bg-green-500 text-white" : "bg-muted"
                        }`}
                      >
                        {isCompleted && <Check className="h-5 w-5" />}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{habit.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{habit.category}</span>
                          {habit.contributesToStudy && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              +{habit.studyUnitHours}h
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Flame className={`h-5 w-5 ${streak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Log Hours */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-2 block">Quick Log Study Hours</Label>
            <div className="flex gap-2 mb-3">
              {[0.5, 1, 2, 3].map((hours) => (
                <Button
                  key={hours}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLog(hours)}
                  className="flex-1"
                >
                  +{hours}h
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                placeholder="Custom hours"
                value={logHoursValue}
                onChange={(e) => setLogHoursValue(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => {
                  const hours = parseFloat(logHoursValue);
                  if (hours > 0) {
                    handleQuickLog(hours);
                    setLogHoursValue("0");
                  }
                }}
              >
                Log
              </Button>
            </div>
          </div>

          {/* Close */}
          <div className="flex justify-center pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close (Esc)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
