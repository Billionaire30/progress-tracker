"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Repeat, Clock, FolderOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-card border-t border-border z-50 lg:hidden">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
