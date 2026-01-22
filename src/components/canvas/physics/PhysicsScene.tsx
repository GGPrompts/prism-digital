"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { RigidBody, CuboidCollider, BallCollider, CylinderCollider } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import * as THREE from "three";
import {
  type PhysicsSceneProps,
  type PhysicsObject,
  type PhysicsObjectType,
  type PresetType,
  velocityColors,
  materialPresets,
  presetConfigs,
} from "./types";

// Pre-allocated color for performance
const tempColor = new THREE.Color();

// Generate unique ID
let idCounter = 0;
function generateId(): string {
  return `obj-${Date.now()}-${idCounter++}`;
}

// Get color based on velocity
function getVelocityColor(speed: number): string {
  if (speed < 0.5) return velocityColors.stationary;
  if (speed < 5) return velocityColors.slow;
  if (speed < 15) return velocityColors.medium;
  return velocityColors.fast;
}

// Ground component
function Ground() {
  return (
    <RigidBody type="fixed" colliders={false} friction={0.8} restitution={0.2}>
      <CuboidCollider args={[20, 0.1, 20]} position={[0, -0.1, 0]} />
      <mesh receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Grid lines */}
      <gridHelper args={[40, 40, "#333355", "#222244"]} position={[0, 0.01, 0]} />
    </RigidBody>
  );
}

// Walls to keep objects in bounds
function Walls() {
  return (
    <group>
      {/* Back wall */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[20, 10, 0.1]} position={[0, 5, -15]} />
      </RigidBody>
      {/* Front wall - invisible */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[20, 10, 0.1]} position={[0, 5, 15]} />
      </RigidBody>
      {/* Left wall */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.1, 10, 20]} position={[-15, 5, 0]} />
      </RigidBody>
      {/* Right wall */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.1, 10, 20]} position={[15, 5, 0]} />
      </RigidBody>
    </group>
  );
}

// Individual physics object component
interface PhysicsBodyProps {
  obj: PhysicsObject;
  onDragStart: (id: string, rigidBody: RapierRigidBody) => void;
  onDragEnd: (velocity: [number, number, number]) => void;
  isDragging: boolean;
  isMobile: boolean;
}

function PhysicsBody({ obj, onDragStart, isDragging, isMobile }: Omit<PhysicsBodyProps, "onDragEnd">) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const [currentColor, setCurrentColor] = useState(obj.color);

  // Update color based on velocity
  useFrame(() => {
    if (!rigidBodyRef.current || !materialRef.current || isDragging) return;

    const vel = rigidBodyRef.current.linvel();
    const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
    const newColor = getVelocityColor(speed);

    if (newColor !== currentColor) {
      setCurrentColor(newColor);
      tempColor.set(newColor);
      materialRef.current.color.copy(tempColor);
      materialRef.current.emissive.copy(tempColor);
    }
  });

  // Handle pointer down to start drag
  const handlePointerDown = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      if (rigidBodyRef.current) {
        onDragStart(obj.id, rigidBodyRef.current);
      }
    },
    [obj.id, onDragStart]
  );

  const geometry = useMemo(() => {
    switch (obj.type) {
      case "sphere":
        return <sphereGeometry args={[obj.scale, 32, 32]} />;
      case "box":
        return <boxGeometry args={[obj.scale * 2, obj.scale * 2, obj.scale * 2]} />;
      case "cylinder":
        return <cylinderGeometry args={[obj.scale, obj.scale, obj.scale * 2, 32]} />;
    }
  }, [obj.type, obj.scale]);

  const collider = useMemo(() => {
    switch (obj.type) {
      case "sphere":
        return <BallCollider args={[obj.scale]} />;
      case "box":
        return <CuboidCollider args={[obj.scale, obj.scale, obj.scale]} />;
      case "cylinder":
        return <CylinderCollider args={[obj.scale, obj.scale]} />;
    }
  }, [obj.type, obj.scale]);

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={obj.position}
      linearVelocity={obj.velocity || [0, 0, 0]}
      colliders={false}
      restitution={0.5}
      friction={0.5}
      linearDamping={0.3}
      angularDamping={0.3}
    >
      {collider}
      <mesh
        ref={meshRef}
        castShadow={!isMobile}
        receiveShadow={!isMobile}
        onPointerDown={handlePointerDown}
      >
        {geometry}
        <meshPhysicalMaterial
          ref={materialRef}
          color={currentColor}
          emissive={currentColor}
          emissiveIntensity={0.1}
          {...materialPresets.glass}
          side={THREE.DoubleSide}
        />
      </mesh>
    </RigidBody>
  );
}

