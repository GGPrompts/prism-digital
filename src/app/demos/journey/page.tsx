"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { ProgressBar } from "@/components/journey/ProgressBar";
import { WaypointCard, JOURNEY_WAYPOINT_CONFIGS } from "@/components/journey/WaypointCard";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Dynamically import the canvas to prevent SSR issues
const JourneyCanvas = dynamic(
  () =>
    import("@/components/canvas/JourneyCanvas").then((mod) => mod.JourneyCanvas),
  { ssr: false }
);

// Progress bar waypoint markers
const PROGRESS_WAYPOINTS = [
  { position: 0, label: "Start" },
  { position: 0.33, label: "Geometric" },
  { position: 0.55, label: "Portal" },
  { position: 0.8, label: "Crystal" },
];

export default function JourneyPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll handler using GSAP ScrollTrigger
  useEffect(() => {
    if (!scrollContainerRef.current || !contentRef.current) return;

    const updateProgress = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;

      const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
      setScrollProgress(progress);
    };

    // Create ScrollTrigger for smooth updates
    const trigger = ScrollTrigger.create({
      trigger: contentRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: updateProgress,
    });

    // Also listen for direct scroll events
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    // Initial call
    updateProgress();

    return () => {
      trigger.kill();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const scrollAmount = window.innerHeight * 0.8;

      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        window.scrollBy({ top: scrollAmount, behavior: "smooth" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        window.scrollBy({ top: -scrollAmount, behavior: "smooth" });
      } else if (e.key === "Home") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (e.key === "End") {
        e.preventDefault();
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",
        });
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div ref={scrollContainerRef} className="relative">
      {/* Fixed 3D Canvas */}
      <JourneyCanvas scrollProgress={scrollProgress} />

      {/* Navigation - fixed top */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between p-4 md:p-6">
        <Link
          href="/demos"
          className="group flex items-center gap-2 rounded-lg bg-black/30 px-4 py-2 text-sm font-medium text-foreground-muted backdrop-blur-sm transition-all hover:bg-black/50 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Demos
        </Link>

        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg bg-black/30 px-4 py-2 text-sm font-medium text-foreground-muted backdrop-blur-sm transition-all hover:bg-black/50 hover:text-foreground"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </nav>

      {/* Progress indicator */}
      <ProgressBar progress={scrollProgress} waypoints={PROGRESS_WAYPOINTS} />

      {/* Waypoint cards */}
      {JOURNEY_WAYPOINT_CONFIGS.map((config) => (
        <WaypointCard
          key={config.title}
          title={config.title}
          subtitle={config.subtitle}
          progress={scrollProgress}
          showRange={config.showRange}
          position={config.position}
        />
      ))}

      {/* Scrollable content - creates scroll height */}
      <div ref={contentRef} className="relative min-h-[500vh]">
        {/* Scroll indicator at the start */}
        <div className="fixed bottom-8 left-1/2 z-40 -translate-x-1/2">
          <div
            className="flex flex-col items-center gap-2 text-foreground-muted transition-opacity duration-500"
            style={{
              opacity: scrollProgress < 0.05 ? 1 : Math.max(0, 1 - scrollProgress * 5),
            }}
          >
            <span className="text-sm font-medium">Scroll to explore</span>
            <div className="flex h-8 w-5 items-start justify-center rounded-full border border-foreground-muted/30 p-1">
              <div className="h-2 w-1 animate-bounce rounded-full bg-primary" />
            </div>
          </div>
        </div>

        {/* End screen */}
        <div
          className="fixed inset-0 z-30 flex items-center justify-center transition-opacity duration-700"
          style={{
            opacity: scrollProgress > 0.9 ? (scrollProgress - 0.9) / 0.1 : 0,
            pointerEvents: scrollProgress > 0.95 ? "auto" : "none",
          }}
        >
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-primary via-primary-hover to-accent-cyan bg-clip-text text-transparent">
                Journey Complete
              </span>
            </h2>
            <p className="mb-8 text-lg text-foreground-muted">
              Ready to create your own immersive experience?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-muted px-6 py-3 font-semibold text-white shadow-lg shadow-glow-primary/30 transition-all hover:scale-105 hover:from-primary-hover hover:to-primary hover:shadow-glow-primary/60"
              >
                Get in Touch
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 font-semibold text-foreground backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
              >
                Restart Journey
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
