"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useMagneticButton, type MagneticButtonOptions } from "@/hooks/useMagneticButton";
import { cn } from "@/lib/utils";

export interface MagneticButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    MagneticButtonOptions {
  children: ReactNode;
  /** Additional class for the inner content span */
  contentClassName?: string;
}

/**
 * Button with magnetic attraction effect
 *
 * The button content subtly follows the cursor when nearby,
 * with an elastic snap-back animation when the cursor leaves.
 */
export const MagneticButton = forwardRef<HTMLButtonElement, MagneticButtonProps>(
  function MagneticButton(
    {
      children,
      className,
      contentClassName,
      magneticDistance,
      maxOffset,
      strength,
      scaleGlow,
      glowVariable,
      ...props
    },
    _forwardedRef
  ) {
    const { buttonRef, contentRef } = useMagneticButton({
      magneticDistance,
      maxOffset,
      strength,
      scaleGlow,
      glowVariable,
    });

    return (
      <button
        ref={buttonRef}
        className={cn("magnetic-button", className)}
        {...props}
      >
        <span
          ref={contentRef}
          className={cn("magnetic-button-content inline-flex items-center justify-center", contentClassName)}
        >
          {children}
        </span>
      </button>
    );
  }
);
