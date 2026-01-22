"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

const TRAIL_LENGTH = 12;
const TRAIL_DECAY = 0.85;

/**
 * Custom cursor with glow effect and trailing animation
 * Automatically hides on touch devices
 */
export function CustomCursor() {
  const { isTouch, isMobile } = useDeviceDetection();
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLCanvasElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Track cursor position for smooth animation
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const trail = useRef<TrailPoint[]>([]);
  const rafId = useRef<number | null>(null);

  // Initialize trail points and add custom cursor class to body
  useEffect(() => {
    trail.current = Array.from({ length: TRAIL_LENGTH }, () => ({
      x: 0,
      y: 0,
      opacity: 0,
    }));

    // Add class to hide default cursor when custom cursor is active
    if (!isTouch && !isMobile) {
      document.body.classList.add("custom-cursor-active");
    }

    return () => {
      document.body.classList.remove("custom-cursor-active");
    };
  }, [isTouch, isMobile]);

  // Animation loop for smooth cursor movement and trail
  const animate = useCallback(() => {
    // Smooth cursor follow with easing (higher = more responsive)
    const easing = 0.35;
    cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * easing;
    cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * easing;

    // Update cursor position
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px)`;
    }

    // Calculate movement delta to detect if mouse is still
    const dx = mousePos.current.x - cursorPos.current.x;
    const dy = mousePos.current.y - cursorPos.current.y;
    const isMoving = Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5;

    // Update trail points - shift and decay
    for (let i = trail.current.length - 1; i > 0; i--) {
      if (isMoving) {
        // Normal trailing behavior when moving
        trail.current[i].x = trail.current[i - 1].x;
        trail.current[i].y = trail.current[i - 1].y;
        trail.current[i].opacity = trail.current[i - 1].opacity * TRAIL_DECAY;
      } else {
        // When still, quickly converge all points to cursor center
        trail.current[i].x += (cursorPos.current.x - trail.current[i].x) * 0.3;
        trail.current[i].y += (cursorPos.current.y - trail.current[i].y) * 0.3;
        trail.current[i].opacity *= TRAIL_DECAY;
      }
    }
    trail.current[0] = {
      x: cursorPos.current.x,
      y: cursorPos.current.y,
      opacity: isMoving ? 1 : trail.current[0].opacity * 0.9,
    };

    // Draw trail on canvas
    const canvas = trailRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw trail from back to front
        for (let i = trail.current.length - 1; i >= 0; i--) {
          const point = trail.current[i];
          if (point.opacity < 0.02) continue;

          const size = 4 + (1 - i / trail.current.length) * 4;
          const gradient = ctx.createRadialGradient(
            point.x,
            point.y,
            0,
            point.x,
            point.y,
            size * 2
          );

          // Purple to cyan gradient glow
          const alpha = point.opacity * 0.6;
          gradient.addColorStop(0, `rgba(168, 85, 247, ${alpha})`);
          gradient.addColorStop(0.5, `rgba(139, 92, 246, ${alpha * 0.5})`);
          gradient.addColorStop(1, `rgba(34, 211, 238, 0)`);

          ctx.beginPath();
          ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  // Handle mouse movement
  useEffect(() => {
    if (isTouch || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Start animation loop
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isTouch, isMobile, isVisible, animate]);

  // Handle hover state for interactive elements
  useEffect(() => {
    if (isTouch || isMobile) return;

    const interactiveSelector =
      'a, button, [role="button"], input, textarea, select, [data-cursor-hover]';

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest(interactiveSelector)) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as Element;
      const relatedTarget = e.relatedTarget as Element | null;

      // Only set hovering to false if not moving to another interactive element
      if (target.closest(interactiveSelector)) {
        if (!relatedTarget?.closest(interactiveSelector)) {
          setIsHovering(false);
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [isTouch, isMobile]);

  // Handle click state
  useEffect(() => {
    if (isTouch || isMobile) return;

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isTouch, isMobile]);

  // Resize canvas to match window
  useEffect(() => {
    if (isTouch || isMobile) return;

    const handleResize = () => {
      if (trailRef.current) {
        trailRef.current.width = window.innerWidth;
        trailRef.current.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isTouch, isMobile]);

  // Don't render on touch/mobile devices
  if (isTouch || isMobile) return null;

  return (
    <>
      {/* Trail canvas - behind cursor */}
      <canvas
        ref={trailRef}
        className="pointer-events-none fixed inset-0 z-[9998]"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
        aria-hidden="true"
      />

      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed z-[9999]"
        style={{
          left: 0,
          top: 0,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
        aria-hidden="true"
      >
        {/* Outer glow ring - centered on cursor position */}
        <div
          className="absolute rounded-full"
          style={{
            width: isHovering ? 48 : 32,
            height: isHovering ? 48 : 32,
            left: isHovering ? -24 : -16,
            top: isHovering ? -24 : -16,
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(34, 211, 238, 0.1) 50%, transparent 70%)",
            boxShadow: isHovering
              ? "0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(34, 211, 238, 0.3)"
              : "0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(34, 211, 238, 0.2)",
            transform: `scale(${isClicking ? 0.8 : 1})`,
            transition:
              "width 0.2s ease-out, height 0.2s ease-out, left 0.2s ease-out, top 0.2s ease-out, box-shadow 0.2s ease-out, transform 0.1s ease-out",
          }}
        />

        {/* Inner dot - centered on cursor position */}
        <div
          className="absolute rounded-full"
          style={{
            width: isHovering ? 10 : 6,
            height: isHovering ? 10 : 6,
            left: isHovering ? -5 : -3,
            top: isHovering ? -5 : -3,
            background:
              "linear-gradient(135deg, rgba(168, 85, 247, 1) 0%, rgba(192, 132, 252, 1) 100%)",
            boxShadow:
              "0 0 10px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.4)",
            transform: `scale(${isClicking ? 1.2 : 1})`,
            transition:
              "width 0.15s ease-out, height 0.15s ease-out, left 0.15s ease-out, top 0.15s ease-out, transform 0.1s ease-out",
          }}
        />
      </div>
    </>
  );
}
