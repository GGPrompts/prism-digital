"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles, MousePointer2, Code2 } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

gsap.registerPlugin(ScrollTrigger);

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

  useEffect(() => {
    if (!sectionRef.current || !titleRef.current || !cardsRef.current) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.from(titleRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 50%",
          toggleActions: "play none none reverse",
        },
      });

      // Subtitle animation
      if (subtitleRef.current) {
        gsap.from(subtitleRef.current, {
          y: 60,
          opacity: 0,
          duration: 1,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Feature cards staggered animation
      const cards = cardsRef.current?.querySelectorAll(".feature-card");
      if (cards) {
        gsap.from(cards, {
          y: 100,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 75%",
            end: "top 40%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Parallax effect for the entire section
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="scroll-section relative overflow-hidden"
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

      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-20 text-center">
          <h2
            ref={titleRef}
            className="mb-6 bg-gradient-to-r from-primary via-primary-hover to-accent-cyan bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl"
          >
            What We Create
          </h2>
          <p
            ref={subtitleRef}
            className="mx-auto max-w-2xl text-lg text-foreground-muted md:text-xl"
          >
            Pushing the boundaries of web technology to deliver extraordinary 3D
            experiences
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
