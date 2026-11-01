"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic } from "lucide-react";

export function SimpleVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        aria-label="Voice Assistant"
        title="Voice Assistant"
      >
        <Mic className="h-4 w-4" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Assistant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Voice assistant is not currently available in this simplified version.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
