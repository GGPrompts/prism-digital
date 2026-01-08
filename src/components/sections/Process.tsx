"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const processSteps = [
  {
    number: "01",
    title: "Discovery",
    description: "We dive deep into your vision, understanding goals, audience, and technical requirements to craft the perfect 3D experience.",
    icon: "🔍",
    color: "from-purple-500 via-violet-500 to-purple-600",
    accentColor: "from-cyan-400 to-blue-500"
  },
  {
    number: "02",
    title: "Design",
    description: "Our team creates stunning 3D prototypes and interactive mockups, refining every detail until it exceeds expectations.",
    icon: "✨",
    color: "from-violet-500 via-purple-500 to-fuchsia-500",
    accentColor: "from-pink-400 to-purple-500"
  },
  {
    number: "03",
    title: "Develop",
    description: "With cutting-edge WebGL and React Three Fiber, we build high-performance 3D web experiences optimized for all devices.",
    icon: "⚡",
    color: "from-fuchsia-500 via-pink-500 to-purple-600",
    accentColor: "from-blue-400 to-cyan-500"
  },
  {
    number: "04",
    title: "Deploy",
    description: "We launch your 3D masterpiece with rigorous testing, performance optimization, and continuous support to ensure success.",
    icon: "🚀",
    color: "from-pink-500 via-purple-500 to-violet-600",
    accentColor: "from-purple-400 to-pink-500"
  }
];

export function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Animate progress line
      gsap.from(progressLineRef.current, {
        scaleY: 0,
        transformOrigin: "top center",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 1,
        },
      });

      // Animate each step card with visible default state
      stepsRef.current.forEach((step, index) => {
        if (!step) return;

        // Set initial visible state
        gsap.set(step, { opacity: 1, x: 0 });

        // Card entrance animation on scroll
        gsap.fromTo(
          step,
          {
            opacity: 0.3,
            x: index % 2 === 0 ? -50 : 50,
          },
          {
            opacity: 1,
            x: 0,
            scrollTrigger: {
              trigger: step,
              start: "top 90%",
              end: "top 60%",
              scrub: 1,
            },
          }
        );

        // Floating animation
        gsap.to(step, {
          y: -8,
          duration: 2.5 + index * 0.3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.2,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="scroll-section relative overflow-hidden"
      style={{ minHeight: "150vh" }}
    >
      {/* Simple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        {/* Section Header */}
        <div className="mb-24 text-center">
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
          {/* Vertical progress line */}
          <div
            ref={progressLineRef}
            className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 opacity-30 blur-sm"
            style={{ transformOrigin: "top center" }}
          />
          <div
            className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500"
            style={{ transformOrigin: "top center" }}
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
                      {/* Step number with icon */}
                      <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10">
                          <span className="text-3xl">{step.icon}</span>
                        </div>
                        <span className="font-mono text-5xl font-bold text-purple-500/30">
                          {step.number}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="mb-3 text-3xl font-bold text-white">
                        {step.title}
                      </h3>

                      {/* Description */}
                      <p className="text-base leading-relaxed text-gray-300">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Center Node */}
                <div className="relative z-20 flex h-8 w-8 flex-shrink-0 items-center justify-center">
                  <div className="absolute h-8 w-8 animate-ping rounded-full bg-purple-500 opacity-20" />
                  <div className={`h-6 w-6 rounded-full bg-gradient-to-br ${step.accentColor} shadow-lg shadow-purple-500/50`} />
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
