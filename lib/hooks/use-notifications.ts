import { useState, useEffect } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);

      const savedEnabled = localStorage.getItem("notifications-enabled");
      if (savedEnabled === "true") {
        setEnabled(true);
      }
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        setEnabled(true);
        localStorage.setItem("notifications-enabled", "true");
      }
      return result;
    }
    return "denied";
  };

  const toggleNotifications = async () => {
    if (enabled) {
      setEnabled(false);
      localStorage.setItem("notifications-enabled", "false");
    } else {
      await requestPermission();
    }
  };

  const sendNotification = (title: string, body: string) => {
    if (enabled && permission === "granted" && typeof window !== "undefined") {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
      });
    }
  };

  return {
    permission,
    enabled,
    requestPermission,
    toggleNotifications,
    sendNotification,
  };
}
