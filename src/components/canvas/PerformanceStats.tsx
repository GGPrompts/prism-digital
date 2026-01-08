"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";

/**
 * Performance monitoring component for development
 * Tracks FPS and warns if performance drops below 60fps
 */
export function PerformanceStats() {
  const [fps, setFps] = useState(60);
  const [showWarning, setShowWarning] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);

  useFrame(() => {
    frameCountRef.current++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTimeRef.current;

    // Update FPS every second
    if (elapsed >= 1000) {
      const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
      setFps(currentFps);

      // Track FPS history
      fpsHistoryRef.current.push(currentFps);
      if (fpsHistoryRef.current.length > 10) {
        fpsHistoryRef.current.shift();
      }

      // Show warning if consistently below 50fps
      const avgFps =
        fpsHistoryRef.current.reduce((a, b) => a + b, 0) /
        fpsHistoryRef.current.length;
      setShowWarning(avgFps < 50);

      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
  });

  // Only show in development
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        padding: "8px 12px",
        background: showWarning
          ? "rgba(239, 68, 68, 0.9)"
          : "rgba(0, 0, 0, 0.7)",
        color: "white",
        fontFamily: "monospace",
        fontSize: "14px",
        borderRadius: "4px",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      FPS: {fps}
      {showWarning && " ⚠️"}
    </div>
  );
}
