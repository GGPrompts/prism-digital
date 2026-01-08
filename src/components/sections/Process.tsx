"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProcessIcon3D } from "@/components/canvas/ProcessIcon3D";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Check for reduced motion preference
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type IconType = "discovery" | "design" | "develop" | "deploy";

const processSteps: {
  number: string;
  title: string;
  description: string;
  icon: string;
  iconType: IconType;
  color: string;
  accentColor: string;
}[] = [
  {
    number: "01",
    title: "Discovery",
    description: "We dive deep into your vision, understanding goals, audience, and technical requirements to craft the perfect 3D experience.",
    icon: "🔍",
    iconType: "discovery",
    color: "from-purple-500 via-violet-500 to-purple-600",
    accentColor: "from-cyan-400 to-blue-500"
  },
  {
    number: "02",
    title: "Design",
    description: "Our team creates stunning 3D prototypes and interactive mockups, refining every detail until it exceeds expectations.",
    icon: "✨",
    iconType: "design",
    color: "from-violet-500 via-purple-500 to-fuchsia-500",
    accentColor: "from-pink-400 to-purple-500"
  },
  {
    number: "03",
    title: "Develop",
    description: "With cutting-edge WebGL and React Three Fiber, we build high-performance 3D web experiences optimized for all devices.",
    icon: "⚡",
    iconType: "develop",
    color: "from-fuchsia-500 via-pink-500 to-purple-600",
    accentColor: "from-blue-400 to-cyan-500"
  },
  {
    number: "04",
    title: "Deploy",
    description: "We launch your 3D masterpiece with rigorous testing, performance optimization, and continuous support to ensure success.",
    icon: "🚀",
    iconType: "deploy",
    color: "from-pink-500 via-purple-500 to-violet-600",
    accentColor: "from-purple-400 to-pink-500"
  }
];

export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const progressGlowRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const indicatorsRef = useRef<(HTMLDivElement | null)[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const device = useDeviceDetection();

  // Determine if we should use 3D icons (desktop/tablet with good GPU)
  const use3DIcons = !device.isMobile && device.gpu !== "low";

  useEffect(() => {
    if (!sectionRef.current) return;

    const reducedMotion = prefersReducedMotion();

    const ctx = gsap.context(() => {
      // Header entrance animation
      if (headerRef.current && !reducedMotion) {
        gsap.from(headerRef.current, {
          y: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Animate progress line fill with clipPath for smooth reveal
      if (progressLineRef.current && progressGlowRef.current) {
        const progressElements = [progressLineRef.current, progressGlowRef.current];

        gsap.fromTo(
          progressElements,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 40%",
              end: "bottom 60%",
              scrub: 0.5,
            },
          }
        );
      }

      // Animate each step card with staggered entrance
      stepsRef.current.forEach((step, index) => {
        if (!step) return;

        if (reducedMotion) {
          // For reduced motion: simple fade only
          gsap.from(step, {
            opacity: 0,
            duration: 0.5,
            scrollTrigger: {
              trigger: step,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
          return;
        }

        // Staggered fade-in + slide animation
        gsap.fromTo(
          step,
          {
            opacity: 0,
            x: index % 2 === 0 ? -80 : 80,
            y: 40,
            scale: 0.95,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 1,
            delay: index * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: step,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Subtle parallax effect - cards move at different speeds
        gsap.to(step, {
          y: -20 - index * 5,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      });

      // Animate step indicators (center nodes) with floating/bobbing
      indicatorsRef.current.forEach((indicator, index) => {
        if (!indicator || reducedMotion) return;

        // Floating animation for step indicators
        gsap.to(indicator, {
          y: -6,
          duration: 2 + index * 0.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.3,
        });

        // Scale pulse on scroll into view
        gsap.fromTo(
          indicator,
          { scale: 0.5, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            delay: index * 0.15,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: indicator,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="scroll-section relative overflow-hidden"
      style={{ minHeight: "150vh" }}
    >
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        {/* Section Header */}
        <div ref={headerRef} className="mb-24 text-center">
          <div className="mb-6 inline-block">
            <span className="text-sm font-mono uppercase tracking-wider text-accent-cyan">
              How We Work
            </span>
          </div>
          <h2 className="text-gradient mb-6 text-5xl font-bold md:text-7xl">
            Our Process
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-foreground-muted">
            From concept to launch, we transform your vision into immersive 3D realities
          </p>
        </div>

        {/* Progress indicator */}
        <div className="relative mx-auto max-w-5xl">
          {/* Vertical progress line - background track */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-purple-500/10" />

          {/* Vertical progress line - animated fill with glow */}
          <div
            ref={progressGlowRef}
            className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 opacity-30 blur-sm"
          />
          <div
            ref={progressLineRef}
            className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500"
          />

          {/* Process Steps */}
          <div className="space-y-32 py-12">
            {processSteps.map((step, index) => (
              <div
                key={step.number}
                ref={(el) => {
                  stepsRef.current[index] = el;
                }}
                className={`relative flex items-center gap-8 ${
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {/* Step Card - Glassmorphism design */}
                <div className="group relative flex-1">
                  <div className="glass-card relative p-8">
                    {/* Subtle gradient accent on hover */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5 pointer-events-none`}
                      style={{ zIndex: 1 }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Step number with 3D icon */}
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-purple-500/30 bg-purple-500/10">
                          {use3DIcons ? (
                            <ProcessIcon3D
                              type={step.iconType}
                              accentColor={step.accentColor}
                              fallbackIcon={step.icon}
                              isMobile={device.isMobile}
                            />
                          ) : (
                            <span className="text-3xl">{step.icon}</span>
                          )}
                        </div>
                        <span className="font-mono text-5xl font-bold text-purple-400/50">
                          {step.number}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mb-3 text-3xl font-bold text-white">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-base leading-relaxed text-gray-200">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Center Node - Step Indicator */}
                <div
                  ref={(el) => {
                    indicatorsRef.current[index] = el;
                  }}
                  className="relative z-20 flex h-8 w-8 flex-shrink-0 items-center justify-center"
                >
                  <div className="absolute h-8 w-8 animate-ping rounded-full bg-purple-500 opacity-20" />
                  <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${step.accentColor} shadow-lg shadow-purple-500/50 transition-transform duration-300 hover:scale-125`} />
                  <div className="absolute h-12 w-12 rounded-full border border-purple-500/30" />
                </div>

                {/* Spacer for alternating layout */}
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-32 text-center">
          <button className="btn btn-primary glow-pulse text-lg">
            Start Your Project
          </button>
        </div>
      </div>

    </section>
  );
}
