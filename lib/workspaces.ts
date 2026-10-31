import { AppData, Workspace, WorkspaceData } from "./data";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createWorkspace(
  data: AppData,
  name: string,
  description?: string,
  color?: string,
  icon?: string
): AppData {
  if (!data.workspaces) data.workspaces = [];

  const newWorkspace: Workspace = {
    id: generateId(),
    name,
    description,
    color: color || "#3b82f6",
    icon: icon || "📁",
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    data: {
      version: data.version,
      months: [],
      weeklyLog: [],
      competencyChecklist: [],
      portfolio: [],
      startDate: "",
      preferences: {},
      lastUpdated: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      achievements: [],
      weeklyGoal: 20,
    } as WorkspaceData,
    isTemplate: false,
  };

  data.workspaces.push(newWorkspace);

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `workspace-create-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "workspace_created",
    entity: "workspace",
    entityId: newWorkspace.id,
    changes: { name, description },
  });

  return data;
}

export function deleteWorkspace(data: AppData, workspaceId: string): AppData {
  if (!data.workspaces) return data;

  const workspaceIndex = data.workspaces.findIndex((w) => w.id === workspaceId);
  if (workspaceIndex === -1) return data;

  // Prevent deleting the last workspace
  if (data.workspaces.length <= 1) {
    console.warn("Cannot delete the last workspace");
    return data;
  }

  data.workspaces.splice(workspaceIndex, 1);

  // Switch to another workspace if we deleted the active one
  if (data.activeWorkspaceId === workspaceId) {
    data.activeWorkspaceId = data.workspaces[0].id;
  }

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `workspace-delete-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "workspace_deleted",
    entity: "workspace",
    entityId: workspaceId,
  });

  return data;
}

export function switchWorkspace(data: AppData, workspaceId: string): AppData {
  if (!data.workspaces) return data;

  const workspace = data.workspaces.find((w) => w.id === workspaceId);
  if (!workspace) return data;

  data.activeWorkspaceId = workspaceId;
  workspace.lastAccessed = new Date().toISOString();

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `workspace-switch-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "workspace_switched",
    entity: "workspace",
    entityId: workspaceId,
  });

  return data;
}

export function updateWorkspace(
  data: AppData,
  workspaceId: string,
  updates: Partial<Pick<Workspace, "name" | "description" | "color" | "icon">>
): AppData {
  if (!data.workspaces) return data;

  const workspace = data.workspaces.find((w) => w.id === workspaceId);
  if (!workspace) return data;

  Object.assign(workspace, updates);

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `workspace-update-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "workspace_updated",
    entity: "workspace",
    entityId: workspaceId,
    changes: updates,
  });

  return data;
}

export function duplicateWorkspace(data: AppData, workspaceId: string): AppData {
  if (!data.workspaces) return data;

  const workspace = data.workspaces.find((w) => w.id === workspaceId);
  if (!workspace) return data;

  const duplicatedWorkspace: Workspace = {
    ...workspace,
    id: generateId(),
    name: `${workspace.name} (Copy)`,
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(workspace.data)) as WorkspaceData,
  };

  data.workspaces.push(duplicatedWorkspace);

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `workspace-duplicate-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "workspace_duplicated",
    entity: "workspace",
    entityId: duplicatedWorkspace.id,
    changes: { originalId: workspaceId },
  });

  return data;
}

export function getActiveWorkspace(data: AppData): Workspace | null {
  if (!data.workspaces || !data.activeWorkspaceId) return null;
  return data.workspaces.find((w) => w.id === data.activeWorkspaceId) || null;
}

export function createWorkspaceFromTemplate(
  data: AppData,
  templateId: string,
  name: string
): AppData {
  // This would fetch a template from a predefined list
  // For now, we'll create a basic template
  return createWorkspace(data, name, "Created from template");
}
