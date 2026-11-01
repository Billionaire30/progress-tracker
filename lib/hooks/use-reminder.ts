"use client";

import { useEffect, useState, useMemo } from "react";
import { useApp } from "@/lib/context";
import { useNotifications } from "./use-notifications";
import { useToast } from "./use-toast";

export function useReminder() {
  const { data } = useApp();
  const { sendNotification, enabled } = useNotifications();
  const { toast } = useToast();
  const [hasShownReminder, setHasShownReminder] = useState(false);

  const todayStr = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const loggedToday = useMemo(() => {
    return data.weeklyLog.some((entry) => entry.date === todayStr);
  }, [data.weeklyLog, todayStr]);

  useEffect(() => {
    const checkReminder = () => {
      if (!loggedToday && !hasShownReminder) {
        const today = new Date();
        const hoursUntilMidnight = 24 - today.getHours();

        if (hoursUntilMidnight <= 2) {
          if (enabled) {
            sendNotification(
              "Time to log your hours!",
              "Don't forget to log your study hours for today."
            );
          }

          toast({
            title: "Reminder",
            description: "Don't forget to log your study hours for today!",
            variant: "default",
          });

          setHasShownReminder(true);
        }
      }

      if (loggedToday) {
        setHasShownReminder(false);
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 60000 * 60);

    return () => clearInterval(interval);
  }, [loggedToday, hasShownReminder, enabled, sendNotification, toast]);
}
