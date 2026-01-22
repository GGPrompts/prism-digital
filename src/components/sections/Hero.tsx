'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useTextRevealOnRef } from '@/hooks/useTextReveal'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Check for reduced motion preference
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const headlineLine1Ref = useRef<HTMLSpanElement>(null)
  const headlineLine2Ref = useRef<HTMLSpanElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)

  // Apply text reveal animations to headline lines
  // Delays account for ContentFade (200ms + 1000ms transition)
  useTextRevealOnRef(headlineLine1Ref, {
    duration: 1,
    stagger: 0.04,
    yOffset: 30,
    triggerOnScroll: false, // Animate on page load
    delay: 1.5, // Start after ContentFade completes
    splitBy: 'chars',
  })

  useTextRevealOnRef(headlineLine2Ref, {
    duration: 1,
    stagger: 0.04,
    yOffset: 30,
    triggerOnScroll: false,
    delay: 2.0, // Staggered after first line
    splitBy: 'chars',
  })

  // Apply text reveal to subtext
  useTextRevealOnRef(subtextRef, {
    duration: 0.8,
    stagger: 0.02,
    yOffset: 20,
    triggerOnScroll: false,
    delay: 2.6, // After headline finishes
    splitBy: 'words',
  })

  useEffect(() => {
    if (!sectionRef.current) return

    const reducedMotion = prefersReducedMotion()

    const ctx = gsap.context(() => {
      // CTA fade in animation (after text reveals complete)
      if (ctaRef.current && !reducedMotion) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, delay: 3.2, ease: 'power3.out' }
        )
      }

      // Scroll indicator fade in
      if (scrollIndicatorRef.current && !reducedMotion) {
        gsap.fromTo(
          scrollIndicatorRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, delay: 3.8, ease: 'power2.out' }
        )
      }

      // Fade out hero content as user scrolls
      if (headlineRef.current) {
        gsap.to(headlineRef.current, {
          opacity: 0,
          y: -50,
          scale: 0.95,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }

      if (subtextRef.current) {
        gsap.to(subtextRef.current, {
          opacity: 0,
          y: -30,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }

      if (ctaRef.current) {
        gsap.to(ctaRef.current, {
          opacity: 0,
          y: -20,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        })
      }

      // Fade out scroll indicator early
      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          y: 20,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=140', // fade within the first ~140px of scroll
            scrub: 1,
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Gradient overlay - transparent to let 3D canvas show through */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial opacity-40" />
      </div>

      <div className="content-overlay relative z-10 w-full px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="space-y-6 md:space-y-8">

            <h1
              ref={headlineRef}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-center hero-headline"
            >
              <span
                ref={headlineLine1Ref}
                className="block text-gradient"
                style={{ opacity: 0 }}
              >
                Building the Future
              </span>
              <span
                ref={headlineLine2Ref}
                className="block text-white"
                style={{ opacity: 0 }}
              >
                of Web3D
              </span>
            </h1>

            <p
              ref={subtextRef}
              className="mx-auto max-w-2xl text-center text-lg md:text-xl lg:text-2xl text-foreground-muted font-light tracking-wide hero-subtext"
              style={{ opacity: 0 }}
            >
              Immersive 3D experiences for the modern web. Pushing boundaries, breaking conventions.
            </p>

            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-4 md:pt-8 hero-cta"
              style={{ opacity: 0 }}
            >
              <button className="btn btn-primary glow-pulse">
                See Our Work
              </button>

              <button className="btn btn-glass">
                Learn More
              </button>
            </div>

          </div>
        </div>
      </div>

      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none hero-scroll"
        style={{ opacity: 0 }}
      >
        <span className="text-xs md:text-sm font-medium tracking-widest uppercase text-foreground-subtle" style={{textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'}}>
          Scroll
        </span>

        <div className="animate-bounce">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))'}}
          >
            <path
              d="M7 10L12 15L17 10"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
