import { AppData } from "./data";

export interface ReportData {
  title: string;
  generatedAt: string;
  summary: {
    totalHours: number;
    totalTasks: number;
    completedTasks: number;
    monthsComplete: number;
    currentStreak: number;
    longestStreak: number;
    overallProgress: number;
  };
  monthlyBreakdown: Array<{
    month: number;
    title: string;
    status: string;
    tasksCompleted: number;
    totalTasks: number;
  }>;
  weeklyLog: Array<{
    date: string;
    hours: number;
    focus: string;
  }>;
  achievements: string[];
  gamification?: {
    level: number;
    totalXP: number;
    badges: string[];
  };
}

export function generateReport(data: AppData): ReportData {
  const totalHours = data.weeklyLog.reduce((sum, log) => sum + log.hours, 0);
  const totalTasks = data.months.reduce((sum, month) => sum + month.tasks.length, 0);
  const completedTasks = data.months.reduce(
    (sum, month) => sum + month.tasks.filter((t) => t.done).length,
    0
  );
  const monthsComplete = data.months.filter((m) => m.status === "complete").length;
  const portfolioComplete = data.portfolio.filter((p) => p.status === "complete").length;
  const competenciesComplete = data.competencyChecklist.filter((c) => c.done).length;
  const overallProgress = Math.round(
    ((monthsComplete + portfolioComplete + competenciesComplete) / (12 + 5 + 17)) * 100
  );

  const monthlyBreakdown = data.months.map((month) => ({
    month: month.id,
    title: month.title,
    status: month.status,
    tasksCompleted: month.tasks.filter((t) => t.done).length,
    totalTasks: month.tasks.length,
  }));

  return {
    title: "Progress Report",
    generatedAt: new Date().toISOString(),
    summary: {
      totalHours,
      totalTasks,
      completedTasks,
      monthsComplete,
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      overallProgress,
    },
    monthlyBreakdown,
    weeklyLog: data.weeklyLog,
    achievements: data.achievements,
    gamification: data.gamification
      ? {
          level: data.gamification.level,
          totalXP: data.gamification.totalXP,
          badges: data.gamification.badges,
        }
      : undefined,
  };
}

export function exportToJSON(data: AppData): string {
  const report = generateReport(data);
  return JSON.stringify(report, null, 2);
}

export function exportToCSV(data: AppData): string {
  const report = generateReport(data);

  // Create CSV header
  let csv = "Date,Hours,Focus\n";

  // Add weekly log data
  report.weeklyLog.forEach((log) => {
    csv += `${log.date},${log.hours},"${log.focus}"\n`;
  });

  return csv;
}

export function generateShareableLink(data: AppData): string {
  // In a real implementation, this would create a unique URL
  // For now, we'll generate a mock link
  const hash = btoa(JSON.stringify(generateReport(data))).substring(0, 20);
  return `https://progress-tracker.app/share/${hash}`;
}

export function generateHTMLReport(data: AppData): string {
  const report = generateReport(data);

  return `
<!DOCTYPE html>
<html>
<head>
  <title>${report.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stat { display: inline-block; margin: 10px 20px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
    .stat-label { font-size: 14px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
    .badge { display: inline-block; padding: 4px 8px; background: #3b82f6; color: white; border-radius: 4px; margin: 2px; }
  </style>
</head>
<body>
  <h1>${report.title}</h1>
  <p>Generated: ${new Date(report.generatedAt).toLocaleString()}</p>

  <div class="summary">
    <div class="stat">
      <div class="stat-value">${report.summary.totalHours.toFixed(1)}h</div>
      <div class="stat-label">Total Hours</div>
    </div>
    <div class="stat">
      <div class="stat-value">${report.summary.overallProgress}%</div>
      <div class="stat-label">Complete</div>
    </div>
    <div class="stat">
      <div class="stat-value">${report.summary.currentStreak}</div>
      <div class="stat-label">Day Streak</div>
    </div>
    <div class="stat">
      <div class="stat-value">${report.summary.completedTasks}/${report.summary.totalTasks}</div>
      <div class="stat-label">Tasks</div>
    </div>
  </div>

  <h2>Monthly Progress</h2>
  <table>
    <tr>
      <th>Month</th>
      <th>Status</th>
      <th>Tasks</th>
    </tr>
    ${report.monthlyBreakdown
      .map(
        (m) => `
    <tr>
      <td>${m.title}</td>
      <td>${m.status}</td>
      <td>${m.tasksCompleted}/${m.totalTasks}</td>
    </tr>
  `
      )
      .join("")}
  </table>

  <h2>Achievements</h2>
  <div>
    ${report.achievements.map((a) => `<span class="badge">${a}</span>`).join("")}
  </div>

  ${report.gamification ? `
  <h2>Gamification</h2>
  <div class="summary">
    <div class="stat">
      <div class="stat-value">Level ${report.gamification.level}</div>
      <div class="stat-label">Current Level</div>
    </div>
    <div class="stat">
      <div class="stat-value">${report.gamification.totalXP}</div>
      <div class="stat-label">Total XP</div>
    </div>
  </div>
  ` : ''}
</body>
</html>
  `.trim();
}

export function downloadReport(data: AppData, format: "json" | "csv" | "html") {
  let content: string;
  let filename: string;
  let mimeType: string;

  switch (format) {
    case "json":
      content = exportToJSON(data);
      filename = `progress-report-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
      break;
    case "csv":
      content = exportToCSV(data);
      filename = `progress-report-${new Date().toISOString().split("T")[0]}.csv`;
      mimeType = "text/csv";
      break;
    case "html":
      content = generateHTMLReport(data);
      filename = `progress-report-${new Date().toISOString().split("T")[0]}.html`;
      mimeType = "text/html";
      break;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
