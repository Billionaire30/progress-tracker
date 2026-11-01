import { AppData } from "./data";

export function exportToPDF(data: AppData) {
  // Using window.print() as a simple PDF export solution
  // For production, you would use libraries like jsPDF or react-pdf
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    const totalHours = data.weeklyLog.reduce((sum, log) => sum + log.hours, 0);
    const monthsComplete = data.months.filter((m) => m.status === "complete").length;
    const competenciesComplete = data.competencyChecklist.filter((c) => c.done).length;
    const overallProgress = Math.round(
      ((monthsComplete + data.portfolio.filter((p) => p.status === "complete").length + competenciesComplete) / (12 + 5 + 17)) * 100
    );

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Progress Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #2563eb; }
          .summary { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .section { margin: 30px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #2563eb; color: white; }
          .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; }
          .progress-fill { background: #2563eb; height: 100%; }
        </style>
      </head>
      <body>
        <h1>Progress Tracker Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        
        <div class="summary">
          <h2>Overall Progress</h2>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${overallProgress}%"></div>
          </div>
          <p>${overallProgress}% Complete</p>
          <ul>
            <li>Total Hours: ${totalHours.toFixed(1)}</li>
            <li>Months Complete: ${monthsComplete}/12</li>
            <li>Competencies: ${competenciesComplete}/17</li>
            <li>Current Streak: ${data.currentStreak} days</li>
          </ul>
        </div>

        <div class="section">
          <h2>Monthly Progress</h2>
          <table>
            <tr>
              <th>Month</th>
              <th>Title</th>
              <th>Status</th>
              <th>Tasks Complete</th>
            </tr>
            ${data.months.map((month) => `
              <tr>
                <td>${month.id}</td>
                <td>${month.title}</td>
                <td>${month.status}</td>
                <td>${month.tasks.filter((t) => t.done).length}/${month.tasks.length}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div class="section">
          <h2>Study Log</h2>
          <table>
            <tr>
              <th>Date</th>
              <th>Hours</th>
              <th>Focus</th>
            </tr>
            ${data.weeklyLog.slice(-20).map((log) => `
              <tr>
                <td>${log.date}</td>
                <td>${log.hours}</td>
                <td>${log.focus}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}

export function exportToExcel(data: AppData) {
  // Create CSV content for Excel import
  const totalHours = data.weeklyLog.reduce((sum, log) => sum + log.hours, 0);
  
  let csv = "Progress Tracker Export\n";
  csv += `Generated on,${new Date().toLocaleDateString()}\n\n`;
  
  csv += "Overall Progress\n";
  csv += `Total Hours,${totalHours.toFixed(1)}\n`;
  csv += `Months Complete,${data.months.filter((m) => m.status === "complete").length}\n`;
  csv += `Competencies Complete,${data.competencyChecklist.filter((c) => c.done).length}\n`;
  csv += `Current Streak,${data.currentStreak}\n\n`;
  
  csv += "Monthly Progress\n";
  csv += "Month,Title,Status,Progress,Focus\n";
  data.months.forEach((month) => {
    const progress = month.tasks.length > 0 
      ? ((month.tasks.filter((t) => t.done).length / month.tasks.length) * 100).toFixed(1)
      : "0";
    csv += `${month.id},"${month.title}",${month.status},${progress}%,"${month.focus}"\n`;
  });
  
  csv += "\nStudy Log\n";
  csv += "Date,Hours,Focus\n";
  data.weeklyLog.forEach((log) => {
    csv += `${log.date},${log.hours},"${log.focus}"\n`;
  });
  
  csv += "\nCompetencies\n";
  csv += "ID,Label,Completed\n";
  data.competencyChecklist.forEach((comp) => {
    csv += `${comp.id},"${comp.label}",${comp.done ? "Yes" : "No"}\n`;
  });
  
  // Create download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `progress-tracker-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportDetailedReport(data: AppData) {
  // Generate a comprehensive HTML report
  const overallProgress = Math.round(
    ((data.months.filter((m) => m.status === "complete").length + 
      data.portfolio.filter((p) => p.status === "complete").length + 
      data.competencyChecklist.filter((c) => c.done).length) / (12 + 5 + 17)) * 100
  );

  const report = `
<!DOCTYPE html>
<html>
<head>
  <title>Progress Tracker - Detailed Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; padding: 40px; background: #f9fafb; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
    .header h1 { color: #1e40af; font-size: 2.5em; margin-bottom: 10px; }
    .header p { color: #6b7280; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
    .summary-card h3 { font-size: 0.9em; opacity: 0.9; margin-bottom: 5px; }
    .summary-card .value { font-size: 2em; font-weight: bold; }
    .section { margin: 40px 0; }
    .section h2 { color: #1e40af; font-size: 1.8em; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #1e40af; color: white; padding: 12px; text-align: left; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    tr:hover { background: #f9fafb; }
    .status-complete { color: #10b981; font-weight: bold; }
    .status-in-progress { color: #f59e0b; font-weight: bold; }
    .status-not-started { color: #6b7280; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; }
    @media print { body { padding: 0; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Progress Tracker</h1>
      <p>Detailed Progress Report</p>
      <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <h3>Overall Progress</h3>
        <div class="value">${overallProgress}%</div>
      </div>
      <div class="summary-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <h3>Total Hours</h3>
        <div class="value">${data.weeklyLog.reduce((sum, log) => sum + log.hours, 0).toFixed(1)}</div>
      </div>
      <div class="summary-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
        <h3>Current Streak</h3>
        <div class="value">${data.currentStreak} days</div>
      </div>
      <div class="summary-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
        <h3>Months Complete</h3>
        <div class="value">${data.months.filter((m) => m.status === "complete").length}/12</div>
      </div>
    </div>

    <div class="section">
      <h2>Monthly Progress</h2>
      <table>
        <tr>
          <th>Month</th>
          <th>Title</th>
          <th>Focus</th>
          <th>Status</th>
          <th>Progress</th>
        </tr>
        ${data.months.map((month) => {
          const progress = month.tasks.length > 0 
            ? ((month.tasks.filter((t) => t.done).length / month.tasks.length) * 100).toFixed(0)
            : 0;
          const statusClass = month.status === 'complete' ? 'status-complete' : 
                           month.status === 'in-progress' ? 'status-in-progress' : 'status-not-started';
          return `
            <tr>
              <td><strong>Month ${month.id}</strong></td>
              <td>${month.title}</td>
              <td>${month.focus}</td>
              <td class="${statusClass}">${month.status.replace('-', ' ')}</td>
              <td>${progress}%</td>
            </tr>
          `;
        }).join('')}
      </table>
    </div>

    <div class="section">
      <h2>Competency Checklist</h2>
      <table>
        <tr>
          <th>Competency</th>
          <th>Status</th>
        </tr>
        ${data.competencyChecklist.map((comp) => `
          <tr>
            <td>${comp.label}</td>
            <td>${comp.done ? '✓ Completed' : '○ Pending'}</td>
          </tr>
        `).join('')}
      </table>
    </div>

    <div class="section">
      <h2>Portfolio Projects</h2>
      <table>
        <tr>
          <th>Project</th>
          <th>Status</th>
          <th>Description</th>
        </tr>
        ${data.portfolio.map((proj) => `
          <tr>
            <td><strong>${proj.name}</strong></td>
            <td class="${proj.status === 'complete' ? 'status-complete' : proj.status === 'in-progress' ? 'status-in-progress' : 'status-not-started'}">${proj.status.replace('-', ' ')}</td>
            <td>${proj.description}</td>
          </tr>
        `).join('')}
      </table>
    </div>

    <div class="footer">
      <p>Keep up the great work! Every hour of study brings you closer to your goals.</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
  `;

  const blob = new Blob([report], { type: 'text/html' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `progress-report-${new Date().toISOString().split('T')[0]}.html`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
