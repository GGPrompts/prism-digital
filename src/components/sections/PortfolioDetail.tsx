"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { X, ExternalLink } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolioData";

interface PortfolioDetailProps {
  project: PortfolioProject | null;
  onClose: () => void;
}

export function PortfolioDetail({ project, onClose }: PortfolioDetailProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Animate in/out
  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;

    if (project) {
      // Animate in
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.fromTo(
        panelRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.4, ease: "power3.out", delay: 0.1 }
      );
    }
  }, [project]);

  const handleClose = () => {
    if (!overlayRef.current || !panelRef.current) {
      onClose();
      return;
    }

    // Animate out
    gsap.to(panelRef.current, {
      x: "100%",
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 opacity-0 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute bottom-0 right-0 top-0 w-full max-w-lg overflow-y-auto bg-background/95 shadow-2xl backdrop-blur-md md:max-w-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-title"
      >
        {/* Header with gradient */}
        <div
          className="relative h-48 w-full md:h-64"
          style={{
            background: `linear-gradient(135deg, ${project.color}60, ${project.accentColor}30)`,
          }}
        >
          {/* Project initial as placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-8xl font-bold opacity-20"
              style={{ color: project.color }}
            >
              {project.title.charAt(0)}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-sm transition-all hover:bg-black/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close project details"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-6 pt-12">
            <h2
              id="project-title"
              className="text-2xl font-bold md:text-3xl"
              style={{ color: project.color }}
            >
              {project.title}
            </h2>
            <p className="mt-1 text-sm text-foreground-muted">
              {project.shortDescription}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          {project.stats && project.stats.length > 0 && (
            <div className="mb-6 grid grid-cols-3 gap-4">
              {project.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white/5 p-4 text-center"
                >
                  <div
                    className="text-xl font-bold md:text-2xl"
                    style={{ color: project.color }}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-foreground-muted">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground-muted">
              About
            </h3>
            <p className="leading-relaxed text-foreground/90">
              {project.description}
            </p>
          </div>

          {/* Technologies */}
          <div className="mb-8">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground-muted">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: `${project.color}20`,
                    color: project.color,
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${project.color}, ${project.accentColor})`,
                }}
              >
                <ExternalLink className="h-4 w-4" />
                View Project
              </a>
            )}
            <button
              onClick={handleClose}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-foreground transition-all hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
