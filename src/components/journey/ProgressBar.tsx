"use client";

import { useMemo } from "react";

interface ProgressBarProps {
  progress: number; // 0-1
  waypoints: Array<{
    position: number; // 0-1
    label: string;
  }>;
}

/**
 * Vertical progress indicator for scroll journey.
 * Shows current progress and waypoint markers.
 */
export function ProgressBar({ progress, waypoints }: ProgressBarProps) {
  // Find current waypoint index
  const currentWaypointIndex = useMemo(() => {
    for (let i = waypoints.length - 1; i >= 0; i--) {
      if (progress >= waypoints[i].position - 0.05) {
        return i;
      }
    }
    return 0;
  }, [progress, waypoints]);

  return (
    <div className="fixed right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-2 md:right-8">
      {/* Progress track */}
      <div className="relative h-48 w-1 rounded-full bg-white/10 backdrop-blur-sm md:h-64">
        {/* Fill bar */}
        <div
          className="absolute bottom-0 left-0 w-full rounded-full bg-gradient-to-t from-primary via-primary-hover to-accent-cyan transition-all duration-150 ease-out"
          style={{
            height: `${progress * 100}%`,
          }}
        />

        {/* Glow effect */}
        <div
          className="absolute left-1/2 w-3 -translate-x-1/2 rounded-full bg-primary/50 blur-md transition-all duration-150 ease-out"
          style={{
            height: "8px",
            bottom: `calc(${progress * 100}% - 4px)`,
          }}
        />

        {/* Waypoint markers */}
        {waypoints.map((waypoint, index) => {
          const isActive = index <= currentWaypointIndex;
          const isCurrent = index === currentWaypointIndex;

          return (
            <div
              key={waypoint.label}
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: `calc(${waypoint.position * 100}% - 4px)`,
              }}
            >
              {/* Marker dot */}
              <div
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "scale-125 bg-primary shadow-[0_0_8px_var(--primary)]"
                    : "bg-white/30"
                } ${isCurrent ? "scale-150" : ""}`}
              />

              {/* Label (hidden on mobile for cleaner UI) */}
              <div
                className={`absolute right-4 top-1/2 hidden -translate-y-1/2 whitespace-nowrap text-xs font-medium transition-all duration-300 md:block ${
                  isActive ? "text-primary" : "text-foreground-muted/50"
                }`}
              >
                {waypoint.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress percentage */}
      <div className="text-xs font-mono text-foreground-muted/70">
        {Math.round(progress * 100)}%
      </div>
    </div>
  );
}
