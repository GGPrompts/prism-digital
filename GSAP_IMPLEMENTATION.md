# GSAP ScrollTrigger Implementation Guide

## Quick Start

### Using Scroll State in Components

```tsx
import { useGSAPScroll } from '@/hooks/useGSAPScroll'

export function MyComponent() {
  const { scrollProgress, section } = useGSAPScroll()

  // scrollProgress is 0-1 for entire page
  // Use it for any scroll-driven logic

  return <div>Currently at {section}</div>
}
```

### Creating Scroll Animations

```tsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function AnimatedSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(elementRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef}>
      <div ref={elementRef}>Animated content</div>
    </section>
  )
}
```

### Connecting to 3D Scene

```tsx
import { useFrame } from '@react-three/fiber'
import { useGSAPScroll } from '@/hooks/useGSAPScroll'

export function My3DObject() {
  const { scrollProgress } = useGSAPScroll()
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    if (!meshRef.current) return

    // Rotate based on scroll
    meshRef.current.rotation.y = scrollProgress * Math.PI * 2

    // Move based on scroll
    meshRef.current.position.y = scrollProgress * 5
  })

  return <mesh ref={meshRef}>...</mesh>
}
```

## Key Files

### Configuration
- `/src/components/ScrollConfig.tsx` - Global GSAP setup (included in layout.tsx)

### Hooks
- `/src/hooks/useGSAPScroll.ts` - Main scroll state hook

### Enhanced Components
- `/src/components/sections/Hero.tsx` - Fade out on scroll
- `/src/components/sections/FeaturesAnimated.tsx` - Parallax cards
- `/src/components/canvas/Scene.tsx` - 3D lighting & rotation
- `/src/components/canvas/Hero3D.tsx` - Particle transformations

## Common Patterns

### 1. Fade In on Scroll

```tsx
gsap.from(element, {
  opacity: 0,
  y: 50,
  duration: 1,
  scrollTrigger: {
    trigger: container,
    start: 'top 80%',
  },
})
```

### 2. Fade Out on Scroll

```tsx
gsap.to(element, {
  opacity: 0,
  y: -50,
  scrollTrigger: {
    trigger: container,
    start: 'top top',
    end: 'bottom top',
    scrub: 1, // Smooth scrolling
  },
})
```

### 3. Parallax Effect

```tsx
gsap.to(element, {
  y: -100,
  ease: 'none',
  scrollTrigger: {
    trigger: container,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
  },
})
```

### 4. Staggered Animation

```tsx
gsap.from('.cards', {
  y: 100,
  opacity: 0,
  stagger: 0.15, // 0.15s delay between each
  scrollTrigger: {
    trigger: '.container',
    start: 'top 75%',
  },
})
```

### 5. Smooth 3D Transform

```tsx
const smoothScroll = useRef(0)
const { scrollProgress } = useGSAPScroll()

useFrame(() => {
  // Smooth interpolation
  smoothScroll.current = THREE.MathUtils.lerp(
    smoothScroll.current,
    scrollProgress,
    0.1 // Smoothing factor (0-1)
  )

  // Use smoothed value
  mesh.rotation.y = smoothScroll.current * Math.PI
})
```

## ScrollTrigger Properties

### Positioning

- `trigger`: Element to watch
- `start`: When to start ("top 80%" = trigger top at viewport 80%)
- `end`: When to end ("bottom top" = trigger bottom at viewport top)

### Behavior

- `scrub`: Smooth scrolling (true or 0-3)
- `toggleActions`: "onEnter onLeave onEnterBack onLeaveBack"
  - Options: play, pause, resume, reverse, restart, complete, reset, none
  - Example: "play none none reverse"

### Utilities

- `markers`: true for debugging (shows start/end lines)
- `id`: Label for the trigger
- `onEnter`, `onLeave`: Callbacks

## Device Optimization

The system automatically detects device capabilities:

```tsx
const { scrollProgress } = useGSAPScroll()
const device = useDeviceDetection()

// Adjust based on device
const speed = device.isMobile ? 0.5 : 1.0
const particleCount = device.isMobile ? 1500 : 3000

// Disable on touch devices
if (!device.isTouch) {
  // Mouse-based effects
}
```

## Debugging

Enable visual markers:

```tsx
scrollTrigger: {
  trigger: element,
  start: 'top 80%',
  markers: true, // Shows start/end positions
  id: 'my-animation', // Label for marker
}
```

Or globally:

```tsx
ScrollTrigger.defaults({
  markers: true
})
```

## Best Practices

### ✅ DO

1. **Use gsap.context() for scoping**
   ```tsx
   const ctx = gsap.context(() => {
     // Animations here
   }, ref)
   return () => ctx.revert()
   ```

2. **Guard against SSR**
   ```tsx
   if (typeof window !== 'undefined') {
     gsap.registerPlugin(ScrollTrigger)
   }
   ```

3. **Use refs, not state**
   ```tsx
   const elementRef = useRef<HTMLDivElement>(null)
   gsap.to(elementRef.current, { ... })
   ```

4. **Always cleanup**
   ```tsx
   useEffect(() => {
     // Setup
     return () => {
       // Cleanup
     }
   }, [])
   ```

5. **Smooth 3D with lerp**
   ```tsx
   value.current = THREE.MathUtils.lerp(value.current, target, 0.1)
   ```

### ❌ DON'T

1. **Don't create animations in render**
   ```tsx
   // BAD
   gsap.to(element, { ... }) // Every render!

   // GOOD
   useEffect(() => {
     gsap.to(element, { ... })
   }, [])
   ```

2. **Don't forget cleanup**
   ```tsx
   // BAD
   useEffect(() => {
     gsap.to(element, { ... })
   }, [])

   // GOOD
   useEffect(() => {
     const ctx = gsap.context(() => {
       gsap.to(element, { ... })
     })
     return () => ctx.revert()
   }, [])
   ```

3. **Don't use ScrollTrigger without registration**
   ```tsx
   // BAD
   gsap.to(element, { scrollTrigger: { ... } })

   // GOOD
   gsap.registerPlugin(ScrollTrigger)
   gsap.to(element, { scrollTrigger: { ... } })
   ```

## Performance Tips

1. **Limit particle count on mobile**
2. **Use `scrub` for smooth scrolling** (prevents jank)
3. **Disable effects on low-end devices**
4. **Use refs instead of state** (avoid re-renders)
5. **Debounce resize events** (250ms minimum)

## Common Issues

### Animations not triggering?

Check:
1. Is ScrollTrigger registered?
2. Is the trigger element in the DOM?
3. Are start/end values correct?
4. Try `markers: true` to debug

### Layout shifts?

```tsx
useEffect(() => {
  ScrollTrigger.refresh()
}, []) // After content loads
```

### SSR errors?

```tsx
if (typeof window === 'undefined') return
```

### Not cleaning up?

```tsx
const ctx = gsap.context(() => { ... }, ref)
return () => ctx.revert()
```

## Examples in Codebase

### Hero Fade Out
**File:** `/src/components/sections/Hero.tsx`

```tsx
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

### Staggered Cards
**File:** `/src/components/sections/FeaturesAnimated.tsx`

```tsx
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

### 3D Particle Transform
**File:** `/src/components/canvas/Hero3D.tsx`

```tsx
useFrame(() => {
  const scroll = smoothScrollRef.current

  particlesGroupRef.current.scale.setScalar(1 + scroll * 2)
  particlesGroupRef.current.rotation.y = scroll * Math.PI * 0.5
})
```

## Configuration

### Global Settings
**File:** `/src/components/ScrollConfig.tsx`

```tsx
ScrollTrigger.config({
  limitCallbacks: true,
  syncInterval: 0,
})

ScrollTrigger.defaults({
  toggleActions: 'play none none reverse',
  markers: false,
})
```

### Enable Scroll Snapping
**File:** `/src/app/layout.tsx`

```tsx
<ScrollConfig enableSnap={true} snapDuration={0.5} />
```

## Resources

- **Full Documentation:** `/SCROLL_ANIMATIONS.md`
- **Architecture Diagram:** `/SCROLL_INTEGRATION_DIAGRAM.md`
- **Implementation Summary:** `/PD-013-SUMMARY.md`
- **GSAP Docs:** https://greensock.com/docs/
- **ScrollTrigger Docs:** https://greensock.com/scrolltrigger/

## Support

For issues or questions:
1. Check `/SCROLL_ANIMATIONS.md` for detailed examples
2. Enable `markers: true` to debug scroll positions
3. Review existing implementations in `/src/components/sections/`
