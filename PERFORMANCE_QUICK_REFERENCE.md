# Performance Quick Reference

## At a Glance

### Particle Counts by Device

| Device Type | GPU Tier | Particle Count |
|-------------|----------|----------------|
| Desktop | High | 3000 |
| Desktop | Medium | 1500 |
| Desktop | Low | 800 |
| Mobile | High | 1200 |
| Mobile | Medium | 600 |
| Mobile | Low | 300 |

### Effects Settings

| Device | Effects Enabled | Bloom Intensity | Bloom Radius | Mipmap Blur |
|--------|----------------|-----------------|--------------|-------------|
| Desktop High | ✓ | 1.2 | 0.8 | ✓ |
| Desktop Medium | ✓ | 0.8 | 0.5 | ✗ |
| Desktop Low | ✗ | - | - | - |
| Mobile High | ✓ (reduced) | 0.8 | 0.5 | ✗ |
| Mobile Medium | ✗ | - | - | - |
| Mobile Low | ✗ | - | - | - |

### DPR Ranges

| Device | Min DPR | Max DPR | Default |
|--------|---------|---------|---------|
| Desktop | 1.0 | 2.0 | 1.5 |
| Mobile | 0.5 | 1.5 | 1.0 |

## Key Components

### Device Detection
```typescript
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

const device = useDeviceDetection();
// device.gpu: "high" | "medium" | "low"
// device.isMobile: boolean
// device.hasWebGL2: boolean
```

### Adaptive Particle Count
```typescript
import { getOptimalParticleCount } from "@/hooks/useDeviceDetection";

const particleCount = getOptimalParticleCount(device);
```

### Performance LOD
```typescript
import { usePerformanceLOD } from "@/hooks/usePerformanceLOD";

const qualityLevel = usePerformanceLOD();
// Returns: "high" | "medium" | "low"
```

## Pre-allocated Objects Pattern

```typescript
// ✓ GOOD - Pre-allocate outside useFrame
const tempVec = useMemo(() => new THREE.Vector3(), []);
const tempObject = useMemo(() => new THREE.Object3D(), []);

useFrame(() => {
  tempVec.set(x, y, z);
  // Use tempVec...
});
```

```typescript
// ✗ BAD - Creates new objects every frame
useFrame(() => {
  const vec = new THREE.Vector3(x, y, z); // GC pressure!
});
```

## Resource Disposal Pattern

```typescript
useEffect(() => {
  return () => {
    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach((mat) => mat.dispose());
      } else {
        meshRef.current.material.dispose();
      }
    }
  };
}, []);
```

## State vs Ref in useFrame

```typescript
// ✓ GOOD - Use ref for high-frequency updates
const scrollOffsetRef = useRef(0);

useFrame(() => {
  scrollOffsetRef.current = scroll?.offset || 0;
  // Use scrollOffsetRef.current...
});
```

```typescript
// ✗ BAD - setState causes re-renders
const [scrollOffset, setScrollOffset] = useState(0);

useFrame(() => {
  setScrollOffset(scroll?.offset || 0); // Re-renders every frame!
});
```

## PerformanceMonitor Setup

```typescript
<PerformanceMonitor
  onIncline={() => setDpr(2)}
  onDecline={() => setDpr(1)}
  onChange={({ factor }) => {
    setDpr(Math.max(0.5, Math.min(2, 1.5 * factor)));
  }}
  flipflops={3}
  onFallback={() => setDpr(0.5)}
>
  {/* Scene content */}
</PerformanceMonitor>
```

## Canvas Configuration

```typescript
<Canvas
  gl={{
    antialias: !device.isMobile,
    alpha: true,
    powerPreference: device.isMobile ? "default" : "high-performance",
    stencil: false,
    depth: true,
  }}
  dpr={dpr}
  frameloop="always"
  performance={{ min: 0.5 }}
/>
```

## Adaptive Geometry

