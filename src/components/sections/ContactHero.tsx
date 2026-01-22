"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EnvelopeScene } from "@/components/canvas/EnvelopeScene";
import { ContactForm } from "@/components/ui/ContactForm";
import { useEnvelopeAnimation } from "@/hooks/useEnvelopeAnimation";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { useTextRevealOnRef } from "@/hooks/useTextReveal";

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ContactHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const device = useDeviceDetection();
  const envelopeAnimation = useEnvelopeAnimation();

  // Text reveal animations
  useTextRevealOnRef(titleRef, {
    duration: 1,
    stagger: 0.04,
    yOffset: 30,
    triggerOnScroll: true,
    triggerStart: "top 85%",
    splitBy: "chars",
  });

  // Intersection observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // GSAP animations for content
  useEffect(() => {
    if (!sectionRef.current) return;
    const reducedMotion = prefersReducedMotion();

    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      // Animate form card
      gsap.fromTo(
        ".contact-form-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact-hero"
      className="relative min-h-screen overflow-hidden px-6 py-24 md:py-32"
      style={{
        background:
          "linear-gradient(180deg, #050507 0%, #0a0a0f 50%, #12121a 100%)",
      }}
    >
      {/* Background gradient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/4 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle,
              rgba(168, 85, 247, 0.4) 0%,
              rgba(124, 58, 237, 0.3) 30%,
              transparent 70%)`,
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 opacity-15 blur-3xl"
          style={{
            background: `radial-gradient(circle,
              rgba(34, 211, 238, 0.4) 0%,
              rgba(34, 211, 238, 0.2) 40%,
              transparent 70%)`,
          }}
        />
      </div>

      {/* Main content container */}
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          <h1
            ref={titleRef}
            className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
            style={{
              background:
                "linear-gradient(135deg, #f4f4f5 0%, #c084fc 50%, #f472b6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Let&apos;s Build Something
            <br />
            Amazing Together
          </h1>
          <p
            ref={subtitleRef}
            className={`mx-auto max-w-xl text-lg text-foreground-muted transition-all duration-1000 md:text-xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            Have a project in mind? We&apos;d love to hear about it. Send us a
            message and let&apos;s create something extraordinary.
          </p>
        </div>

        {/* Split layout: 3D scene (left) + Form (right) */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* 3D Scene - Hidden on mobile for performance */}
          <div
            className={`relative hidden h-[400px] lg:block lg:h-[500px] ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{
              transition: "all 1s ease-out",
              transitionDelay: "300ms",
            }}
          >
            <div className="absolute inset-0 rounded-2xl border border-glass-border bg-background-secondary/30 backdrop-blur-sm">
              <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                style={{ borderRadius: "1rem" }}
              >
                <EnvelopeScene
                  device={device}
                  animationState={envelopeAnimation.state}
                />
              </Canvas>
            </div>
          </div>

          {/* Form Card */}
          <div
            className={`contact-form-card glass rounded-2xl p-6 backdrop-blur-xl md:p-8 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
            style={{
              transition: "all 1s ease-out",
              transitionDelay: "500ms",
            }}
          >
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-foreground">
                Get in Touch
              </h2>
              <p className="text-sm text-foreground-muted">
                Fill out the form below and we&apos;ll get back to you within
                24 hours.
              </p>
            </div>

            <ContactForm envelopeAnimation={envelopeAnimation} />
          </div>
        </div>

        {/* Contact info cards */}
        <div
          className={`mt-12 grid gap-4 sm:grid-cols-3 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
          style={{
            transition: "all 1s ease-out",
            transitionDelay: "700ms",
          }}
        >
          {[
            {
              icon: (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              ),
              label: "Email",
              value: "hello@prismdigital.com",
            },
            {
              icon: (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ),
              label: "Location",
              value: "San Francisco, CA",
            },
            {
              icon: (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
              label: "Response Time",
              value: "Within 24 hours",
            },
          ].map((item, i) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-xl border border-glass-border bg-background-secondary/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-background-secondary/70"
              style={{ transitionDelay: `${800 + i * 100}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {item.icon}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                  {item.label}
                </p>
                <p className="font-medium text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
