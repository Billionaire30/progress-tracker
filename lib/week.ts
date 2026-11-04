export function getCurrentWeekNumber(startDate: string): string {
  if (!startDate) return "N/A";
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.ceil(diffDays / 7);
  return weekNumber > 52 ? "52+" : weekNumber.toString();
}

export function getCurrentMonthNumber(startDate: string): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const monthNumber = Math.ceil(diffDays / 30);
  return monthNumber > 12 ? 0 : monthNumber;
}

export function getTodayFocus(): string {
  const weeklyRoutine = [
    { day: 0, focus: "Engineering theory (1–2 hrs)" },
    { day: 1, focus: "Software — AutoCAD / Civil 3D / structural (1–2 hrs)" },
    { day: 2, focus: "Engineering calculations and design (1–2 hrs)" },
    { day: 3, focus: "Construction methods and site knowledge (1–2 hrs)" },
    { day: 4, focus: "Excel / project management / BOQ / technical writing (1 hr)" },
    { day: 5, focus: "Main practical project (3–5 hrs)" },
    { day: 6, focus: "Review, reflection, planning (1 hr)" },
  ];

  const today = new Date().getDay();
  const routine = weeklyRoutine.find((r) => r.day === today);
  return routine?.focus || "Review your weekly plan";
}

export function getWeekData(logs: Array<{ date: string; hours: number }>) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(today.getDate() - diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekData = days.map((day, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    // Use local timezone (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayStr = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;
    const dayEntries = logs.filter((e) => e.date === dateStr);
    const hours = dayEntries.reduce((sum, e) => sum + e.hours, 0);
    return { day, hours };
  });

  return weekData;
}
