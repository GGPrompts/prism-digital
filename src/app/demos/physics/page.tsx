"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

// Dynamic import to avoid SSR issues with Rapier physics
const PhysicsPlayground = dynamic(
  () =>
    import("@/components/canvas/PhysicsPlayground").then(
      (mod) => mod.PhysicsPlayground
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-foreground-muted">Loading Physics Engine...</p>
        </div>
      </div>
    ),
  }
);

export default function PhysicsPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Back link */}
      <div className="absolute left-6 top-6 z-50">
        <Link
          href="/demos"
          className="group flex items-center gap-2 rounded-lg bg-black/40 px-4 py-2 text-sm font-medium text-foreground-muted backdrop-blur-md transition-colors hover:bg-black/60 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Demos
        </Link>
      </div>

      {/* Title */}
      <div className="absolute left-1/2 top-6 z-50 -translate-x-1/2">
        <h1 className="bg-gradient-to-r from-primary via-primary-hover to-accent-cyan bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
          Physics Playground
        </h1>
      </div>

      {/* Physics Canvas */}
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <div className="text-foreground-muted">Initializing...</div>
          </div>
        }
      >
        <PhysicsPlayground />
      </Suspense>
    </main>
  );
}
