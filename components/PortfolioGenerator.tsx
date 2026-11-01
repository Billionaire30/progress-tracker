"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe, Download, ExternalLink, Code, Eye, Check } from "lucide-react";
import { useState } from "react";

export function PortfolioGenerator() {
  const { data } = useApp();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [portfolioConfig, setPortfolioConfig] = useState({
    name: "Your Name",
    title: "Civil Engineer",
    bio: "Passionate civil engineer focused on sustainable infrastructure and innovative design solutions.",
    email: "your.email@example.com",
    linkedin: "",
    github: "",
    website: "",
  });

  const generatePortfolioHTML = () => {
    const totalHours = data.weeklyLog.reduce((sum, log) => sum + log.hours, 0);
    const monthsComplete = data.months.filter((m) => m.status === "complete").length;
    const portfolioComplete = data.portfolio.filter((p) => p.status === "complete").length;
    const competenciesComplete = data.competencyChecklist.filter((c) => c.done).length;
    const overallProgress = Math.round(
      ((monthsComplete + portfolioComplete + competenciesComplete) / (12 + 5 + 17)) * 100
    );

    const completedPortfolioItems = data.portfolio.filter((p) => p.status === "complete");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${portfolioConfig.name} - ${portfolioConfig.title}</title>
  <meta name="description" content="${portfolioConfig.bio}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .portfolio-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 3em;
      margin-bottom: 10px;
      font-weight: 700;
    }
    .header p {
      font-size: 1.3em;
      opacity: 0.9;
    }
    .content {
      padding: 40px;
    }
    .section {
      margin: 40px 0;
    }
    .section h2 {
      color: #667eea;
      font-size: 2em;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #667eea;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    .stat-card .value {
      font-size: 3em;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .stat-card .label {
      font-size: 1.1em;
      opacity: 0.9;
    }
    .progress-bar {
      background: #e0e0e0;
      height: 30px;
      border-radius: 15px;
      overflow: hidden;
      margin: 20px 0;
    }
    .progress-fill {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      transition: width 0.5s ease;
    }
    .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin: 30px 0;
    }
    .project-card {
      border: 2px solid #e0e0e0;
      border-radius: 15px;
      padding: 25px;
      transition: all 0.3s ease;
    }
    .project-card:hover {
      border-color: #667eea;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
      transform: translateY(-5px);
    }
    .project-card h3 {
      color: #667eea;
      margin-bottom: 10px;
    }
    .competency-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }
    .competency-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
    }
    .competency-item.completed {
      background: #d4edda;
      color: #155724;
    }
    .competency-item .icon {
      font-size: 1.5em;
    }
    .contact-links {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin: 30px 0;
      flex-wrap: wrap;
    }
    .contact-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 30px;
      transition: all 0.3s ease;
    }
    .contact-link:hover {
      background: #764ba2;
      transform: translateY(-2px);
    }
    .footer {
      text-align: center;
      padding: 30px;
      background: #f8f9fa;
      margin-top: 40px;
      color: #666;
    }
    @media (max-width: 768px) {
      .header h1 { font-size: 2em; }
      .content { padding: 20px; }
      .project-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="portfolio-card">
      <div class="header">
        <h1>${portfolioConfig.name}</h1>
        <p>${portfolioConfig.title}</p>
        <p style="margin-top: 20px; opacity: 0.8;">${portfolioConfig.bio}</p>
      </div>

      <div class="content">
        <div class="section">
          <h2>Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="value">${totalHours.toFixed(0)}</div>
              <div class="label">Hours Logged</div>
            </div>
            <div class="stat-card">
              <div class="value">${monthsComplete}</div>
              <div class="label">Months Complete</div>
            </div>
            <div class="stat-card">
              <div class="value">${portfolioComplete}</div>
              <div class="label">Projects Done</div>
            </div>
            <div class="stat-card">
              <div class="value">${competenciesComplete}</div>
              <div class="label">Skills Mastered</div>
            </div>
          </div>

          <div class="progress-bar">
            <div class="progress-fill" style="width: ${overallProgress}%">
              ${overallProgress}% Complete
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Portfolio Projects</h2>
          <div class="project-grid">
            ${completedPortfolioItems.map((item) => `
              <div class="project-card">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                ${item.notes ? `<p style="margin-top: 10px; color: #666;"><strong>Notes:</strong> ${item.notes}</p>` : ""}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <h2>Competencies</h2>
          <div class="competency-list">
            ${data.competencyChecklist.map((comp) => `
              <div class="competency-item ${comp.done ? 'completed' : ''}">
                <span class="icon">${comp.done ? '✓' : '○'}</span>
                <span>${comp.label}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <h2>Contact</h2>
          <div class="contact-links">
            <a href="mailto:${portfolioConfig.email}" class="contact-link">
              📧 ${portfolioConfig.email}
            </a>
            ${portfolioConfig.linkedin ? `
              <a href="${portfolioConfig.linkedin}" target="_blank" class="contact-link">
                💼 LinkedIn
              </a>
            ` : ''}
            ${portfolioConfig.github ? `
              <a href="${portfolioConfig.github}" target="_blank" class="contact-link">
                💻 GitHub
              </a>
            ` : ''}
            ${portfolioConfig.website ? `
              <a href="${portfolioConfig.website}" target="_blank" class="contact-link">
                🌐 Website
              </a>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="footer">
        <p>Portfolio generated with Progress Tracker • ${new Date().toLocaleDateString()}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const downloadPortfolio = () => {
    const html = generatePortfolioHTML();
    const blob = new Blob([html], { type: "text/html" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${portfolioConfig.name.replace(/\s+/g, "-").toLowerCase()}-portfolio.html`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const previewPortfolio = () => {
    const html = generatePortfolioHTML();
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(html);
      previewWindow.document.close();
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          Professional Portfolio Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-muted-foreground">
            Generate a professional portfolio website showcasing your progress, projects, and competencies.
            Customize your information below and download a ready-to-use HTML file.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="portfolio-name">Full Name</Label>
            <Input
              id="portfolio-name"
              value={portfolioConfig.name}
              onChange={(e) => setPortfolioConfig({ ...portfolioConfig, name: e.target.value })}
              placeholder="Your Name"
            />
          </div>
          <div>
            <Label htmlFor="portfolio-title">Professional Title</Label>
            <Input
              id="portfolio-title"
              value={portfolioConfig.title}
              onChange={(e) => setPortfolioConfig({ ...portfolioConfig, title: e.target.value })}
              placeholder="Civil Engineer"
            />
          </div>
          <div>
            <Label htmlFor="portfolio-bio">Bio</Label>
            <textarea
              id="portfolio-bio"
              value={portfolioConfig.bio}
              onChange={(e) => setPortfolioConfig({ ...portfolioConfig, bio: e.target.value })}
              placeholder="A brief description about yourself..."
              className="w-full p-2 border rounded-md min-h-[100px] resize-y"
            />
          </div>
          <div>
            <Label htmlFor="portfolio-email">Email</Label>
            <Input
              id="portfolio-email"
              type="email"
              value={portfolioConfig.email}
              onChange={(e) => setPortfolioConfig({ ...portfolioConfig, email: e.target.value })}
              placeholder="your.email@example.com"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="portfolio-linkedin">LinkedIn URL</Label>
              <Input
                id="portfolio-linkedin"
                value={portfolioConfig.linkedin}
                onChange={(e) => setPortfolioConfig({ ...portfolioConfig, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <Label htmlFor="portfolio-github">GitHub URL</Label>
              <Input
                id="portfolio-github"
                value={portfolioConfig.github}
                onChange={(e) => setPortfolioConfig({ ...portfolioConfig, github: e.target.value })}
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <Label htmlFor="portfolio-website">Website URL</Label>
              <Input
                id="portfolio-website"
                value={portfolioConfig.website}
                onChange={(e) => setPortfolioConfig({ ...portfolioConfig, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={previewPortfolio} variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={downloadPortfolio} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Portfolio
          </Button>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm mb-1">Deployment Tips</h4>
              <p className="text-xs text-muted-foreground">
                After downloading, you can host your portfolio for free on GitHub Pages, Netlify, or Vercel.
                Simply upload the HTML file and you'll have a professional portfolio in minutes!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
