"use client";

import { useRef, useCallback, useState, useEffect } from "react";

export interface EnvelopeAnimationState {
  isTyping: boolean;
  isFocused: boolean;
  isSending: boolean;
  isSent: boolean;
  hasError: boolean;
}

export interface UseEnvelopeAnimationReturn {
  state: EnvelopeAnimationState;
  triggerWobble: () => void;
  triggerSend: () => Promise<void>;
  triggerError: () => void;
  setTyping: (typing: boolean) => void;
  setFocused: (focused: boolean) => void;
  reset: () => void;
}

/**
 * Hook to manage envelope 3D animation state and triggers
 * Connects form interactions to 3D scene animations
 */
export function useEnvelopeAnimation(): UseEnvelopeAnimationReturn {
  const [state, setState] = useState<EnvelopeAnimationState>({
    isTyping: false,
    isFocused: false,
    isSending: false,
    isSent: false,
    hasError: false,
  });

  // Refs to track animation state without re-renders
  const wobbleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wobbleTimeoutRef.current) clearTimeout(wobbleTimeoutRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const triggerWobble = useCallback(() => {
    // Debounce wobble animations
    if (wobbleTimeoutRef.current) {
      clearTimeout(wobbleTimeoutRef.current);
    }
    setState((prev) => ({ ...prev, isFocused: true }));
    wobbleTimeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, isFocused: false }));
    }, 600);
  }, []);

  const triggerSend = useCallback(async (): Promise<void> => {
    setState((prev) => ({
      ...prev,
      isSending: true,
      hasError: false,
    }));

    // Animation duration
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setState((prev) => ({
      ...prev,
      isSending: false,
      isSent: true,
    }));
  }, []);

  const triggerError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hasError: true,
      isSending: false,
    }));

    // Clear error state after shake animation
    setTimeout(() => {
      setState((prev) => ({ ...prev, hasError: false }));
    }, 400);
  }, []);

  const setTyping = useCallback((typing: boolean) => {
    // Debounce typing state to avoid rapid updates
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typing) {
      setState((prev) => ({ ...prev, isTyping: true }));
    } else {
      typingTimeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isTyping: false }));
      }, 300);
    }
  }, []);

  const setFocused = useCallback((focused: boolean) => {
    setState((prev) => ({ ...prev, isFocused: focused }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isTyping: false,
      isFocused: false,
      isSending: false,
      isSent: false,
      hasError: false,
    });
  }, []);

  return {
    state,
    triggerWobble,
    triggerSend,
    triggerError,
    setTyping,
    setFocused,
    reset,
  };
}
