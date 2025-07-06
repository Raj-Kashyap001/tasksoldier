"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

const themes = [
  { name: "light", icon: <Sun className="w-5 h-5" />, label: "Light" },
  { name: "dark", icon: <Moon className="w-5 h-5" />, label: "Dark" },
  { name: "system", icon: <Laptop className="w-5 h-5" />, label: "System" },
] as const;

export function ThemeToggleMobile() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="space-y-2">
      <span className="text-sm text-muted-foreground font-medium">Theme</span>
      <div className="flex items-center gap-2">
        {themes.map(({ name, icon, label }) => (
          <button
            key={name}
            onClick={() => setTheme(name)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-md border text-xs w-full transition-colors",
              theme === name
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground hover:border-foreground"
            )}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
