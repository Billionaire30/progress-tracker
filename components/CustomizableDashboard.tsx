"use client";

import { useState } from "react";
import { useApp } from "@/lib/context";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GripVertical, Plus, LayoutGrid } from "lucide-react";
import { OverallProgress } from "@/components/OverallProgress";
import { StreakTracker } from "@/components/StreakTracker";
import { ProductivityInsights } from "@/components/ProductivityInsights";
import { GamificationPanel } from "@/components/GamificationPanel";
import { CompetencyPanel } from "@/components/CompetencyPanel";
import { PortfolioPanel } from "@/components/PortfolioPanel";

type WidgetType =
  | "progress"
  | "streak"
  | "insights"
  | "gamification"
  | "competency"
  | "portfolio";

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
}

const WIDGET_CONFIG: Record<WidgetType, { title: string; component: React.ComponentType }> = {
  progress: { title: "Overall Progress", component: OverallProgress },
  streak: { title: "Streak Tracker", component: StreakTracker },
  insights: { title: "Productivity Insights", component: ProductivityInsights },
  gamification: { title: "Gamification", component: GamificationPanel },
  competency: { title: "Competencies", component: CompetencyPanel },
  portfolio: { title: "Portfolio", component: PortfolioPanel },
};

const DEFAULT_WIDGETS: Widget[] = [
  { id: "1", type: "progress", title: "Overall Progress" },
  { id: "2", type: "streak", title: "Streak Tracker" },
  { id: "3", type: "insights", title: "Productivity Insights" },
  { id: "4", type: "gamification", title: "Gamification" },
  { id: "5", type: "competency", title: "Competencies" },
  { id: "6", type: "portfolio", title: "Portfolio" },
];

export function CustomizableDashboard() {
  const { data, setData } = useApp();
  const [widgets, setWidgets] = useState<Widget[]>(
    data.preferences.dashboardLayout
      ? JSON.parse(data.preferences.dashboardLayout)
      : DEFAULT_WIDGETS
  );
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);

    // Save to preferences
    const updatedData = {
      ...data,
      preferences: {
        ...data.preferences,
        dashboardLayout: JSON.stringify(items),
      },
    };
    setData(updatedData);
  };

  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `${Date.now()}`,
      type,
      title: WIDGET_CONFIG[type].title,
    };

    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);

    const updatedData = {
      ...data,
      preferences: {
        ...data.preferences,
        dashboardLayout: JSON.stringify(updatedWidgets),
      },
    };
    setData(updatedData);
    setIsAddOpen(false);
  };

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter((w) => w.id !== widgetId);
    setWidgets(updatedWidgets);

    const updatedData = {
      ...data,
      preferences: {
        ...data.preferences,
        dashboardLayout: JSON.stringify(updatedWidgets),
      },
    };
    setData(updatedData);
  };

  const availableWidgets = Object.keys(WIDGET_CONFIG) as WidgetType[];
  const usedWidgetTypes = widgets.map((w) => w.type);
  const availableToAdd = availableWidgets.filter((type) => !usedWidgetTypes.includes(type));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-serif">Dashboard</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Widget</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2">
              {availableToAdd.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  onClick={() => addWidget(type)}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span className="text-sm">{WIDGET_CONFIG[type].title}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {widgets.map((widget, index) => {
                const WidgetComponent = WIDGET_CONFIG[widget.type].component;
                return (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`transition-shadow ${
                          snapshot.isDragging ? "shadow-lg" : ""
                        }`}
                      >
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              </div>
                              <CardTitle className="text-base">{widget.title}</CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeWidget(widget.id)}
                              className="h-8 w-8"
                            >
                              ×
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <WidgetComponent />
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
