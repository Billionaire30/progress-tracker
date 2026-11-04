export type MonthStatus = "not-started" | "in-progress" | "complete";
export type PortfolioStatus = "not-started" | "in-progress" | "complete";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in-progress" | "review" | "done";

export interface Subtask {
  id: string;
  label: string;
  done: boolean;
}

export interface Task {
  id: string;          // e.g. "m1-t1"
  label: string;
  done: boolean;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  subtasks?: Subtask[];
  dependencies?: string[]; // IDs of tasks that must be completed first
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string; // YYYY-MM-DD
  createdAt?: string;
  completedAt?: string;
}

export interface Month {
  id: number;              // 1..12
  title: string;           // e.g. "Engineering & Construction Foundation"
  focus: string;           // e.g. "AutoCAD + Excel"
  software: string[];      // e.g. ["AutoCAD", "Excel"]
  project: string;         // project description
  portfolioOutput: string; // expected output
  learningTopics: string[];// bullet topics from the document
  status: MonthStatus;
  tasks: Task[];           // user breaks project into these
  image?: string;          // hero image path
  notes?: string;          // User notes
  deadline?: string;       // Target completion date (YYYY-MM-DD)
}

export interface WeeklyLogEntry {
  id: string;       // uuid
  date: string;     // "YYYY-MM-DD"
  hours: number;    // e.g. 1.5
  focus: string;    // e.g. "Engineering theory"
}

export interface CompetencyItem {
  id: string;       // "c1".."c17"
  label: string;
  done: boolean;
}

export interface PortfolioItem {
  id: number;       // 1..5
  name: string;
  description: string;
  status: PortfolioStatus;
  image?: string;   // hero image path
  notes?: string;   // User notes
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  image?: string;
  skills: string[];
  notes?: string;
}

export interface Preferences {
  theme?: "light" | "dark" | "system";
  showChartAsTable?: boolean;
  dashboardLayout?: string;
  quietHours?: { start: string; end: string };
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
}

export interface WorkspaceData {
  version: number;
  months: Month[];
  weeklyLog: WeeklyLogEntry[];
  competencyChecklist: CompetencyItem[];
  portfolio: PortfolioItem[];
  startDate: string;
  preferences: Preferences;
  lastUpdated: string;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  weeklyGoal?: number;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  lastAccessed: string;
  data: WorkspaceData; // The actual progress data for this workspace (without workspaces to avoid circular reference)
  isTemplate?: boolean;
  templateId?: string;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: "hours" | "tasks" | "streak" | "focus";
  target: number;
  current: number;
  completed: boolean;
  expiresAt: string;
  rewardXP: number;
}

export interface Gamification {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  badges: string[];
  currentStreakBonus: number;
  dailyChallenges: DailyChallenge[];
  weeklyChallengesCompleted: number;
  currency?: number;
  purchasedRewards?: string[];
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: "productivity" | "health" | "learning" | "mindfulness";
  target: number;
  currentStreak: number;
  completedDates: string[];
  color: string;
  status?: "active" | "paused" | "archived";  // habit lifecycle
  pausedUntil?: string | null;   // YYYY-MM-DD, auto-resume
  contributesToStudy?: boolean;  // links to study hours
  studyUnitHours?: number;       // hours this habit contributes per completion
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "study" | "break" | "review" | "deadline";
  completed: boolean;
  synced: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  icon: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, any>;
  userId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  taskId?: string;
  workspaceId?: string;
  syncedWithGoogle?: boolean;
  googleEventId?: string;
  recurrence?: string;
}

export interface Friend {
  userId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  addedAt: string;
  lastActiveAt?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromDisplayName: string;
  fromEmail: string;
  fromPhotoURL?: string;
  toUserId: string;
  toEmail?: string; // For users who haven't signed in yet
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  respondedAt?: string;
}

