"use client";

import React, { useEffect } from "react";

interface TaskPieChartProps {
  completed: number;
  inProgress: number;
  total: number;
}

export function TaskPieChart({
  completed,
  inProgress,
  total,
}: TaskPieChartProps) {
  const open = total - completed - inProgress;

  const completedPercent = total === 0 ? 0 : (completed / total) * 100;
  const inProgressPercent = total === 0 ? 0 : (inProgress / total) * 100;
  const openPercent = 100 - completedPercent - inProgressPercent;

  const completedAngle = (360 * completedPercent) / 100;
  const inProgressAngle = completedAngle + (360 * inProgressPercent) / 100;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--completed-angle", `${completedAngle}deg`);
      root.style.setProperty("--in-progress-angle", `${inProgressAngle}deg`);
      root.style.setProperty("--completed-color", "#16a34a");
      root.style.setProperty("--in-progress-color", "#2563eb");
      root.style.setProperty("--open-color", "#ea580c");
    }
  }, [completedAngle, inProgressAngle]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40 rounded-full bg-[conic-gradient(var(--completed-color)_0deg_var(--completed-angle),var(--in-progress-color)_var(--completed-angle)_var(--in-progress-angle),var(--open-color)_var(--in-progress-angle)_360deg)]">
        <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center">
          <div className="text-center text-sm text-muted-foreground font-medium">
            {total} <br />
            tasks
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-green-600 rounded-full" />
          Completed ({completed})
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-blue-600 rounded-full" />
          In Progress ({inProgress})
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-orange-600 rounded-full" />
          Open ({open})
        </div>
      </div>
    </div>
  );
}
