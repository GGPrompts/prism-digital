"use client";

import { LucideIcon } from "lucide-react";
import { useCardParallax } from "@/hooks/useCardParallax";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: FeatureCardProps) {
  const cardRef = useCardParallax<HTMLDivElement>({
    maxTilt: 8,
    animationDuration: 0.4,
    shadowShift: true,
    maxShadowOffset: 15,
    perspective: 1000,
  });

  return (
    <div
      ref={cardRef}
      className="feature-card glass-card group relative overflow-hidden p-8"
      style={{
        animationDelay: `${index * 150}ms`,
      }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, var(--glow-primary-subtle) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon with glow effect */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary/20">
          <Icon
            className="h-8 w-8 text-primary transition-all duration-500 group-hover:drop-shadow-[0_0_8px_var(--primary)]"
            strokeWidth={1.5}
          />
        </div>

        {/* Title */}
        <h3 className="mb-4 text-2xl font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
          {title}
        </h3>

        {/* Description */}
        <p className="text-foreground-muted leading-relaxed transition-colors duration-300 group-hover:text-foreground">
          {description}
        </p>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary via-primary-hover to-accent-cyan transition-all duration-500 group-hover:w-full" />
    </div>
  );
}
