# Prism Digital - 3D Landing Page

> Building the Future of Web3D

## Project Overview

Interactive 3D landing page for Prism Digital, a 3D visualization studio company. Built with React Three Fiber, Next.js, and GSAP scroll animations.

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **3D Rendering:** React Three Fiber (@react-three/fiber)
- **3D Helpers:** @react-three/drei, @react-three/postprocessing
- **Animation:** GSAP + ScrollTrigger
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Language:** TypeScript

## Design Direction

- **Primary Color:** purple
- **Scene Style:** particles
- **Scroll Sections:** 3
- **Theme:** Dark-first (optimized for 3D visibility)

## Key Features

3D Visualization, Interactive Experiences, WebGL Development

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx       # Root layout with Canvas
│   ├── page.tsx         # Home page content
│   └── globals.css      # Global styles
├── components/
│   ├── canvas/          # R3F 3D components
│   │   ├── Scene.tsx    # Main 3D scene
│   │   ├── Hero3D.tsx   # Hero scene elements
│   │   └── Effects.tsx  # Post-processing
│   ├── ui/              # shadcn/ui components
│   └── sections/        # Page sections
│       ├── Header.tsx
│       ├── Hero.tsx
│       ├── Features.tsx
│       └── Footer.tsx
├── hooks/
│   └── useScroll.ts     # Scroll state for 3D
└── lib/
    └── utils.ts
```

## Orchestration Instructions

### For Parallel Workers

This project uses beads for issue tracking. Run `bd ready` to see available tasks.

#### Wave Execution Order

| Wave | Focus | Parallel? |
|------|-------|-----------|
| 0 | Asset generation | Yes (with Wave 1) |
| 1 | Foundation setup | Yes (3 parallel) |
| 2 | 3D + UI components | Yes (8 parallel) |
| 3 | Polish + optimization | Yes (6 parallel) |
| 4 | QA checkpoint | Sequential |

#### Worker Commands

```bash
# Start working on ready issues
/conductor:bd-work

# Full autonomous mode
/conductor:bd-swarm-auto
```

### 3D Development Guidelines

#### React Three Fiber Patterns

```tsx
// Good: Declarative R3F
function Scene() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="purple" />
    </mesh>
  )
}

// Good: Using drei helpers
import { OrbitControls, Environment } from '@react-three/drei'

function Scene() {
  return (
    <>
      <Environment preset="night" />
      <OrbitControls enableZoom={false} />
    </>
  )
}
```

#### Scroll Integration Pattern

```tsx
// Connect scroll to 3D state
import { useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

function ScrollScene() {
  const scroll = useScroll()
  const meshRef = useRef()

  useFrame(() => {
    // scroll.offset is 0-1
    meshRef.current.rotation.y = scroll.offset * Math.PI * 2
  })

  return <mesh ref={meshRef}>...</mesh>
}
```

#### Performance Rules

1. **Avoid object creation in useFrame** - Pre-allocate vectors/quaternions
2. **Use instancing** for repeated geometries
3. **Dispose resources** on unmount
4. **Lazy load** heavy 3D assets
5. **Use `<PerformanceMonitor>`** from drei

### Content Variables

Use these values throughout the build:

- Business: **Prism Digital**
- Tagline: **Building the Future of Web3D**
- Industry: **3D visualization studio**
- CTA: **See Our Work**
- Features: 3D Visualization, Interactive Experiences, WebGL Development

## MCP Servers Available

- **shadcn** - Install UI components
- **beads** - Issue tracking
- **tabz** - Browser automation for screenshots

## Review Checklist

Before marking issues complete:

- [ ] 60fps on desktop
- [ ] Smooth scroll animations
- [ ] Mobile responsive
- [ ] No WebGL errors in console
- [ ] Accessible (keyboard nav, screen reader)
- [ ] Dark mode works
