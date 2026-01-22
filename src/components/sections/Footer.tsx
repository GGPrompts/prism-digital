'use client'

import { useState, useCallback, type ReactNode } from 'react'
import { Twitter, Linkedin, Instagram, Github } from 'lucide-react'

export function Footer() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [emailFocused, setEmailFocused] = useState(false)

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/#features' },
    { name: 'Demos', href: '/demos' },
    { name: 'About', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
  ]

  const services = [
    '3D Visualization',
    'Interactive Experiences',
    'WebGL Development',
  ]

  const socialLinks: { name: string; href: string; icon: ReactNode }[] = [
    { name: 'Twitter', href: 'https://twitter.com/prismdigital', icon: <Twitter className="h-5 w-5" /> },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/prismdigital', icon: <Linkedin className="h-5 w-5" /> },
    { name: 'Instagram', href: 'https://instagram.com/prismdigital', icon: <Instagram className="h-5 w-5" /> },
    { name: 'GitHub', href: 'https://github.com/prismdigital', icon: <Github className="h-5 w-5" /> },
  ]

  // Smooth scroll handler for navigation links
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // For page routes without anchors, let the browser handle navigation
    if (!href.includes('#')) {
      return
    }

    // Extract the path and anchor parts
    const [path, anchor] = href.split('#')
    const isCurrentPage = path === '' || path === '/' || window.location.pathname === path || window.location.pathname === '/'

    // If we're on a different page, let the browser navigate
    if (!isCurrentPage && path !== '') {
      return
    }

    // If we're on the current page, smooth scroll
    e.preventDefault()
    const element = document.getElementById(anchor)

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [])

  return (
    <footer className="relative overflow-hidden border-t border-primary/10 bg-background-secondary">
      {/* Diagonal separator with gradient */}
      <div
        className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent"
        style={{
          transform: 'skewY(-0.5deg)',
          transformOrigin: 'top left',
        }}
      />

      {/* Ambient glow effect */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      {/* Main footer content */}
      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        {/* Top grid - Asymmetric layout */}
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1.5fr]">
          {/* Brand column - Takes more space */}
          <div className="space-y-6">
            <div className="group relative inline-block">
              <h3
                className="text-3xl font-black uppercase tracking-tighter text-foreground lg:text-4xl"
                style={{
                  fontVariantCaps: 'all-small-caps',
                  letterSpacing: '-0.05em',
                }}
              >
                Prism
                <span className="text-gradient ml-1">Digital</span>
              </h3>
              {/* Underline effect */}
              <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-accent-pink transition-all duration-500 ease-out group-hover:w-full" />
            </div>

            <p
              className="max-w-xs text-sm uppercase tracking-widest text-foreground-muted"
              style={{ letterSpacing: '0.15em' }}
            >
              Building the Future of Web3D
            </p>

            <p className="max-w-sm text-sm leading-relaxed text-foreground-subtle">
              We craft immersive 3D experiences that transcend the boundaries of traditional web design.
              Every pixel matters. Every interaction counts.
            </p>

            {/* Newsletter signup with futuristic styling */}
            <div className="pt-4">
              <div
                className={`
                  group relative overflow-hidden rounded-lg border bg-background-tertiary/50 backdrop-blur-sm transition-all duration-300
                  ${emailFocused ? 'border-primary shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'border-border'}
                `}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="w-full bg-transparent px-4 py-3 text-sm text-foreground placeholder-foreground-subtle outline-none"
                />
                <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <button
                className="mt-2 w-full rounded-lg bg-gradient-to-r from-primary to-primary-muted px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:brightness-110"
                style={{ letterSpacing: '0.1em' }}
              >
                Subscribe
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4
              className="text-sm font-bold uppercase tracking-widest text-foreground-muted"
              style={{ letterSpacing: '0.2em' }}
            >
              Navigate
            </h4>
            <nav className="space-y-3">
              {navLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="group relative block cursor-pointer text-foreground-muted transition-colors duration-300 hover:text-primary"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span className="relative inline-block">
                    {/* Glitch effect on hover */}
                    {hoveredLink === link.name && (
                      <>
                        <span
                          className="absolute left-0 top-0 text-accent-cyan opacity-70"
                          style={{ transform: 'translate(-1px, -1px)' }}
                        >
                          {link.name}
                        </span>
                        <span
                          className="absolute left-0 top-0 text-accent-pink opacity-70"
                          style={{ transform: 'translate(1px, 1px)' }}
                        >
                          {link.name}
                        </span>
                      </>
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </span>

                  {/* Arrow indicator */}
                  <span className="ml-1 inline-block opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4
              className="text-sm font-bold uppercase tracking-widest text-foreground-muted"
              style={{ letterSpacing: '0.2em' }}
            >
              Services
            </h4>
            <div className="space-y-3">
              {services.map((service, index) => (
                <div
                  key={service}
                  className="group relative cursor-default text-sm text-foreground-subtle transition-colors duration-300 hover:text-foreground"
                  style={{
                    animationDelay: `${index * 60}ms`,
                  }}
                >
                  {/* Decorative line */}
                  <div className="absolute -left-4 top-1/2 h-px w-2 -translate-y-1/2 bg-primary opacity-0 transition-all duration-300 group-hover:w-3 group-hover:opacity-100" />
                  {service}
                </div>
              ))}
            </div>
          </div>

          {/* Connect column with social icons */}
          <div className="space-y-6">
            <h4
              className="text-sm font-bold uppercase tracking-widest text-foreground-muted"
              style={{ letterSpacing: '0.2em' }}
            >
              Connect
            </h4>

            {/* Social icons with cyber-brutalist design */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-12 w-12 items-center justify-center overflow-hidden border border-border bg-background-tertiary/50 transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-110"
                  style={{
                    clipPath: 'polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)',
                    animationDelay: `${index * 40}ms`,
                  }}
                  aria-label={social.name}
                >
                  <span className="text-foreground-muted transition-all duration-300 group-hover:text-primary">
                    {social.icon}
                  </span>

                  {/* Diagonal scan line effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/20 to-transparent transition-transform duration-500 group-hover:translate-x-full"
                    style={{ transform: 'skewX(-20deg)' }}
                  />
                </a>
              ))}
            </div>

            {/* Contact info with monospace font */}
            <div className="space-y-3 pt-4">
              <a
                href="mailto:hello@prismdigital.com"
                className="group block text-sm text-foreground-subtle transition-colors hover:text-primary"
              >
                <span className="font-mono text-xs uppercase tracking-wider">Email</span>
                <div className="mt-1 font-mono text-foreground-muted group-hover:text-primary">
                  hello@prismdigital.com
                </div>
              </a>

              <div className="text-sm text-foreground-subtle">
                <span className="font-mono text-xs uppercase tracking-wider">Location</span>
                <div className="mt-1 text-foreground-muted">
                  Remote-First Studio
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="relative my-12">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
          {/* Floating dot in the center */}
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
        </div>

        {/* Bottom bar - Deconstructed layout */}
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          {/* Copyright with glitch styling */}
          <div className="group relative">
            <p className="font-mono text-xs text-foreground-subtle">
              <span className="text-foreground-muted">©</span>
              {' '}
              <span className="tabular-nums">2024</span>
              {' '}
              <span className="font-bold uppercase tracking-wider text-foreground-muted transition-colors group-hover:text-primary">
                Prism Digital
              </span>
              {' • '}
              <span>All rights reserved</span>
            </p>
          </div>

          {/* Legal links - placeholder until pages are created */}
          <div className="flex gap-6 font-mono text-xs">
            <span className="text-foreground-subtle cursor-default">
              Privacy
            </span>
            <span className="text-foreground-subtle cursor-default">
              Terms
            </span>
            <span className="text-foreground-subtle cursor-default">
              Cookies
            </span>
          </div>

          {/* Back to top with animated arrow */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-foreground-subtle transition-colors hover:text-primary"
          >
            <span>Back to top</span>
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Noise texture overlay for depth */}
      <div className="noise-overlay pointer-events-none absolute inset-0" />
    </footer>
  )
}
