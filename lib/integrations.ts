import { AppData } from "./data";

export interface IntegrationConfig {
  id: string;
  name: string;
  connected: boolean;
  lastSync?: string;
  settings?: Record<string, any>;
}

export function connectIntegration(
  data: AppData,
  integrationId: string,
  settings: Record<string, any>
): AppData {
  if (!data.integrations) {
    data.integrations = {
      notion: { connected: false, lastSync: undefined },
      googleCalendar: { connected: false, lastSync: undefined },
      toggl: { connected: false, lastSync: undefined },
      dropbox: { connected: false, lastSync: undefined },
    };
  }

  const now = new Date().toISOString();

  switch (integrationId) {
    case "notion":
      data.integrations.notion = { connected: true, lastSync: now, ...settings };
      break;
    case "googleCalendar":
      data.integrations.googleCalendar = { connected: true, lastSync: now, ...settings };
      break;
    case "toggl":
      data.integrations.toggl = { connected: true, lastSync: now, ...settings };
      break;
    case "dropbox":
      data.integrations.dropbox = { connected: true, lastSync: now, ...settings };
      break;
  }

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `integration-connect-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "integration_connected",
    entity: "integration",
    entityId: integrationId,
    changes: settings,
  });

  return data;
}

export function disconnectIntegration(data: AppData, integrationId: string): AppData {
  if (!data.integrations) return data;

  switch (integrationId) {
    case "notion":
      data.integrations.notion = { connected: false, lastSync: undefined };
      break;
    case "googleCalendar":
      data.integrations.googleCalendar = { connected: false, lastSync: undefined };
      break;
    case "toggl":
      data.integrations.toggl = { connected: false, lastSync: undefined };
      break;
    case "dropbox":
      data.integrations.dropbox = { connected: false, lastSync: undefined };
      break;
  }

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `integration-disconnect-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "integration_disconnected",
    entity: "integration",
    entityId: integrationId,
  });

  return data;
}

export function syncWithNotion(data: AppData): Promise<AppData> {
  // In a real implementation, this would sync with Notion API
  return new Promise((resolve) => {
    // Mock sync
    setTimeout(() => {
      if (data.integrations?.notion?.connected) {
        console.log("Synced with Notion");
      }
      resolve(data);
    }, 1000);
  });
}

export function syncWithToggl(data: AppData): Promise<AppData> {
  // In a real implementation, this would sync with Toggl API
  return new Promise((resolve) => {
    setTimeout(() => {
      if (data.integrations?.toggl?.connected) {
        console.log("Synced with Toggl");
      }
      resolve(data);
    }, 1000);
  });
}

export function backupToDropbox(data: AppData): Promise<AppData> {
  // In a real implementation, this would backup to Dropbox API
  return new Promise((resolve) => {
    setTimeout(() => {
      if (data.integrations?.dropbox?.connected) {
        console.log("Backed up to Dropbox");
      }
      resolve(data);
    }, 1000);
  });
}

export function getIntegrationsList(data: AppData): IntegrationConfig[] {
  if (!data.integrations) return [];

  return [
    {
      id: "notion",
      name: "Notion",
      connected: data.integrations.notion?.connected || false,
      lastSync: data.integrations.notion?.lastSync,
    },
    {
      id: "googleCalendar",
      name: "Google Calendar",
      connected: data.integrations.googleCalendar?.connected || false,
      lastSync: data.integrations.googleCalendar?.lastSync,
    },
    {
      id: "toggl",
      name: "Toggl",
      connected: data.integrations.toggl?.connected || false,
      lastSync: data.integrations.toggl?.lastSync,
    },
    {
      id: "dropbox",
      name: "Dropbox",
      connected: data.integrations.dropbox?.connected || false,
      lastSync: data.integrations.dropbox?.lastSync,
    },
  ];
}
