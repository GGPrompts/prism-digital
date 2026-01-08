# Hero 3D Particle System

Beautiful, performant particle system for the Prism Digital hero section with mouse interaction and scroll reactivity.

## Components

### Particles.tsx
Core particle system using instanced mesh for optimal performance.

**Features:**
- **3000 particles** rendered as a single draw call using `InstancedMesh`
- **Purple color palette** with 5 violet variations (violet-300 to violet-700)
- **Organic flowing motion** using sine/cosine functions with phase offsets
- **Mouse interaction** - particles subtly repel from cursor position
- **Scroll reactivity** - particle field expands/contracts with scroll
- **Performance optimized** - pre-allocated vectors, no object creation in render loop
- **Dynamic sizing** - particles scale based on depth and scroll position
- **Color pulsing** - subtle brightness animation for alive feel

**Props:**
```tsx
interface ParticlesProps {
  count?: number;           // Default: 3000
  mouse?: THREE.Vector2;    // Mouse position (-1 to 1)
  scrollOffset?: number;    // Scroll position (0 to 1)
}
```

**Performance Pattern:**
```tsx
// Pre-allocate reusable objects
const tempObject = useMemo(() => new THREE.Object3D(), []);
const tempVec = useMemo(() => new THREE.Vector3(), []);
const tempColor = useMemo(() => new THREE.Color(), []);

// Update in render loop without creating new objects
useFrame(() => {
  tempObject.position.set(x, y, z);
  meshRef.current.setMatrixAt(i, tempObject.matrix);
});
```

### Hero3D.tsx
Hero scene composition that connects user input to particles.

**Features:**
- **Smooth mouse tracking** using lerp for fluid motion
- **Scroll-based camera movement** - camera moves back and tilts with scroll
- **Subtle camera sway** - follows mouse position for parallax effect
- **Integration layer** between user input and 3D scene

**Interaction Flow:**
1. Tracks raw pointer position from R3F
2. Smooths mouse movement using lerp (0.05 factor)
3. Passes smooth mouse position to Particles
4. Monitors scroll offset from ScrollControls
5. Animates camera position and rotation based on scroll

### Effects.tsx
Post-processing pipeline for visual polish.

**Effects:**
- **Bloom** - Glowing particles with mipmapped blur
  - Intensity: 1.2
  - Threshold: 0.2 (only bright objects glow)
  - Radius: 0.8
- **Vignette** - Subtle darkening at edges for depth
  - Offset: 0.3
  - Darkness: 0.5

### Scene.tsx
Main scene wrapper that composes all elements.

**Structure:**
```tsx
<>
  <ambientLight intensity={0.2} />
  <Environment preset="night" />
  <Hero3D />
  <Effects />
</>
```

## Technical Details

### Performance Optimizations

1. **Instanced Rendering**
   - Single mesh renders 3000 particles
   - 1 draw call instead of 3000
   - Massive GPU performance gain

2. **Pre-allocated Objects**
   - Reusable Vector3, Object3D, Color instances
   - Avoid garbage collection in render loop
   - Consistent 60fps target

3. **Efficient Updates**
   - Only update instanceMatrix/instanceColor when needed
   - Use `needsUpdate` flags sparingly
   - Batch matrix operations

4. **Smart Rendering**
   - `toneMapped={false}` on particles for accurate colors
   - `multisampling={0}` on EffectComposer (post-processing handles AA)
   - `dpr={[1, 2]}` adaptive pixel ratio

### Interaction Design

**Mouse Repulsion:**
- Particles within 3 units of cursor are affected
- Repulsion strength: `(3 - distance) / 3`
- Applied gradually using normalized direction vector
- Creates organic "breathing" effect

**Scroll Expansion:**
- Field radius changes: `radius + sin(scroll * π) * 2.0`
- Smooth sinusoidal expansion/contraction
- Camera moves from z=5 to z=8 over scroll range
- Camera tilts 0.3 radians for depth perception

### Color System

Purple variations from Tailwind:
```tsx
const colorPalette = [
  new THREE.Color("#8b5cf6"), // violet-500 (primary)
  new THREE.Color("#a78bfa"), // violet-400 (lighter)
  new THREE.Color("#7c3aed"), // violet-600 (deeper)
  new THREE.Color("#c4b5fd"), // violet-300 (pale)
  new THREE.Color("#6d28d9"), // violet-700 (darkest)
];
```

Each particle assigned a color from palette, then modulated by:
- Depth-based brightness
- Sinusoidal pulsing (2Hz frequency)
- Individual phase offset for variety

### Animation Flow

**Organic Motion:**
```tsx
// Multi-frequency sine waves for natural flow
flowX = sin(time * 0.3 + phase) * 0.01
      + cos(time * 0.21 + y * 0.1) * 0.005

flowY = cos(time * 0.3 + phase) * 0.01
      + sin(time * 0.15 + x * 0.1) * 0.005

flowZ = sin(time * 0.24 + phase) * 0.008
      + cos(time * 0.09 + x * 0.1) * 0.004
```

Different frequencies (0.3, 0.21, 0.15, etc.) prevent repetitive patterns.
Position-based modulation (y * 0.1, x * 0.1) creates spatial variation.

## Integration with Page

The 3D canvas is fixed behind scrollable content:

```tsx
// layout.tsx
<Canvas3D />                           {/* Fixed position */}
<div className="relative z-10">       {/* Overlay content */}
  {children}
</div>
```

ScrollControls syncs 3D scroll with DOM scroll:
```tsx
<ScrollControls pages={3} damping={0.1}>
  <Scene />
</ScrollControls>
```

## Usage

The hero scene is automatically loaded in the root layout and doesn't require any additional setup:

```tsx
// Already integrated in layout.tsx
import { Canvas3D } from "@/components/canvas/Canvas3D";
```

## Customization

**Adjust particle count:**
```tsx
// src/components/canvas/Hero3D.tsx
<Particles count={5000} />  // More particles (heavier)
<Particles count={1500} />  // Fewer particles (lighter)
```

**Modify colors:**
```tsx
// src/components/canvas/Particles.tsx
const colorPalette = [
  new THREE.Color("#ff0000"),  // Custom color palette
  new THREE.Color("#00ff00"),
  // ...
];
```

**Adjust bloom intensity:**
```tsx
// src/components/canvas/Effects.tsx
<Bloom
  intensity={2.0}  // Stronger glow
  radius={1.2}     // Wider glow
/>
```

**Change interaction strength:**
```tsx
// src/components/canvas/Hero3D.tsx
const mouseInfluence = 5.0;  // Stronger mouse repulsion
const scrollInfluence = 3.0; // More scroll expansion
```

## Performance Benchmarks

Target: **60fps** on modern hardware

Expected performance:
- **Desktop (RTX 3060+)**: 60fps constant
- **Desktop (GTX 1060+)**: 55-60fps
- **MacBook Pro (M1+)**: 60fps constant
- **Mobile (high-end)**: 30-45fps

If experiencing performance issues:
1. Reduce particle count to 2000 or 1500
2. Disable vignette effect
3. Lower bloom quality (remove `mipmapBlur`)
4. Reduce DPR to [1, 1.5]

## Files Created

```
src/components/canvas/
├── Particles.tsx       # Core particle system (198 lines)
├── Hero3D.tsx         # Hero scene composition (64 lines)
├── Effects.tsx        # Post-processing (23 lines)
├── Scene.tsx          # Updated with Hero3D
├── CanvasWrapper.tsx  # Updated with ScrollControls
└── README.md          # This documentation
```
