"use client";

import { AlertCircle } from "lucide-react";

/**
 * WebGL Fallback Component
 *
 * Shown when WebGL is not supported on the user's device.
 * Provides a graceful degradation with static gradient background.
 */
export function WebGLFallback() {
  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center bg-background">
      {/* Animated gradient background as fallback */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 40% 20%, rgba(124, 58, 237, 0.25) 0%, transparent 50%)
            `,
          }}
        />

        {/* Animated particles effect using CSS */}
        <div className="particles-fallback absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle-dot absolute h-1 w-1 rounded-full bg-primary/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Fallback message */}
      <div className="relative z-10 mx-auto max-w-md px-6 text-center">
        <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4">
          <AlertCircle className="h-12 w-12 text-primary" />
        </div>

        <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
          3D Not Supported
        </h2>

        <p className="mb-6 text-lg leading-relaxed text-foreground-muted">
          Your browser doesn't support WebGL, which is required for our 3D
          experience. The site will work, but without the interactive 3D
          elements.
        </p>

        <div className="rounded-xl border border-border bg-background-secondary/50 p-4">
          <p className="text-sm text-foreground-subtle">
            For the best experience, try using a modern browser like Chrome,
            Firefox, Safari, or Edge.
          </p>
        </div>

        <div className="mt-8">
          <a
            href="#features"
            className="inline-block rounded-lg bg-primary px-8 py-3 font-semibold text-white transition-all hover:bg-primary-hover hover:scale-105"
          >
            Continue to Site
          </a>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-30px) translateX(20px);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
