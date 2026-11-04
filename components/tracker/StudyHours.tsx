"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Clock, Trash2, Edit2 } from "lucide-react";
import { WeekEntriesList } from "@/components/tracker/WeekEntriesList";
import { getToday, getStartOfISOWeek } from "@/lib/timezone";
import { computeStudyGoalStatus } from "@/lib/goals";

const weeklyRoutine = [
  { day: 0, focus: "Engineering theory (1–2 hrs)" },
  { day: 1, focus: "Software — AutoCAD / Civil 3D / structural (1–2 hrs)" },
  { day: 2, focus: "Engineering calculations and design (1–2 hrs)" },
  { day: 3, focus: "Construction methods and site knowledge (1–2 hrs)" },
  { day: 4, focus: "Excel / project management / BOQ / technical writing (1 hr)" },
  { day: 5, focus: "Main practical project (3–5 hrs)" },
  { day: 6, focus: "Review, reflection, planning (1 hr)" },
];

export function StudyHours() {
  const studySessions = useAppStore((state) => state.studySessions);
  const settings = useAppStore((state) => state.settings);
  const addStudySession = useAppStore((state) => state.addStudySession);
  const updateStudySession = useAppStore((state) => state.updateStudySession);
  const deleteStudySession = useAppStore((state) => state.deleteStudySession);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [logDate, setLogDate] = useState(getToday());
  const [logHoursValue, setLogHoursValue] = useState("1");
  const [logFocus, setLogFocus] = useState("");

  useEffect(() => {
    if (isAddOpen || isEditOpen) {
      const today = new Date(logDate);
      const dayOfWeek = today.getDay();
      const routine = weeklyRoutine.find((r) => r.day === dayOfWeek);
      if (routine) {
        setLogFocus(routine.focus);
      }
    }
  }, [isAddOpen, isEditOpen, logDate]);

  const handleSave = () => {
    if (!logDate || !logHoursValue || !logFocus.trim()) return;

    const hours = parseFloat(logHoursValue);
    if (isNaN(hours) || hours <= 0) return;

    const today = getToday();
    if (logDate > today) {
      alert("Cannot log hours for future dates");
      return;
    }

    if (editingSessionId) {
      updateStudySession(editingSessionId, {
        date: logDate,
        hours,
        note: logFocus,
      });
      setEditingSessionId(null);
      setIsEditOpen(false);
    } else {
      addStudySession({
        date: logDate,
        hours,
        note: logFocus,
      });
      setIsAddOpen(false);
    }

    setLogDate(getToday());
    setLogHoursValue("1");
  };

  const openEditSession = (session: any) => {
    setEditingSessionId(session.id);
    setLogDate(session.date);
    setLogHoursValue(session.hours.toString());
    setLogFocus(session.note || "");
    setIsEditOpen(true);
  };

  const weekStartsOn = settings.weekStartsOn;
  const weekStart = getStartOfISOWeek(getToday(), weekStartsOn);

  const thisWeekEntries = studySessions.filter((entry) => {
    return entry.date >= weekStart;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const weeklyTotal = thisWeekEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const weeklyGoal = settings.weeklyGoalHours;
  const goalStatus = computeStudyGoalStatus(weeklyTotal, weeklyGoal);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Study Hours
          </CardTitle>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Log Hours
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Hours</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="log-date">Date</Label>
                  <Input
                    id="log-date"
                    type="date"
                    value={logDate}
                    onChange={(e) => {
                      setLogDate(e.target.value);
                      const date = new Date(e.target.value);
                      const dayOfWeek = date.getDay();
                      const routine = weeklyRoutine.find((r) => r.day === dayOfWeek);
                      if (routine) {
                        setLogFocus(routine.focus);
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="log-hours">Hours</Label>
                  <Input
                    id="log-hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    value={logHoursValue}
                    onChange={(e) => setLogHoursValue(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="log-focus">Focus</Label>
                  <select
                    id="log-focus"
                    value={logFocus}
                    onChange={(e) => setLogFocus(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {weeklyRoutine.map((routine) => (
                      <option key={routine.day} value={routine.focus}>
                        {routine.focus}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">Save</Button>
                  <Button onClick={() => setIsAddOpen(false)} variant="outline" className="flex-1">Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Weekly Progress</span>
            <span className="font-medium">
              {weeklyTotal.toFixed(1)} / {weeklyGoal} hrs
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 transition-all duration-300 ${
                goalStatus.status === 'ahead' ? 'bg-green-500' :
                goalStatus.status === 'behind' ? 'bg-red-500' :
                'bg-primary'
              }`}
              style={{ width: `${Math.min(goalStatus.percentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className={`${
              goalStatus.status === 'ahead' ? 'text-green-600' :
              goalStatus.status === 'behind' ? 'text-red-600' :
              'text-muted-foreground'
            }`}>
              Status: {goalStatus.status.charAt(0).toUpperCase() + goalStatus.status.slice(1)}
            </span>
            <span className="text-muted-foreground">
              {goalStatus.remaining.toFixed(1)} hrs remaining
            </span>
          </div>
        </div>

        {/* Quick Log Chips */}
        <div className="flex gap-2">
          {[0.5, 1, 2, 3].map((hours) => (
            <Button
              key={hours}
              variant="outline"
              size="sm"
              onClick={() => {
                setLogHoursValue(hours.toString());
                setLogDate(getToday());
                setIsAddOpen(true);
              }}
            >
              +{hours}h
            </Button>
          ))}
        </div>

        {/* This Week's Entries */}
        <WeekEntriesList 
          entries={thisWeekEntries} 
          onDelete={deleteStudySession}
          onEdit={openEditSession}
        />
      </CardContent>
    </Card>
  );
}
