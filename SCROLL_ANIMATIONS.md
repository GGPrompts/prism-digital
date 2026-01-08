# GSAP ScrollTrigger Integration

## Overview

This project uses GSAP ScrollTrigger for scroll-driven animations that connect DOM elements and the 3D scene. The implementation provides smooth, performant animations with proper SSR compatibility for Next.js.

## Key Features

1. **Scroll-driven 3D scene transitions** - Camera and particle movements respond to scroll position
2. **UI element animations** - Fade, slide, and parallax effects for sections
3. **Smooth interpolation** - Buttery smooth transitions using lerp
4. **SSR compatible** - Proper client-side only initialization
5. **Performance optimized** - Device detection for mobile/tablet optimizations

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Layout.tsx                        │
│  ┌───────────────────────────────────────────────┐  │
│  │          ScrollConfig                         │  │
│  │  - Initializes GSAP ScrollTrigger            │  │
│  │  - Sets up global configuration              │  │
│  │  - Optional scroll snapping                  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   ┌────▼────┐                      ┌────▼─────┐
   │  Scene  │                      │   Hero   │
   │  (3D)   │◄────scroll state────►│   (UI)   │
   └─────────┘                      └──────────┘
        │                                 │
   useGSAPScroll()                  useGSAP hook
   - scrollProgress                 - fade out on scroll
   - direction                      - scale transforms
   - velocity                       - opacity changes
   - section
```

## File Structure

```
src/
├── hooks/
│   ├── useGSAPScroll.ts          # Main scroll state hook
│   └── useScrollProgress.ts      # Legacy hook (can be removed)
├── components/
│   ├── ScrollConfig.tsx          # Global GSAP configuration
│   └── sections/
│       ├── Hero.tsx              # Hero with scroll fade-out
│       ├── Features.tsx          # Existing features (basic)
│       ├── FeaturesAnimated.tsx  # Enhanced parallax version
│       ├── Process.tsx           # Already has animations
│       └── Testimonials.tsx      # Already has animations
└── canvas/
    ├── Scene.tsx                 # 3D scene with scroll integration
    └── Hero3D.tsx                # Particles with scroll transforms
```

## Usage Patterns

### 1. Basic Scroll Animations (UI Elements)

```tsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function MyComponent() {
  const sectionRef = useRef<HTMLElement>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Fade in from below
      gsap.from(elementRef.current, {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef}>
      <div ref={elementRef}>Content</div>
    </section>
  )
}
```

### 2. Parallax Effects

```tsx
// Different elements moving at different speeds
gsap.to(element, {
  y: -50,
  ease: 'none',
  scrollTrigger: {
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1, // Smooth scrubbing
  },
})
```

### 3. Connecting Scroll to 3D Scene

```tsx
import { useGSAPScroll } from '@/hooks/useGSAPScroll'

export function Scene() {
  const scrollState = useGSAPScroll()

  useFrame(() => {
    // Use scrollState.scrollProgress (0-1) to drive 3D transforms
    camera.position.z = scrollState.scrollProgress * 10
  })
}
```

## Hooks Reference

### `useGSAPScroll()`

Main hook for scroll state management.

**Returns:**
```typescript
{
  scrollY: number          // Raw scroll position
  scrollProgress: number   // Normalized 0-1 progress
  direction: "up" | "down" // Scroll direction
  velocity: number         // Scroll speed
  section: string          // Current section ID
}
```

**Example:**
```tsx
const { scrollProgress, section } = useGSAPScroll()

useFrame(() => {
  particles.rotation.y = scrollProgress * Math.PI
})
```

### `useParallax(ref, options)`

Utility hook for quick parallax effects.

**Parameters:**
```typescript
{
  speed?: number       // Parallax speed (default: 0.5)
  start?: string      // ScrollTrigger start (default: "top bottom")
  end?: string        // ScrollTrigger end (default: "bottom top")
}
```

**Example:**
```tsx
const elementRef = useRef<HTMLDivElement>(null)
useParallax(elementRef, { speed: 0.3 })
```

## ScrollTrigger Configuration

### Global Settings (ScrollConfig.tsx)

```typescript
ScrollTrigger.config({
  limitCallbacks: true,  // Performance optimization
  syncInterval: 0,       // Sync with display refresh
})

