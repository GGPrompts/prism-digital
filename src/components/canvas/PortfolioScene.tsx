"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PortfolioCards } from "./PortfolioCards";
import { Particles } from "./Particles";
import { getOptimalParticleCount } from "@/hooks/useDeviceDetection";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";
import type { PortfolioProject } from "@/lib/portfolioData";

interface PortfolioSceneProps {
  device: DeviceCapabilities;
  selectedProject: PortfolioProject | null;
  onSelectProject: (project: PortfolioProject | null) => void;
}

export function PortfolioScene({
  device,
  selectedProject,
  onSelectProject,
}: PortfolioSceneProps) {
  const { pointer } = useThree();
  const particlesGroupRef = useRef<THREE.Group>(null!);

  // Get optimal particle count based on device
  const particleCount = Math.floor(getOptimalParticleCount(device) * 0.5); // Less particles for portfolio

  // Track smooth mouse position
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  useFrame(() => {
    // Smooth mouse following
    const lerpSpeed = device.isMobile ? 0.02 : 0.05;
    mouseRef.current.x = THREE.MathUtils.lerp(
      mouseRef.current.x,
      pointer.x,
      lerpSpeed
    );
    mouseRef.current.y = THREE.MathUtils.lerp(
      mouseRef.current.y,
      pointer.y,
      lerpSpeed
    );

    // Subtle particles rotation
    if (particlesGroupRef.current) {
      particlesGroupRef.current.rotation.y += 0.001;
    }
  });

  const handleSelectProject = (project: PortfolioProject) => {
    // Toggle selection
    if (selectedProject?.id === project.id) {
      onSelectProject(null);
    } else {
      onSelectProject(project);
    }
  };

  return (
    <>
      {/* Ambient particles in background */}
      <group ref={particlesGroupRef}>
        <Particles
          count={particleCount}
          mouse={mouseRef.current}
          scrollOffset={0}
          device={device}
        />
      </group>

      {/* Portfolio cards in helix arrangement */}
      <PortfolioCards
        selectedId={selectedProject?.id ?? null}
        onSelect={handleSelectProject}
        device={device}
      />

      {/* Subtle point light for card illumination */}
      <pointLight
        position={[0, 5, 5]}
        intensity={0.5}
        color="#a855f7"
        distance={20}
        decay={2}
      />
      <pointLight
        position={[5, -3, 3]}
        intensity={0.3}
        color="#06b6d4"
        distance={15}
        decay={2}
      />
    </>
  );
}
