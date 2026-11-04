"use client";

import { useState } from "react";
import { HabitTracker } from "@/components/tracker/HabitTracker";
import { StudyHours } from "@/components/tracker/StudyHours";
import { Competencies } from "@/components/tracker/Competencies";
import { Portfolio } from "@/components/tracker/Portfolio";
import { Certificates } from "@/components/tracker/Certificates";
import { DailyCheckIn } from "@/components/tracker/DailyCheckIn";
import { NextActionWidget } from "@/components/tracker/NextActionWidget";
import { Trends } from "@/components/tracker/Trends";
import { WeeklyHoursChart } from "@/components/tracker/WeeklyHoursChart";
import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";

export default function Dashboard() {
  const [checkInOpen, setCheckInOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and stay on track</p>
        </div>
        <Button onClick={() => setCheckInOpen(true)} className="hidden sm:flex">
          <CheckSquare className="h-4 w-4 mr-2" />
          Daily Check-in
        </Button>
      </div>

      {/* Next Action Widget */}
      <NextActionWidget />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HabitTracker onCheckInClick={() => setCheckInOpen(true)} />
        <StudyHours />
      </div>

      {/* Weekly Hours Chart */}
      <WeeklyHoursChart onLogHoursClick={() => {}} />

      {/* Trends */}
      <Trends />

      <Competencies />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Portfolio />
        <Certificates />
      </div>

      {/* Daily Check-in Modal */}
      <DailyCheckIn open={checkInOpen} onOpenChange={setCheckInOpen} />
    </div>
  );
}