```typescript
const geometrySegments = device?.isMobile ? 6 : 8;

<sphereGeometry args={[1, geometrySegments, geometrySegments]} />
```

## Conditional Effects

```typescript
import { shouldEnableEffects } from "@/hooks/useDeviceDetection";

const enableEffects = shouldEnableEffects(device);

return (
  <>
    {/* Scene content */}
    {enableEffects && <Effects device={device} />}
  </>
);
```

## Performance Testing Commands

```bash
# Build and check for errors
npm run build

# Start dev server
npm run dev

# Run Lighthouse (requires lighthouse CLI)
lighthouse http://localhost:3000 --view

# Check bundle size
ls -lh .next/static/chunks
```

## Chrome DevTools Quick Actions

1. **Show FPS Meter**
   - Cmd/Ctrl + Shift + P → "Show Rendering" → Enable "FPS Meter"

2. **Performance Profiling**
   - Open DevTools → Performance tab → Record → Interact → Stop

3. **Memory Profiling**
   - DevTools → Memory tab → Heap snapshot → Take snapshot → Compare

4. **GPU Status**
   - Visit: `chrome://gpu`

## Performance Targets

| Metric | Target | Good | Excellent |
|--------|--------|------|-----------|
| Desktop FPS | 45+ | 55+ | 60 |
| Mobile FPS | 30+ | 45+ | 60 |
| First Paint | <2s | <1.5s | <1s |
| Time to Interactive | <4s | <3.5s | <3s |
| Memory Growth | <5MB/min | <2MB/min | Stable |

## Troubleshooting

### Low FPS
1. Check particle count: `console.log(particleCount)`
2. Check effects: `console.log(enableEffects)`
3. Check DPR: `console.log(gl.getPixelRatio())`
4. Monitor GPU tier: `console.log(device.gpu)`

### Memory Leaks
1. Open Memory tab in DevTools
2. Take heap snapshot before/after navigation
3. Check for detached DOM nodes
4. Verify resource disposal

### Jank/Stuttering
1. Check Performance tab for long tasks
2. Verify no layout thrashing
3. Check for synchronous operations
4. Monitor frame timing in Performance Monitor

## Common Issues

### Issue: Particles not adapting to device
**Check:** Device detection initialized before use
```typescript
const device = useDeviceDetection();
// Wait for device detection to complete
if (!device.gpu) return null;
```

### Issue: Effects always enabled
**Check:** Conditional rendering implemented
```typescript
{shouldEnableEffects(device) && <Effects device={device} />}
```

### Issue: Memory growing over time
**Check:** Resource disposal in all components
```typescript
useEffect(() => {
  return () => {
    // Cleanup code
  };
}, []);
```

### Issue: Low FPS on mobile
**Check:**
- Mobile detection working
- Particle count reduced
- Effects disabled
- DPR limited to 1.5
- Antialiasing disabled

## Environment Variables

No environment variables needed for performance system.
All optimizations are automatic based on runtime detection.

## Feature Flags

All performance features are enabled by default.
To disable adaptive quality (for testing):

```typescript
// In Scene.tsx
const qualitySettings = {
  particleCount: 3000,
  effects: true,
};
```

## Monitoring in Production

Add to your analytics:

```typescript
// Track FPS
const fpsObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    analytics.track('fps', { value: entry.duration });
  }
});
```

## Quick Wins

1. **Instant:** Enable PerformanceMonitor (already done)
2. **Instant:** Use refs instead of state in useFrame (already done)
3. **Instant:** Pre-allocate objects (already done)
4. **Instant:** Disable effects on mobile (already done)
5. **5 min:** Add resource disposal (already done)
6. **10 min:** Implement device detection (already done)

## Further Reading

- [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md) - Detailed documentation
- [PERFORMANCE_TESTING.md](./PERFORMANCE_TESTING.md) - Testing guide
- [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) - Implementation summary
- [PD-014_CHECKLIST.md](./PD-014_CHECKLIST.md) - Completion checklist