export interface PublicProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  overallProgress: number;
  currentStreak: number;
  longestStreak: number;
  totalHours: number;
  level: number;
  totalXP: number;
  badges: string[];
  monthsCompleted: number;
  lastUpdated: string;
  premiumTier?: "free" | "basic" | "premium" | "elite";
  messagingEnabled?: boolean;
}

export type MessageStatus = "sent" | "delivered" | "read";
export type MessageType = "text" | "emoji" | "image" | "voice" | "reaction" | "system";

export interface Message {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  replyTo?: string; // ID of message being replied to
  reactions?: Reaction[];
  isEncrypted?: boolean;
  expiresAt?: string; // For ephemeral messages
}

export interface Reaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  isArchived?: boolean;
  muteUntil?: string;
  typingUsers?: string[]; // User IDs currently typing
}

export interface MessagingSettings {
  ephemeralMessagesEnabled: boolean;
  ephemeralMessageDuration: number; // hours
  readReceiptsEnabled: boolean;
  typingIndicatorsEnabled: boolean;
  messageReactionEnabled: boolean;
  messageEditingEnabled: boolean;
  messageDeletionEnabled: boolean;
  voiceMessagesEnabled: boolean;
  imageMessagesEnabled: boolean;
  maxMessageLength: number;
  dailyMessageLimit?: number;
  messageHistoryDays?: number;
}

export interface AppData {
  version: number; // Data schema version for migrations
  months: Month[];
  weeklyLog: WeeklyLogEntry[];
  competencyChecklist: CompetencyItem[];
  portfolio: PortfolioItem[];
  certificates?: Certificate[];
  startDate: string; // "YYYY-MM-DD" — when the user began Month 1
  preferences: Preferences;
  lastUpdated: string; // ISO timestamp
  currentStreak: number; // consecutive days with logged hours
  longestStreak: number;
  achievements: string[]; // unlocked achievement IDs
  weeklyGoal?: number; // Custom weekly hour goal (default: 20)
  // New premium features
  workspaces?: Workspace[];
  activeWorkspaceId?: string;
  gamification?: Gamification;
  auditLog?: AuditLog[];
  calendarEvents?: CalendarEvent[];
  integrations?: {
    notion?: { connected: boolean; pageId?: string; lastSync?: string };
    googleCalendar?: { connected: boolean; accessToken?: string; lastSync?: string };
    toggl?: { connected: boolean; apiKey?: string; lastSync?: string };
    dropbox?: { connected: boolean; accessToken?: string; lastSync?: string };
  };
  collaboration?: {
    teamId?: string;
    mentorId?: string;
    menteeIds?: string[];
  };
  habits?: Habit[];
  schedule?: ScheduleEvent[];
  theme?: ThemePreset;
  // Friends system
  friends?: Friend[];
  friendRequests?: FriendRequest[];
  profileVisibility?: "public" | "friends-only" | "private";
  // Messaging system
  conversations?: Conversation[];
  messagingSettings?: MessagingSettings;
  premiumTier?: "free" | "basic" | "premium" | "elite";
  premiumActivatedAt?: string;
  premiumExpiresAt?: string;
}

export interface PremiumTier {
  id: "free" | "basic" | "premium" | "elite";
  name: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  messagingFeatures: MessagingSettings;
  maxFriends: number;
  xpMultiplier: number;
  badge?: string;
  color: string;
}

export const PREMIUM_TIERS: PremiumTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "monthly",
    features: [
      "Basic progress tracking",
      "Unlimited friends",
      "Unlimited messages",
      "Read receipts",
      "Typing indicators",
      "Message reactions",
      "Message editing (10 min)",
      "Message deletion",
      "Voice messages",
      "Image sharing",
      "Ephemeral messages (24h)",
      "Standard support"
    ],
    messagingFeatures: {
      ephemeralMessagesEnabled: true,
      ephemeralMessageDuration: 24,
      readReceiptsEnabled: true,
      typingIndicatorsEnabled: true,
      messageReactionEnabled: true,
      messageEditingEnabled: true,
      messageDeletionEnabled: true,
      voiceMessagesEnabled: true,
      imageMessagesEnabled: true,
      maxMessageLength: 2000,
      dailyMessageLimit: Infinity,
      messageHistoryDays: 365
    },
    maxFriends: Infinity,
    xpMultiplier: 1.0,
    color: "#6b7280"
  }
];

