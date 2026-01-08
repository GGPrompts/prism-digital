"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

export function Loader() {
  const { progress, active } = useProgress();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // When loading completes, trigger exit animation
    if (!active && progress === 100) {
      setTimeout(() => {
        setIsExiting(true);
      }, 300);
    }
  }, [active, progress]);

  // Don't render if exiting is complete
  if (isExiting && progress === 100) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-700 ${
        isExiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Animated prism logo */}
        <div className="relative h-32 w-32">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="h-full w-full rounded-full border-2 border-primary/30 border-t-primary" />
          </div>

          {/* Inner pulsing prism shape */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="prism-shape h-16 w-16 animate-pulse-slow" />
          </div>

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-primary shadow-glow-primary animate-pulse" />
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="font-orbitron text-2xl font-bold tracking-wider text-primary">
            PRISM DIGITAL
          </h1>
          <p className="mt-2 font-inter text-sm text-foreground-muted">
            Building the Future of Web3D
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64">
          <div className="mb-2 flex justify-between text-xs text-foreground-muted">
            <span>Loading Experience</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 10px rgba(168, 85, 247, 0.5)",
              }}
            />
          </div>
        </div>

        {/* Loading status text */}
        <div className="min-h-[20px] text-center text-xs text-foreground-muted">
          {active && progress < 100 && (
            <span className="animate-pulse">Initializing 3D assets...</span>
          )}
          {!active && progress === 100 && !isExiting && (
            <span className="text-primary">Ready</span>
          )}
        </div>
      </div>
    </div>
  );
}
