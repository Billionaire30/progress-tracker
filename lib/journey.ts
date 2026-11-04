/**
 * Journey progress calculation
 * Weighted composite: 40% time, 30% competencies, 20% study, 10% portfolio
 */

import { AppData } from '@/lib/data';
import { getToday, daysBetween } from './timezone';

export interface JourneyProgress {
  overall: number;
  timeProgress: number;
  competencyProgress: number;
  studyProgress: number;
  portfolioProgress: number;
  pace: 'ahead' | 'on-pace' | 'behind';
  rationale: string;
}

export function computeJourneyProgress(data: AppData): JourneyProgress {
  const { startDate, competencyChecklist, weeklyLog, portfolio, months } = data;
  const today = getToday();

  // Time progress (40%)
  const startDateValue = startDate || today;
  const targetEndDate = addDays(startDateValue, 365);
  const totalDays = daysBetween(startDateValue, targetEndDate);
  const daysElapsed = daysBetween(startDateValue, today);
  const timeProgress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));

  // Competency progress (30%)
  const totalCompetencies = competencyChecklist.length;
  const completedCompetencies = competencyChecklist.filter((c: any) => c.done).length;
  const competencyProgress = totalCompetencies > 0 ? (completedCompetencies / totalCompetencies) * 100 : 0;

  // Study progress (20%)
  const annualTarget = 1040;
  const totalHours = weeklyLog.reduce((sum: number, entry: any) => sum + entry.hours, 0);
  const studyProgress = Math.min(100, (totalHours / annualTarget) * 100);

  // Portfolio progress (10%)
  const totalPortfolio = portfolio.length;
  const completedPortfolio = portfolio.filter((p: any) => p.status === 'complete').length;
  const portfolioProgress = totalPortfolio > 0 ? (completedPortfolio / totalPortfolio) * 100 : 0;

  // Weighted composite
  const overall = (timeProgress * 0.4) + 
                  (competencyProgress * 0.3) + 
                  (studyProgress * 0.2) + 
                  (portfolioProgress * 0.1);

  // Pace calculation
  const expectedCompetencies = Math.floor((daysElapsed / totalDays) * totalCompetencies);
  const competencyDiff = completedCompetencies - expectedCompetencies;
  
  const expectedStudyHours = (daysElapsed / totalDays) * annualTarget;
  const studyDiff = totalHours - expectedStudyHours;

  let pace: 'ahead' | 'on-pace' | 'behind' = 'on-pace';
  let rationale = '';

  if (competencyDiff >= 2 && studyDiff >= 0) {
    pace = 'ahead';
    rationale = `You're ${competencyDiff} competencies ahead of pace and on track for study hours.`;
  } else if (competencyDiff <= -2 || studyDiff < -10) {
    pace = 'behind';
    rationale = `You're ${Math.abs(competencyDiff)} competencies behind pace. Focus on one this week.`;
  } else {
    pace = 'on-pace';
    rationale = `You're ${competencyDiff === 0 ? 'right on' : competencyDiff > 0 ? 'slightly ahead' : 'slightly behind'} your expected progress.`;
  }

  return {
    overall: Math.round(overall),
    timeProgress: Math.round(timeProgress),
    competencyProgress: Math.round(competencyProgress),
    studyProgress: Math.round(studyProgress),
    portfolioProgress: Math.round(portfolioProgress),
    pace,
    rationale,
  };
}

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
