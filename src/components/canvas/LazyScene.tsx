"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

/**
 * Lazy-loaded 3D scene components for better initial load performance
 * Components are loaded on-demand as they become visible
 */

// Lazy load heavy 3D components with no SSR
export const LazyFeaturesParticles = dynamic(
  () => import("./FeaturesParticles").then((mod) => ({ default: mod.FeaturesParticles })),
  {
    ssr: false,
    loading: () => null,
  }
);

export const LazyTestimonialsScene = dynamic(
  () => import("./TestimonialsScene"),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * Wrapper component with Suspense boundary for lazy-loaded 3D content
 */
export function LazySceneWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      {children}
    </Suspense>
  );
}
