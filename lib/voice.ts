import { AppData } from "./data";

export interface VoiceCommand {
  phrase: string;
  action: string;
  params?: Record<string, any>;
}

const VOICE_COMMANDS: VoiceCommand[] = [
  { phrase: "log hours", action: "log_hours" },
  { phrase: "add task", action: "add_task" },
  { phrase: "complete task", action: "complete_task" },
  { phrase: "show progress", action: "show_progress" },
  { phrase: "show statistics", action: "show_stats" },
  { phrase: "show streak", action: "show_streak" },
  { phrase: "open settings", action: "open_settings" },
  { phrase: "go home", action: "go_home" },
  { phrase: "help", action: "show_help" },
];

export function parseVoiceCommand(transcript: string): VoiceCommand | null {
  const lowerTranscript = transcript.toLowerCase();

  for (const command of VOICE_COMMANDS) {
    if (lowerTranscript.includes(command.phrase)) {
      return command;
    }
  }

  return null;
}

export function extractHoursFromTranscript(transcript: string): number | null {
  const matches = transcript.match(/(\d+(\.\d+)?)\s*hours?/i);
  if (matches) {
    return parseFloat(matches[1]);
  }
  return null;
}

export function extractFocusFromTranscript(transcript: string): string | null {
  // Look for patterns like "study [topic]" or "work on [topic]"
  const patterns = [
    /study\s+(.+)/i,
    /work\s+on\s+(.+)/i,
    /focus\s+on\s+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

export function isSpeechRecognitionSupported(): boolean {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function startSpeechRecognition(
  onResult: (transcript: string) => void,
  onError?: (error: string) => void
): (() => void) | null {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError("Speech recognition not supported");
    return null;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    if (onError) onError(event.error);
  };

  recognition.start();

  return () => {
    recognition.stop();
  };
}

export function speak(text: string): void {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
}

export function announceToScreenReader(message: string): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.style.position = "absolute";
  announcement.style.left = "-10000px";
  announcement.style.width = "1px";
  announcement.style.height = "1px";
  announcement.style.overflow = "hidden";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export function getVoiceCommandsList(): VoiceCommand[] {
  return VOICE_COMMANDS;
}
