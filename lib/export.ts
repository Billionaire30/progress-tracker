import { AppData } from "./data";

export const exportToCSV = (data: AppData) => {
  // Create CSV content
  const headers = ["Month", "Status", "Tasks Complete", "Total Tasks", "Focus", "Deadline"];
  const rows = data.months.map((month) => [
    month.id,
    month.status,
    month.tasks.filter((t) => t.done).length,
    month.tasks.length,
    month.focus,
    month.deadline || "Not set",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `progress-tracker-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data: AppData) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `progress-tracker-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateReport = (data: AppData): string => {
  const monthsComplete = data.months.filter((m) => m.status === "complete").length;
  const portfolioComplete = data.portfolio.filter((p) => p.status === "complete").length;
  const competenciesComplete = data.competencyChecklist.filter((c) => c.done).length;
  const overallProgress = Math.round(
    ((monthsComplete + portfolioComplete + competenciesComplete) / (12 + 5 + 17)) * 100
  );

  const totalHoursLogged = data.weeklyLog.reduce((sum, entry) => sum + entry.hours, 0);
  const avgHoursPerWeek = data.weeklyLog.length > 0 ? totalHoursLogged / data.weeklyLog.length : 0;

  return `
Progress Report
Generated: ${new Date().toLocaleString()}

OVERALL PROGRESS
================
Overall Completion: ${overallProgress}%
Months Complete: ${monthsComplete}/12
Portfolio Complete: ${portfolioComplete}/5
Competencies Complete: ${competenciesComplete}/17

TIME TRACKING
=============
Total Hours Logged: ${totalHoursLogged.toFixed(1)}h
Average Hours/Week: ${avgHoursPerWeek.toFixed(1)}h
Current Streak: ${data.currentStreak} days
Longest Streak: ${data.longestStreak} days

MONTHLY BREAKDOWN
=================
${data.months
  .map(
    (month) => `
Month ${month.id}: ${month.title}
Status: ${month.status}
Tasks: ${month.tasks.filter((t) => t.done).length}/${month.tasks.length} complete
Focus: ${month.focus}
${month.deadline ? `Deadline: ${month.deadline}` : "Deadline: Not set"}
`
  )
  .join("\n")}

WEEKLY LOG
==========
${data.weeklyLog
  .map(
    (entry) => `
${entry.date}: ${entry.hours.toFixed(1)}h - ${entry.focus}
`
  )
  .join("\n")}
`;
};

export const exportToText = (data: AppData) => {
  const report = generateReport(data);
  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `progress-report-${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
