"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { portfolioProjects, type PortfolioProject } from "@/lib/portfolioData";
import { PortfolioDetail } from "@/components/sections/PortfolioDetail";
import { usePortfolioState } from "@/hooks/usePortfolioState";

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface MobileProjectCardProps {
  project: PortfolioProject;
  index: number;
  onClick: () => void;
}

function MobileProjectCard({ project, index, onClick }: MobileProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="mobile-card glass-card group relative w-full overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50"
      style={{
        animationDelay: `${index * 100}ms`,
        borderColor: `${project.color}20`,
      }}
    >
      {/* Project thumbnail placeholder */}
      <div
        className="relative mb-4 aspect-video overflow-hidden rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${project.color}40, ${project.accentColor}20)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-4xl font-bold opacity-30"
            style={{ color: project.color }}
          >
            {project.title.charAt(0)}
          </span>
        </div>
        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-sm font-medium text-white">View Details</span>
        </div>
      </div>

      {/* Content */}
      <h3
        className="mb-2 text-lg font-bold transition-colors duration-300 group-hover:text-primary"
        style={{ color: project.color }}
      >
        {project.title}
      </h3>
      <p className="mb-3 line-clamp-2 text-sm text-foreground-muted">
        {project.shortDescription}
      </p>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-1.5">
        {project.technologies.slice(0, 3).map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-foreground-muted"
          >
            {tech}
          </span>
        ))}
        {project.technologies.length > 3 && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-foreground-muted">
            +{project.technologies.length - 3}
          </span>
        )}
      </div>

      {/* Accent line */}
      <div
        className="absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full"
        style={{
          background: `linear-gradient(90deg, ${project.color}, ${project.accentColor})`,
        }}
      />
    </button>
  );
}

export default function WorkPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);

  // Use shared portfolio state for 3D scene communication
  const {
    setIsWorkRoute,
    selectedProject,
    setSelectedProject,
  } = usePortfolioState();

  // Set work route flag when component mounts
  useEffect(() => {
    setIsWorkRoute(true);
    return () => setIsWorkRoute(false);
  }, [setIsWorkRoute]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // GSAP animations for mobile grid
  useEffect(() => {
    if (!sectionRef.current || !gridRef.current || !isMobile) return;

    const reducedMotion = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (titleRef.current && !reducedMotion) {
        gsap.from(titleRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }

      if (subtitleRef.current && !reducedMotion) {
        gsap.from(subtitleRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: subtitleRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }

      const cards = gridRef.current?.querySelectorAll(".mobile-card");
      if (cards && !reducedMotion) {
        gsap.from(cards, {
          y: 60,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  // Handle escape key to close detail
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedProject) {
        setSelectedProject(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProject]);

  return (
    <>
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 bg-background">
        <div
          className="absolute left-1/2 top-1/3 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full opacity-10 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)",
          }}
        />
      </div>

      <main className="min-h-screen pt-24">
        <section ref={sectionRef} className="relative overflow-hidden py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            {/* Back link */}
            <Link
              href="/"
              className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-foreground-muted transition-colors hover:text-primary md:mb-12"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>

            {/* Section header */}
            <div className="mb-12 text-center md:mb-16">
              <h1
                ref={titleRef}
                className="mb-4 bg-gradient-to-r from-primary via-primary-hover to-accent-cyan bg-clip-text text-4xl font-bold tracking-tight text-transparent md:mb-6 md:text-5xl lg:text-6xl"
              >
                Our Work
              </h1>
              <p
                ref={subtitleRef}
                className="mx-auto max-w-2xl text-base text-foreground-muted md:text-lg"
              >
                Explore our portfolio of immersive 3D experiences, interactive
                visualizations, and cutting-edge WebGL applications
              </p>
            </div>

            {/* Desktop: 3D scene takes over - hide this content */}
            <div className="hidden md:block">
              <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-foreground-muted/50">
                  Interact with the 3D gallery to explore our work
                </p>
              </div>
            </div>

            {/* Mobile: 2D grid fallback */}
            <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 md:hidden">
              {portfolioProjects.map((project, index) => (
                <MobileProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onClick={() => setSelectedProject(project)}
                />
              ))}
            </div>

            {/* CTA section */}
            <div className="mt-16 text-center md:mt-20">
              <p className="mb-6 text-foreground-muted">
                Ready to bring your vision to life?
              </p>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-gradient-to-r from-primary to-primary-muted px-8 py-3 font-semibold text-white shadow-lg shadow-glow-primary/30 transition-all duration-300 hover:scale-105 hover:border-primary hover:from-primary-hover hover:to-primary hover:shadow-glow-primary/60"
              >
                Start a Project
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Detail modal */}
      <PortfolioDetail
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
