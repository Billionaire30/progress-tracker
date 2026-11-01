"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Clock, Target, Zap } from "lucide-react";

const AMBIENT_SOUNDS = [
  { id: "rain", name: "Rain", icon: "🌧️", url: "https://www.soundjay.com/nature/sounds/rain-01.mp3" },
  { id: "forest", name: "Forest", icon: "🌲", url: "https://www.soundjay.com/nature/sounds/forest-01.mp3" },
  { id: "ocean", name: "Ocean Waves", icon: "🌊", url: "https://www.soundjay.com/nature/sounds/ocean-wave-01.mp3" },
  { id: "whitenoise", name: "White Noise", icon: "⚪", url: null }, // Generate white noise programmatically
  { id: "cafe", name: "Cafe Ambience", icon: "☕", url: "https://www.soundjay.com/misc/sounds/coffee-shop-01.mp3" },
];

export function FocusMode() {
  const [isActive, setIsActive] = useState(false);
  const [selectedSound, setSelectedSound] = useState(AMBIENT_SOUNDS[0]);
  const [volume, setVolume] = useState(50);
  const [sessionDuration, setSessionDuration] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(sessionDuration * 60);
  const [isPaused, setIsPaused] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const whiteNoiseContextRef = useRef<AudioContext | null>(null);
  const whiteNoiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Generate white noise
  const createWhiteNoise = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = 2 * audioContext.sampleRate;
      const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoiseSource = audioContext.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      const gainNode = audioContext.createGain();
      gainNode.gain.value = volume / 100;

      whiteNoiseSource.connect(gainNode);
      gainNode.connect(audioContext.destination);

      whiteNoiseSource.start();

      whiteNoiseContextRef.current = audioContext;
      return { audioContext, source: whiteNoiseSource, gainNode };
    } catch (error) {
      console.error("Error creating white noise:", error);
      return null;
    }
  };

  const playSound = () => {
    if (selectedSound.id === "whitenoise") {
      const noise = createWhiteNoise();
      if (noise) {
        whiteNoiseSourceRef.current = noise.source;
      }
    } else if (selectedSound.url) {
      const audio = new Audio(selectedSound.url);
      audio.volume = volume / 100;
      audio.loop = true;
      audio.play();
      audioRef.current = audio;
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (whiteNoiseSourceRef.current) {
      try {
        whiteNoiseSourceRef.current.stop();
      } catch (e) {
        // Source might already be stopped
      }
      whiteNoiseSourceRef.current = null;
    }
    if (whiteNoiseContextRef.current) {
      whiteNoiseContextRef.current.close();
      whiteNoiseContextRef.current = null;
    }
  };

  const startFocusSession = () => {
    setIsActive(true);
    setTimeRemaining(sessionDuration * 60);
    playSound();
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseSession = () => {
    setIsPaused(true);
    stopSound();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const resumeSession = () => {
    setIsPaused(false);
    playSound();
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endSession = () => {
    setIsActive(false);
    setIsPaused(false);
    stopSound();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setTimeRemaining(sessionDuration * 60);
  };

  const updateVolume = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
    }
    if (whiteNoiseSourceRef.current) {
      // For white noise, we'd need to recreate it or have a gain node reference
      // Simplified: stop and restart with new volume
      if (isActive && !isPaused) {
        stopSound();
        setTimeout(() => playSound(), 100);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-500" />
          Focus Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-bold tabular-nums font-mono mb-2">
            {formatTime(timeRemaining)}
          </div>
          <p className="text-sm text-muted-foreground">
            {isActive ? (isPaused ? "Paused" : "Focus session in progress") : "Ready to focus"}
          </p>
        </div>

        {/* Session Duration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Session Duration</span>
            <span className="text-muted-foreground">{sessionDuration} minutes</span>
          </div>
          <div className="flex gap-2">
            {[15, 25, 45, 60].map((duration) => (
              <Button
                key={duration}
                variant={sessionDuration === duration ? "default" : "outline"}
                size="sm"
                onClick={() => setSessionDuration(duration)}
                disabled={isActive}
              >
                {duration}m
              </Button>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-2">
          {!isActive ? (
            <Button onClick={startFocusSession} size="lg" className="w-full">
              <Play className="h-5 w-5 mr-2" />
              Start Focus Session
            </Button>
          ) : (
            <>
              {!isPaused ? (
                <Button onClick={pauseSession} size="lg" variant="outline" className="flex-1">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={resumeSession} size="lg" variant="outline" className="flex-1">
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
              )}
              <Button onClick={endSession} size="lg" variant="destructive" className="flex-1">
                <Zap className="h-5 w-5 mr-2" />
                End Session
              </Button>
            </>
          )}
        </div>

        {/* Ambient Sounds */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Ambient Sound</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isActive && !isPaused) {
                  stopSound();
                  playSound();
                }
              }}
              disabled={isActive}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {AMBIENT_SOUNDS.map((sound) => (
              <Button
                key={sound.id}
                variant={selectedSound.id === sound.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedSound(sound);
                  if (isActive && !isPaused) {
                    stopSound();
                    playSound();
                  }
                }}
                disabled={isActive}
                className="flex flex-col items-center gap-1 py-3"
              >
                <span className="text-xl">{sound.icon}</span>
                <span className="text-xs">{sound.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Volume</span>
            <span className="text-muted-foreground">{volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => updateVolume([parseInt(e.target.value)])}
            disabled={isActive}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Focus Tips */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Focus Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use the Pomodoro technique: 25 min focus, 5 min break</li>
            <li>• Put your phone in another room or use Do Not Disturb</li>
            <li>• Clear your workspace of distractions</li>
            <li>• Set a specific goal for each session</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
