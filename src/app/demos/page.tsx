"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import {
  ArrowLeft,
  Box,
  Sparkles,
  ScrollText,
  Atom,
  Palette,
  BarChart3,
  Images,
} from "lucide-react";
import { Header } from "@/components/sections/Header";

gsap.registerPlugin(ScrollTrigger);

// Check for reduced motion preference
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface Demo {
  slug: string;
  title: string;
  description: string;
  icon: typeof Box;
  tags: string[];
  status: "live" | "coming-soon";
}

const demos: Demo[] = [
  {
    slug: "configurator",
    title: "Product Configurator",
    description:
      "Interactive 3D product customization with real-time material and color changes",
    icon: Box,
    tags: ["3d", "interactive", "r3f"],
    status: "coming-soon",
  },
  {
    slug: "particles",
    title: "Particle Morphing",
    description:
      "Text and shapes that dissolve and reform using GPU-accelerated particles",
    icon: Sparkles,
    tags: ["particles", "shader", "gsap"],
    status: "live",
  },
  {
    slug: "journey",
    title: "Scroll Journey",
    description:
      "Immersive scroll-driven storytelling with animated 3D scenes and transitions",
    icon: ScrollText,
    tags: ["scroll", "animation", "storytelling"],
    status: "live",
  },
  {
    slug: "physics",
    title: "Physics Playground",
    description:
      "Real-time physics simulation with interactive objects and forces",
    icon: Atom,
    tags: ["physics", "simulation", "interactive"],
    status: "live",
  },
  {
    slug: "shaders",
    title: "Shader Gallery",
    description:
      "Collection of custom GLSL shaders showcasing visual effects and techniques",
    icon: Palette,
    tags: ["glsl", "shader", "effects"],
    status: "live",
  },
  {
    slug: "dataviz",
    title: "Data Visualization",
    description:
      "3D data visualization with interactive charts, graphs, and exploratory views",
    icon: BarChart3,
    tags: ["data", "charts", "interactive"],
    status: "live",
  },
  {
    slug: "portfolio",
    title: "Portfolio Gallery",
    description:
      "Elegant 3D gallery showcasing work with smooth transitions and hover effects",
    icon: Images,
    tags: ["gallery", "portfolio", "transitions"],
    status: "coming-soon",
  },
];

function DemoCard({ demo, index }: { demo: Demo; index: number }) {
  const Icon = demo.icon;
  const isComingSoon = demo.status === "coming-soon";

  const cardContent = (
    <div
      className="demo-card glass-card group relative overflow-hidden p-8 text-foreground"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Coming Soon Badge */}
      {isComingSoon && (
        <div className="absolute right-4 top-4 z-20 rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
          Coming Soon
        </div>
      )}

      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, var(--glow-primary-subtle) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon with glow effect */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/20">
          <Icon
            className="h-8 w-8 text-primary transition-all duration-500 group-hover:drop-shadow-[0_0_8px_var(--primary)]"
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h3 className="mb-3 text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
          {demo.title}
        </h3>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-foreground-muted transition-colors duration-300 group-hover:text-foreground">
          {demo.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {demo.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 dark:bg-white/5 px-2.5 py-1 text-xs font-medium text-foreground-muted transition-colors group-hover:bg-primary/20 group-hover:text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary via-primary-hover to-accent-cyan transition-all duration-500 group-hover:w-full" />
    </div>
  );

  if (isComingSoon) {
    return (
      <div className="cursor-not-allowed opacity-75 transition-opacity hover:opacity-90">
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={`/demos/${demo.slug}`} className="block">
      {cardContent}
    </Link>
  );
}

export default function DemosPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return;

    const reducedMotion = prefersReducedMotion();

    const ctx = gsap.context(() => {
      // Title animation
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

      // Subtitle animation
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

      // Demo cards staggered animation
      const cards = cardsRef.current?.querySelectorAll(".demo-card");
      if (cards && !reducedMotion) {
        gsap.from(cards, {
          y: 80,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
            end: "top 40%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Header />

      {/* Background gradient - transparent to show through to page background */}
      <div className="fixed inset-0 -z-10 bg-background/80 dark:bg-background/60">
        <div
          className="absolute left-1/2 top-1/3 h-[1000px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 dark:opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full opacity-8 dark:opacity-10 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)",
          }}
        />
      </div>

      <main className="min-h-screen pt-24">
        <section ref={sectionRef} className="relative overflow-hidden py-20">
          <div className="mx-auto max-w-7xl px-6">
            {/* Back link */}
            <Link
              href="/"
              className="group mb-12 inline-flex items-center gap-2 text-sm font-medium text-foreground-muted transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>

            {/* Section header */}
            <div className="mb-16 text-center">
              <h1
                ref={titleRef}
                className="mb-6 bg-gradient-to-r from-primary via-primary-hover to-accent-cyan bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl lg:text-7xl"
              >
                Explore Our Demos
              </h1>
              <p
                ref={subtitleRef}
                className="mx-auto max-w-2xl text-lg text-foreground-muted md:text-xl"
              >
                Interactive showcases of our 3D capabilities, from particle
                systems to physics simulations
              </p>
            </div>

            {/* Demo cards grid */}
            <div
              ref={cardsRef}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {demos.map((demo, index) => (
                <DemoCard key={demo.slug} demo={demo} index={index} />
              ))}
            </div>

            {/* CTA section */}
            <div className="mt-20 text-center">
              <p className="mb-6 text-foreground-muted">
                Want to see a custom demo for your project?
              </p>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-gradient-to-r from-primary to-primary-muted px-8 py-3 font-semibold text-white shadow-lg shadow-glow-primary/30 transition-all duration-300 hover:scale-105 hover:border-primary hover:from-primary-hover hover:to-primary hover:shadow-glow-primary/60"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
