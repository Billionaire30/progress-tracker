"use client";

import { useApp } from "@/lib/context";
import { MonthStatus, PortfolioStatus, Preferences, Task, WeeklyLogEntry, initialData } from "@/lib/data";
import { storage } from "@/lib/storage";
import { useCallback, useMemo } from "react";

export function useAppData() {
  const { data, setData, resetData, exportData, importData, updatePreferences } = useApp();

  const toggleTask = useCallback((monthId: number, taskId: string) => {
    setData((prevData: any) => {
      const updatedMonths = prevData.months.map((m: any) =>
        m.id === monthId
          ? {
              ...m,
              tasks: m.tasks.map((t: any) =>
                t.id === taskId ? { ...t, done: !t.done } : t
              ),
            }
          : m
      );
      return { ...prevData, months: updatedMonths };
    });
  }, [setData]);

  const addTask = useCallback((monthId: number, label: string) => {
    setData((prevData: any) => {
      const month = prevData.months.find((m: any) => m.id === monthId);
      if (!month) return prevData;

      const newTask: Task = {
        id: `m${monthId}-t${month.tasks.length + 1}`,
        label,
        done: false,
      };

      const updatedMonths = prevData.months.map((m: any) =>
        m.id === monthId ? { ...m, tasks: [...m.tasks, newTask] } : m
      );
      return { ...prevData, months: updatedMonths };
    });
  }, [setData]);

  const deleteTask = useCallback((monthId: number, taskId: string) => {
    setData((prevData: any) => {
      const updatedMonths = prevData.months.map((m: any) =>
        m.id === monthId
          ? { ...m, tasks: m.tasks.filter((t: any) => t.id !== taskId) }
          : m
      );
      return { ...prevData, months: updatedMonths };
    });
  }, [setData]);

  const setMonthStatus = useCallback((monthId: number, status: MonthStatus) => {
    setData((prevData: any) => {
      const updatedMonths = prevData.months.map((m: any) =>
        m.id === monthId ? { ...m, status } : m
      );
      return { ...prevData, months: updatedMonths };
    });
  }, [setData]);

  const cycleMonthStatus = useCallback((monthId: number) => {
    setData((prevData: any) => {
      const month = prevData.months.find((m: any) => m.id === monthId);
      if (!month) return prevData;

      const statuses: MonthStatus[] = ["not-started", "in-progress", "complete"];
      const currentIndex = statuses.indexOf(month.status);
      const nextIndex = (currentIndex + 1) % statuses.length;
      const newStatus = statuses[nextIndex];

      const updatedMonths = prevData.months.map((m: any) =>
        m.id === monthId ? { ...m, status: newStatus } : m
      );
      return { ...prevData, months: updatedMonths };
    });
  }, [setData]);

  const logHours = useCallback((entry: Omit<WeeklyLogEntry, "id">) => {
    const newEntry: WeeklyLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };

    setData((prevData: any) => ({
      ...prevData,
      weeklyLog: [...prevData.weeklyLog, newEntry].sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    }));
  }, [setData]);

  const deleteLogEntry = useCallback((id: string) => {
    setData((prevData: any) => ({
      ...prevData,
      weeklyLog: prevData.weeklyLog.filter((entry: any) => entry.id !== id),
    }));
  }, [setData]);

  const toggleCompetency = useCallback((id: string) => {
    setData((prevData: any) => {
      const updatedChecklist = prevData.competencyChecklist.map((c: any) =>
        c.id === id ? { ...c, done: !c.done } : c
      );
      return { ...prevData, competencyChecklist: updatedChecklist };
    });
  }, [setData]);

  const cyclePortfolio = useCallback((id: number) => {
    setData((prevData: any) => {
      const item = prevData.portfolio.find((p: any) => p.id === id);
      if (!item) return prevData;

      const statuses: PortfolioStatus[] = ["not-started", "in-progress", "complete"];
      const currentIndex = statuses.indexOf(item.status);
      const nextIndex = (currentIndex + 1) % statuses.length;
      const newStatus = statuses[nextIndex];

      const updatedPortfolio = prevData.portfolio.map((p: any) =>
        p.id === id ? { ...p, status: newStatus } : p
      );
      return { ...prevData, portfolio: updatedPortfolio };
    });
  }, [setData]);

  const reset = useCallback(() => {
    resetData();
  }, [resetData]);

  const seed = useCallback(() => {
    storage.seed();
    setData(initialData as any);
  }, [setData]);

  const exportJson = useCallback(() => {
    exportData();
  }, [exportData]);

  const importJson = useCallback((file: File) => {
    importData(file);
  }, [importData]);

  const setStartDate = useCallback((date: string) => {
    setData((prevData: any) => ({ ...prevData, startDate: date }));
  }, [setData]);

  const setPreferences = useCallback((preferences: Partial<Preferences>) => {
    updatePreferences(preferences);
  }, [updatePreferences]);

  return useMemo(() => ({
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
  }), [data, setData, toggleTask, addTask, deleteTask, setMonthStatus, cycleMonthStatus, logHours, deleteLogEntry, toggleCompetency, cyclePortfolio, reset, seed, exportJson, importJson, setStartDate, setPreferences]);
}
