/**
 * Seed data for the Progress Tracker application
 * NOTE: Phase 1 uses legacy types for build compatibility
 * Phase 2 will migrate to new domain model from types/domain.ts
 */

import { Habit, CompetencyItem, PortfolioItem } from "@/lib/data";

// Default habits for new users (legacy model)
export const DEFAULT_HABITS: Omit<Habit, "id" | "completedDates" | "currentStreak">[] = [
  {
    name: "Morning Meditation",
    description: "10 minutes of meditation",
    category: "mindfulness",
    target: 5,
    color: "purple",
    status: "active",
    contributesToStudy: false,
  },
  {
    name: "Exercise",
    description: "30 minutes of physical activity",
    category: "health",
    target: 4,
    color: "green",
    status: "active",
    contributesToStudy: false,
  },
  {
    name: "Read",
    description: "20 pages of a book",
    category: "learning",
    target: 5,
    color: "blue",
    status: "active",
    contributesToStudy: false,
  },
  {
    name: "Deep Work",
    description: "2 hours of focused work",
    category: "productivity",
    target: 5,
    color: "orange",
    status: "active",
    contributesToStudy: true,
    studyUnitHours: 2,
  },
  {
    name: "Journal",
    description: "Write daily reflections",
    category: "mindfulness",
    target: 7,
    color: "pink",
    status: "active",
    contributesToStudy: false,
  },
];

// All 17 competencies (legacy model)
export const COMPETENCY_CHECKLIST: CompetencyItem[] = [
  { id: "c1", label: "Read and interpret engineering drawings.", done: false },
  { id: "c2", label: "Produce professional CAD drawings.", done: false },
  { id: "c3", label: "Create an existing-ground surface from survey data.", done: false },
  { id: "c4", label: "Develop a basic road horizontal and vertical alignment.", done: false },
  { id: "c5", label: "Create a Civil 3D corridor and cross sections.", done: false },
  { id: "c6", label: "Calculate basic earthworks quantities.", done: false },
  { id: "c7", label: "Understand pavement construction and road construction sequence.", done: false },
  { id: "c8", label: "Design basic drainage at a learning/project level.", done: false },
  { id: "c9", label: "Understand structural load paths and basic structural analysis.", done: false },
  { id: "c10", label: "Build a basic structural model in one analysis package.", done: false },
  { id: "c11", label: "Perform construction quantity take-offs.", done: false },
  { id: "c12", label: "Prepare a simplified BOQ and cost estimate.", done: false },
  { id: "c13", label: "Develop a construction programme.", done: false },
  { id: "c14", label: "Write professional technical reports.", done: false },
  { id: "c15", label: "Maintain a site diary and interpret site activities.", done: false },
  { id: "c16", label: "Present an engineering project clearly.", done: false },
  { id: "c17", label: "Maintain a professional engineering portfolio.", done: false }
];

// Portfolio items (legacy model)
export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 1,
    name: "Road Design",
    description: "Survey, alignment, profile, corridor, cross sections, earthworks, quantities",
    status: "not-started",
    image: "/flaviu-costin-CT1-lufvs1U-unsplash.jpg"
  },
  {
    id: 2,
    name: "Two-Storey Building",
    description: "Plans, elevations, sections, foundation/structural layouts, analysis outputs, quantities",
    status: "not-started",
    image: "/ricardo-gomez-angel-sYK-jN0sKBY-unsplash.jpg"
  },
  {
    id: 3,
    name: "Integrated Infrastructure Development",
    description: "Roads, drainage, site development, building, quantities, cost, programme",
    status: "not-started",
    image: "/thisisengineering-nyAzMQ6Ejgs-unsplash.jpg"
  },
  {
    id: 4,
    name: "Site Engineering Record",
    description: "Site diary, observations, QA/QC examples, HSE observations, lessons learned",
    status: "not-started",
    image: "/thisisengineering-sbVu5zitZt0-unsplash.jpg"
  },
  {
    id: 5,
    name: "Technical Writing Samples",
    description: "Calculation sheets, method statement, inspection report, technical report, presentation",
    status: "not-started",
    image: "/josue-isai-ramos-figueroa-qvBYnMuNJ9A-unsplash.jpg"
  }
];

// Competency categories for grouping
export const COMPETENCY_CATEGORIES = {
  "CAD & Surveying": ["c1", "c2", "c3", "c4", "c5", "c6"],
  "Road & Drainage": ["c7", "c8"],
  "Structural": ["c9", "c10"],
  "Construction Management": ["c11", "c12", "c13"],
  "Professional Skills": ["c14", "c15", "c16", "c17"],
};

// Portfolio categories for UI
export const PORTFOLIO_CATEGORIES = [
  { id: 'road-design', name: 'Road Design', description: 'Survey, alignment, profile, corridor, cross sections, earthworks, quantities' },
  { id: 'two-storey-building', name: 'Two-Storey Building', description: 'Plans, elevations, sections, foundation/structural layouts, analysis outputs, quantities' },
  { id: 'integrated-infrastructure', name: 'Integrated Infrastructure', description: 'Roads, drainage, site development, building, quantities, cost, programme' },
  { id: 'site-engineering-record', name: 'Site Engineering Record', description: 'Site diary, observations, QA/QC examples, HSE observations, lessons learned' },
  { id: 'technical-writing', name: 'Technical Writing', description: 'Calculation sheets, method statement, inspection report, technical report, presentation' },
  { id: 'certificates', name: 'Certificates', description: 'Professional certifications and credentials' },
];

// Milestone definitions
export const MILESTONES = [
  { id: "streak-7", type: "streak", threshold: 7, title: "7-Day Streak", description: "Complete habits for 7 consecutive days" },
  { id: "streak-30", type: "streak", threshold: 30, title: "30-Day Streak", description: "Complete habits for 30 consecutive days" },
  { id: "streak-100", type: "streak", threshold: 100, title: "100-Day Streak", description: "Complete habits for 100 consecutive days" },
  { id: "hours-10", type: "hours", threshold: 10, title: "10 Hours", description: "Log 10 study hours" },
  { id: "hours-50", type: "hours", threshold: 50, title: "50 Hours", description: "Log 50 study hours" },
  { id: "hours-100", type: "hours", threshold: 100, title: "100 Hours", description: "Log 100 study hours" },
  { id: "hours-500", type: "hours", threshold: 500, title: "500 Hours", description: "Log 500 study hours" },
  { id: "competency-first", type: "competency", threshold: 1, title: "First Competency", description: "Complete your first competency" },
  { id: "competency-all", type: "competency", threshold: 17, title: "All Competencies", description: "Complete all 17 competencies" },
  { id: "portfolio-first", type: "portfolio", threshold: 1, title: "First Portfolio Item", description: "Add your first portfolio item" },
  { id: "portfolio-complete", type: "portfolio", threshold: 5, title: "Portfolio Complete", description: "Complete all portfolio items" },
  { id: "certificate-first", type: "certificate", threshold: 1, title: "First Certificate", description: "Add your first certificate" },
];

// Default settings
export const DEFAULT_SETTINGS = {
  weeklyGoalHours: 20,
  monthlyGoalHours: 87,
  annualGoalHours: 1040,
  weekStartsOn: 1 as const,
  reminderEnabled: false,
  reminderTime: "09:00",
  theme: "system" as const,
};
