import { AppData, Task, Month, TaskPriority, TaskStatus } from "./data";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function addTask(
  data: AppData,
  monthId: number,
  task: Omit<Task, "id" | "createdAt">
): AppData {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return data;

  const newTask: Task = {
    ...task,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  month.tasks.push(newTask);

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `task-add-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "task_created",
    entity: "task",
    entityId: newTask.id,
    changes: { monthId, label: task.label },
  });

  return data;
}

export function updateTask(
  data: AppData,
  monthId: number,
  taskId: string,
  updates: Partial<Task>
): AppData {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return data;

  const task = month.tasks.find((t) => t.id === taskId);
  if (!task) return data;

  const oldValues = { ...task };
  Object.assign(task, updates);

  // Handle completion timestamp
  if (updates.done === true && !task.completedAt) {
    task.completedAt = new Date().toISOString();
  } else if (updates.done === false) {
    task.completedAt = undefined;
  }

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `task-update-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "task_updated",
    entity: "task",
    entityId: taskId,
    changes: updates,
  });

  return data;
}

export function deleteTask(data: AppData, monthId: number, taskId: string): AppData {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return data;

  const taskIndex = month.tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) return data;

  month.tasks.splice(taskIndex, 1);

  if (!data.auditLog) data.auditLog = [];
  data.auditLog.push({
    id: `task-delete-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: "task_deleted",
    entity: "task",
    entityId: taskId,
  });

  return data;
}

export function addSubtask(
  data: AppData,
  monthId: number,
  taskId: string,
  label: string
): AppData {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return data;

  const task = month.tasks.find((t) => t.id === taskId);
  if (!task) return data;

  if (!task.subtasks) task.subtasks = [];

  task.subtasks.push({
    id: generateId(),
    label,
    done: false,
  });

  return data;
}

export function updateSubtask(
  data: AppData,
  monthId: number,
  taskId: string,
  subtaskId: string,
  done: boolean
): AppData {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return data;

  const task = month.tasks.find((t) => t.id === taskId);
  if (!task || !task.subtasks) return data;

  const subtask = task.subtasks.find((s) => s.id === subtaskId);
  if (!subtask) return data;

  subtask.done = done;

  return data;
}

export function deleteSubtask(
  data: AppData,
  monthId: number,
  taskId: string,
  subtaskId: string
): AppData {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return data;

  const task = month.tasks.find((t) => t.id === taskId);
  if (!task || !task.subtasks) return data;

  const subtaskIndex = task.subtasks.findIndex((s) => s.id === subtaskId);
  if (subtaskIndex === -1) return data;

  task.subtasks.splice(subtaskIndex, 1);

  return data;
}

export function addTaskDependency(
  data: AppData,
  monthId: number,
  taskId: string,
  dependsOnTaskId: string
): AppData {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return data;

  const task = month.tasks.find((t) => t.id === taskId);
  if (!task) return data;

  if (!task.dependencies) task.dependencies = [];
  if (!task.dependencies.includes(dependsOnTaskId)) {
    task.dependencies.push(dependsOnTaskId);
  }

  return data;
}

export function removeTaskDependency(
  data: AppData,
  monthId: number,
  taskId: string,
  dependsOnTaskId: string
): AppData {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return data;

  const task = month.tasks.find((t) => t.id === taskId);
  if (!task || !task.dependencies) return data;

  task.dependencies = task.dependencies.filter((id) => id !== dependsOnTaskId);

  return data;
}

export function getTaskDependencies(
  data: AppData,
  monthId: number,
  taskId: string
): Task[] {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return [];

  const task = month.tasks.find((t) => t.id === taskId);
  if (!task || !task.dependencies) return [];

  return task.dependencies
    .map((depId) => month.tasks.find((t) => t.id === depId))
    .filter((t): t is Task => t !== undefined);
}

export function isTaskBlocked(data: AppData, monthId: number, taskId: string): boolean {
  const dependencies = getTaskDependencies(data, monthId, taskId);
  return dependencies.some((dep) => !dep.done);
}

export function getAvailableTasks(data: AppData, monthId: number): Task[] {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return [];

  return month.tasks.filter((task) => !isTaskBlocked(data, monthId, task.id));
}

export function addTaskTag(data: AppData, monthId: number, taskId: string, tag: string): AppData {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return data;

  const task = month.tasks.find((t) => t.id === taskId);
  if (!task) return data;

  if (!task.tags) task.tags = [];
  if (!task.tags.includes(tag)) {
    task.tags.push(tag);
  }

  return data;
}

export function removeTaskTag(
  data: AppData,
  monthId: number,
  taskId: string,
  tag: string
): AppData {
  const month = data.months.find((m) => m.id === monthId);
  if (!month) return data;

  const task = month.tasks.find((t) => t.id === taskId);
  if (!task || !task.tags) return data;

  task.tags = task.tags.filter((t) => t !== tag);

  return data;
}

export function getTasksByTag(data: AppData, tag: string): Task[] {
  const tasks: Task[] = [];

  data.months.forEach((month) => {
    month.tasks.forEach((task) => {
      if (task.tags && task.tags.includes(tag)) {
        tasks.push(task);
      }
    });
  });

  return tasks;
}

export function getTasksByPriority(data: AppData, priority: TaskPriority): Task[] {
  const tasks: Task[] = [];

  data.months.forEach((month) => {
    month.tasks.forEach((task) => {
      if (task.priority === priority) {
        tasks.push(task);
      }
    });
  });

  return tasks;
}

export function getTasksByStatus(data: AppData, status: TaskStatus): Task[] {
  const tasks: Task[] = [];

  data.months.forEach((month) => {
    month.tasks.forEach((task) => {
      if (task.status === status) {
        tasks.push(task);
      }
    });
  });

  return tasks;
}

export function getOverdueTasks(data: AppData): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tasks: Task[] = [];

  data.months.forEach((month) => {
    month.tasks.forEach((task) => {
      if (task.dueDate && !task.done) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          tasks.push(task);
        }
      }
    });
  });

  return tasks;
}

export function getUpcomingTasks(data: AppData, days: number = 7): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  const tasks: Task[] = [];

  data.months.forEach((month) => {
    month.tasks.forEach((task) => {
      if (task.dueDate && !task.done) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate >= today && dueDate <= futureDate) {
          tasks.push(task);
        }
      }
    });
  });

  return tasks.sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}
