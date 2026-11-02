"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Settings, X, Save, RotateCcw, Clock, Target, Download, Upload, Calendar } from "lucide-react";
import { useApp } from "@/lib/context";
import { useToast } from "@/lib/hooks/use-toast";

export function SimpleSettings() {
  const { data, setData, resetData, exportData, importData, updatePreferences } = useApp();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(data.weeklyGoal || 20);
  const [startDate, setStartDate] = useState(data.startDate || "");
  const [showChartAsTable, setShowChartAsTable] = useState(data.preferences.showChartAsTable || false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setWeeklyGoal(data.weeklyGoal || 20);
      setStartDate(data.startDate || "");
      setShowChartAsTable(data.preferences.showChartAsTable || false);
      setIsAnimating(true);
    }
  }, [isOpen, data.weeklyGoal, data.startDate, data.preferences.showChartAsTable]);

  const handleSave = () => {
    setData({ ...data, weeklyGoal, startDate });
    updatePreferences({ showChartAsTable });
    setIsOpen(false);
    setIsAnimating(false);
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };

  const handleReset = () => {
    if (confirm("This will erase all progress. Continue?")) {
      resetData();
      setIsOpen(false);
      setIsAnimating(false);
      toast({
        title: "Data reset",
        description: "All progress has been erased",
      });
    }
  };

  const handleExport = () => {
    exportData();
    toast({
      title: "Export successful",
      description: "Your data has been exported",
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importData(file);
      toast({
        title: "Data imported",
        description: "Your data has been imported successfully",
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Invalid file",
        variant: "destructive",
      });
    }
    // Reset input
    e.target.value = "";
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
        aria-label="Settings"
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
      <div 
        className={`w-full max-w-md transition-all duration-300 flex flex-col ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
        style={{
          left: position.x,
          top: position.y,
          position: 'relative'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Card className={`relative shadow-2xl border-2 max-h-[90vh] overflow-y-auto ${isDragging ? 'cursor-move select-none' : ''}`}>
        <CardHeader className="space-y-1 pb-4 pr-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setIsOpen(false); setIsAnimating(false); }}
            className="absolute top-3 right-3 z-10 hover:bg-destructive/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
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

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <Label htmlFor="start-date" className="text-base font-medium">Start Date</Label>
            </div>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-chart-table" className="text-base font-medium">Show chart as table by default</Label>
            <input
              id="show-chart-table"
              type="checkbox"
              checked={showChartAsTable}
              onChange={(e) => setShowChartAsTable(e.target.checked)}
              className="w-5 h-5"
            />
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label className="text-base font-medium">Data Management</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="w-full gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </div>
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
