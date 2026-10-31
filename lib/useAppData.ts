"use client";

import { useApp } from "@/lib/context";
import { MonthStatus, PortfolioStatus, Preferences, Task, WeeklyLogEntry, initialData } from "@/lib/data";
import { storage } from "@/lib/storage";

export function useAppData() {
  const { data, setData, resetData, exportData, importData, updatePreferences } = useApp();

  const toggleTask = (monthId: number, taskId: string) => {
    const updatedMonths = data.months.map((m) =>
      m.id === monthId
        ? {
            ...m,
            tasks: m.tasks.map((t) =>
              t.id === taskId ? { ...t, done: !t.done } : t
            ),
          }
        : m
    );
    setData({ ...data, months: updatedMonths });
  };

  const addTask = (monthId: number, label: string) => {
    const month = data.months.find((m) => m.id === monthId);
    if (!month) return;

    const newTask: Task = {
      id: `m${monthId}-t${month.tasks.length + 1}`,
      label,
      done: false,
    };

    const updatedMonths = data.months.map((m) =>
      m.id === monthId ? { ...m, tasks: [...m.tasks, newTask] } : m
    );
    setData({ ...data, months: updatedMonths });
  };

  const deleteTask = (monthId: number, taskId: string) => {
    const updatedMonths = data.months.map((m) =>
      m.id === monthId
        ? { ...m, tasks: m.tasks.filter((t) => t.id !== taskId) }
        : m
    );
    setData({ ...data, months: updatedMonths });
  };

  const setMonthStatus = (monthId: number, status: MonthStatus) => {
    const updatedMonths = data.months.map((m) =>
      m.id === monthId ? { ...m, status } : m
    );
    setData({ ...data, months: updatedMonths });
  };

  const cycleMonthStatus = (monthId: number) => {
    const month = data.months.find((m) => m.id === monthId);
    if (!month) return;

    const statuses: MonthStatus[] = ["not-started", "in-progress", "complete"];
    const currentIndex = statuses.indexOf(month.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    setMonthStatus(monthId, newStatus);
  };

  const logHours = (entry: Omit<WeeklyLogEntry, "id">) => {
    const newEntry: WeeklyLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };

    setData({
      ...data,
      weeklyLog: [...data.weeklyLog, newEntry].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    });
  };

  const deleteLogEntry = (id: string) => {
    setData({
      ...data,
      weeklyLog: data.weeklyLog.filter((entry) => entry.id !== id),
    });
  };

  const toggleCompetency = (id: string) => {
    const updatedChecklist = data.competencyChecklist.map((c) =>
      c.id === id ? { ...c, done: !c.done } : c
    );
    setData({ ...data, competencyChecklist: updatedChecklist });
  };

  const cyclePortfolio = (id: number) => {
    const item = data.portfolio.find((p) => p.id === id);
    if (!item) return;

    const statuses: PortfolioStatus[] = ["not-started", "in-progress", "complete"];
    const currentIndex = statuses.indexOf(item.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    const updatedPortfolio = data.portfolio.map((p) =>
      p.id === id ? { ...p, status: newStatus } : p
    );
    setData({ ...data, portfolio: updatedPortfolio });
  };

  const reset = () => {
    resetData();
  };

  const seed = () => {
    storage.seed();
    setData(initialData);
  };

  const exportJson = () => {
    exportData();
  };

  const importJson = (file: File) => {
    importData(file);
  };

  const setStartDate = (date: string) => {
    setData({ ...data, startDate: date });
  };

  const setPreferences = (preferences: Partial<Preferences>) => {
    updatePreferences(preferences);
  };

  return {
    data,
    setData,
    toggleTask,
    addTask,
    deleteTask,
    setMonthStatus,
    cycleMonthStatus,
    logHours,
    deleteLogEntry,
    toggleCompetency,
    cyclePortfolio,
    reset,
    seed,
    exportJson,
    importJson,
    setStartDate,
    setPreferences,
  };
}
