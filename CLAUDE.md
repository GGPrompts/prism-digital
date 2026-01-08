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

#### Worker Commands

```bash
# Start working on ready issues
/conductor:bd-work

# Full autonomous mode
/conductor:bd-swarm-auto
```

#### Completion Protocol

**Before marking work complete**, run the conductor pipeline:

```bash
/conductor:verify-build      # Build and check for errors
/conductor:code-review       # Opus review with auto-fix
/conductor:commit-changes    # Stage + commit
/conductor:close-issue <id>  # Close beads issue
bd sync && git push          # Push everything
```

Or use the full pipeline: `/conductor:worker-done <id>`

See `.beads/PRIME.md` for detailed workflow documentation.

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

---

## AI Assistant Notes

### Skills for 3D Development

| Skill | When to Use |
|-------|-------------|
| `r3f-fundamentals` | Canvas setup, useFrame, useThree, R3F patterns |
| `r3f-materials` | Custom shaders, uniforms, drei shaderMaterial |
| `threejs-builder` | Vanilla Three.js scenes, WebGPU renderer |
| `building-3d-graphics` | Advanced: instancing, physics, complex scenes |
| `3d-composition-visualization` | Interactive visualizations, drill-down views |

**Trigger with:** "use the r3f-fundamentals skill for scroll animations"

### Slash Commands

| Command | Purpose |
|---------|---------|
| `/conductor:bd-work` | Pick top beads issue and start working |
| `/conductor:bd-swarm-auto` | Fully autonomous parallel issue processing |
| `/conductor:worker-done <id>` | Full completion pipeline |
| `/conductor:code-review` | Autonomous code review |
| `/conductor:verify-build` | Build and check for errors |

### Autonomous Debugging

```bash
# Check build without asking user
npm run build 2>&1 | head -50

# Check for WebGL errors in browser console
# Use tabz_get_console_logs MCP tool
```

### When Making Changes

1. Check existing patterns in `src/components/canvas/`
2. Follow R3F conventions (declarative, useFrame for animation)
3. Test at multiple scroll positions
4. Update CHANGELOG.md after fixes
5. Run build before committing
