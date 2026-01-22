import type { RapierRigidBody } from "@react-three/rapier";
import type { RefObject } from "react";

export type PhysicsObjectType = "sphere" | "box" | "cylinder";

export type PresetType = "bowling" | "dominoes" | "jenga" | "clear";

export interface PhysicsObject {
  id: string;
  type: PhysicsObjectType;
  position: [number, number, number];
  scale: number;
  color: string;
  velocity?: [number, number, number];
}

export interface PhysicsSceneProps {
  device: {
    isMobile: boolean;
    isTablet: boolean;
    gpu: "high" | "medium" | "low";
  };
  maxObjects: number;
  onObjectCountChange: (count: number) => void;
  spawnRef: RefObject<((type: PhysicsObjectType) => void) | null>;
  resetRef: RefObject<(() => void) | null>;
  loadPresetRef: RefObject<((preset: PresetType) => void) | null>;
}

export interface DraggableBodyRef {
  rigidBody: RapierRigidBody | null;
  isDragging: boolean;
  dragStart: { x: number; y: number };
  initialPosition: [number, number, number];
}

// Color palette for physics objects based on velocity
export const velocityColors = {
  slow: "#60a5fa", // blue
  medium: "#4ade80", // green
  fast: "#f87171", // red
  stationary: "#a78bfa", // purple (base color)
};

// Material presets
export const materialPresets = {
  glass: {
    roughness: 0.15,
    metalness: 0.2,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    transmission: 0.2,
    thickness: 0.5,
  },
  metal: {
    roughness: 0.3,
    metalness: 0.9,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
  },
};

// Preset configurations
export const presetConfigs = {
  bowling: {
    pins: [
      // Back row (4 pins)
      { position: [0, 0.5, -8] as [number, number, number] },
      { position: [-0.8, 0.5, -8] as [number, number, number] },
      { position: [0.8, 0.5, -8] as [number, number, number] },
      { position: [-1.6, 0.5, -8] as [number, number, number] },
      // Third row (3 pins)
      { position: [-0.4, 0.5, -7.2] as [number, number, number] },
      { position: [0.4, 0.5, -7.2] as [number, number, number] },
      { position: [-1.2, 0.5, -7.2] as [number, number, number] },
      // Second row (2 pins)
      { position: [0, 0.5, -6.4] as [number, number, number] },
      { position: [-0.8, 0.5, -6.4] as [number, number, number] },
      // Front pin
      { position: [-0.4, 0.5, -5.6] as [number, number, number] },
    ],
    ball: { position: [0, 0.8, 4] as [number, number, number] },
  },
  dominoes: {
    count: 20,
    spacing: 0.6,
    startZ: -6,
    curve: true,
  },
  jenga: {
    layers: 8,
    blocksPerLayer: 3,
    blockSize: { width: 0.3, height: 0.15, depth: 0.9 },
    startY: 0.075,
  },
};
