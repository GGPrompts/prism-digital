"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, MousePointer2, Code2 } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { useTextRevealOnRef } from "@/hooks/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

// Check for reduced motion preference
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const features = [
  {
    icon: Sparkles,
    title: "3D Visualization",
    description:
      "Stunning 3D renders and animations that bring your ideas to life with photorealistic quality and immersive detail.",
  },
  {
    icon: MousePointer2,
    title: "Interactive Experiences",
    description:
      "Engaging web-based 3D interactions that captivate users and create memorable brand experiences.",
  },
  {
    icon: Code2,
    title: "WebGL Development",
    description:
      "Custom WebGL solutions built with cutting-edge technologies for maximum performance and visual impact.",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Apply text reveal to section title
  useTextRevealOnRef(titleRef, {
    duration: 1,
    stagger: 0.04,
    yOffset: 30,
    triggerOnScroll: true,
    triggerStart: "top 85%",
    splitBy: "chars",
  });

  // Apply text reveal to subtitle
  useTextRevealOnRef(subtitleRef, {
    duration: 0.8,
    stagger: 0.02,
    yOffset: 20,
    triggerOnScroll: true,
    triggerStart: "top 85%",
    delay: 0.3,
    splitBy: "words",
  });

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return;

    const reducedMotion = prefersReducedMotion();

    const ctx = gsap.context(() => {
      // Feature cards staggered animation
      const cards = cardsRef.current?.querySelectorAll(".feature-card");
      if (cards && cards.length > 0) {
        if (!reducedMotion) {
          gsap.fromTo(
            cards,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.15,
              ease: "power2.out",
              scrollTrigger: {
                trigger: cardsRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          );
        } else {
          // Reduced motion - just show immediately
          gsap.set(cards, { opacity: 1, y: 0 });
        }
      }

      // Parallax effect for the entire section
      if (!reducedMotion) {
        gsap.to(sectionRef.current, {
          y: -50,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="scroll-section relative"
      id="features"
      data-section="features"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="content-overlay mx-auto max-w-7xl px-6 relative z-10">
        {/* Section header */}
        <div className="mb-20 text-center">
          <h2
            ref={titleRef}
            className="mb-6 bg-gradient-to-r from-primary via-primary-hover to-accent-cyan bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl"
            style={{ opacity: 0 }}
          >
            What We Create
          </h2>
          <p
            ref={subtitleRef}
            className="mx-auto max-w-2xl text-lg text-foreground-muted md:text-xl"
            style={{ opacity: 0 }}
          >
            Pushing the boundaries of web technology to deliver extraordinary 3D experiences
          </p>
        </div>

        {/* Feature cards grid */}
        <div
          ref={cardsRef}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* Decorative elements */}
        <div className="absolute left-0 top-1/2 -z-10 h-px w-full -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
    </section>
  );
}
