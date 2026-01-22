# R3F Best Practices

React Three Fiber (R3F) and Poimandres ecosystem best practices for building performant 3D web applications.

## When to Use

Apply these patterns when working with:
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Helper components and hooks
- `@react-three/postprocessing` - Post-processing effects
- `@react-three/rapier` - Physics simulation
- `zustand` - State management
- Custom shaders and materials

## Critical Rules (MUST FOLLOW)

### 1. NEVER setState in useFrame

This is the #1 performance killer. Calling setState triggers 60+ re-renders per second.

```jsx
// BAD - 60 re-renders per second
function Bad() {
  const [pos, setPos] = useState(0);
  useFrame(() => setPos(p => p + 0.01)); // NEVER
  return <mesh position-x={pos} />;
}

// GOOD - Direct ref mutation
function Good() {
  const ref = useRef();
  useFrame(() => {
    ref.current.position.x += 0.01;
  });
  return <mesh ref={ref} />;
}
```

### 2. Use Zustand Selectors

Subscribe only to specific state slices, not entire stores.

```jsx
// BAD - Re-renders on ANY store change
const store = useGameStore();

// GOOD - Re-renders only when playerX changes
const playerX = useGameStore(state => state.playerX);

// BETTER - In useFrame, use getState() for zero re-renders
useFrame(() => {
  const { value } = useStore.getState();
  ref.current.position.x = value;
});
```

### 3. Avoid Inline Objects in JSX

New object/array references trigger unnecessary re-renders.

```jsx
// BAD - New array every render
<mesh position={[1, 2, 3]} />

// GOOD - Stable reference
const POSITION = [1, 2, 3];
<mesh position={POSITION} />

// GOOD - Individual props
<mesh position-x={1} position-y={2} position-z={3} />
```

### 4. Use Delta Time for Animation

Frame-rate independent animation prevents speed variations.

```jsx
// BAD - Speed varies with frame rate
useFrame(() => {
  ref.current.rotation.y += 0.01;
});

// GOOD - Consistent 1 radian/second
useFrame((state, delta) => {
  ref.current.rotation.y += 1 * delta;
});
```

## References

For detailed rules and examples, see:
- [references/performance.md](references/performance.md) - Performance & re-render rules
- [references/animation.md](references/animation.md) - useFrame & animation patterns
- [references/drei.md](references/drei.md) - Drei helper usage
- [references/physics.md](references/physics.md) - Rapier physics patterns
- [references/postprocessing.md](references/postprocessing.md) - Effect composer setup
