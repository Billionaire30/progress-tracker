"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Task } from "@/lib/data";
import { useClickSound } from "@/lib/hooks/use-click-sound";
import { memo, useMemo } from "react";

interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  showMarkCompleteButton?: boolean;
  onMarkComplete?: () => void;
}

export const TaskList = memo(function TaskList({
  tasks,
  onToggle,
  onDelete,
  showMarkCompleteButton = false,
  onMarkComplete,
}: TaskListProps) {
  const { playClickSound } = useClickSound();

  const taskStats = useMemo(() => {
    const tasksComplete = tasks.filter((t) => t.done).length;
    const taskProgress = tasks.length > 0 ? (tasksComplete / tasks.length) * 100 : 0;
    const allTasksDone = tasks.length > 0 && tasksComplete === tasks.length;
    return { tasksComplete, taskProgress, allTasksDone };
  }, [tasks]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>
          Break down your project into manageable tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Progress value={taskStats.taskProgress} className="flex-1" />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {taskStats.tasksComplete}/{tasks.length}
          </span>
        </div>

        {showMarkCompleteButton && taskStats.allTasksDone && onMarkComplete && (
          <Button onClick={() => {
            playClickSound();
            onMarkComplete();
          }} className="w-full">
            Mark month complete
          </Button>
        )}

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <Checkbox
                checked={task.done}
                onCheckedChange={() => {
                  playClickSound();
                  onToggle(task.id);
                }}
              />
              <span
                className={`flex-1 text-sm ${
                  task.done ? "line-through text-muted-foreground" : ""
                }`}
              >
                {task.label}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  playClickSound();
                  onDelete(task.id);
                }}
                aria-label="Delete task"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tasks yet. Add your first task above.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
