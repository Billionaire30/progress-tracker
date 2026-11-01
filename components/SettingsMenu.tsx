"use client";

import { useState, useRef, useCallback } from "react";
import { useApp } from "@/lib/context";
import { useToast } from "@/lib/hooks/use-toast";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useClickSound } from "@/lib/hooks/use-click-sound";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Settings, Bell, Download, Table, FileText, Upload } from "lucide-react";
import { exportToCSV, exportToText } from "@/lib/export";
import { downloadReport } from "@/lib/report";

export function SettingsButton() {
  const { data, setData, resetData, exportData, importData, updatePreferences, preferences } = useApp();
  const { toast } = useToast();
  const { permission, enabled, toggleNotifications } = useNotifications();
  const { playClickSound } = useClickSound();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [startDate, setStartDate] = useState(data.startDate || "");
  const [showChartAsTable, setShowChartAsTable] = useState(preferences.showChartAsTable || false);

  const handleDownloadReport = useCallback(() => {
    downloadReport(data, "html");
    toast({
      title: "Report downloaded",
      description: "Your progress report has been downloaded",
    });
  }, [data, toast]);

  const handleExportCSV = useCallback(() => {
    exportToCSV(data);
    toast({
      title: "CSV exported",
      description: "Your data has been exported to CSV",
    });
  }, [data, toast]);

  const handleExportText = useCallback(() => {
    exportToText(data);
    toast({
      title: "Report exported",
      description: "Your text report has been downloaded",
    });
  }, [data, toast]);

  const handleReset = useCallback(() => {
    resetData();
    toast({
      title: "Data reset",
      description: "All progress has been cleared",
    });
  }, [resetData, toast]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file)
        .then(() => {
          toast({
            title: "Data imported",
            description: "Your progress has been loaded successfully",
          });
        })
        .catch((error) => {
          toast({
            title: "Import failed",
            description: "Invalid file",
            variant: "destructive",
          });
        });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [importData, toast]);

  const handleStartDateChange = useCallback((value: string) => {
    setStartDate(value);
    setData({ ...data, startDate: value });
  }, [data, setData]);

  const handleChartToggle = useCallback((checked: boolean) => {
    setShowChartAsTable(checked);
    updatePreferences({ showChartAsTable: checked });
  }, [updatePreferences]);

  const handleWeeklyGoalChange = useCallback((value: number) => {
    setData({ ...data, weeklyGoal: value });
  }, [data, setData]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label="Settings"
        onClick={() => {
          setIsSettingsOpen(true);
        }}
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your data and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  When you began Month 1
                </p>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Hour Goal</p>
                <p className="text-sm text-muted-foreground">
                  Target hours per week
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={data.weeklyGoal || 20}
                  onChange={(e) => handleWeeklyGoalChange(parseInt(e.target.value) || 20)}
                  className="px-3 py-2 border rounded-md text-sm w-20"
                />
                <span className="text-sm text-muted-foreground">hrs</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show chart as table</p>
                <p className="text-sm text-muted-foreground">
                  Display weekly hours as table by default
                </p>
              </div>
              <Checkbox
                checked={showChartAsTable}
                onCheckedChange={(checked) => {
                  playClickSound();
                  handleChartToggle(checked as boolean);
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-muted-foreground">
                  {permission === "granted"
                    ? "Receive reminders for logging hours"
                    : permission === "denied"
                    ? "Notifications blocked by browser"
                    : "Enable browser notifications"}
                </p>
              </div>
              <Button
                variant={enabled ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  playClickSound();
                  toggleNotifications();
                }}
                disabled={permission === "denied"}
              >
                <Bell className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export JSON</p>
                <p className="text-sm text-muted-foreground">
                  Download your progress as JSON
                </p>
              </div>
              <Button onClick={() => {
                playClickSound();
                exportData();
              }} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export CSV</p>
                <p className="text-sm text-muted-foreground">
                  Download spreadsheet-compatible data
                </p>
              </div>
              <Button onClick={() => {
                playClickSound();
                handleExportCSV();
              }} variant="outline" size="sm">
                <Table className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Text Report</p>
                <p className="text-sm text-muted-foreground">
                  Generate a detailed text summary
                </p>
              </div>
              <Button onClick={() => {
                playClickSound();
                handleExportText();
              }} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Import Data</p>
                <p className="text-sm text-muted-foreground">
                  Load progress from a JSON file
                </p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  onClick={() => {
                    playClickSound();
                    fileInputRef.current?.click();
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Reset Data</p>
                <p className="text-sm text-muted-foreground">
                  Clear all progress and start fresh
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  playClickSound();
                  handleReset();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
