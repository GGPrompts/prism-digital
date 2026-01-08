"use client";

import { useEffect, useState } from "react";

interface ScrollProgress {
  scrollY: number;
  scrollProgress: number; // 0-1 for entire page
  currentSection: string;
  featuresProgress: number; // 0-1 for features section visibility
}

/**
 * Custom hook to track scroll progress across the page
 * Provides normalized scroll values for 3D scene integration
 */
export function useScrollProgress(): ScrollProgress {
  const [scrollState, setScrollState] = useState<ScrollProgress>({
    scrollY: 0,
    scrollProgress: 0,
    currentSection: "hero",
    featuresProgress: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollProgress = scrollY / (documentHeight - windowHeight);

      // Detect current section
      const featuresSection = document.querySelector(
        '[data-section="features"]'
      );
      let currentSection = "hero";
      let featuresProgress = 0;

      if (featuresSection) {
        const rect = featuresSection.getBoundingClientRect();
        const sectionTop = scrollY + rect.top;
        const sectionHeight = rect.height;

        // Calculate if we're in the features section
        if (scrollY > sectionTop - windowHeight && scrollY < sectionTop + sectionHeight) {
          currentSection = "features";
          // Normalize progress within the features section (0-1)
          featuresProgress = Math.max(
            0,
            Math.min(1, (scrollY - sectionTop + windowHeight) / (sectionHeight + windowHeight))
          );
        }
      }

      setScrollState({
        scrollY,
        scrollProgress,
        currentSection,
        featuresProgress,
      });
    };

    // Initial call
    handleScroll();

    // Listen to scroll
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return scrollState;
}