// Main physics scene
export function PhysicsScene({
  device,
  maxObjects,
  onObjectCountChange,
  spawnRef,
  resetRef,
  loadPresetRef,
}: PhysicsSceneProps) {
  const { camera, gl, size } = useThree();
  const [objects, setObjects] = useState<PhysicsObject[]>([]);

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggedBodyRef = useRef<RapierRigidBody | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const dragCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Raycaster for click detection
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  // Update object count
  useEffect(() => {
    onObjectCountChange(objects.length);
  }, [objects.length, onObjectCountChange]);

  // Spawn a new object
  const spawnObject = useCallback(
    (
      type: PhysicsObjectType,
      position?: [number, number, number],
      velocity?: [number, number, number]
    ) => {
      if (objects.length >= maxObjects) {
        // Remove oldest object
        setObjects((prev) => prev.slice(1));
      }

      const colors = ["#a78bfa", "#c4b5fd", "#e9d5ff", "#f5d0fe", "#d946ef"];
      const newObj: PhysicsObject = {
        id: generateId(),
        type,
        position: position || [
          (Math.random() - 0.5) * 4,
          5 + Math.random() * 3,
          (Math.random() - 0.5) * 4,
        ],
        scale: type === "box" ? 0.3 + Math.random() * 0.2 : 0.3 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity,
      };

      setObjects((prev) => [...prev, newObj]);
    },
    [objects.length, maxObjects]
  );

  // Reset scene
  const resetScene = useCallback(() => {
    setObjects([]);
    setDraggingId(null);
    draggedBodyRef.current = null;
  }, []);

  // Load presets
  const loadPreset = useCallback(
    (preset: PresetType) => {
      resetScene();

      if (preset === "clear") return;

      const newObjects: PhysicsObject[] = [];

      if (preset === "bowling") {
        // Add pins
        presetConfigs.bowling.pins.forEach((pin) => {
          newObjects.push({
            id: generateId(),
            type: "cylinder",
            position: pin.position,
            scale: 0.2,
            color: "#f5d0fe",
          });
        });

        // Add ball
        newObjects.push({
          id: generateId(),
          type: "sphere",
          position: presetConfigs.bowling.ball.position,
          scale: 0.4,
          color: "#a855f7",
        });
      } else if (preset === "dominoes") {
        const { count, spacing, startZ, curve } = presetConfigs.dominoes;
        for (let i = 0; i < count; i++) {
          const t = i / (count - 1);
          const x = curve ? Math.sin(t * Math.PI * 0.5) * 4 : 0;
          const z = startZ + i * spacing;

          newObjects.push({
            id: generateId(),
            type: "box",
            position: [x, 0.4, z],
            scale: 0.15,
            color: i % 2 === 0 ? "#a78bfa" : "#c4b5fd",
          });
        }

        // Add a ball to knock them down
        newObjects.push({
          id: generateId(),
          type: "sphere",
          position: [0, 0.5, startZ - 2],
          scale: 0.3,
          color: "#d946ef",
        });
      } else if (preset === "jenga") {
        const { layers, blocksPerLayer, blockSize, startY } = presetConfigs.jenga;
        for (let layer = 0; layer < layers; layer++) {
          const isOdd = layer % 2 === 1;
          for (let block = 0; block < blocksPerLayer; block++) {
            const x = isOdd ? 0 : (block - 1) * blockSize.depth * 1.1;
            const z = isOdd ? (block - 1) * blockSize.depth * 1.1 : 0;
            const y = startY + layer * blockSize.height * 2;

            newObjects.push({
              id: generateId(),
              type: "box",
              position: [x, y, z],
              scale: 0.15,
              color: layer % 3 === 0 ? "#a78bfa" : layer % 3 === 1 ? "#c4b5fd" : "#e9d5ff",
            });
          }
        }
      }

      setObjects(newObjects);
    },
    [resetScene]
  );

  // Expose functions via refs
  useEffect(() => {
    if (spawnRef.current !== null) {
      (spawnRef as { current: (type: PhysicsObjectType) => void }).current = spawnObject;
    }
    if (resetRef.current !== null) {
      (resetRef as { current: () => void }).current = resetScene;
    }
    if (loadPresetRef.current !== null) {
      (loadPresetRef as { current: (preset: PresetType) => void }).current = loadPreset;
    }
  }, [spawnObject, resetScene, loadPreset, spawnRef, resetRef, loadPresetRef]);

  // Handle drag start
  const handleDragStart = useCallback((id: string, rigidBody: RapierRigidBody) => {
    setDraggingId(id);
    draggedBodyRef.current = rigidBody;

    // Make kinematic while dragging
    rigidBody.setBodyType(2, true); // 2 = KinematicPositionBased
  }, []);

  // Handle drag end - calculate and apply velocity
  const handleDragEnd = useCallback((velocity: [number, number, number]) => {
    if (draggedBodyRef.current) {
      // Return to dynamic
      draggedBodyRef.current.setBodyType(0, true); // 0 = Dynamic

      // Apply impulse
      const force = 3;
      draggedBodyRef.current.applyImpulse(
        { x: velocity[0] * force, y: velocity[1] * force, z: velocity[2] * force },
        true
      );
    }

    setDraggingId(null);
    draggedBodyRef.current = null;
    dragStartRef.current = null;
  }, []);

  // Mouse/touch handlers
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!draggingId || !draggedBodyRef.current) return;

      const mouse = new THREE.Vector2(
        (e.clientX / size.width) * 2 - 1,
        -(e.clientY / size.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);
      const intersectPoint = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
        // Keep y above ground
        intersectPoint.y = Math.max(intersectPoint.y, 0.5);

        draggedBodyRef.current.setNextKinematicTranslation({
          x: intersectPoint.x,
          y: intersectPoint.y,
          z: intersectPoint.z,
        });
      }

      dragCurrentRef.current = { x: e.clientX, y: e.clientY };
    },
    [draggingId, camera, raycaster, plane, size]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      if (!draggingId || !dragStartRef.current) return;

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const dt = (Date.now() - dragStartRef.current.time) / 1000;

      // Convert screen delta to world velocity
      const speed = Math.sqrt(dx * dx + dy * dy) / Math.max(dt, 0.1);
      const vx = (dx / size.width) * speed * 0.1;
      const vz = (dy / size.height) * speed * 0.1;

      handleDragEnd([vx, Math.max(0, -dy / size.height) * 10, vz]);
    },
    [draggingId, handleDragEnd, size]
  );

  // Double-click to spawn
  const handleDoubleClick = useCallback(
    (e: MouseEvent) => {
      const mouse = new THREE.Vector2(
        (e.clientX / size.width) * 2 - 1,
        -(e.clientY / size.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);
      const intersectPoint = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
        const types: PhysicsObjectType[] = ["sphere", "box", "cylinder"];
        const randomType = types[Math.floor(Math.random() * types.length)];
        spawnObject(randomType, [intersectPoint.x, Math.max(intersectPoint.y, 2), intersectPoint.z]);
      }
    },
    [camera, raycaster, plane, size, spawnObject]
  );

  // Setup drag listeners on canvas
  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (draggingId) {
        dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      }
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("dblclick", handleDoubleClick);

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [gl, handlePointerMove, handlePointerUp, handleDoubleClick, draggingId]);

  // Track when dragging starts to capture initial position
  useEffect(() => {
    if (draggingId) {
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      dragStartRef.current = {
        x: dragCurrentRef.current.x || rect.left + rect.width / 2,
        y: dragCurrentRef.current.y || rect.top + rect.height / 2,
        time: Date.now(),
      };
    }
  }, [draggingId, gl]);

  return (
    <>
      <Ground />
      <Walls />

      {/* Render physics objects */}
      {objects.map((obj) => (
        <PhysicsBody
          key={obj.id}
          obj={obj}
          onDragStart={handleDragStart}
          isDragging={draggingId === obj.id}
          isMobile={device.isMobile}
        />
      ))}
    </>
  );
}
