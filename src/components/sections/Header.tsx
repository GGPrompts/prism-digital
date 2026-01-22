"use client";

import { useState, useEffect, useCallback } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Header Component - Glass Morphism Navigation
 *
 * Features:
 * - Glass effect with backdrop blur floating over 3D canvas
 * - Scroll direction detection for auto-hide/show behavior
 * - Mobile-responsive hamburger menu with slide-out drawer
 * - Purple accent CTA button with glow effects
 * - Refined typography with tight tracking for futuristic feel
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Add background blur when scrolled past 50px
          setScrolled(currentScrollY > 50);

          // Hide header on scroll down, show on scroll up
          if (currentScrollY > lastScrollY && currentScrollY > 100) {
            setHidden(true);
          } else if (currentScrollY < lastScrollY) {
            setHidden(false);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "/demos", label: "Demos" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  // Smooth scroll handler for navigation links
  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // For page routes (not anchors), let the browser handle navigation
    if (!href.startsWith('#')) {
      setMobileMenuOpen(false);
      return;
    }

    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }

    // Close mobile menu if open
    setMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-500 ease-out-expo
          ${hidden ? "-translate-y-full" : "translate-y-0"}
          ${scrolled ? "bg-black/20" : "bg-transparent"}
          backdrop-blur-xl
          border-b border-white/10
        `}
      >
        <nav className="container-custom flex items-center justify-between h-20 px-6">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="
              logo group relative z-10
              text-2xl font-bold tracking-tighter
              transition-all duration-300 ease-out
              cursor-pointer
            "
          >
            <span className="
              relative inline-block
              text-transparent bg-clip-text
              bg-gradient-to-r from-purple-400 via-primary to-accent-pink
              group-hover:from-accent-cyan group-hover:via-primary-hover group-hover:to-primary
              transition-all duration-500
            ">
              Prism
            </span>
            <span className="
              relative inline-block ml-2
              text-foreground
              group-hover:text-primary-hover
              transition-colors duration-300
            ">
              Digital
            </span>

            {/* Animated underline glow */}
            <span className="
              absolute -bottom-1 left-0 w-0 h-0.5
              bg-gradient-to-r from-primary to-accent-pink
              group-hover:w-full
              transition-all duration-500 ease-out-expo
              shadow-glow
            " />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme toggle */}
            <ThemeToggle />

            <ul className="flex items-center gap-1">
              {navLinks.map((link, index) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="
                      nav-link group relative
                      px-4 py-2 rounded-lg
                      text-foreground-muted hover:text-foreground
                      font-medium text-sm tracking-wide uppercase
                      transition-all duration-300 ease-out
                      hover:bg-white/5
                      cursor-pointer
                    "
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="relative z-10">{link.label}</span>

                    {/* Hover glow effect */}
                    <span className="
                      absolute inset-0 rounded-lg
                      opacity-0 group-hover:opacity-100
                      bg-gradient-to-r from-primary/10 to-accent-pink/10
                      transition-opacity duration-300
                    " />

                    {/* Bottom accent line */}
                    <span className="
                      absolute bottom-1 left-4 right-4 h-px
                      bg-gradient-to-r from-transparent via-primary to-transparent
                      scale-x-0 group-hover:scale-x-100
                      transition-transform duration-300 ease-out-expo
                    " />
                  </a>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="
                cta-button relative group
                px-6 py-2.5 rounded-lg
                font-semibold text-sm tracking-wide
                text-white
                bg-gradient-to-r from-primary to-primary-muted
                hover:from-primary-hover hover:to-primary
                shadow-lg shadow-glow-primary/30
                hover:shadow-glow-primary/60
                transition-all duration-300 ease-out
                hover:scale-105
                active:scale-100
                border border-primary/50 hover:border-primary
                overflow-hidden
                cursor-pointer
              "
            >
              <span className="relative z-10">See Our Work</span>

              {/* Animated gradient overlay */}
              <span className="
                absolute inset-0
                bg-gradient-to-r from-accent-cyan/20 via-primary/20 to-accent-pink/20
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
              " />

              {/* Shine effect on hover */}
              <span className="
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/20 to-transparent
                -translate-x-full group-hover:translate-x-full
                transition-transform duration-700 ease-out
              " />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="
              md:hidden relative z-10
              w-10 h-10 rounded-lg
              flex flex-col items-center justify-center gap-1.5
              bg-white/5 hover:bg-white/10
              border border-white/10 hover:border-primary/50
              transition-all duration-300
              group
            "
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className={`
              w-5 h-0.5 bg-foreground rounded-full
              transition-all duration-300 ease-out-expo
              ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}
              group-hover:bg-primary
            `} />
            <span className={`
              w-5 h-0.5 bg-foreground rounded-full
              transition-all duration-300
              ${mobileMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"}
              group-hover:bg-primary
            `} />
            <span className={`
              w-5 h-0.5 bg-foreground rounded-full
              transition-all duration-300 ease-out-expo
              ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}
              group-hover:bg-primary
            `} />
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`
          fixed inset-0 z-40
          bg-black/80 backdrop-blur-md
          transition-opacity duration-500 ease-out
          ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          md:hidden
        `}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      {/* Mobile Menu Drawer */}
      <aside
        className={`
          fixed top-0 right-0 bottom-0 z-50
          w-full max-w-sm
          bg-background-secondary/95 backdrop-blur-2xl
          border-l border-white/10
          transition-transform duration-500 ease-out-expo
          ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          md:hidden
          overflow-y-auto
        `}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <span className="text-xl font-bold tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-pink">
              Menu
            </span>
          </span>
          <div className="flex items-center gap-3">
            {/* Theme toggle in mobile menu */}
            <ThemeToggle />
            <button
            onClick={() => setMobileMenuOpen(false)}
            className="
              w-10 h-10 rounded-lg
              flex items-center justify-center
              bg-white/5 hover:bg-white/10
              border border-white/10 hover:border-primary/50
              transition-all duration-300
              group
            "
            aria-label="Close menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="text-foreground group-hover:text-primary transition-colors"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          </div>
        </div>

        {/* Mobile nav links */}
        <nav className="p-6">
          <ul className="space-y-2">
            {navLinks.map((link, index) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="
                    block group relative
                    px-6 py-4 rounded-xl
                    text-foreground hover:text-primary
                    font-semibold text-lg tracking-wide
                    bg-white/5 hover:bg-white/10
                    border border-white/10 hover:border-primary/50
                    transition-all duration-300 ease-out
                    cursor-pointer
                  "
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: mobileMenuOpen ? 1 : 0,
                    transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                    transition: `all 0.5s ease-out ${index * 100}ms`
                  }}
                >
                  <span className="relative z-10">{link.label}</span>

                  {/* Hover glow */}
                  <span className="
                    absolute inset-0 rounded-xl
                    opacity-0 group-hover:opacity-100
                    bg-gradient-to-r from-primary/20 to-accent-pink/20
                    transition-opacity duration-300
                  " />
                </a>
              </li>
            ))}
          </ul>

          {/* Mobile CTA */}
          <div className="mt-8">
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="
                block group relative
                px-8 py-5 rounded-xl
                text-center font-bold text-lg tracking-wide
                text-white
                bg-gradient-to-r from-primary to-primary-muted
                hover:from-primary-hover hover:to-primary
                shadow-xl shadow-glow-primary/40
                hover:shadow-glow-primary/60
                transition-all duration-300 ease-out
                border border-primary/50 hover:border-primary
                overflow-hidden
                cursor-pointer
              "
              style={{
                animationDelay: `${navLinks.length * 100}ms`,
                opacity: mobileMenuOpen ? 1 : 0,
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                transition: `all 0.5s ease-out ${navLinks.length * 100}ms`
              }}
            >
              <span className="relative z-10">See Our Work</span>

              {/* Animated gradient overlay */}
              <span className="
                absolute inset-0
                bg-gradient-to-r from-accent-cyan/30 via-primary/30 to-accent-pink/30
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
              " />
            </a>
          </div>

          {/* Mobile menu footer tagline */}
          <div
            className="mt-12 pt-8 border-t border-white/10"
            style={{
              animationDelay: `${(navLinks.length + 1) * 100}ms`,
              opacity: mobileMenuOpen ? 1 : 0,
              transition: `all 0.5s ease-out ${(navLinks.length + 1) * 100}ms`
            }}
          >
            <p className="text-sm text-foreground-muted text-center leading-relaxed">
              Building the Future of Web3D
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
