"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings, X, Save, RotateCcw, Clock, Target } from "lucide-react";
import { useApp } from "@/lib/context";

export function SimpleSettings() {
  const { data, setData } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(data.weeklyGoal || 20);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleSave = () => {
    setData({ ...data, weeklyGoal });
    setIsOpen(false);
    setIsAnimating(false);
  };

  const handleReset = () => {
    setWeeklyGoal(20);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setIsAnimating(false);
    }
  };

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
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClickOutside}
    >
      <div className={`w-full max-w-md transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
        <Card className="relative shadow-2xl border-2">
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
              <Settings className="h-5 w-5 text-primary" />
            </div>
            Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">Customize your study experience</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <Label htmlFor="weekly-goal" className="text-base font-medium">Weekly Study Goal</Label>
            </div>
            <div className="flex items-center gap-3">
              <Input
                id="weekly-goal"
                type="number"
                min="1"
                max="100"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 20)}
                className="text-lg font-semibold h-12"
              />
              <span className="text-sm text-muted-foreground font-medium">hours/week</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Recommended: 20-30 hours per week for optimal progress</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleSave} 
              className="flex-1 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button 
              onClick={handleReset} 
              variant="outline"
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
