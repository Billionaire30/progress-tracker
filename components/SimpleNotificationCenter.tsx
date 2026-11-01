"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell } from "lucide-react";

export function SimpleNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