const createInitialWorkspace = (months: Month[], weeklyLog: WeeklyLogEntry[], competencyChecklist: CompetencyItem[], portfolio: PortfolioItem[]): Workspace => ({
  id: "default",
  name: "Civil Engineering",
  description: "Default civil engineering curriculum",
  color: "#3b82f6",
  icon: "🏗️",
  createdAt: new Date().toISOString(),
  lastAccessed: new Date().toISOString(),
  data: {
    version: 3,
    months,
    weeklyLog,
    competencyChecklist,
    portfolio,
    startDate: "",
    preferences: {},
    lastUpdated: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
    achievements: [],
    weeklyGoal: 20
  } as WorkspaceData,
  isTemplate: false
});

import { DEFAULT_HABITS, COMPETENCY_CHECKLIST, PORTFOLIO_ITEMS, DEFAULT_SETTINGS } from "@/constants/seedData";

export const initialData: AppData = {
  version: 4,
  months: [
    {
      id: 1,
      title: "Engineering & Construction Foundation",
      focus: "AutoCAD + Excel",
      software: ["AutoCAD", "Excel"],
      project: "Create a simple two-storey building concept drawing with site plan, floor plan, elevation, section, foundation concept and basic construction details.",
      portfolioOutput: "Construction drawing + quantity sheet",
      learningTopics: [
        "Engineering fundamentals: mechanics, materials, surveying, structures, soils, hydraulics, transportation",
        "Construction sequence: site clearance to finishes",
        "AutoCAD: layers, blocks, hatching, dimensions, layouts, viewports, Xrefs, plotting",
        "Excel: formulas, IF, SUM, AVERAGE, XLOOKUP, tables, filters, conditional formatting"
      ],
      status: "not-started",
      tasks: [],
      image: "/thisisengineering-hoivM01c-vg-unsplash.jpg"
    },
    {
      id: 2,
      title: "Surveying & Site Development",
      focus: "Civil 3D",
      software: ["Civil 3D"],
      project: "Use a small survey dataset to produce points, an existing-ground surface, contours, a topographic plan and a longitudinal profile.",
      portfolioOutput: "Existing-ground survey and surface",
      learningTopics: [
        "Surveying: total station, GNSS, levelling, benchmarks, coordinates, setting out",
        "Civil 3D: import points, point groups, surfaces, contours, breaklines, surface analysis"
      ],
      status: "not-started",
      tasks: [],
      image: "/jacek-dylag-nhCPOp4A2Xo-unsplash.jpg"
    },
    {
      id: 3,
      title: "Road Geometric Design",
      focus: "Civil 3D",
      software: ["Civil 3D"],
      project: "Design a 1–2 km road including existing ground, horizontal alignment, vertical alignment, plan/profile and typical cross-section.",
      portfolioOutput: "Complete road alignment",
      learningTopics: [
        "Horizontal alignment: tangents, curves, radius, deflection angle, chainage, PI/PC/PT, superelevation, transition curves",
        "Vertical alignment: existing profile, proposed profile, grade, crest/sag curves, K-value",
        "Civil 3D: alignment creation, profile views, profile layout"
      ],
      status: "not-started",
      tasks: [],
      image: "/scott-blake-x-ghf9LjrVg-unsplash.jpg"
    },
    {
      id: 4,
      title: "Road Construction & Pavement",
      focus: "Civil 3D + Excel",
      software: ["Civil 3D", "Excel"],
      project: "Complete the Month 3 road through assembly, corridor, cross sections, earthwork quantities and construction drawings. Portfolio Project #1.",
      portfolioOutput: "Road design, corridor and quantities",
      learningTopics: [
        "Pavement structure: subgrade, subbase, base course, asphalt",
        "Construction: CBR, compaction, moisture, grading, prime/tack coat, asphalt placement",
        "Equipment: excavator, grader, bulldozer, roller, water bowser, paver, dump truck, loader",
        "Civil 3D: assemblies, corridors, targets, sample lines, cross sections, materials, volumes"
      ],
      status: "not-started",
      tasks: [],
      image: "/danny-lau-HlAmpNz6nOc-unsplash.jpg"
    },
    {
      id: 5,
      title: "Drainage & Infrastructure",
      focus: "Civil 3D",
      software: ["Civil 3D"],
      project: "Design drainage for the road, including drainage plan/profile, culvert concept, typical drain section, hydraulic calculations and quantity estimate.",
      portfolioOutput: "Drainage design",
      learningTopics: [
        "Hydrology: catchment, rainfall, runoff, rational method, return period, peak discharge",
        "Drainage: side drains, culverts, catchpits, manholes, channels, stormwater pipes, outfalls",
        "Hydraulics: flow, velocity, Manning's equation, hydraulic radius, channel capacity",
        "Civil 3D: pipe networks, structures, profiles, drainage layouts"
      ],
      status: "not-started",
      tasks: [],
      image: "/siyuan-hu-VKNI1KOVFo8-unsplash.jpg"
    },
    {
      id: 6,
      title: "Building Construction",
      focus: "AutoCAD + building modelling",
      software: ["AutoCAD"],
      project: "Develop a small two-storey building with site plan, floor plans, elevations, sections, foundation plan, column layout, beam layout and slab layout. Portfolio Project #2.",
      portfolioOutput: "Two-storey building project",
      learningTopics: [
        "Building sequence: setting out to finishes",
        "Foundations: strip, pad, raft, pile",
        "Concrete: cement, aggregates, water, mix concepts, slump, curing, strength",
        "Reinforcement: main bars, distribution bars, stirrups, links, laps, cover, bar bending schedules"
      ],
      status: "not-started",
      tasks: [],
      image: "/mads-eneqvist-J9jYy9S1zAk-unsplash.jpg"
    },
    {
      id: 7,
      title: "Structural Design",
      focus: "ETABS / STAAD.Pro / SAP2000",
      software: ["ETABS", "STAAD.Pro", "SAP2000"],
      project: "Model the Month 6 building, apply loads, analyse the structure, review member forces, perform design checks and produce representative reinforcement/structural drawings.",
      portfolioOutput: "Structural model + calculations",
      learningTopics: [
        "Load path: slab → beam → column → foundation → soil",
        "Loads: dead, live, environmental; load combinations; bending, shear, axial force, deflection",
        "Choose one package: ETABS, STAAD.Pro or SAP2000",
        "Interpret software output using engineering principles"
      ],
      status: "not-started",
      tasks: [],
      image: "/mikita-yo-U41u8rodlKw-unsplash.jpg"
    },
    {
      id: 8,
      title: "Construction Management",
      focus: "Excel + MS Project / P6",
      software: ["Excel", "MS Project", "Primavera P6"],
      project: "Prepare a construction programme for the two-storey building, including a Gantt chart, activity dependencies and a basic resource plan.",
      portfolioOutput: "Construction programme",
      learningTopics: [
        "WBS, activities, dependencies, durations, critical path, resources, sequencing",
        "Site management: labour, materials, plant, productivity, logistics, QC, safety",
        "Microsoft Project first; Primavera P6 later"
      ],
      status: "not-started",
      tasks: [],
      image: "/john-kakuk-HvvPceHYLOg-unsplash.jpg"
    },
    {
      id: 9,
      title: "Quantities & Cost Estimation",
      focus: "Excel",
      software: ["Excel"],
      project: "Prepare a simplified BOQ and cost estimate for the building and road projects.",
      portfolioOutput: "BOQ + cost estimate",
      learningTopics: [
        "Measurement of length, area, volume, weight, item counts",
        "Quantities: excavation, concrete, reinforcement, formwork, blockwork, plastering, roofing, painting, earthworks, pavement",
        "BOQ structure: description, unit, quantity, rate, amount",
        "Excel automation of quantities and cost"
      ],
      status: "not-started",
      tasks: [],
      image: "/ricardo-gomez-angel-7bzbyafVTYg-unsplash.jpg"
    },
    {
      id: 10,
      title: "Integrated Infrastructure Project",
      focus: "Civil 3D + AutoCAD",
      software: ["Civil 3D", "AutoCAD"],
      project: "Complete an integrated community/residential infrastructure development. Portfolio Project #3.",
      portfolioOutput: "Complete infrastructure project",
      learningTopics: [
        "Site analysis: terrain, contours, drainage, elevations, constraints",
        "Road network: horizontal, vertical, cross sections",
        "Earthworks: cut, fill, volumes",
        "Drainage: catchments, channels, culverts, stormwater network",
        "Building: representative two-storey structure",
        "Quantities, cost, programme"
      ],
      status: "not-started",
      tasks: [],
      image: "/encata-pd-ZmDk8tXQRS0-unsplash.jpg"
    },
    {
      id: 11,
      title: "Site Engineering & Professional Practice",
      focus: "All relevant tools",
      software: ["All relevant tools"],
      project: "Seek meaningful exposure to a road, building or infrastructure project. Maintain a site diary.",
      portfolioOutput: "Site documentation and field experience",
      learningTopics: [
        "Road observations: setting out, earthworks, grading, compaction, pavement, drainage, asphalt",
        "Building observations: setting out, excavation, reinforcement, formwork, concrete, masonry, roofing, finishes",
        "Site diary: date, project, activity, observations, principle, equipment, materials, problems, solutions, lessons",
        "QA/QC, HSE, method statements, inspection, technical reporting"
      ],
      status: "not-started",
      tasks: [],
      image: "/josue-isai-ramos-figueroa-qvBYnMuNJ9A-unsplash.jpg"
    },
    {
      id: 12,
      title: "Capstone Project & Professional Portfolio",
      focus: "All relevant tools",
      software: ["All relevant tools"],
      project: "Community Infrastructure Development Project — survey → analysis → road → drainage → building → quantities → cost → programme → drawings → technical report.",
      portfolioOutput: "Professional engineering portfolio",
      learningTopics: [
        "Integrate all major skills learned throughout the year",
        "Produce a professional drawing and report package"
      ],
      status: "not-started",
      tasks: [],
      image: "/alexander-nariswari-6hvnSzBSNyI-unsplash.jpg"
    }
  ],
  weeklyLog: [],
  competencyChecklist: COMPETENCY_CHECKLIST,
  portfolio: PORTFOLIO_ITEMS,
  startDate: "",
  preferences: {},
  lastUpdated: new Date().toISOString(),
  currentStreak: 0,
  longestStreak: 0,
  achievements: [],
  weeklyGoal: DEFAULT_SETTINGS.weeklyGoalHours,
  workspaces: [],
  activeWorkspaceId: "default",
  gamification: {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    badges: [],
    currentStreakBonus: 1,
    dailyChallenges: [],
    weeklyChallengesCompleted: 0,
    currency: 0,
    purchasedRewards: []
  },
  auditLog: [],
  calendarEvents: [],
  integrations: {
    notion: { connected: false },
    googleCalendar: { connected: false },
    toggl: { connected: false },
    dropbox: { connected: false }
  },
  collaboration: {},
  habits: [],
  schedule: [],
  friends: [],
  friendRequests: [],
  profileVisibility: "friends-only"
};

// Helper to initialize workspace with data
export const initializeDefaultWorkspace = (data: AppData): AppData => {
  if (!data.workspaces || data.workspaces.length === 0) {
    const workspace = createInitialWorkspace(data.months, data.weeklyLog, data.competencyChecklist, data.portfolio);
    data.workspaces = [workspace];
  }
  return data;
};
