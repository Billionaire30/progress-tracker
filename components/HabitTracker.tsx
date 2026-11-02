"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Flame, Calendar, TrendingUp, Target } from "lucide-react";
import { useState, useMemo } from "react";

interface Habit {
  id: string;
  name: string;
  description: string;
  category: "productivity" | "health" | "learning" | "mindfulness";
  target: number; // days per week
  currentStreak: number;
  completedDates: string[]; // ISO date strings
  color: string;
}

const DEFAULT_HABITS: Omit<Habit, "id" | "completedDates" | "currentStreak">[] = [
  {
    name: "Morning Meditation",
    description: "10 minutes of meditation",
    category: "mindfulness",
    target: 5,
    color: "purple",
  },
  {
    name: "Exercise",
    description: "30 minutes of physical activity",
    category: "health",
    target: 4,
    color: "green",
  },
  {
    name: "Read",
    description: "20 pages of a book",
    category: "learning",
    target: 5,
    color: "blue",
  },
  {
    name: "Deep Work",
    description: "2 hours of focused work",
    category: "productivity",
    target: 5,
    color: "orange",
  },
  {
    name: "Journal",
    description: "Write daily reflections",
    category: "mindfulness",
    target: 7,
    color: "pink",
  },
];

export function HabitTracker() {
  const { data, setData } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDesc, setNewHabitDesc] = useState("");
  const [newHabitTarget, setNewHabitTarget] = useState(5);
  const [newHabitCategory, setNewHabitCategory] = useState<Habit["category"]>("productivity");

  const habits: Habit[] = useMemo(() => {
    if (!data.habits || data.habits.length === 0) {
      return DEFAULT_HABITS.map((h) => ({
        ...h,
        id: `habit-${Date.now()}-${Math.random()}`,
        completedDates: [],
        currentStreak: 0,
      }));
    }
    return data.habits;
  }, [data.habits]);

  const today = new Date().toISOString().split("T")[0];

  const toggleHabitCompletion = (habitId: string) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id !== habitId) return habit;

      const isCompletedToday = habit.completedDates.includes(today);
      const updatedDates = isCompletedToday
        ? habit.completedDates.filter((d) => d !== today)
        : [...habit.completedDates, today];

      // Calculate streak
      let streak = 0;
      const sortedDates = [...updatedDates].sort().reverse();
      if (sortedDates.length > 0) {
        streak = 1;
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            streak++;
          } else {
            break;
          }
        }
      }

      return {
        ...habit,
        completedDates: updatedDates,
        currentStreak: streak,
      };
    });

    setData((prevData) => ({ ...prevData, habits: updatedHabits }));
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: newHabitName,
      description: newHabitDesc,
      category: newHabitCategory,
      target: newHabitTarget,
      currentStreak: 0,
      completedDates: [],
      color: getCategoryColor(newHabitCategory),
    };

    // Use the current habits (including defaults if data.habits is empty)
    const currentHabits = habits;
    setData((prevData) => ({ ...prevData, habits: [...currentHabits, newHabit] }));
    setNewHabitName("");
    setNewHabitDesc("");
    setNewHabitTarget(5);
    setIsAddOpen(false);
  };

  const deleteHabit = (habitId: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      const currentHabits = habits;
      setData((prevData) => ({ ...prevData, habits: currentHabits.filter((h) => h.id !== habitId) }));
    }
  };

  const getCategoryColor = (category: Habit["category"]) => {
    switch (category) {
      case "productivity":
        return "orange";
      case "health":
        return "green";
      case "learning":
        return "blue";
      case "mindfulness":
        return "purple";
    }
  };

  const getCategoryIcon = (category: Habit["category"]) => {
    switch (category) {
      case "productivity":
        return <Target className="h-4 w-4" />;
      case "health":
        return <Flame className="h-4 w-4" />;
      case "learning":
        return <TrendingUp className="h-4 w-4" />;
      case "mindfulness":
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getWeeklyProgress = (habit: Habit) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      weekDates.push(date.toISOString().split("T")[0]);
    }

    const completedThisWeek = habit.completedDates.filter((date) =>
      weekDates.includes(date)
    ).length;

    return (completedThisWeek / habit.target) * 100;
  };

  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;

  return (
    <Card className="glass-card card-premium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500 animate-pulse-glow" />
            Habit Tracker
          </CardTitle>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="button-premium">
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Add New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="habit-name">Habit Name</Label>
                  <Input
                    id="habit-name"
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g., Morning meditation"
                    className="transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="habit-desc">Description</Label>
                  <Input
                    id="habit-desc"
                    value={newHabitDesc}
                    onChange={(e) => setNewHabitDesc(e.target.value)}
                    placeholder="e.g., 10 minutes of meditation"
                    className="transition-colors focus:border-primary"
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
                    className="transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <Label htmlFor="habit-category">Category</Label>
                  <select
                    id="habit-category"
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value as Habit["category"])}
                    className="w-full p-2 border rounded-md transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="productivity">Productivity</option>
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="mindfulness">Mindfulness</option>
                  </select>
                </div>
                <Button onClick={addHabit} className="w-full button-premium">
                  Add Habit
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg hover:shadow-premium transition-shadow duration-300">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 counter-animate">{totalStreak}</div>
            <div className="text-xs text-muted-foreground">Total Streak Days</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg hover:shadow-premium transition-shadow duration-300">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 counter-animate">{completedToday}</div>
            <div className="text-xs text-muted-foreground">Completed Today</div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg hover:shadow-premium transition-shadow duration-300">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 counter-animate">{habits.length}</div>
            <div className="text-xs text-muted-foreground">Active Habits</div>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.map((habit, index) => {
            const isCompletedToday = habit.completedDates.includes(today);
            const weeklyProgress = getWeeklyProgress(habit);

            return (
              <div
                key={habit.id}
                className={`p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-premium animate-slide-in ${
                  isCompletedToday
                    ? "border-green-400 bg-green-50 dark:bg-green-950/20 shadow-glow"
                    : "border-border bg-muted/50 hover:border-primary/50"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(habit.category)}
                      <h4 className="font-medium">{habit.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {habit.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{habit.description}</p>
                  </div>
                  <Button
                    variant={isCompletedToday ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className="gap-1 button-premium"
                  >
                    <Check className="h-4 w-4" />
                    {isCompletedToday ? "Done" : "Mark Done"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Weekly Progress</span>
                    <span className="font-medium">
                      {Math.round(weeklyProgress)}% of {habit.target} days
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <Progress value={weeklyProgress} className="h-2" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                      <Flame className="h-3 w-3" />
                      <span>{habit.currentStreak} day streak</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHabit(habit.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </Button>
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
