# GSAP ScrollTrigger Integration Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Window                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     User Scrolls ↓                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────▼────────┐                    ┌───────▼────────┐
│ ScrollTrigger  │                    │ Native Scroll  │
│   (GSAP)       │                    │    Events      │
└───────┬────────┘                    └───────┬────────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           │
                ┌──────────▼──────────┐
                │  useGSAPScroll()    │
                │  Custom Hook        │
                │  ─────────────      │
                │  - scrollProgress   │
                │  - scrollY          │
                │  - direction        │
                │  - velocity         │
                │  - section          │
                └──────────┬──────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────▼────────┐                    ┌───────▼────────┐
│   DOM Layer    │                    │   3D Layer     │
│   (React)      │                    │   (R3F)        │
└───────┬────────┘                    └───────┬────────┘
        │                                     │
        │ ScrollTrigger.create()              │ useFrame()
        │                                     │
        ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  UI Animations  │                  │ 3D Transforms   │
│  ─────────────  │                  │ ──────────────  │
│  • Fade in/out  │                  │ • Camera move   │
│  • Slide up/dn  │                  │ • Rotate parts  │
│  • Parallax     │                  │ • Scale system  │
│  • Stagger      │                  │ • Lerp smooth   │
└─────────────────┘                  └─────────────────┘
```

## Component Hierarchy

```
layout.tsx
├── ScrollConfig ──────────────┐ (Initializes GSAP globally)
├── Canvas3D                   │
│   └── Scene.tsx              │
│       ├── useGSAPScroll() ◄──┤ (Consumes scroll state)
│       ├── Hero3D.tsx         │
│       │   └── Particles ◄────┤ (Transforms based on scroll)
│       └── Effects            │
│                              │
└── Page Content               │
    ├── Header.tsx             │
    ├── Hero.tsx ◄─────────────┤ (Fades out on scroll)
    ├── Features.tsx           │
    ├── FeaturesAnimated.tsx ◄─┤ (Enhanced with parallax)
    ├── Process.tsx ◄──────────┤ (Existing animations)
    ├── Testimonials.tsx ◄─────┤ (Existing animations)
    └── Footer.tsx             │
                               │
                  (All consume scroll via GSAP ScrollTrigger)
```

## Data Flow (Scroll → 3D)

```
User Scrolls
     ↓
ScrollTrigger detects scroll position
     ↓
useGSAPScroll() hook updates
     ↓
scrollProgress: 0.0 → 1.0
     ↓
Passed to Scene.tsx as prop
     ↓
Scene passes to Hero3D component
     ↓
useFrame() reads scrollProgress
     ↓
Smooth interpolation (lerp)
     ↓
Apply transforms:
  - camera.position.z = scroll * 5
  - particles.rotation.y = scroll * π * 0.5
  - particles.scale = 1 + scroll * 2
     ↓
Render frame (60fps)
```

## Animation Timeline

```
Scroll Position:  0%        25%       50%       75%      100%
                  │         │         │         │         │
Hero Headline:    ████████░░░░░░░░░░░░                    (fade out)
Hero Subtext:     ██████████░░░░░░░░░░                    (fade slower)
Hero CTA:         ████████████░░░░                        (fade slowest)
Scroll Indicator: ██░░░░░░░░                              (fade fast)
                  │         │         │         │         │
Camera Z:         0 ────────────────────────────────────> 5 (move back)
Particles Scale:  1.0 ──────────────────────────────────> 3.0 (expand)
Particles Rot:    0° ─────────────────────────────────> 90° (rotate)
                  │         │         │         │         │
Features Cards:             ████████                      (fade in)
Process Steps:                        ████████            (fade in)
Testimonials:                                   ████████  (fade in)
```

## Scroll Trigger Configuration

```
Section Boundaries:

