"use client";

import { useApp } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Brush, Check, Download, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  icon: string;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Default",
    description: "Clean and modern default theme",
    colors: {
      primary: "#3b82f6",
      secondary: "#10b981",
      accent: "#8b5cf6",
      background: "#ffffff",
      foreground: "#0f172a",
    },
    icon: "🎨",
  },
  {
    id: "neon",
    name: "Neon Glow",
    description: "Cyberpunk-inspired neon theme",
    colors: {
      primary: "#ff00ff",
      secondary: "#00ffff",
      accent: "#ffff00",
      background: "#0a0a0a",
      foreground: "#ffffff",
    },
    icon: "💡",
  },
  {
    id: "sunset",
    name: "Sunset Vibes",
    description: "Warm sunset gradient theme",
    colors: {
      primary: "#f97316",
      secondary: "#ec4899",
      accent: "#8b5cf6",
      background: "#fef3c7",
      foreground: "#1c1917",
    },
    icon: "🌅",
  },
  {
    id: "ocean",
    name: "Ocean Depths",
    description: "Deep blue ocean theme",
    colors: {
      primary: "#0ea5e9",
      secondary: "#06b6d4",
      accent: "#14b8a6",
      background: "#0c4a6e",
      foreground: "#f0f9ff",
    },
    icon: "🌊",
  },
  {
    id: "forest",
    name: "Forest Zen",
    description: "Natural forest green theme",
    colors: {
      primary: "#22c55e",
      secondary: "#16a34a",
      accent: "#84cc16",
      background: "#f0fdf4",
      foreground: "#14532d",
    },
    icon: "🌲",
  },
  {
    id: "midnight",
    name: "Midnight Purple",
    description: "Dark purple space theme",
    colors: {
      primary: "#a855f7",
      secondary: "#6366f1",
      accent: "#ec4899",
      background: "#1e1b4b",
      foreground: "#f5f3ff",
    },
    icon: "🌙",
  },
];

export function AdvancedTheming() {
  const { data, setData } = useApp();
  const [customColors, setCustomColors] = useState({
    primary: "#3b82f6",
    secondary: "#10b981",
    accent: "#8b5cf6",
    background: "#ffffff",
    foreground: "#0f172a",
  });
  const [customFont, setCustomFont] = useState("Inter");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const currentTheme = data.theme || THEME_PRESETS[0];

  const applyTheme = (preset: ThemePreset) => {
    setData({
      ...data,
      theme: preset,
    });
  };

  const applyCustomTheme = () => {
    const customTheme: ThemePreset = {
      id: "custom",
      name: "Custom",
      description: "Your custom theme",
      colors: customColors,
      icon: "🎨",
    };
    setData({
      ...data,
      theme: customTheme,
    });
  };

  const exportTheme = () => {
    const themeConfig = {
      theme: data.theme,
      customFont,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(themeConfig, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `theme-config-${Date.now()}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetToDefault = () => {
    if (confirm("Reset to default theme?")) {
      setData({
        ...data,
        theme: THEME_PRESETS[0],
      });
      setCustomColors(THEME_PRESETS[0].colors);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-500" />
            Advanced Theming
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsPreviewMode(!isPreviewMode)}>
              {isPreviewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {isPreviewMode ? "Exit Preview" : "Preview"}
            </Button>
            <Button size="sm" variant="outline" onClick={exportTheme}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Theme */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-3">Current Theme</h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{currentTheme.icon}</div>
            <div>
              <h4 className="font-medium">{currentTheme.name}</h4>
              <p className="text-sm text-muted-foreground">{currentTheme.description}</p>
            </div>
          </div>
        </div>

        {/* Theme Presets */}
        <div>
          <h3 className="font-medium mb-3">Theme Presets</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyTheme(preset)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  currentTheme.id === preset.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-2xl mb-2">{preset.icon}</div>
                <h4 className="font-medium text-sm">{preset.name}</h4>
                <p className="text-xs text-muted-foreground">{preset.description}</p>
                <div className="flex gap-1 mt-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.colors.secondary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.colors.accent }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Theme Builder */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Brush className="h-4 w-4" />
            Custom Theme Builder
          </h3>
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="color-primary">Primary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="color-primary"
                    type="color"
                    value={customColors.primary}
                    onChange={(e) =>
                      setCustomColors({ ...customColors, primary: e.target.value })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={customColors.primary}
                    onChange={(e) =>
                      setCustomColors({ ...customColors, primary: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="color-secondary">Secondary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="color-secondary"
                    type="color"
                    value={customColors.secondary}
                    onChange={(e) =>
                      setCustomColors({ ...customColors, secondary: e.target.value })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={customColors.secondary}
                    onChange={(e) =>
                      setCustomColors({ ...customColors, secondary: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="color-accent">Accent Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="color-accent"
                    type="color"
                    value={customColors.accent}
                    onChange={(e) =>
                      setCustomColors({ ...customColors, accent: e.target.value })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={customColors.accent}
                    onChange={(e) =>
                      setCustomColors({ ...customColors, accent: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="color-background">Background Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="color-background"
                    type="color"
                    value={customColors.background}
                    onChange={(e) =>
                      setCustomColors({ ...customColors, background: e.target.value })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={customColors.background}
                    onChange={(e) =>
                      setCustomColors({ ...customColors, background: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="custom-font">Custom Font</Label>
              <select
                id="custom-font"
                value={customFont}
                onChange={(e) => setCustomFont(e.target.value)}
                className="w-full p-2 border rounded-md mt-1"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Poppins">Poppins</option>
                <option value="Montserrat">Montserrat</option>
              </select>
            </div>

            <Button onClick={applyCustomTheme} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Apply Custom Theme
            </Button>
          </div>
        </div>

        {/* Preview Card */}
        {isPreviewMode && (
          <div
            className="p-6 rounded-lg border-2"
            style={{
              backgroundColor: currentTheme.colors.background,
              color: currentTheme.colors.foreground,
              borderColor: currentTheme.colors.primary,
            }}
          >
            <h3 className="font-bold text-lg mb-2">Theme Preview</h3>
            <p className="mb-4">
              This is how your content will look with the selected theme. Customize colors above to see changes in real-time.
            </p>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded text-white"
                style={{ backgroundColor: currentTheme.colors.primary }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded text-white"
                style={{ backgroundColor: currentTheme.colors.secondary }}
              >
                Secondary Button
              </button>
              <button
                className="px-4 py-2 rounded text-white"
                style={{ backgroundColor: currentTheme.colors.accent }}
              >
                Accent Button
              </button>
            </div>
          </div>
        )}

        {/* Reset Button */}
        <Button variant="outline" onClick={resetToDefault} className="w-full">
          Reset to Default
        </Button>
      </CardContent>
    </Card>
  );
}
