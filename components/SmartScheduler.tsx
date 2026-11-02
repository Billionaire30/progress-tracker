"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, ExternalLink, Check, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";

interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "study" | "break" | "review" | "deadline";
  completed: boolean;
  synced: boolean;
}

export function SmartScheduler() {
  const { data, setData } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [newEventStartTime, setNewEventStartTime] = useState("09:00");
  const [newEventEndTime, setNewEventEndTime] = useState("10:00");
  const [newEventType, setNewEventType] = useState<ScheduleEvent["type"]>("study");

  const events: ScheduleEvent[] = useMemo(() => {
    return data.schedule ?? [];
  }, [data.schedule]);

  const generateOptimalSchedule = () => {
    // AI-powered schedule generation based on current progress
    const now = new Date();
    const suggestions: Omit<ScheduleEvent, "id" | "synced">[] = [];

    // Get focus areas from weekly log
    const focusAreas = data.weeklyLog.reduce((acc: Record<string, number>, log) => {
      const focus = log.focus || "General";
      acc[focus] = (acc[focus] || 0) + log.hours;
      return acc;
    }, {});

    const topFocus = Object.entries(focusAreas).sort((a, b) => b[1] - a[1])[0]?.[0] || "General";

    // Generate study sessions for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      // Skip weekends for deep work
      if (date.getDay() === 0 || date.getDay() === 6) {
        suggestions.push({
          title: `Review ${topFocus} notes`,
          date: dateStr,
          startTime: "10:00",
          endTime: "11:00",
          type: "review",
          completed: false,
        });
      } else {
        // Weekday deep work
        suggestions.push({
          title: `Deep Work: ${topFocus}`,
          date: dateStr,
          startTime: "09:00",
          endTime: "11:00",
          type: "study",
          completed: false,
        });

        suggestions.push({
          title: "Study Session",
          date: dateStr,
          startTime: "14:00",
          endTime: "16:00",
          type: "study",
          completed: false,
        });

        suggestions.push({
          title: "Break",
          date: dateStr,
          startTime: "12:00",
          endTime: "12:30",
          type: "break",
          completed: false,
        });
      }
    }

    setData((prevData) => ({
      ...prevData,
      schedule: [
        ...(prevData.schedule || []),
        ...suggestions.map((s) => ({
          ...s,
          id: `event-${Date.now()}-${Math.random()}`,
          synced: false,
        })),
      ],
    }));
    alert("Generated optimal schedule for the next 7 days!");
  };

  const addEvent = () => {
    if (!newEventTitle.trim()) return;

    const newEvent: ScheduleEvent = {
      id: `event-${Date.now()}`,
      title: newEventTitle,
      date: newEventDate,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      type: newEventType,
      completed: false,
      synced: false,
    };

    setData((prevData) => ({
      ...prevData,
      schedule: [...(prevData.schedule || []), newEvent],
    }));
    setNewEventTitle("");
    setNewEventDate(new Date().toISOString().split("T")[0]);
    setNewEventStartTime("09:00");
    setNewEventEndTime("10:00");
    setIsAddOpen(false);
  };

  const toggleEventCompletion = (eventId: string) => {
    setData((prevData) => {
      const updatedEvents = (prevData.schedule || []).map((event) =>
        event.id === eventId ? { ...event, completed: !event.completed } : event
      );
      return { ...prevData, schedule: updatedEvents };
    });
  };

  const deleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setData((prevData) => ({
        ...prevData,
        schedule: (prevData.schedule || []).filter((e) => e.id !== eventId),
      }));
    }
  };

  const syncToCalendar = (eventId: string) => {
    // Mock calendar sync - in production, this would integrate with Google/Outlook APIs
    setData((prevData) => {
      const updatedEvents = (prevData.schedule || []).map((event) =>
        event.id === eventId ? { ...event, synced: true } : event
      );
      return { ...prevData, schedule: updatedEvents };
    });
    alert("Event synced to calendar (mock)");
  };

  const getEventTypeColor = (type: ScheduleEvent["type"]) => {
    switch (type) {
      case "study":
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800";
      case "break":
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800";
      case "review":
        return "bg-purple-50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800";
      case "deadline":
        return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800";
    }
  };

  const getEventTypeBadge = (type: ScheduleEvent["type"]) => {
    switch (type) {
      case "study":
        return <Badge className="bg-blue-500">Study</Badge>;
      case "break":
        return <Badge className="bg-green-500">Break</Badge>;
      case "review":
        return <Badge className="bg-purple-500">Review</Badge>;
      case "deadline":
        return <Badge className="bg-red-500">Deadline</Badge>;
    }
  };

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, ScheduleEvent[]> = {};
    events.forEach((event) => {
      if (!groups[event.date]) groups[event.date] = [];
      groups[event.date].push(event);
    });
    return groups;
  }, [events]);

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Smart Scheduler
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={generateOptimalSchedule}>
              <Clock className="h-4 w-4 mr-2" />
              Auto-Generate
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                  <DialogTitle>Add Schedule Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input
                      id="event-title"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      placeholder="e.g., Study Session"
                      autoFocus={false}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-date">Date</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      autoFocus={false}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event-start">Start Time</Label>
                      <Input
                        id="event-start"
                        type="time"
                        value={newEventStartTime}
                        onChange={(e) => setNewEventStartTime(e.target.value)}
                        autoFocus={false}
                      />
                    </div>
                    <div>
                      <Label htmlFor="event-end">End Time</Label>
                      <Input
                        id="event-end"
                        type="time"
                        value={newEventEndTime}
                        onChange={(e) => setNewEventEndTime(e.target.value)}
                        autoFocus={false}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="event-type">Type</Label>
                    <select
                      id="event-type"
                      value={newEventType}
                      onChange={(e) => setNewEventType(e.target.value as ScheduleEvent["type"])}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="study">Study</option>
                      <option value="break">Break</option>
                      <option value="review">Review</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>
                  <Button onClick={addEvent} className="w-full">
                    Add Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upcoming Events */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Upcoming Events
          </h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No upcoming events. Generate a schedule or add events manually.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border ${getEventTypeColor(event.type)} ${
                    event.completed ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getEventTypeBadge(event.type)}
                        <h4 className="font-medium text-sm">{event.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.synced && (
                        <Badge variant="outline" className="gap-1">
                          <Check className="h-3 w-3" />
                          Synced
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleEventCompletion(event.id)}
                        title={event.completed ? "Mark incomplete" : "Mark complete"}
                      >
                        <Check className={`h-4 w-4 ${event.completed ? "text-green-500" : ""}`} />
                      </Button>
                      {!event.synced && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => syncToCalendar(event.id)}
                          title="Sync to calendar"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEvent(event.id)}
                        title="Delete"
                      >
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar Integration Notice */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm mb-1">Calendar Integration</h4>
              <p className="text-xs text-muted-foreground">
                Sync your schedule with Google Calendar or Outlook. Enable integration in Settings to automatically sync events.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
