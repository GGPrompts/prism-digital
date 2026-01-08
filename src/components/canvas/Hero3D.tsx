"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import * as THREE from "three";
import { Particles } from "./Particles";

export function Hero3D() {
  const { viewport, pointer } = useThree();
  const scroll = useScroll();

  // Track smooth mouse position
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const targetMouseRef = useRef(new THREE.Vector2(0, 0));

  // Track scroll offset
  const [scrollOffset, setScrollOffset] = useState(0);

  // Camera reference for scroll-based movement
  const cameraGroupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    // Smooth mouse following (lerp)
    targetMouseRef.current.set(pointer.x, pointer.y);
    mouseRef.current.lerp(targetMouseRef.current, 0.05);

    // Update scroll offset (0-1 range)
    const newScrollOffset = scroll?.offset || 0;
    setScrollOffset(newScrollOffset);

    // Camera movement based on scroll
    if (cameraGroupRef.current) {
      // Move camera back as user scrolls
      cameraGroupRef.current.position.z = 5 + newScrollOffset * 3;

      // Slight rotation for depth
      cameraGroupRef.current.rotation.x = newScrollOffset * 0.3;
    }

    // Subtle camera sway with mouse
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      pointer.x * 0.5,
      0.03
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      pointer.y * 0.5,
      0.03
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={cameraGroupRef}>
      <Particles
        count={3000}
        mouse={mouseRef.current}
        scrollOffset={scrollOffset}
      />
    </group>
  );
}
