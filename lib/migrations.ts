import { AppData, initialData, initializeDefaultWorkspace } from "./data";

type MigrationFunction = (data: any) => AppData;

const migrations: Record<number, MigrationFunction> = {
  // Migration from version 0 (no version) to version 1
  1: (data: any): AppData => {
    return {
      ...data,
      version: 1,
    };
  },

  // Migration from version 1 to version 2
  // - Added weeklyGoal field
  // - Fixed duplicate portfolio image for Technical Writing Samples
  2: (data: any): AppData => {
    const updatedPortfolio = data.portfolio.map((item: any) => {
      if (item.id === 5 && item.image === "/thisisengineering-sbVu5zitZt0-unsplash.jpg") {
        return {
          ...item,
          image: "/josue-isai-ramos-figueroa-qvBYnMuNJ9A-unsplash.jpg",
        };
      }
      return item;
    });

    return {
      ...data,
      version: 2,
      portfolio: updatedPortfolio,
      weeklyGoal: data.weeklyGoal || 20,
    };
  },

  // Migration from version 2 to version 3
  // - Added enhanced task fields (priority, status, subtasks, dependencies, tags, etc.)
  // - Added workspaces support
  // - Added gamification system
  // - Added audit log
  // - Added calendar events
  // - Added integrations
  // - Added collaboration features
  3: (data: any): AppData => {
    // Migrate tasks to have new fields
    const updatedMonths = data.months.map((month: any) => ({
      ...month,
      tasks: month.tasks.map((task: any) => ({
        ...task,
        priority: task.priority || "medium",
        status: task.status || (task.done ? "done" : "todo"),
        subtasks: task.subtasks || [],
        dependencies: task.dependencies || [],
        tags: task.tags || [],
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        dueDate: task.dueDate,
        createdAt: task.createdAt || new Date().toISOString(),
        completedAt: task.completedAt,
      })),
    }));

    return {
      ...data,
      version: 3,
      months: updatedMonths,
      workspaces: data.workspaces || [],
      activeWorkspaceId: data.activeWorkspaceId || "default",
      gamification: data.gamification || {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        totalXP: 0,
        badges: [],
        currentStreakBonus: 1,
        dailyChallenges: [],
        weeklyChallengesCompleted: 0,
      },
      auditLog: data.auditLog || [],
      calendarEvents: data.calendarEvents || [],
      integrations: data.integrations || {
        notion: { connected: false },
        googleCalendar: { connected: false },
        toggl: { connected: false },
        dropbox: { connected: false },
      },
      collaboration: data.collaboration || {},
    };
  },

  // Migration from version 3 to version 4
  // - Added friends system (friends list, friend requests, profile visibility)
  4: (data: any): AppData => {
    return {
      ...data,
      version: 4,
      friends: data.friends || [],
      friendRequests: data.friendRequests || [],
      profileVisibility: data.profileVisibility || "friends-only",
    };
  },
};

export function migrateData(data: any): AppData {
  const currentVersion = data.version || 0;
  const targetVersion = 4; // Current schema version

  if (currentVersion >= targetVersion) {
    return data as AppData;
  }

  console.log(`Migrating data from version ${currentVersion} to ${targetVersion}`);

  let migratedData = data;

  for (let version = currentVersion + 1; version <= targetVersion; version++) {
    if (migrations[version]) {
      console.log(`Running migration ${version}`);
      migratedData = migrations[version](migratedData);
    }
  }

  // Initialize default workspace if needed
  migratedData = initializeDefaultWorkspace(migratedData);

  return migratedData;
}
