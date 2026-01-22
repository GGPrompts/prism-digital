"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type {
  ColorOption,
  MaterialOption,
} from "@/lib/configurator-data";
import type { DeviceCapabilities } from "@/hooks/useDeviceDetection";

interface ConfiguratorProductProps {
  color: ColorOption;
  material: MaterialOption;
  device: DeviceCapabilities;
}

export function ConfiguratorProduct({
  color,
  material,
  device,
}: ConfiguratorProductProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const innerMeshRef = useRef<THREE.Mesh>(null!);

  // Create torus knot geometry - visually interesting for material showcase
  const geometry = useMemo(() => {
    const segments = device.isMobile ? 64 : 100;
    const tubularSegments = device.isMobile ? 8 : 16;
    return new THREE.TorusKnotGeometry(0.8, 0.3, segments, tubularSegments);
  }, [device.isMobile]);

  // Create inner geometry for glass effect
  const innerGeometry = useMemo(() => {
    const segments = device.isMobile ? 32 : 64;
    const tubularSegments = device.isMobile ? 6 : 12;
    return new THREE.TorusKnotGeometry(0.75, 0.25, segments, tubularSegments);
  }, [device.isMobile]);

  // Pre-allocate color for animation
  const targetColor = useRef(new THREE.Color(color.hex));

  // Update target color when color prop changes
  useEffect(() => {
    targetColor.current.set(color.hex);
  }, [color.hex]);

  // Smooth color transition in animation loop
  useFrame(() => {
    if (!meshRef.current?.material) return;

    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    if (mat.color) {
      mat.color.lerp(targetColor.current, 0.1);
    }

    // Update inner mesh color for glass
    if (innerMeshRef.current?.material) {
      const innerMat = innerMeshRef.current.material as THREE.MeshBasicMaterial;
      if (innerMat.color) {
        innerMat.color.lerp(targetColor.current, 0.1);
      }
    }
  });

  // Update material properties when material prop changes
  useEffect(() => {
    if (!meshRef.current?.material) return;

    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;

    // Animate material property changes
    mat.roughness = material.roughness;
    mat.metalness = material.metalness;
    mat.transmission = material.transmission ?? 0;
    mat.thickness = material.thickness ?? 0;
    mat.ior = material.ior ?? 1.5;
    mat.clearcoat = material.clearcoat ?? 0;
    mat.clearcoatRoughness = material.clearcoatRoughness ?? 0;

    // Adjust transparency for glass
    mat.transparent = material.transmission ? material.transmission > 0 : false;
    mat.opacity = material.transmission ? 0.9 : 1;

    mat.needsUpdate = true;
  }, [material]);

  const isGlass = material.id === "glass";

  return (
    <group>
      {/* Main product mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={color.hex}
          roughness={material.roughness}
          metalness={material.metalness}
          transmission={material.transmission ?? 0}
          thickness={material.thickness ?? 0}
          ior={material.ior ?? 1.5}
          clearcoat={material.clearcoat ?? 0}
          clearcoatRoughness={material.clearcoatRoughness ?? 0}
          transparent={isGlass}
          opacity={isGlass ? 0.9 : 1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Inner glow for glass material */}
      {isGlass && (
        <mesh
          ref={innerMeshRef}
          geometry={innerGeometry}
          scale={0.85}
        >
          <meshBasicMaterial
            color={color.hex}
            transparent
            opacity={0.15}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* Subtle rim light effect */}
      <pointLight
        position={[2, 2, 2]}
        intensity={0.5}
        color={color.hex}
        distance={5}
      />
    </group>
  );
}
