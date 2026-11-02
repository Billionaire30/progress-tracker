"use client";

import { useApp } from "@/lib/context";
import { useToast } from "@/lib/hooks/use-toast";
import { MonthStatus } from "@/lib/data";
import { triggerConfetti } from "@/lib/confetti";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/StatusPill";
import { TaskList } from "@/components/TaskList";
import { AddTaskInput } from "@/components/AddTaskInput";
import { NotesEditor } from "@/components/NotesEditor";
import { AuthRequired } from "@/components/AuthRequired";
import { LoadingState } from "@/components/LoadingSpinner";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, use } from "react";

export default function MonthPage({ params }: { params: Promise<{ id: string }> }) {
  const { data, setData, isLoading } = useApp();
  const { toast } = useToast();
  const resolvedParams = use(params);
  const monthId = parseInt(resolvedParams.id);
  const month = data.months.find((m) => m.id === monthId);

  // Show loading state
  if (isLoading) {
    return (
      <AuthRequired>
        <LoadingState message="Loading month data..." />
      </AuthRequired>
    );
  }

  const allTasksDone = useMemo(
    () => month && month.tasks.length > 0 && month.tasks.every((t) => t.done),
    [month]
  );

  const cycleStatus = useCallback(() => {
    if (!month) return;

    const statuses: MonthStatus[] = ["not-started", "in-progress", "complete"];
    const currentIndex = statuses.indexOf(month.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];

    const updatedMonths = data.months.map((m) =>
      m.id === monthId ? { ...m, status: newStatus } : m
    );
    setData({ ...data, months: updatedMonths });

    if (newStatus === "complete") {
      triggerConfetti();
      toast({
        title: "Month complete",
        description: `Month ${month.id} has been marked as complete`,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, data.months, monthId, setData, toast]);

  const addTask = useCallback((label: string) => {
    if (!month) return;

    const newTask = {
      id: `m${monthId}-t${month.tasks.length + 1}`,
      label,
      done: false,
    };
    const updatedMonths = data.months.map((m) =>
      m.id === monthId ? { ...m, tasks: [...m.tasks, newTask] } : m
    );
    setData({ ...data, months: updatedMonths });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, data.months, monthId, setData]);

  const toggleTask = useCallback((taskId: string) => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.months, monthId, setData]);

  const deleteTask = useCallback((taskId: string) => {
    const updatedMonths = data.months.map((m) =>
      m.id === monthId
        ? { ...m, tasks: m.tasks.filter((t) => t.id !== taskId) }
        : m
    );
    setData({ ...data, months: updatedMonths });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.months, monthId, setData]);

  const saveNotes = useCallback((notes: string) => {
    const updatedMonths = data.months.map((m) =>
      m.id === monthId ? { ...m, notes } : m
    );
    setData({ ...data, months: updatedMonths });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.months, monthId, setData]);

  const saveDeadline = useCallback((deadline: string) => {
    const updatedMonths = data.months.map((m) =>
      m.id === monthId ? { ...m, deadline } : m
    );
    setData({ ...data, months: updatedMonths });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.months, monthId, setData]);

  const markMonthComplete = useCallback(() => {
    const updatedMonths = data.months.map((m) =>
      m.id === monthId ? { ...m, status: "complete" as MonthStatus } : m
    );
    setData({ ...data, months: updatedMonths });
    triggerConfetti();
    toast({
      title: "Month complete",
      description: `Month ${month?.id} has been marked as complete`,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.months, monthId, setData, month?.id, toast]);

  const formatLastUpdated = useCallback(() => {
    if (!data.lastUpdated) return "Never";
    const date = new Date(data.lastUpdated);
    return date.toLocaleString();
  }, [data.lastUpdated]);

  if (!month) {
    return (
      <AuthRequired>
        <div className="min-h-screen p-8">
          <p>Month not found (ID: {monthId})</p>
          <p className="text-sm text-muted-foreground mt-2">
            Available months: {data.months.map(m => m.id).join(', ')}
          </p>
          <a href="/">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </a>
        </div>
      </AuthRequired>
    );
  }

  return (
    <AuthRequired>
      <div className="flex flex-col">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <a href="/">
            <Button variant="ghost" size="sm" aria-label="Back to Dashboard" className="text-xs sm:text-sm">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </a>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6 flex-1" role="main">
        {month.image && (
          <div className="relative h-40 sm:h-48 md:h-64 rounded-lg overflow-hidden">
            <Image
              src={month.image}
              alt={month.title}
              fill
              className="object-cover"
              loading="eager"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif leading-tight">
              Month {month.id} — {month.title}
            </h1>
          </div>
          <StatusPill status={month.status} onClick={cycleStatus} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Focus & Software</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm font-medium">Focus</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{month.focus}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Software</p>
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                  {month.software.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs sm:text-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm font-medium">Description</p>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-4">{month.project}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Portfolio Output</p>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{month.portfolioOutput}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Learning Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 sm:space-y-2">
              {month.learningTopics.map((topic, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground flex-shrink-0">•</span>
                  <span className="text-xs sm:text-sm">{topic}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Target Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={month.deadline || ""}
                onChange={(e) => saveDeadline(e.target.value)}
                className="px-3 py-2 border rounded-md text-xs sm:text-sm"
              />
              {month.deadline && (
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {new Date(month.deadline) < new Date() ? " (Overdue)" : ""}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <AddTaskInput onAdd={addTask} />

        <TaskList
          tasks={month.tasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
          showMarkCompleteButton={allTasksDone && month.status === "in-progress"}
          onMarkComplete={markMonthComplete}
        />

        <NotesEditor
          notes={month.notes}
          onSave={saveNotes}
          title="Month Notes"
        />
      </main>

      <footer className="border-t bg-card py-3 sm:py-4">
        <div className="container mx-auto px-3 sm:px-4">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Last updated: {formatLastUpdated()}
          </p>
        </div>
      </footer>
    </div>
    </AuthRequired>
  );
}
