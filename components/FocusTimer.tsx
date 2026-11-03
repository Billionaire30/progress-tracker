"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppData } from "@/lib/useAppData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

const POMODORO_TIME = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK = 5 * 60; // 5 minutes
const LONG_BREAK = 15 * 60; // 15 minutes

type TimerMode = "focus" | "shortBreak" | "longBreak";

export function FocusTimer() {
  const { logHours } = useAppData();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);

    if (mode === "focus") {
      // Auto-log hours when focus session completes
      const hoursLogged = POMODORO_TIME / 3600; // Convert to hours
      logHours({
        date: new Date().toISOString().split("T")[0],
        hours: hoursLogged,
        focus: "Focus session (Pomodoro)",
      });

      toast({
        title: "Focus session complete!",
        description: `${hoursLogged.toFixed(2)} hours logged automatically`,
      });

      setSessionCount((prev) => prev + 1);

      // After 4 focus sessions, take a long break
      if ((sessionCount + 1) % 4 === 0) {
        setMode("longBreak");
        setTimeLeft(LONG_BREAK);
      } else {
        setMode("shortBreak");
        setTimeLeft(SHORT_BREAK);
      }
    } else {
      // Break complete, back to focus
      setMode("focus");
      setTimeLeft(POMODORO_TIME);
      toast({
        title: "Break complete!",
        description: "Ready for another focus session?",
      });
    }
  }, [mode, sessionCount, logHours, toast]);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setMode("focus");
    setTimeLeft(POMODORO_TIME);
  }, []);

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    switch (newMode) {
      case "focus":
        setTimeLeft(POMODORO_TIME);
        break;
      case "shortBreak":
        setTimeLeft(SHORT_BREAK);
        break;
      case "longBreak":
        setTimeLeft(LONG_BREAK);
        break;
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getModeColor = () => {
    switch (mode) {
      case "focus":
        return "text-blue-600 dark:text-blue-400";
      case "shortBreak":
        return "text-green-600 dark:text-green-400";
      case "longBreak":
        return "text-purple-600 dark:text-purple-400";
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case "focus":
        return "Focus Time";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
    }
  };

  return (
    <Card className="glass-card card-premium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Focus Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-6xl font-bold tabular-nums ${getModeColor()} mb-2`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-muted-foreground">{getModeLabel()}</div>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            variant={mode === "focus" ? "default" : "outline"}
            size="sm"
            onClick={() => switchMode("focus")}
          >
            Focus
          </Button>
          <Button
            variant={mode === "shortBreak" ? "default" : "outline"}
            size="sm"
            onClick={() => switchMode("shortBreak")}
          >
            Short Break
          </Button>
          <Button
            variant={mode === "longBreak" ? "default" : "outline"}
            size="sm"
            onClick={() => switchMode("longBreak")}
          >
            Long Break
          </Button>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            onClick={toggleTimer}
            className="button-premium"
            size="lg"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={resetTimer}
            variant="outline"
            size="lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Sessions completed: {sessionCount}
        </div>
      </CardContent>
    </Card>
  );
}
