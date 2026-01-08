"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

interface ContentFadeProps {
  children: React.ReactNode;
}

export function ContentFade({ children }: ContentFadeProps) {
  const { progress } = useProgress();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for loading to complete, then trigger fade-in
    if (progress === 100) {
      // Delay slightly to ensure smooth transition after loader exits
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [progress]);

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