ScrollTrigger.defaults({
  toggleActions: 'play none none reverse',
  markers: false, // Set to true for debugging
})
```

### Common ScrollTrigger Properties

```typescript
scrollTrigger: {
  trigger: element,           // Element to watch
  start: "top 80%",          // When to start (trigger top at viewport 80%)
  end: "bottom 20%",         // When to end
  scrub: 1,                  // Smooth scrubbing (0-3, or true)
  toggleActions: "play none none reverse",
  markers: false,            // Show debug markers
  onEnter: () => {},        // Callback on enter
  onLeave: () => {},        // Callback on leave
}
```

### toggleActions Syntax

Format: `"onEnter onLeave onEnterBack onLeaveBack"`

Options: `play`, `pause`, `resume`, `reverse`, `restart`, `complete`, `reset`, `none`

Common patterns:
- `"play none none reverse"` - Play forward, reverse on scroll up
- `"play pause resume reverse"` - Full control
- `"play complete none none"` - Play once, never reverse

## Performance Optimization

### Device Detection

The implementation includes device detection to reduce animations on mobile/tablet:

```typescript
// Reduce particle count
const particleCount = device.isMobile ? 1500 : 3000

// Reduce rotation multiplier
const rotationMultiplier = device.isMobile ? 0.3 : 0.5

// Disable mouse tracking on touch devices
if (!device.isTouch) {
  // Mouse-based animations
}
```

### Smooth Interpolation

Use `lerp` for buttery smooth transitions:

```typescript
smoothScrollRef.current = THREE.MathUtils.lerp(
  smoothScrollRef.current,
  targetScroll,
  0.1 // Smoothing factor (0-1)
)
```

### Cleanup

Always clean up ScrollTrigger instances:

```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    // Create animations
  }, ref)

  return () => ctx.revert() // Kills all animations in context
}, [])
```

## Scroll Snapping

Optional smooth scroll snapping to sections:

```tsx
// In layout.tsx
<ScrollConfig enableSnap={true} snapDuration={0.5} />
```

Snapping is **disabled by default** to maintain natural scrolling feel.

## Debugging

Enable ScrollTrigger markers:

```typescript
scrollTrigger: {
  trigger: element,
  markers: true, // Shows start/end positions
  id: "my-animation" // Label for marker
}
```

Or globally:

```typescript
ScrollTrigger.defaults({
  markers: true
})
```

## Common Issues

### 1. Animations not triggering

**Solution:** Ensure ScrollTrigger is registered:
```typescript
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}
```

### 2. Layout shifts after mount

**Solution:** Refresh ScrollTrigger after content loads:
```typescript
useEffect(() => {
  ScrollTrigger.refresh()
}, [])
```

### 3. Animations not cleaning up

**Solution:** Use `gsap.context()` for automatic cleanup:
```typescript
const ctx = gsap.context(() => {
  // animations
}, ref)

return () => ctx.revert()
```

### 4. SSR errors

**Solution:** Guard against server-side execution:
```typescript
if (typeof window === 'undefined') return
```

## Examples

### Hero Fade Out

```typescript
// Hero.tsx
gsap.to(headlineRef.current, {
  opacity: 0,
  y: -50,
  scale: 0.95,
  scrollTrigger: {
    trigger: sectionRef.current,
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
  },
})
```

### Staggered Card Entrance

```typescript
// FeaturesAnimated.tsx
gsap.from(cards, {
  y: 100,
  opacity: 0,
  scale: 0.9,
  duration: 1,
  stagger: 0.15,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: container,
    start: 'top 85%',
    toggleActions: 'play none none reverse',
  },
})
```

### 3D Scene Scroll Response

```typescript
// Hero3D.tsx
useFrame(() => {
  const scroll = smoothScrollRef.current

  // Move camera
  cameraGroupRef.current.position.z = scroll * 5

  // Rotate particles
  particlesGroupRef.current.rotation.y = scroll * Math.PI * 0.5

  // Scale particles
  particlesGroupRef.current.scale.setScalar(1 + scroll * 2)
})
```

## Best Practices

1. **Use `gsap.context()`** for component-scoped animations
2. **Always return cleanup** in useEffect
3. **Guard SSR** with `typeof window !== 'undefined'`
4. **Use refs** for DOM elements, not state
5. **Smooth interpolation** with lerp for 3D values
6. **Device detection** for mobile optimization
7. **Debounce resize** events (250ms)
8. **Test performance** on low-end devices

## Resources

- [GSAP Docs](https://greensock.com/docs/)
- [ScrollTrigger Docs](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [ScrollTrigger Examples](https://codepen.io/collection/AEbkkJ)
