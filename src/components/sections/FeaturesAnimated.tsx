"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, MousePointer2, Code2 } from "lucide-react";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    icon: Sparkles,
    title: "3D Visualization",
    description:
      "Transform complex data and products into stunning interactive 3D visuals.",
  },
  {
    icon: MousePointer2,
    title: "Interactive Experiences",
    description:
      "Create engaging web experiences that captivate and convert visitors.",
  },
  {
    icon: Code2,
    title: "WebGL Development",
    description:
      "Build high-performance 3D applications using cutting-edge web technologies.",
  },
];

export function FeaturesAnimated() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Title fade in from below
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 80,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Cards stagger animation
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        // Initial fade in
        gsap.from(card, {
          y: 100,
          opacity: 0,
          scale: 0.9,
          duration: 1,
          delay: index * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 60%",
            toggleActions: "play none none reverse",
          },
        });

        // Parallax effect - cards move at different speeds
        gsap.to(card, {
          y: -30 - index * 10,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      // Section background parallax
      if (sectionRef.current) {
        const bgGradient = sectionRef.current.querySelector(
          ".bg-gradient-glow"
        ) as HTMLElement;
        if (bgGradient) {
          gsap.to(bgGradient, {
            y: 100,
            opacity: 0.8,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="scroll-section relative overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-gradient-glow absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 opacity-40" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-20 text-center">
          <h2
            ref={titleRef}
            className="text-gradient mb-6 text-5xl font-bold tracking-tight md:text-6xl"
          >
            What We Create
          </h2>
        </div>

        {/* Feature cards grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className="group glass-card relative overflow-hidden p-8 transition-all duration-500 hover:scale-105 hover:border-primary/40"
              >
                {/* Icon */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent-cyan/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <Icon className="h-8 w-8 text-primary" />
                </div>

                {/* Title */}
                <h3 className="mb-4 text-2xl font-bold tracking-tight transition-colors group-hover:text-primary">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="leading-relaxed text-foreground-muted">
                  {feature.description}
                </p>

                {/* Hover glow effect */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent-cyan/10 blur-xl" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
