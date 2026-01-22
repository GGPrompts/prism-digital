"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PortfolioCard } from "./PortfolioCard";
import { portfolioProjects, type PortfolioProject } from "@/lib/portfolioData";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface PortfolioCardsProps {
  selectedId: string | null;
  onSelect: (project: PortfolioProject) => void;
  device: DeviceCapabilities;
}

export function PortfolioCards({
  selectedId,
  onSelect,
  device,
}: PortfolioCardsProps) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null!);

  // Calculate helix/spiral positions for cards
  const cardPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const numCards = portfolioProjects.length;

    // Helix parameters - adjust based on device
    const radius = device.isMobile ? 2.5 : 3;
    const verticalSpacing = device.isMobile ? 1.2 : 1.5;
    const startY = ((numCards - 1) * verticalSpacing) / 2;

    for (let i = 0; i < numCards; i++) {
      // Calculate angle for helix (full rotation spread across cards)
      const theta = (i / numCards) * Math.PI * 2;

      // Position on helix
      const x = Math.cos(theta) * radius;
      const y = startY - i * verticalSpacing;
      const z = Math.sin(theta) * radius * 0.5 - 2; // Depth variation

      positions.push([x, y, z]);
    }

    return positions;
  }, [device.isMobile]);

  // Smooth camera transition when selecting a card
  const targetCameraPosition = useRef(new THREE.Vector3(0, 0, 8));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (!groupRef.current) return;

    // Find selected card position
    if (selectedId) {
      const selectedIndex = portfolioProjects.findIndex(
        (p) => p.id === selectedId
      );
      if (selectedIndex !== -1) {
        const [x, y, z] = cardPositions[selectedIndex];
        // Position camera to look at selected card
        targetCameraPosition.current.set(x * 0.3, y * 0.5, z + 5);
        targetLookAt.current.set(x, y, z);
      }
    } else {
      // Default camera position
      targetCameraPosition.current.set(0, 0, 8);
      targetLookAt.current.set(0, 0, 0);
    }

    // Smooth camera movement
    camera.position.lerp(targetCameraPosition.current, 0.05);

    // Smooth look-at (create a temporary vector to lerp)
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    currentLookAt.multiplyScalar(10).add(camera.position);
    currentLookAt.lerp(targetLookAt.current, 0.05);
  });

  // Handle card selection
  const handleSelect = (project: PortfolioProject) => {
    onSelect(project);
  };

  return (
    <group ref={groupRef}>
      {portfolioProjects.map((project, index) => (
        <PortfolioCard
          key={project.id}
          project={project}
          position={cardPositions[index]}
          isSelected={selectedId === project.id}
          onSelect={() => handleSelect(project)}
          index={index}
        />
      ))}
    </group>
  );
}
