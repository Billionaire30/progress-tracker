import { AppData, Preferences } from "./data";

export interface Notification {
  id: string;
  type: "reminder" | "achievement" | "streak" | "deadline" | "insight";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
}

export function generateNotifications(data: AppData): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Check if user logged hours today
  const loggedToday = data.weeklyLog.some((log) => log.date === today);

  // Reminder to log hours (if not logged and it's evening)
  const hour = now.getHours();
  if (!loggedToday && hour >= 18 && hour < 22) {
    notifications.push({
      id: `reminder-hours-${Date.now()}`,
      type: "reminder",
      title: "Time to log your hours",
      message: "Don't forget to log your study hours for today!",
      timestamp: now.toISOString(),
      read: false,
      priority: "medium",
    });
  }

  // Streak protection warning
  if (data.currentStreak > 0 && !loggedToday && hour >= 20) {
    notifications.push({
      id: `streak-warning-${Date.now()}`,
      type: "streak",
      title: "Protect your streak!",
      message: `You have a ${data.currentStreak}-day streak. Log some hours to keep it going!`,
      timestamp: now.toISOString(),
      read: false,
      priority: "high",
    });
  }

  // Check for overdue tasks
  data.months.forEach((month) => {
    month.tasks.forEach((task) => {
      if (task.dueDate && !task.done) {
        const dueDate = new Date(task.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue === 0) {
          notifications.push({
            id: `deadline-today-${task.id}`,
            type: "deadline",
            title: "Task due today",
            message: `"${task.label}" is due today!`,
            timestamp: now.toISOString(),
            read: false,
            priority: "high",
          });
        } else if (daysUntilDue === 1) {
          notifications.push({
            id: `deadline-tomorrow-${task.id}`,
            type: "deadline",
            title: "Task due tomorrow",
            message: `"${task.label}" is due tomorrow.`,
            timestamp: now.toISOString(),
            read: false,
            priority: "medium",
          });
        } else if (daysUntilDue <= 3 && daysUntilDue > 0) {
          notifications.push({
            id: `deadline-soon-${task.id}`,
            type: "deadline",
            title: "Upcoming deadline",
            message: `"${task.label}" is due in ${daysUntilDue} days.`,
            timestamp: now.toISOString(),
            read: false,
            priority: "low",
          });
        } else if (daysUntilDue < 0) {
          notifications.push({
            id: `deadline-overdue-${task.id}`,
            type: "deadline",
            title: "Task overdue",
            message: `"${task.label}" was due on ${task.dueDate}.`,
            timestamp: now.toISOString(),
            read: false,
            priority: "high",
          });
        }
      }
    });
  });

  // Weekly goal reminder
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekLogs = data.weeklyLog.filter((log) => new Date(log.date) >= weekStart);
  const weekHours = weekLogs.reduce((sum, log) => sum + log.hours, 0);
  const weeklyGoal = data.weeklyGoal || 20;

  if (now.getDay() >= 5 && weekHours < weeklyGoal * 0.5) {
    notifications.push({
      id: `weekly-goal-${Date.now()}`,
      type: "insight",
      title: "Weekly goal progress",
      message: `You've logged ${weekHours.toFixed(1)}h this week. Goal: ${weeklyGoal}h.`,
      timestamp: now.toISOString(),
      read: false,
      priority: "medium",
    });
  }

  return notifications;
}

export function isQuietHours(preferences: Preferences): boolean {
  if (!preferences.quietHours) return false;

  const now = new Date();
  const currentHour = now.getHours();
  const [startHour, endHour] = preferences.quietHours.start.split(":").map(Number);
  const [endHourVal, endMinute] = preferences.quietHours.end.split(":").map(Number);

  if (startHour < endHourVal) {
    return currentHour >= startHour && currentHour < endHourVal;
  } else {
    // Overnight quiet hours (e.g., 22:00 to 07:00)
    return currentHour >= startHour || currentHour < endHourVal;
  }
}

export function shouldShowNotification(
  notification: Notification,
  preferences: Preferences
): boolean {
  if (!preferences.notificationsEnabled) return false;

  // Check quiet hours
  if (isQuietHours(preferences) && notification.priority !== "high") {
    return false;
  }

  return true;
}

export function createScheduledReminder(
  data: AppData,
  title: string,
  message: string,
  scheduledTime: string
): Notification {
  return {
    id: `scheduled-${Date.now()}`,
    type: "reminder",
    title,
    message,
    timestamp: scheduledTime,
    read: false,
    priority: "medium",
  };
}

export function scheduleSmartReminders(data: AppData): Notification[] {
  const notifications: Notification[] = [];
  const now = new Date();

  // Schedule reminder for tomorrow if user usually studies at a specific time
  const userStudyHours = data.weeklyLog.reduce((acc: number[], log) => {
    const hour = new Date(log.date).getHours();
    acc.push(hour);
    return acc;
  }, []);

  if (userStudyHours.length > 0) {
    const avgHour = Math.round(userStudyHours.reduce((a, b) => a + b, 0) / userStudyHours.length);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(avgHour, 0, 0, 0);

    notifications.push({
      id: `smart-reminder-${Date.now()}`,
      type: "reminder",
      title: "Study time",
      message: `It's time for your usual study session!`,
      timestamp: tomorrow.toISOString(),
      read: false,
      priority: "medium",
    });
  }

  return notifications;
}
