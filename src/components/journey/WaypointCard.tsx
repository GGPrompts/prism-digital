"use client";

import { useMemo } from "react";

interface WaypointCardProps {
  title: string;
  subtitle?: string;
  progress: number; // Current scroll progress 0-1
  showRange: [number, number]; // [start, end] when to show this card
  position?: "left" | "right" | "center";
}

/**
 * Text card that appears at specific scroll positions during the journey.
 * Fades in/out based on scroll progress within the showRange.
 */
export function WaypointCard({
  title,
  subtitle,
  progress,
  showRange,
  position = "left",
}: WaypointCardProps) {
  const [showStart, showEnd] = showRange;
  const fadeInEnd = showStart + 0.05;
  const fadeOutStart = showEnd - 0.05;

  // Calculate opacity with fade in/out
  const opacity = useMemo(() => {
    if (progress < showStart || progress > showEnd) return 0;
    if (progress < fadeInEnd) {
      // Fade in
      return (progress - showStart) / (fadeInEnd - showStart);
    }
    if (progress > fadeOutStart) {
      // Fade out
      return 1 - (progress - fadeOutStart) / (showEnd - fadeOutStart);
    }
    return 1;
  }, [progress, showStart, showEnd, fadeInEnd, fadeOutStart]);

  // Calculate transform for parallax effect
  const translateY = useMemo(() => {
    const rangeProgress = (progress - showStart) / (showEnd - showStart);
    return (rangeProgress - 0.5) * -20; // -10 to +10 px
  }, [progress, showStart, showEnd]);

  if (opacity <= 0) return null;

  const positionClasses = {
    left: "left-6 md:left-12 lg:left-20",
    right: "right-6 md:right-12 lg:right-20",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={`fixed top-1/2 z-40 max-w-md -translate-y-1/2 ${positionClasses[position]}`}
      style={{
        opacity,
        transform: `translateY(calc(-50% + ${translateY}px))`,
        pointerEvents: opacity > 0.5 ? "auto" : "none",
      }}
    >
      <div className="glass-card overflow-hidden p-6 md:p-8">
        {/* Accent line */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary-hover to-accent-cyan" />

        {/* Content */}
        <div className="pl-4">
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm leading-relaxed text-foreground-muted md:text-base">
              {subtitle}
            </p>
          )}
        </div>

        {/* Glow effect */}
        <div
          className="absolute inset-0 -z-10 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 0% 50%, var(--glow-primary-subtle) 0%, transparent 50%)",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Waypoint configuration for the journey
 */
export interface WaypointConfig {
  title: string;
  subtitle?: string;
  showRange: [number, number];
  position: "left" | "right" | "center";
}

export const JOURNEY_WAYPOINT_CONFIGS: WaypointConfig[] = [
  {
    title: "Begin Your Journey",
    subtitle: "Scroll to explore an immersive 3D experience through space and geometry.",
    showRange: [0, 0.2],
    position: "center",
  },
  {
    title: "Geometric Structures",
    subtitle: "Floating polyhedrons dance in mathematical harmony, showcasing the beauty of procedural generation.",
    showRange: [0.2, 0.45],
    position: "left",
  },
  {
    title: "Through the Portal",
    subtitle: "A gateway between dimensions, where light bends and reality shifts.",
    showRange: [0.45, 0.7],
    position: "right",
  },
  {
    title: "Crystalline Vista",
    subtitle: "Emerge into a realm of prismatic formations, where code meets art.",
    showRange: [0.7, 1.0],
    position: "left",
  },
];
