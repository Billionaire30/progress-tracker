"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useClickSound } from "@/lib/hooks/use-click-sound";
import { getToday } from "@/lib/timezone";

interface LogHoursModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const weeklyRoutine = [
  { day: 0, focus: "Engineering theory (1–2 hrs)" },
  { day: 1, focus: "Software — AutoCAD / Civil 3D / structural (1–2 hrs)" },
  { day: 2, focus: "Engineering calculations and design (1–2 hrs)" },
  { day: 3, focus: "Construction methods and site knowledge (1–2 hrs)" },
  { day: 4, focus: "Excel / project management / BOQ / technical writing (1 hr)" },
  { day: 5, focus: "Main practical project (3–5 hrs)" },
  { day: 6, focus: "Review, reflection, planning (1 hr)" },
];

export function LogHoursModal({ open, onOpenChange }: LogHoursModalProps) {
  const addStudySession = useAppStore((state) => state.addStudySession);
  const { playClickSound } = useClickSound();
  const [logDate, setLogDate] = useState(getToday());
  const [logHoursValue, setLogHoursValue] = useState("1");
  const [logFocus, setLogFocus] = useState("");

  useEffect(() => {
    if (open) {
      const today = new Date(logDate);
      const dayOfWeek = today.getDay();
      const routine = weeklyRoutine.find((r) => r.day === dayOfWeek);
      if (routine) {
        setLogFocus(routine.focus);
      }
    }
  }, [open, logDate]);

  const handleSave = () => {
    if (!logDate || !logHoursValue || !logFocus.trim()) return;

    const hours = parseFloat(logHoursValue);
    if (isNaN(hours) || hours <= 0) return;

    // Block future dates
    const today = getToday();
    if (logDate > today) {
      alert("Cannot log hours for future dates");
      return;
    }

    addStudySession({
      date: logDate,
      hours,
      note: logFocus,
    });

    setLogDate(getToday());
    setLogHoursValue("1");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Hours</DialogTitle>
          <DialogDescription>
            Record your study time
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Date</label>
            <input
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
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Hours</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="12"
              value={logHoursValue}
              onChange={(e) => setLogHoursValue(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Focus</label>
            <select
              value={logFocus}
              onChange={(e) => setLogFocus(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
            >
              {weeklyRoutine.map((routine) => (
                <option key={routine.day} value={routine.focus}>
                  {routine.focus}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            playClickSound();
            onOpenChange(false);
          }}>
            Cancel
          </Button>
          <Button onClick={() => {
            playClickSound();
            handleSave();
          }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
