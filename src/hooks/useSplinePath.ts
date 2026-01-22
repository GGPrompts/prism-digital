"use client";

import { useMemo, useCallback } from "react";
import * as THREE from "three";

export interface SplinePathConfig {
  points: THREE.Vector3[];
  tension?: number;
  closed?: boolean;
}

export interface SplinePathResult {
  curve: THREE.CatmullRomCurve3;
  getPoint: (progress: number) => THREE.Vector3;
  getTangent: (progress: number) => THREE.Vector3;
  getPointAndTangent: (progress: number) => { point: THREE.Vector3; tangent: THREE.Vector3 };
}

/**
 * Hook to create and manage a spline path for camera movement.
 * Uses CatmullRomCurve3 for smooth interpolation between waypoints.
 */
export function useSplinePath(config: SplinePathConfig): SplinePathResult {
  const { points, tension = 0.5, closed = false } = config;

  const curve = useMemo(() => {
    const catmullRom = new THREE.CatmullRomCurve3(points, closed, "catmullrom", tension);
    return catmullRom;
  }, [points, tension, closed]);

  // Pre-allocate vectors for reuse (avoid allocation in animation loop)
  const tempPoint = useMemo(() => new THREE.Vector3(), []);
  const tempTangent = useMemo(() => new THREE.Vector3(), []);

  const getPoint = useCallback(
    (progress: number): THREE.Vector3 => {
      const clampedProgress = Math.max(0, Math.min(1, progress));
      curve.getPoint(clampedProgress, tempPoint);
      return tempPoint;
    },
    [curve, tempPoint]
  );

  const getTangent = useCallback(
    (progress: number): THREE.Vector3 => {
      const clampedProgress = Math.max(0, Math.min(1, progress));
      curve.getTangent(clampedProgress, tempTangent);
      return tempTangent;
    },
    [curve, tempTangent]
  );

  const getPointAndTangent = useCallback(
    (progress: number): { point: THREE.Vector3; tangent: THREE.Vector3 } => {
      const clampedProgress = Math.max(0, Math.min(1, progress));
      curve.getPoint(clampedProgress, tempPoint);
      curve.getTangent(clampedProgress, tempTangent);
      return { point: tempPoint, tangent: tempTangent };
    },
    [curve, tempPoint, tempTangent]
  );

  return {
    curve,
    getPoint,
    getTangent,
    getPointAndTangent,
  };
}

/**
 * Default camera path waypoints for the journey experience.
 * Progress 0-1 maps to these 5 points creating 4 scene segments.
 */
export const JOURNEY_WAYPOINTS = [
  new THREE.Vector3(0, 0, 20),    // 0.0 - Opening: distant void, looking into scene
  new THREE.Vector3(3, 1, 10),    // 0.25 - Geometric: approaching structures from right
  new THREE.Vector3(-2, 2, 0),    // 0.5 - Portal: passing through ring from left-above
  new THREE.Vector3(0, 0, -8),    // 0.75 - Crystal: entering crystalline cave
  new THREE.Vector3(0, 3, -15),   // 1.0 - Vista: emerging to final vista, elevated
];

/**
 * Look-at target points that the camera focuses on during the journey.
 * Slightly ahead of camera position for natural forward movement feeling.
 */
export const JOURNEY_LOOK_TARGETS = [
  new THREE.Vector3(0, 0, 0),     // 0.0 - Looking at center
  new THREE.Vector3(0, 0, 0),     // 0.25 - Looking at geometric center
  new THREE.Vector3(0, 0, -5),    // 0.5 - Looking through portal
  new THREE.Vector3(0, 1, -15),   // 0.75 - Looking into crystal depths
  new THREE.Vector3(0, 0, -25),   // 1.0 - Looking at distant vista
];

/**
 * Easing functions for scroll-to-camera mapping
 */
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const easeOutQuad = (t: number): number => {
  return 1 - (1 - t) * (1 - t);
};
