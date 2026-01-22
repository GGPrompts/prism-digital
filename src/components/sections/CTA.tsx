'use client'

import { useEffect, useRef, useState } from 'react'
import { MagneticButton } from '@/components/ui/MagneticButton'

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PARTICLES = Array.from({ length: 30 }, (_, index) => {
  const rand = mulberry32(index + 1)
  const width = 1 + rand() * 4
  const height = 1 + rand() * 4
  const left = rand() * 100
  const top = rand() * 100
  const duration = 10 + rand() * 20
  const delay = rand() * 20
  return { width, height, left, top, duration, delay }
})

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Email submitted:', email)
    setEmail('')
    setIsSubmitting(false)
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-32 md:py-40"
      style={{
        background: 'linear-gradient(180deg, #050507 0%, #0a0a0f 50%, #12121a 100%)'
      }}
    >
      {/* Animated gradient glow overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-3xl"
          style={{
            background: `radial-gradient(circle,
              rgba(168, 85, 247, 0.4) 0%,
              rgba(124, 58, 237, 0.3) 30%,
              rgba(244, 114, 182, 0.2) 60%,
              transparent 100%)`,
            animation: 'pulse-glow 8s ease-in-out infinite alternate'
          }}
        />
      </div>

      {/* Floating particles effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary opacity-10"
            style={{
              width: p.width + 'px',
              height: p.height + 'px',
              left: p.left + '%',
              top: p.top + '%',
              animation: `float ${p.duration}s linear infinite`,
              animationDelay: `-${p.delay}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        {/* Headline with staggered animation */}
        <div
          className={`mb-6 transition-all duration-1000 ${
            isVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-10 opacity-0'
          }`}
          style={{
            transitionDelay: '100ms'
          }}
        >
          <h2
            className="mb-4 text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl"
            style={{
              background: 'linear-gradient(135deg, #f4f4f5 0%, #c084fc 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 80px rgba(168, 85, 247, 0.3)'
            }}
          >
            Ready to Transform
            <br />
            Your Vision?
          </h2>
          <div
            className="mx-auto mt-6 h-1 w-32 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #a855f7, transparent)',
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
            }}
          />
        </div>

        {/* Supporting copy */}
        <p
          className={`mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-foreground-muted transition-all duration-1000 md:text-2xl ${
            isVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-10 opacity-0'
          }`}
          style={{
            transitionDelay: '300ms'
          }}
        >
          Let&apos;s bring your ideas to life with cutting-edge 3D experiences that captivate, engage, and convert.
        </p>

        {/* CTA Button - Large and prominent */}
        <div
          className={`mb-16 transition-all duration-1000 ${
            isVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-10 opacity-0'
          }`}
          style={{
            transitionDelay: '500ms'
          }}
        >
          <MagneticButton
            className="group relative overflow-hidden rounded-2xl px-12 py-6 text-xl font-bold text-white shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-purple-500/50 md:px-16 md:py-8 md:text-2xl magnetic-glow-cta"
            magneticDistance={120}
            maxOffset={18}
            strength={0.4}
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #c084fc 100%)'
            }}
            contentClassName="relative z-10 flex items-center gap-3"
          >
            See Our Work
            <svg
              className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-2 md:h-8 md:w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </MagneticButton>
        </div>

        {/* Optional Email Capture Form */}
        <div
          className={`transition-all duration-1000 ${
            isVisible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-10 opacity-0'
          }`}
          style={{
            transitionDelay: '700ms'
          }}
        >
          <div className="glass mx-auto max-w-xl rounded-2xl p-8 backdrop-blur-xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-foreground-muted">
              Or stay updated
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-xl border border-glass-border bg-background-secondary/80 px-6 py-4 text-foreground placeholder-foreground-subtle outline-none transition-all duration-300 focus:border-primary focus:shadow-lg focus:shadow-primary/20"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl border border-glass-border bg-primary px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Subscribe'}
              </button>
            </form>

            <p className="mt-4 text-xs text-foreground-subtle">
              Get exclusive insights on 3D web development and design trends
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.4;
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-40px) translateX(-5px);
          }
          75% {
            transform: translateY(-20px) translateX(-10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </section>
  )
}
