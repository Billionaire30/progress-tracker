"use client";

import { useAppStore, selectActiveHabits, selectHabitLogsForHabit } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Plus, Flame, Target, BookOpen, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";
import { Habit as NewHabit, HabitCategory } from "@/types/domain";
import { getToday, getStartOfISOWeek, daysBetween } from "@/lib/timezone";
import { computeStreak } from "@/lib/streak";
import { computeHabitGoalStatus } from "@/lib/goals";

interface HabitTrackerProps {
  onCheckInClick?: () => void;
}

export function HabitTracker({ onCheckInClick }: HabitTrackerProps) {
  const habits = useAppStore(selectActiveHabits);
  const habitLogs = useAppStore((state) => state.habitLogs);
  const studySessions = useAppStore((state) => state.studySessions);
  const settings = useAppStore((state) => state.settings);
  
  const toggleHabitLog = useAppStore((state) => state.toggleHabitLog);
  const addHabit = useAppStore((state) => state.addHabit);
  const updateHabit = useAppStore((state) => state.updateHabit);
  const deleteHabit = useAppStore((state) => state.deleteHabit);
  const addStudySession = useAppStore((state) => state.addStudySession);
  const deleteStudySession = useAppStore((state) => state.deleteStudySession);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDesc, setNewHabitDesc] = useState("");
  const [newHabitTarget, setNewHabitTarget] = useState(5);
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>("productivity");
  const [newHabitContributesToStudy, setNewHabitContributesToStudy] = useState(false);
  const [newHabitStudyUnitHours, setNewHabitStudyUnitHours] = useState(1);
  const [editStatus, setEditStatus] = useState<"active" | "paused" | "archived">("active");
  const [editPausedUntil, setEditPausedUntil] = useState("");
  const [editAllowGraceDays, setEditAllowGraceDays] = useState(false);

  const today = getToday();
  const weekStartsOn = settings.weekStartsOn;
  const weekStart = getStartOfISOWeek(today, weekStartsOn);

  const toggleHabitCompletion = (habitId: string, date?: string) => {
    const targetDate = date || today;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    // Get current state to check if already completed
    const currentLogs = habitLogs.filter(log => log.habitId === habitId && log.date === targetDate);
    const isCompleted = currentLogs.some(log => log.completed);

    // Toggle the habit log
    toggleHabitLog(habitId, targetDate);

    // Handle study linkage
    if (habit.contributesToStudy && habit.studyUnitHours) {
      if (!isCompleted) {
        // Adding completion: add study session
        addStudySession({
          date: targetDate,
          hours: habit.studyUnitHours,
          note: `Auto-logged from habit: ${habit.name}`,
          sourceHabitId: habitId,
        });
      } else {
        // Removing completion: remove linked study session
        const sessionToRemove = studySessions.find(
          s => s.date === targetDate && s.sourceHabitId === habitId
        );
        if (sessionToRemove) {
          deleteStudySession(sessionToRemove.id);
        }
      }
    }
  };

  const addNewHabit = () => {
    if (!newHabitName.trim()) return;

    addHabit({
      name: newHabitName,
      description: newHabitDesc,
      category: newHabitCategory,
      targetPerWeek: newHabitTarget,
      status: "active",
      pausedUntil: null,
      allowGraceDays: editAllowGraceDays,
      contributesToStudy: newHabitContributesToStudy,
      studyUnitHours: newHabitContributesToStudy ? newHabitStudyUnitHours : undefined,
    });

    setNewHabitName("");
    setNewHabitDesc("");
    setNewHabitTarget(5);
    setNewHabitCategory("productivity");
    setNewHabitContributesToStudy(false);
    setNewHabitStudyUnitHours(1);
    setEditAllowGraceDays(false);
    setIsAddOpen(false);
  };

  const updateExistingHabit = () => {
    if (!editingHabitId || !newHabitName.trim()) return;

    updateHabit(editingHabitId, {
      name: newHabitName,
      description: newHabitDesc,
      category: newHabitCategory,
      targetPerWeek: newHabitTarget,
      status: editStatus,
      pausedUntil: editStatus === "paused" ? editPausedUntil || null : null,
      allowGraceDays: editAllowGraceDays,
      contributesToStudy: newHabitContributesToStudy,
      studyUnitHours: newHabitContributesToStudy ? newHabitStudyUnitHours : undefined,
    });

    setEditingHabitId(null);
    setNewHabitName("");
    setNewHabitDesc("");
    setNewHabitTarget(5);
    setNewHabitCategory("productivity");
    setEditStatus("active");
    setEditPausedUntil("");
    setEditAllowGraceDays(false);
    setNewHabitContributesToStudy(false);
    setNewHabitStudyUnitHours(1);
  };

  const openEditHabit = (habit: NewHabit) => {
    setEditingHabitId(habit.id);
    setNewHabitName(habit.name);
    setNewHabitDesc(habit.description);
    setNewHabitTarget(habit.targetPerWeek);
    setNewHabitCategory(habit.category);
    setEditStatus(habit.status);
    setEditPausedUntil(habit.pausedUntil || "");
    setEditAllowGraceDays(habit.allowGraceDays);
    setNewHabitContributesToStudy(habit.contributesToStudy || false);
    setNewHabitStudyUnitHours(habit.studyUnitHours || 1);
  };

  const deleteHabitHandler = (habitId: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      deleteHabit(habitId);
    }
  };

  const getCategoryIcon = (category: HabitCategory) => {
    switch (category) {
      case "productivity": return <Target className="h-4 w-4" />;
      case "health": return <Flame className="h-4 w-4" />;
      case "learning": return <BookOpen className="h-4 w-4" />;
      case "mindfulness": return <Flame className="h-4 w-4" />;
    }
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      days.push(`${year}-${month}-${day}`);
    }
    return days;
  };

  const last7Days = getLast7Days();

  const getWeeklyProgress = (habit: NewHabit) => {
    const habitLogsForHabit = habitLogs.filter(log => log.habitId === habit.id && log.completed);
    const completedThisWeek = habitLogsForHabit.filter(log => log.date >= weekStart).length;
    const goalStatus = computeHabitGoalStatus(completedThisWeek, habit.targetPerWeek, weekStartsOn);
    return goalStatus;
  };

  // Calculate total streak (sum of active habit streaks)
  const totalStreak = habits.reduce((sum, habit) => {
    const habitLogsForHabit = habitLogs.filter(log => log.habitId === habit.id && log.completed);
    const streakResult = computeStreak(habitLogsForHabit, habit.id, today, {
      graceDays: habit.allowGraceDays ? 1 : 0,
      freezes: 0,
    });
    return sum + streakResult.current;
  }, 0);

  const completedToday = habits.filter(h => {
    const habitLogsForHabit = habitLogs.filter(log => log.habitId === h.id && log.completed);
    return habitLogsForHabit.some(log => log.date === today);
  }).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Habit Tracker
          </CardTitle>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingHabitId ? "Edit Habit" : "Add New Habit"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="habit-name">Habit Name</Label>
                  <Input
                    id="habit-name"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g., Morning meditation"
                  />
                </div>
                <div>
                  <Label htmlFor="habit-desc">Description</Label>
                  <Input
                    id="habit-desc"
                    value={newHabitDesc}
                    onChange={(e) => setNewHabitDesc(e.target.value)}
                    placeholder="e.g., 10 minutes of meditation"
                  />
                </div>
                <div>
                  <Label htmlFor="habit-target">Target (days/week)</Label>
                  <Input
                    id="habit-target"
                    type="number"
                    min="1"
                    max="7"
                    value={newHabitTarget}
                    onChange={(e) => setNewHabitTarget(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="habit-category">Category</Label>
                  <select
                    id="habit-category"
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value as HabitCategory)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="productivity">Productivity</option>
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="mindfulness">Mindfulness</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="habit-study-link"
                    checked={newHabitContributesToStudy}
                    onCheckedChange={(checked) => setNewHabitContributesToStudy(checked as boolean)}
                  />
                  <Label htmlFor="habit-study-link" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Contributes to study hours
                  </Label>
                </div>
                {newHabitContributesToStudy && (
                  <div>
                    <Label htmlFor="habit-study-hours">Hours per completion</Label>
                    <Input
                      id="habit-study-hours"
                      type="number"
                      min="0.5"
                      max="8"
                      step="0.5"
                      value={newHabitStudyUnitHours}
                      onChange={(e) => setNewHabitStudyUnitHours(parseFloat(e.target.value))}
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="habit-grace-days"
                    checked={editAllowGraceDays}
                    onCheckedChange={(checked) => setEditAllowGraceDays(checked as boolean)}
                  />
                  <Label htmlFor="habit-grace-days">Allow grace days (1 missed day allowed)</Label>
                </div>
                <div>
                  <Label htmlFor="habit-status">Status</Label>
                  <select
                    id="habit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "active" | "paused" | "archived")}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                {editStatus === "paused" && (
                  <div>
                    <Label htmlFor="habit-paused-until">Pause until (optional)</Label>
                    <Input
                      id="habit-paused-until"
                      type="date"
                      value={editPausedUntil}
                      onChange={(e) => setEditPausedUntil(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={editingHabitId ? updateExistingHabit : addNewHabit} className="flex-1">
                    {editingHabitId ? "Update" : "Add Habit"}
                  </Button>
                  {editingHabitId && (
                    <Button onClick={() => setEditingHabitId(null)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalStreak}</div>
            <div className="text-xs text-muted-foreground">Total Streak Days</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{completedToday}</div>
            <div className="text-xs text-muted-foreground">Completed Today</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{habits.length}</div>
            <div className="text-xs text-muted-foreground">Active Habits</div>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.map((habit) => {
            const habitLogsForHabit = habitLogs.filter(log => log.habitId === habit.id && log.completed);
            const isCompletedToday = habitLogsForHabit.some(log => log.date === today);
            const streakResult = computeStreak(habitLogsForHabit, habit.id, today, {
              graceDays: habit.allowGraceDays ? 1 : 0,
              freezes: 0,
            });
            const goalStatus = getWeeklyProgress(habit);

            return (
              <div
                key={habit.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCompletedToday
                    ? "border-primary bg-primary/5"
                    : streakResult.atRisk
                    ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(habit.category)}
                      <h4 className="font-medium">{habit.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {habit.category}
                      </Badge>
                      {habit.contributesToStudy && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          +{habit.studyUnitHours}h
                        </Badge>
                      )}
                      {streakResult.atRisk && (
                        <Badge variant="destructive" className="text-xs flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          At Risk
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{habit.description}</p>
                  </div>
                  <Button
                    variant={isCompletedToday ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className="gap-1"
                  >
                    <Check className="h-4 w-4" />
                    {isCompletedToday ? "Done" : "Mark Done"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Weekly Progress</span>
                    <span className="font-medium">
                      {Math.round(goalStatus.percentage)}% of {habit.targetPerWeek} days
                    </span>
                  </div>
                  <Progress value={goalStatus.percentage} className="h-2" />
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className={`flex items-center gap-1 ${
                      goalStatus.status === 'ahead' ? 'text-green-600' :
                      goalStatus.status === 'behind' ? 'text-red-600' :
                      'text-muted-foreground'
                    }`}>
                      Status: {goalStatus.status.charAt(0).toUpperCase() + goalStatus.status.slice(1)}
                    </span>
                    <span className="text-muted-foreground">
                      Expected: {goalStatus.expected}
                    </span>
                  </div>

                  {/* 7-day mini-grid */}
                  <div className="flex gap-1">
                    {last7Days.map((day) => {
                      const isCompleted = habitLogsForHabit.some(log => log.date === day);
                      return (
                        <button
                          key={day}
                          onClick={() => toggleHabitCompletion(habit.id, day)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                            isCompleted
                              ? 'bg-primary text-white'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                          title={day}
                        >
                          {isCompleted && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-primary">
                      <Flame className="h-3 w-3" />
                      <span>{streakResult.current} day streak (best: {streakResult.best})</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditHabit(habit)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHabitHandler(habit.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