┌────────────────────────────────────────┐ ← 0% (top of page)
│                                        │
│           HERO SECTION                 │ ← start: "top top"
│      (scrollProgress: 0.0-0.2)         │ ← end: "bottom top"
│                                        │
├────────────────────────────────────────┤ ← 100vh
│                                        │
│        FEATURES SECTION                │ ← start: "top 80%"
│      (scrollProgress: 0.2-0.4)         │ ← trigger: "top 75%"
│                                        │
├────────────────────────────────────────┤ ← 200vh
│                                        │
│         PROCESS SECTION                │ ← start: "top center"
│      (scrollProgress: 0.4-0.7)         │ ← end: "bottom center"
│                                        │
├────────────────────────────────────────┤ ← 350vh
│                                        │
│      TESTIMONIALS SECTION              │ ← start: "top 80%"
│      (scrollProgress: 0.7-1.0)         │
│                                        │
└────────────────────────────────────────┘ ← 100% (bottom of page)
```

## Performance Strategy

```
Desktop (High-End)          Mobile (Low-End)
─────────────────          ────────────────
Particles: 3000       →     Particles: 1500
Rotation: 0.5x        →     Rotation: 0.3x
Mouse Track: ON       →     Mouse Track: OFF
Effects: ON           →     Effects: OFF
Lerp Speed: 0.1       →     Lerp Speed: 0.05
```

## Code Execution Order

```
1. Page Load
   └─> ScrollConfig.tsx mounts
       └─> gsap.registerPlugin(ScrollTrigger)
       └─> ScrollTrigger.config({ ... })
       └─> ScrollTrigger.defaults({ ... })

2. Component Mount
   └─> Hero.tsx mounts
       └─> useEffect runs
           └─> gsap.context() creates scope
               └─> gsap.to/from create animations
                   └─> ScrollTrigger.create() watches scroll

   └─> Scene.tsx mounts
       └─> useGSAPScroll() initializes
           └─> ScrollTrigger.create() for state
           └─> window.addEventListener('scroll')

3. User Scrolls
   └─> ScrollTrigger.onUpdate fires
       └─> useGSAPScroll state updates
           └─> Scene receives new scrollProgress
               └─> Hero3D useFrame executes
                   └─> Lerp interpolation
                       └─> Transform applied
                           └─> Frame rendered

   └─> ScrollTrigger animations execute
       └─> GSAP tweens DOM styles
           └─> React sees style changes
               └─> Browser repaints

4. Component Unmount
   └─> useEffect cleanup runs
       └─> ctx.revert() kills animations
       └─> ScrollTrigger instances destroyed
       └─> Event listeners removed
```

## Integration Points Matrix

```
Component          │ Uses GSAP │ Scroll State │ Animates │ 3D Integration
───────────────────┼───────────┼──────────────┼──────────┼───────────────
ScrollConfig       │    ✓      │      -       │    -     │      -
useGSAPScroll      │    ✓      │      ✓       │    -     │      ✓
Hero               │    ✓      │      -       │    ✓     │      -
FeaturesAnimated   │    ✓      │      -       │    ✓     │      -
Process            │    ✓      │      -       │    ✓     │      -
Testimonials       │    -      │      -       │    ✓     │      -
Scene              │    -      │      ✓       │    -     │      ✓
Hero3D             │    -      │      ✓       │    -     │      ✓
Particles          │    -      │      ✓       │    -     │      ✓
```

## Dependency Graph

```
gsap (3.14.2)
    │
    ├─> @gsap/react (2.1.2)
    │   └─> useGSAP hook
    │
    └─> ScrollTrigger plugin
        └─> useGSAPScroll hook
            │
            ├─> Scene.tsx ──> Hero3D.tsx ──> Particles.tsx
            │
            └─> (Available to all components)

@react-three/fiber (9.5.0)
    └─> useFrame hook
        └─> Consumes scrollProgress from useGSAPScroll
```

## State Management Flow

```
Browser Scroll Position (native)
        │
        ├──> ScrollTrigger.onUpdate
        │         │
        │         └──> useGSAPScroll state
        │                  │
        │                  ├──> scrollProgress (0-1)
        │                  ├──> direction (up/down)
        │                  └──> section (string)
        │
        └──> ScrollTrigger.create (per component)
                  │
                  └──> GSAP tweens
                            │
                            └──> DOM style updates
```

## Memory & Cleanup Strategy

```
Component Mount
    │
    ├─> Create gsap.context(scope)
    │       │
    │       └─> Animations auto-registered to scope
    │
    ├─> Create ScrollTrigger instances
    │       │
    │       └─> Attached to context
    │
    └─> Add event listeners
            │
            └─> Tracked for cleanup

Component Unmount
    │
    ├─> ctx.revert()
    │       │
    │       └─> Kills all animations in scope
    │       └─> Removes ScrollTriggers
    │
    └─> removeEventListener()
            │
            └─> No memory leaks
```

This architecture ensures smooth, performant scroll animations with proper cleanup and SSR compatibility.
