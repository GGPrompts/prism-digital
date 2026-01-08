# Performance Optimizations

This document outlines all performance optimizations implemented for consistent 60fps rendering.

## Overview

The application uses React Three Fiber for 3D rendering with multiple particle systems and post-processing effects. These optimizations ensure smooth performance across different device capabilities.

## Key Optimizations

### 1. Adaptive Quality Settings

**Device Detection** (`src/hooks/useDeviceDetection.ts`)
- Detects GPU tier (high/medium/low)
- Identifies mobile vs desktop
- Checks WebGL2 support
- Measures viewport and pixel ratio

**Adaptive Particle Counts**
- High-end desktop: 3000 particles
- Mid-range desktop: 1500 particles
- Low-end desktop: 800 particles
- High-end mobile: 1200 particles
- Mid-range mobile: 600 particles
- Low-end mobile: 300 particles

### 2. Performance Monitoring

**PerformanceMonitor** (`src/components/canvas/CanvasWrapper.tsx`)
- Real-time FPS monitoring
- Automatic DPR (Device Pixel Ratio) adjustment
- Quality degradation on performance drop
- Emergency fallback for very low-end devices

**Performance LOD** (`src/hooks/usePerformanceLOD.ts`)
- Dynamic quality adjustment based on frame rate
- Rolling average FPS calculation
- Automatic particle count reduction
- Effect quality scaling

### 3. Memory Management

**Object Pre-allocation**
- Reusable THREE.Vector3 objects in useFrame loops
- Pre-allocated Object3D for matrix transforms
- Pre-allocated Color objects for particle coloring
- Eliminates garbage collection pressure

**Resource Disposal**
- Proper cleanup on component unmount
- Geometry disposal
- Material disposal
- Prevents memory leaks

### 4. Render Optimizations

**Canvas Settings**
```typescript
{
  powerPreference: "high-performance",
  stencil: false,  // Disable stencil buffer
  depth: true,
  antialias: true,
}
```

**Adaptive DPR**
- Desktop: 1.0 - 2.0
- Mobile: 1.0 - 1.5
- Adjusts based on performance

**Post-processing**
- Conditional effects rendering
- Disabled on low-end devices
- Adaptive bloom quality
- Stencil buffer disabled for better performance

### 5. Geometry Optimization

**Reduced Polygon Counts**
- Particle spheres: 6x6 segments on mobile, 8x8 on desktop
- Instanced mesh for particle systems
- Efficient BufferGeometry usage

### 6. State Management

**Ref-based Updates**
- Scroll offset using refs instead of state
- Avoids re-renders in useFrame loop
- Mouse position with refs
- Better performance for high-frequency updates

### 7. Lazy Loading

**Dynamic Imports**
- Canvas3D lazy-loaded with Next.js dynamic
- Heavy 3D components loaded on-demand
- No SSR for 3D components
- Reduced initial bundle size

**Progressive Loading**
- Preload directive for critical assets
- Suspense boundaries for async loading
- Smooth loading experience

## Performance Targets

- **Desktop High-end**: Consistent 60fps at 1440p+
- **Desktop Mid-range**: 60fps at 1080p
- **Desktop Low-end**: 45-60fps at 1080p
- **Mobile High-end**: 60fps
- **Mobile Mid-range**: 45-60fps
- **Mobile Low-end**: 30-45fps

## Monitoring

### Development Tools

**Performance Stats Component**
- Real-time FPS counter
- Performance warnings
- Only visible in development

**Leva Controls**
- Debug UI for testing
- Quality adjustments
- Particle count tuning

### Production Monitoring

**PerformanceMonitor Callbacks**
- `onIncline`: Increase quality
- `onDecline`: Reduce quality
- `onChange`: Gradual adjustment
- `onFallback`: Emergency mode

## Best Practices

### Do's
✓ Pre-allocate objects used in useFrame
✓ Use refs for high-frequency updates
✓ Dispose resources on unmount
✓ Use instancing for repeated geometry
✓ Implement adaptive quality
✓ Test on low-end devices

### Don'ts
✗ Create objects in useFrame loops
✗ Use setState in useFrame
✗ Forget to dispose resources
✗ Use high polygon counts unnecessarily
✗ Enable all effects on all devices
✗ Ignore performance monitoring

## Testing Checklist

- [ ] 60fps on desktop (Chrome DevTools Performance tab)
- [ ] Smooth scroll animations
- [ ] Mobile responsive (test on real devices)
- [ ] No WebGL errors in console
- [ ] Memory doesn't grow over time
- [ ] Works on low-end devices
- [ ] Fallbacks work correctly
- [ ] No frame drops during interactions

## Future Optimizations

Potential areas for further improvement:

1. **Texture Compression**
   - Implement KTX2 compressed textures
   - Use Basis Universal for cross-platform support

2. **GPU Particle System**
   - Shader-based particle updates
   - Compute shaders for complex behaviors

3. **Frustum Culling**
   - Only render visible particles
   - Spatial partitioning for large scenes

4. **Worker Offloading**
   - Move physics calculations to Web Workers
   - Parallel processing for particle updates

5. **WASM Integration**
   - Critical path calculations in WebAssembly
   - Better numerical performance

## Resources

- [React Three Fiber Performance](https://docs.pmnd.rs/react-three-fiber/advanced/performance)
- [Three.js Performance Tips](https://threejs.org/docs/#manual/en/introduction/Performance)
- [GPU Tier Detection](https://github.com/pmndrs/detect-gpu)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
