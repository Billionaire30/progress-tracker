import { AppData } from "./data";

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[];
  createdAt: string;
}

export interface Mentorship {
  mentorId: string;
  menteeIds: string[];
  status: "active" | "paused" | "ended";
  startedAt: string;
  endedAt?: string;
}

export function createTeam(data: AppData, name: string, description?: string): AppData {
  if (!data.collaboration) data.collaboration = {};

  const teamId = `team-${Date.now()}`;
  const team: Team = {
    id: teamId,
    name,
    description,
    members: [data.activeWorkspaceId || "default"],
    createdAt: new Date().toISOString(),
  };

  data.collaboration.teamId = teamId;

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `team-create-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "team_created",
    entity: "team",
    entityId: teamId,
    changes: { name, description },
  });

  return data;
}

export function joinTeam(data: AppData, teamId: string): AppData {
  if (!data.collaboration) data.collaboration = {};

  data.collaboration.teamId = teamId;

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `team-join-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "team_joined",
    entity: "team",
    entityId: teamId,
  });

  return data;
}

export function leaveTeam(data: AppData): AppData {
  if (!data.collaboration) return data;

  const teamId = data.collaboration.teamId;
  delete data.collaboration.teamId;

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `team-leave-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "team_left",
    entity: "team",
    entityId: teamId || "",
  });

  return data;
}

export function setMentor(data: AppData, mentorId: string): AppData {
  if (!data.collaboration) data.collaboration = {};

  data.collaboration.mentorId = mentorId;

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `mentor-set-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "mentor_assigned",
    entity: "mentorship",
    entityId: mentorId,
  });

  return data;
}

export function addMentee(data: AppData, menteeId: string): AppData {
  if (!data.collaboration) data.collaboration = {};
  if (!data.collaboration.menteeIds) data.collaboration.menteeIds = [];

  if (!data.collaboration.menteeIds.includes(menteeId)) {
    data.collaboration.menteeIds.push(menteeId);
  }

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `mentee-add-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "mentee_added",
    entity: "mentorship",
    entityId: menteeId,
  });

  return data;
}

export function removeMentee(data: AppData, menteeId: string): AppData {
  if (!data.collaboration?.menteeIds) return data;

  data.collaboration.menteeIds = data.collaboration.menteeIds.filter((id) => id !== menteeId);

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `mentee-remove-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "mentee_removed",
    entity: "mentorship",
    entityId: menteeId,
  });

  return data;
}

export function shareProgress(data: AppData, recipientId: string): AppData {
  // In a real implementation, this would send progress data to another user
  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `progress-share-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "progress_shared",
    entity: "share",
    entityId: recipientId,
  });

  return data;
}

export function getCollaborationStatus(data: AppData) {
  return {
    inTeam: !!data.collaboration?.teamId,
    hasMentor: !!data.collaboration?.mentorId,
    hasMentees: (data.collaboration?.menteeIds?.length || 0) > 0,
    menteeCount: data.collaboration?.menteeIds?.length || 0,
  };
}
