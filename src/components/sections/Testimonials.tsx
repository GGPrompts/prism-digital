'use client';

import { useEffect, useRef } from 'react';
import { useTextRevealOnRef } from '@/hooks/useTextReveal';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  initial: string;
}

interface Metric {
  value: string;
  label: string;
  suffix?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Prism Digital transformed our product visualization. The 3D experiences they created exceeded our expectations.",
    author: "Sarah Chen",
    role: "CEO",
    company: "TechVision Inc",
    initial: "SC"
  },
  {
    quote: "Working with Prism was a game-changer. Their attention to detail and technical expertise brought our vision to life in ways we didn't think possible.",
    author: "Marcus Rivera",
    role: "Creative Director",
    company: "Nexus Labs",
    initial: "MR"
  },
  {
    quote: "The immersive experiences Prism delivered drove a 300% increase in user engagement. Absolutely phenomenal work.",
    author: "Emily Santos",
    role: "Head of Product",
    company: "Quantum Studios",
    initial: "ES"
  },
  {
    quote: "From concept to execution, Prism Digital demonstrated unparalleled craftsmanship in 3D web development. A true partner in innovation.",
    author: "David Park",
    role: "CTO",
    company: "Hyperspace",
    initial: "DP"
  }
];

const metrics: Metric[] = [
  { value: "50", label: "Projects Delivered", suffix: "+" },
  { value: "98", label: "Client Satisfaction", suffix: "%" },
  { value: "10", label: "Industry Awards", suffix: "+" },
  { value: "5", label: "Years of Innovation", suffix: "" }
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const metricsRef = useRef<(HTMLDivElement | null)[]>([]);
  const quoteMarkRef = useRef<HTMLDivElement>(null);
  const trustBadgesRef = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

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
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('testimonial-visible');
        }
      });
    }, observerOptions);

    // Observe testimonial cards
    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    // Observe metrics
    metricsRef.current.forEach((metric) => {
      if (metric) observer.observe(metric);
    });

    // Observe trust badges
    trustBadgesRef.current.forEach((badge) => {
      if (badge) observer.observe(badge);
    });

    // Observe quote mark
    if (quoteMarkRef.current) {
      observer.observe(quoteMarkRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const rotations = [2, -1.5, 1, -2];

  return (
    <section
      ref={sectionRef}
      className="testimonials-section relative min-h-screen py-24 px-6 md:px-12 lg:px-20 overflow-hidden"
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-radial opacity-60 pointer-events-none" />

      {/* Decorative quote mark - massive, behind content */}
      <div
        ref={quoteMarkRef}
        className="testimonial-quotemark absolute -top-20 left-1/2 -translate-x-1/2 text-[28rem] md:text-[28rem] font-serif text-primary/5 leading-none select-none pointer-events-none"
        style={{ fontFamily: 'Georgia, serif' }}
        aria-hidden="true"
      >
        &ldquo;
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <div className="inline-block mb-4">
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold px-4 py-1.5 border border-primary/30 rounded-full">
              Social Proof
            </span>
          </div>
          <h2
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
            style={{ opacity: 0 }}
          >
            Trusted by Visionaries
          </h2>
          <p
            ref={subtitleRef}
            className="text-lg text-foreground-muted max-w-2xl mx-auto"
            style={{ opacity: 0 }}
          >
            We&apos;ve partnered with forward-thinking companies to create experiences that redefine what&apos;s possible on the web.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              ref={(el) => { metricsRef.current[index] = el; }}
              className="testimonial-metric text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative inline-block">
                <div className="text-6xl md:text-7xl font-black text-foreground mb-2 tabular-nums">
                  {metric.value}
                  <span className="text-primary">{metric.suffix}</span>
                </div>
                {/* Decorative underline */}
                <div className="testimonial-metric-line absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              </div>
              <p className="text-sm text-foreground-subtle uppercase tracking-wider mt-3">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials - Asymmetric Masonry Layout */}
        <div className="testimonials-grid grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.author}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="testimonial-card"
              style={{
                animationDelay: `${index * 150}ms`,
                transform: `rotate(${rotations[index]}deg)`
              }}
            >
              {/* Card content - more transparent to show 3D behind */}
              <div className="testimonial-card-inner relative bg-gradient-to-br from-background-tertiary/70 to-background-secondary/60 backdrop-blur-md border border-primary/20 rounded-3xl p-8 md:p-10 h-full shadow-2xl">
                {/* Top accent line */}
                <div className="w-16 h-1 bg-gradient-to-r from-primary to-accent-cyan mb-6" />

                {/* Quote */}
                <blockquote className="mb-8">
                  <p className="text-lg md:text-xl leading-relaxed text-foreground font-light italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                </blockquote>

                {/* Author info */}
                <div className="flex items-center gap-4">
                  {/* Avatar with initial */}
                  <div className="testimonial-avatar w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-muted flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-lg font-bold text-primary-foreground">
                      {testimonial.initial}
                    </span>
                  </div>

                  {/* Author details */}
                  <div>
                    <div className="font-semibold text-foreground text-base">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-foreground-subtle">
                      {testimonial.role} • <span className="text-primary">{testimonial.company}</span>
                    </div>
                  </div>
                </div>

                {/* Decorative corner accents */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/20" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary/20" />
              </div>
            </div>
          ))}
        </div>

        {/* Company Logos Section */}
        <div className="mt-24 pt-16 border-t border-border/30">
          <p className="text-center text-sm uppercase tracking-widest text-foreground-subtle mb-12">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16 opacity-40">
            {/* Placeholder logo shapes - geometric minimal */}
            {[
              { width: 120, height: 40, name: "TechVision" },
              { width: 100, height: 40, name: "Nexus" },
              { width: 140, height: 40, name: "Quantum" },
              { width: 110, height: 40, name: "Hyperspace" }
            ].map((logo, i) => (
              <div
                key={i}
                ref={(el) => { trustBadgesRef.current[i] = el; }}
                className="testimonial-trust-badge"
                style={{
                  width: `${logo.width}px`,
                  height: `${logo.height}px`,
                  animationDelay: `${i * 100}ms`
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    viewBox="0 0 100 30"
                    className="w-full h-full"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  >
                    <rect
                      x="10"
                      y="8"
                      width="30"
                      height="14"
                      rx="2"
                      fill="currentColor"
                      opacity="0.3"
                    />
                    <rect
                      x="45"
                      y="8"
                      width="45"
                      height="4"
                      rx="2"
                      fill="currentColor"
                      opacity="0.5"
                    />
                    <rect
                      x="45"
                      y="16"
                      width="30"
                      height="4"
                      rx="2"
                      fill="currentColor"
                      opacity="0.4"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
