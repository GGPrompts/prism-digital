"use client";

import { useEffect, useState, useRef } from "react";
import { useProgress } from "@react-three/drei";

interface ContentFadeProps {
  children: React.ReactNode;
}

export function ContentFade({ children }: ContentFadeProps) {
  const { progress, active, loaded, total } = useProgress();
  const [isReady, setIsReady] = useState(false);
  const hasStartedLoading = useRef(false);

  // Track if we've ever had items to load
  useEffect(() => {
    if (total > 0) {
      hasStartedLoading.current = true;
    }
  }, [total]);

  useEffect(() => {
    // Case 1: Normal loading complete
    const normalComplete = progress === 100 && hasStartedLoading.current;

    // Case 2: No items to load at all
    const nothingToLoad = !active && total === 0 && loaded === 0;

    if (normalComplete || nothingToLoad) {
      // Delay slightly to ensure smooth transition after loader exits
      const delay = nothingToLoad ? 200 : 800;
      const timer = setTimeout(() => {
        setIsReady(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [progress, active, loaded, total]);

  return (
    <div
      className={`transition-opacity duration-1000 ease-out ${
        isReady ? "opacity-100" : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
