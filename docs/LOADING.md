# Loading Experience Documentation

## Overview

The loading experience provides smooth transitions and progress tracking for 3D asset loading using React Three Fiber's built-in hooks.

## Implementation

### Components

#### 1. Loader Component (`src/components/ui/Loader.tsx`)

The main loading screen with:
- **Progress tracking** via `useProgress` hook from `@react-three/drei`
- **Animated prism logo** with rotating ring and pulsing shape
- **Progress bar** showing percentage (0-100%)
- **Smooth exit animation** with 700ms fade-out
- **Status text** showing "Initializing 3D assets..." during load

**Key Features:**
- Branded design matching Prism Digital identity
- Purple color scheme with glow effects
- Geometric prism shape using CSS clip-path
- Responsive layout centered on screen
- z-index: 50 to overlay everything during loading

#### 2. ContentFade Component (`src/components/ui/ContentFade.tsx`)

Handles smooth fade-in of page content after loading completes:
- Waits for `progress === 100`
- Adds 800ms delay to sync with loader exit
- 1000ms fade-in transition
- Wraps all page content (Header + children)

### Integration

```tsx
// layout.tsx
<Canvas3D />  {/* Contains Loader */}
<ContentFade>
  <Header />
  {children}
</ContentFade>
```

### Animation Sequence

1. **Initial State** (0-99% progress)
   - Loader visible (opacity: 100%)
   - Content hidden (opacity: 0%)

2. **Loading Complete** (progress: 100%)
   - Loader triggers exit animation (300ms delay)
   - Loader fades out (700ms transition)

3. **Content Fade-In** (800ms after completion)
   - Content begins fade-in (1000ms transition)
   - Smooth handoff between loader and content

**Total transition time:** ~1.5s from load complete to content visible

## Preloading Assets

For future 3D assets (GLTF models, textures):

```tsx
// At module level (outside component)
import { useGLTF, useTexture } from '@react-three/drei'

// Preload before component renders
useGLTF.preload('/models/scene.glb')
useTexture.preload('/textures/diffuse.jpg')

export function Scene() {
  // Component will have assets ready
  const { scene } = useGLTF('/models/scene.glb')
  const texture = useTexture('/textures/diffuse.jpg')
  // ...
}
```

### Current Assets

Currently, the scene uses:
- **Procedural particles** (no external assets)
- **Environment preset** from drei (loaded on-demand)
- **Post-processing shaders** (built-in)

No external preloading needed yet.

## Suspense Boundaries

```tsx
// CanvasWrapper.tsx
<Canvas>
  <Suspense fallback={null}>
    <ScrollControls>
      <Scene />
    </ScrollControls>
    <Preload all />
  </Suspense>
</Canvas>
```

- `Suspense` wraps all 3D content
- `fallback={null}` shows nothing while loading (Loader handles UI)
- `<Preload all />` ensures all lazy-loaded drei components are ready

## CSS Animations

### Custom Animations (globals.css)

```css
/* Prism geometric shape */
.prism-shape {
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  background: linear-gradient(135deg, var(--primary), var(--primary-muted));
  box-shadow: 0 0 20px var(--glow-primary);
}

/* Slow rotation (3s) */
.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

/* Pulsing scale and opacity */
.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

/* Center dot glow */
.shadow-glow-primary {
  box-shadow: 0 0 20px var(--glow-primary), 0 0 40px var(--glow-primary-subtle);
}
```

## Performance Considerations

### Adaptive Quality
- PerformanceMonitor adjusts DPR based on device capability
- AdaptiveDpr enables pixelation on quality reduction
- Effects disabled on low-end devices (see Effects.tsx)

### Loader Performance
- Pure CSS animations (no JavaScript)
- Fixed positioning (no layout thrashing)
- Single component, minimal DOM nodes
- Removed from DOM after exit (returns null)

## Testing

### Manual Testing Checklist
- [ ] Loader appears immediately on page load
- [ ] Progress bar animates from 0% to 100%
- [ ] Loader fades out smoothly at 100%
- [ ] Content fades in after loader exits
- [ ] No flash of unstyled content (FOUC)
- [ ] No jarring transitions
- [ ] Works on slow 3G throttling
- [ ] Accessible (screen reader announces loading state)

### Development Testing
```bash
# Throttle network to see loading longer
npm run dev
# Open DevTools > Network > Throttling > Slow 3G
```

## Future Enhancements

### Potential Improvements
1. **Asset-specific progress** - Show which assets are loading
2. **Minimum display time** - Ensure loader shows for at least 1s (avoid flash)
3. **Error states** - Handle failed asset loads gracefully
4. **Skip button** - Allow users to skip intro (accessibility)
5. **Retry logic** - Retry failed asset loads
6. **Loading tips** - Show randomized tips during long loads

### Example: Minimum Display Time
```tsx
const [showLoader, setShowLoader] = useState(true)
const [minTimePassed, setMinTimePassed] = useState(false)

useEffect(() => {
  const timer = setTimeout(() => setMinTimePassed(true), 1000)
  return () => clearTimeout(timer)
}, [])

useEffect(() => {
  if (progress === 100 && minTimePassed) {
    // Trigger exit
  }
}, [progress, minTimePassed])
```

## Browser Support

- **Modern browsers** - All animations supported
- **Safari** - Requires `-webkit-backdrop-filter` (already included)
- **Firefox** - Full support
- **Chrome/Edge** - Full support
- **Mobile browsers** - Full support (tested on iOS Safari, Chrome Android)

## Accessibility

- Fixed z-index ensures loader always visible
- Text provides loading status
- Smooth transitions prevent seizure risk
- Progress percentage for screen readers
- No reliance on color alone (text labels present)

## Troubleshooting

### Loader never disappears
- Check `useProgress()` is working (log progress value)
- Ensure Suspense boundary is correct
- Verify Preload component is present

### Content doesn't fade in
- Check ContentFade timing (800ms delay)
- Ensure progress === 100 is detected
- Verify opacity transitions are working

### Loading stuck at 0%
- Scene likely not wrapped in Suspense
- Missing Preload component
- No lazy-loaded components to track
