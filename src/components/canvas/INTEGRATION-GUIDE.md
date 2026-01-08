# 3D Scene Integration Guide

## Current Implementation

The 3D scene already responds to scroll through the `Hero3D.tsx` component and `Particles.tsx` system.

## How It Works

### 1. ScrollControls Wrapper
In `CanvasWrapper.tsx`:
```tsx
<ScrollControls pages={3} damping={0.1}>
  <Scene />
</ScrollControls>
```

This creates a virtual scroll area that syncs with the DOM scroll.

### 2. Using Scroll in 3D Components
In `Hero3D.tsx`:
```tsx
import { useScroll } from "@react-three/drei";

const scroll = useScroll();
const scrollOffset = scroll?.offset || 0; // 0-1 value
```

### 3. Particle Response
In `Particles.tsx`:
```tsx
// Expand/contract based on scroll
const scrollEffect = Math.sin(scrollOffset * Math.PI) * 2.0;
const radius = Math.sqrt(x * x + y * y + z * z);
const targetRadius = radius + scrollEffect * 0.1;
```

## Optional Enhancement: FeaturesParticles

If you want more dramatic morphing during the features section, you can add the `FeaturesParticles` component.

### Option A: Replace Existing Particles

**In `Hero3D.tsx`:**
```tsx
import { Particles } from "./Particles";
// Change to:
import { FeaturesParticles } from "./FeaturesParticles";

// Then replace:
<Particles count={3000} mouse={mouseRef.current} scrollOffset={scrollOffset} />
// With:
<FeaturesParticles />
```

### Option B: Layer Both Systems

**In `Hero3D.tsx`:**
```tsx
import { Particles } from "./Particles";
import { FeaturesParticles } from "./FeaturesParticles";

return (
  <group ref={cameraGroupRef}>
    {/* Main particle system */}
    <Particles count={3000} mouse={mouseRef.current} scrollOffset={scrollOffset} />

    {/* Enhanced morphing particles (visible only during features) */}
    {scrollOffset > 0.25 && scrollOffset < 0.75 && (
      <FeaturesParticles />
    )}
  </group>
);
```

## Connecting DOM Section to 3D

The Features section has `data-section="features"` which can be used to trigger specific 3D effects:

```tsx
// In any 3D component
import { useScroll } from "@react-three/drei";

function MyComponent() {
  const scroll = useScroll();

  useFrame(() => {
    const offset = scroll?.offset || 0;

    // Detect features section (page 2 of 3)
    const isInFeatures = offset > 0.33 && offset < 0.66;
    const featuresProgress = (offset - 0.33) / 0.33;

    if (isInFeatures) {
      // Do something special during features
    }
  });
}
```

## Scroll Ranges

With 3 pages, the scroll maps to sections:

```
Scroll:    0.0 ────── 0.33 ────── 0.66 ────── 1.0
           │          │           │           │
Section:   Hero       Features    CTA         Footer
           │          │           │           │
Progress:  0→1        0→1         0→1         complete
```

## Camera Movement Examples

### Smooth Camera Zoom
```tsx
useFrame((state) => {
  const scroll = useScroll();
  const offset = scroll?.offset || 0;

  // Zoom in during features
  state.camera.position.z = 5 - offset * 2;
});
```

### Look At Different Targets
```tsx
const targets = [
  new THREE.Vector3(0, 0, 0),    // Hero
  new THREE.Vector3(2, 1, 0),    // Features
  new THREE.Vector3(-2, -1, 0),  // CTA
];

useFrame((state) => {
  const scroll = useScroll();
  const offset = scroll?.offset || 0;
  const sectionIndex = Math.floor(offset * 3);
  const sectionProgress = (offset * 3) % 1;

  const currentTarget = targets[sectionIndex];
  const nextTarget = targets[Math.min(sectionIndex + 1, 2)];

  const target = new THREE.Vector3().lerpVectors(
    currentTarget,
    nextTarget,
    sectionProgress
  );

  state.camera.lookAt(target);
});
```

## Performance Tips

1. **Conditional Rendering:** Only render heavy effects when visible
2. **LOD (Level of Detail):** Reduce particle count when far away
3. **Frustum Culling:** drei handles this automatically
4. **Memoization:** Use `useMemo` for expensive calculations
5. **RAF Batching:** useFrame batches updates efficiently

## Debugging Scroll

Add this to any component to visualize scroll:

```tsx
import { useScroll } from "@react-three/drei";

function DebugScroll() {
  const scroll = useScroll();

  useFrame(() => {
    console.log('Scroll offset:', scroll?.offset);
  });

  return null;
}

// Add to Scene:
<DebugScroll />
```

## Common Patterns

### Fade In/Out
```tsx
const opacity = Math.sin(scrollOffset * Math.PI); // 0→1→0
material.opacity = opacity;
```

### Expand/Contract
```tsx
const scale = 1 + Math.sin(scrollOffset * Math.PI) * 0.5; // 1→1.5→1
mesh.scale.setScalar(scale);
```

### Rotate Through Sections
```tsx
mesh.rotation.y = scrollOffset * Math.PI * 2; // Full rotation
```

### Color Transition
```tsx
const color = new THREE.Color();
color.lerpColors(
  new THREE.Color('#8b5cf6'),  // Purple
  new THREE.Color('#22d3ee'),  // Cyan
  scrollOffset
);
```

## Resources

- [drei useScroll docs](https://github.com/pmndrs/drei#usescroll)
- [R3F useFrame docs](https://docs.pmnd.rs/react-three-fiber/api/hooks#useframe)
- [Three.js Math Utils](https://threejs.org/docs/#api/en/math/MathUtils)
