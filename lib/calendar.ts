import { AppData, CalendarEvent } from "./data";

export function createCalendarEvent(
  data: AppData,
  event: Omit<CalendarEvent, "id">
): AppData {
  if (!data.calendarEvents) data.calendarEvents = [];

  const newEvent: CalendarEvent = {
    ...event,
    id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  data.calendarEvents.push(newEvent);

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `calendar-create-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "calendar_event_created",
    entity: "calendar_event",
    entityId: newEvent.id,
    changes: { title: event.title },
  });

  return data;
}

export function updateCalendarEvent(
  data: AppData,
  eventId: string,
  updates: Partial<CalendarEvent>
): AppData {
  if (!data.calendarEvents) return data;

  const event = data.calendarEvents.find((e) => e.id === eventId);
  if (!event) return data;

  Object.assign(event, updates);

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `calendar-update-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "calendar_event_updated",
    entity: "calendar_event",
    entityId: eventId,
    changes: updates,
  });

  return data;
}

export function deleteCalendarEvent(data: AppData, eventId: string): AppData {
  if (!data.calendarEvents) return data;

  const index = data.calendarEvents.findIndex((e) => e.id === eventId);
  if (index === -1) return data;

  data.calendarEvents.splice(index, 1);

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `calendar-delete-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "calendar_event_deleted",
    entity: "calendar_event",
    entityId: eventId,
  });

  return data;
}

export function getEventsForDate(data: AppData, date: Date): CalendarEvent[] {
  if (!data.calendarEvents) return [];

  const dateStr = date.toISOString().split("T")[0];

  return data.calendarEvents.filter((event) => {
    const eventDate = new Date(event.start);
    const eventDateStr = eventDate.toISOString().split("T")[0];
    return eventDateStr === dateStr;
  });
}

export function getEventsForWeek(data: AppData, weekStart: Date): CalendarEvent[] {
  if (!data.calendarEvents) return [];

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return data.calendarEvents.filter((event) => {
    const eventDate = new Date(event.start);
    return eventDate >= weekStart && eventDate < weekEnd;
  });
}

export function syncWithGoogleCalendar(data: AppData): AppData {
  // This would integrate with Google Calendar API
  // For now, we'll mark events as ready for sync
  if (!data.calendarEvents) return data;

  data.calendarEvents = data.calendarEvents.map((event) => ({
    ...event,
    syncedWithGoogle: data.integrations?.googleCalendar?.connected || false,
  }));

  return data;
}

export function generateStudySessionEvents(data: AppData): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();

  // Generate events for the next 7 days based on user's typical study times
  const studyHours = data.weeklyLog.reduce((acc: number[], log) => {
    const hour = new Date(log.date).getHours();
    acc.push(hour);
    return acc;
  }, []);

  if (studyHours.length === 0) {
    // Default to 9 AM if no data
    studyHours.push(9);
  }

  const avgHour = Math.round(studyHours.reduce((a, b) => a + b, 0) / studyHours.length);

  for (let i = 1; i <= 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);

    const start = new Date(date);
    start.setHours(avgHour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + 2);

    events.push({
      id: `generated-${Date.now()}-${i}`,
      title: "Study Session",
      description: "Scheduled study time",
      start: start.toISOString(),
      end: end.toISOString(),
      syncedWithGoogle: false,
    });
  }

  return events;
}
