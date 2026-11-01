"use client";

import { useState, useEffect, memo, useCallback } from "react";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, MicOff, Volume2 } from "lucide-react";
import {
  startSpeechRecognition,
  parseVoiceCommand,
  extractHoursFromTranscript,
  extractFocusFromTranscript,
  speak,
  isSpeechRecognitionSupported,
  getVoiceCommandsList,
} from "@/lib/voice";

export const VoiceAssistant = memo(function VoiceAssistant() {
  const { data, setData } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      setResponse("Voice recognition is not supported in your browser. Please use Chrome or Edge for voice commands.");
    }
  }, []);

  const handleStartListening = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setResponse("Voice recognition is not supported in your browser. Please use Chrome or Edge for voice commands.");
      return;
    }

    setIsListening(true);
    setTranscript("");
    setResponse("");

    const stopListening = startSpeechRecognition(
      (transcriptText) => {
        setTranscript(transcriptText);
        setIsListening(false);
        processCommand(transcriptText);
      },
      (error) => {
        setResponse(`Error: ${error}`);
        setIsListening(false);
      }
    );

    return () => {
      if (stopListening) stopListening();
    };
  }, []);

  const processCommand = useCallback((transcriptText: string) => {
    const command = parseVoiceCommand(transcriptText);

    if (!command) {
      setResponse("I didn't understand that command. Try saying 'log hours' or 'show progress'.");
      speak("I didn't understand that command.");
      return;
    }

    switch (command.action) {
      case "log_hours":
        const hours = extractHoursFromTranscript(transcriptText);
        const focus = extractFocusFromTranscript(transcriptText);

        if (hours) {
          const updatedData = {
            ...data,
            weeklyLog: [
              ...data.weeklyLog,
              {
                id: `log-${Date.now()}`,
                date: new Date().toISOString().split("T")[0],
                hours,
                focus: focus || "General study",
              },
            ],
          };
          setData(updatedData);
          setResponse(`Logged ${hours} hours for ${focus || "general study"}.`);
          speak(`Logged ${hours} hours.`);
        } else {
          setResponse("How many hours would you like to log?");
          speak("How many hours would you like to log?");
        }
        break;

      case "show_progress":
        const totalHours = data.weeklyLog.reduce((sum, log) => sum + log.hours, 0);
        const monthsComplete = data.months.filter((m) => m.status === "complete").length;
        setResponse(`You've logged ${totalHours.toFixed(1)} hours total and completed ${monthsComplete} months.`);
        speak(`You've logged ${totalHours.toFixed(1)} hours total and completed ${monthsComplete} months.`);
        break;

      case "show_streak":
        setResponse(`Your current streak is ${data.currentStreak} days.`);
        speak(`Your current streak is ${data.currentStreak} days.`);
        break;

      case "show_stats":
        setResponse("Opening statistics page...");
        speak("Opening statistics.");
        window.location.href = "/stats";
        break;

      case "open_settings":
        setResponse("Opening settings...");
        speak("Opening settings.");
        // Trigger settings menu
        break;

      case "go_home":
        setResponse("Going to home...");
        speak("Going to home.");
        window.location.href = "/";
        break;

      case "show_help":
        const commands = getVoiceCommandsList();
        const commandList = commands.map((c) => c.phrase).join(", ");
        setResponse(`Available commands: ${commandList}`);
        if (isSpeechRecognitionSupported()) {
          speak(`Available commands: ${commandList}`);
        }
        break;

      default:
        setResponse("Command not implemented yet.");
        speak("Command not implemented yet.");
    }
  }, [data, setData]);

  const handleSpeakResponse = useCallback(() => {
    if (response) {
      speak(response);
    }
  }, [response]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          console.log("Voice Assistant button clicked");
          setIsOpen(true);
        }}
        title="Voice Assistant"
        aria-label="Voice Assistant"
      >
        <Mic className="h-4 w-4" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Assistant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleStartListening}
              disabled={isListening || !isSpeechRecognitionSupported()}
              size="lg"
              className="h-16 w-16 rounded-full"
            >
              {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
          </div>

          {isListening && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground animate-pulse">Listening...</p>
            </div>
          )}

          {transcript && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">You said:</p>
              <p className="text-lg">{transcript}</p>
            </div>
          )}

          {response && (
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Response:</p>
                  <p className="text-lg">{response}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSpeakResponse}>
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-2">Available commands:</p>
            <ul className="space-y-1">
              {getVoiceCommandsList().map((cmd) => (
                <li key={cmd.phrase}>• "{cmd.phrase}"</li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
});
