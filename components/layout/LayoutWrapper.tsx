"use client";

import { AppProvider } from "@/lib/context";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useState } from "react";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen">
            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <main className="pt-16 lg:pl-[260px] pb-14 lg:pb-6 px-4 lg:px-6">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
            <MobileBottomNav />
          </div>
        </AppProvider>
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
}
