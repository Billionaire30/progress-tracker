"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, X, Volume2, AlertCircle } from "lucide-react";
import { isSpeechRecognitionSupported, startSpeechRecognition, parseVoiceCommand } from "@/lib/voice";

export function SimpleVoice() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleStartListening = () => {
    if (!isSpeechRecognitionSupported()) {
      setResponse("Voice recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    setIsListening(true);
    setTranscript("");
    setResponse("");

    const stopListening = startSpeechRecognition(
      (text) => {
        setTranscript(text);
        setIsListening(false);
        
        const command = parseVoiceCommand(text);
        if (command) {
          setResponse(`Command recognized: ${command.action}`);
          // Handle basic commands
          switch (command.action) {
            case "open_settings":
              // Trigger settings open via global event or callback
              setResponse("Settings would open here");
              break;
            case "show_help":
              setResponse("Press Ctrl+/ for shortcuts, Ctrl+, for settings");
              break;
            default:
              setResponse(`Command: ${command.action}`);
          }
        } else {
          setResponse("No command recognized. Try saying 'help' or 'open settings'");
        }
      },
      (error) => {
        setIsListening(false);
        setResponse(`Error: ${error}`);
      }
    );

    return () => {
      if (stopListening) stopListening();
    };
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setIsAnimating(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('input, textarea, button, select')) {
      return
    }
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }

    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, dragStart])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsAnimating(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:scale-110"
        title="Voice commands"
      >
        <Mic className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClickOutside}
    >
      <div 
        className={`w-full max-w-md transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
        style={{
          left: position.x,
          top: position.y,
          position: 'relative'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Card className={`relative shadow-2xl border-2 ${isDragging ? 'cursor-move select-none' : ''}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setIsOpen(false); setIsAnimating(false); }}
          className="absolute top-3 right-3 z-10 hover:bg-destructive/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Volume2 className="h-5 w-5 text-primary" />
            </div>
            Voice Commands
          </CardTitle>
          <p className="text-sm text-muted-foreground">Control the app with your voice</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <Button
              onClick={handleStartListening}
              disabled={isListening}
              size="lg"
              className={`w-full h-16 text-lg shadow-lg hover:shadow-xl transition-all duration-200 ${isListening ? 'bg-destructive hover:bg-destructive/90' : ''}`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5 mr-2 animate-pulse" />
                  Listening...
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
          </div>
          
          {transcript && (
            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-1">You said:</p>
              <p className="text-sm font-medium">{transcript}</p>
            </div>
          )}
          
          {response && (
            <div className={`p-4 rounded-lg border ${response.startsWith('Error') ? 'bg-destructive/10 border-destructive/20' : 'bg-green-500/10 border-green-500/20'}`}>
              <div className="flex items-start gap-2">
                {response.startsWith('Error') ? (
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                ) : (
                  <Volume2 className="h-4 w-4 text-green-600 mt-0.5" />
                )}
                <p className="text-sm">{response}</p>
              </div>
            </div>
          )}
          
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Try saying:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-background border rounded text-xs font-mono">"open settings"</span>
              <span className="px-2 py-1 bg-background border rounded text-xs font-mono">"help"</span>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
