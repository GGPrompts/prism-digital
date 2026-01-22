# Performance & Re-renders

React re-renders are the #1 performance killer in R3F. The render loop runs at 60fps - React reconciliation must not interfere.

## perf-never-set-state-in-useframe

**NEVER call setState inside useFrame.**

```jsx
// BAD - Causes 60 re-renders per second
function BadComponent() {
  const [position, setPosition] = useState(0);
  useFrame(() => {
    setPosition(p => p + 0.01); // NEVER DO THIS
  });
  return <mesh position-x={position} />;
}

// GOOD - Mutate refs directly
function GoodComponent() {
  const meshRef = useRef();
  useFrame(() => {
    meshRef.current.position.x += 0.01;
  });
  return <mesh ref={meshRef} />;
}
```

## perf-isolate-state

**Isolate components that need React state.**

```jsx
// BAD - Entire scene re-renders when score changes
function Game() {
  const [score, setScore] = useState(0);
  return (
    <>
      <HUD score={score} />
      <Player />
      <Enemies count={100} /> {/* Re-renders when score changes! */}
    </>
  );
}

// GOOD - Only HUD re-renders
function Game() {
  return (
    <>
      <HUD /> {/* Manages its own state or uses store */}
      <Player />
      <Enemies count={100} />
    </>
  );
}

function HUD() {
  const score = useGameStore(state => state.score);
  return <Html><div>{score}</div></Html>;
}
```

## perf-zustand-selectors

**Use Zustand selectors to minimize re-renders.**

```jsx
// BAD - Re-renders on ANY store change
function BadComponent() {
  const store = useGameStore(); // Subscribes to entire store
  return <mesh position-x={store.playerX} />;
}

// GOOD - Re-renders only when playerX changes
function GoodComponent() {
  const playerX = useGameStore(state => state.playerX);
  return <mesh position-x={playerX} />;
}

// BETTER - Use shallow equality for objects
import { shallow } from 'zustand/shallow';

function BetterComponent() {
  const { x, y, z } = useGameStore(
    state => ({ x: state.x, y: state.y, z: state.z }),
    shallow
  );
  return <mesh position={[x, y, z]} />;
}
```

## perf-transient-subscriptions

**Use transient subscriptions for continuous values.**

```jsx
// GOOD - No re-renders, direct mutation
function Player() {
  const meshRef = useRef();

  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(
      state => state.playerPosition,
      position => {
        meshRef.current.position.copy(position);
      }
    );
    return unsubscribe;
  }, []);

  return <mesh ref={meshRef} />;
}

// ALTERNATIVE - Use getState() in useFrame
function Player() {
  const meshRef = useRef();
  useFrame(() => {
    const { playerPosition } = useGameStore.getState();
    meshRef.current.position.copy(playerPosition);
  });
  return <mesh ref={meshRef} />;
}
```

## perf-memo-components

**Memoize expensive components.**

```jsx
const ExpensiveModel = memo(function ExpensiveModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene.clone()} />;
});

// With custom comparison
const OptimizedMesh = memo(
  function OptimizedMesh({ position, color }) {
    return (
      <mesh position={position}>
        <boxGeometry />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  },
  (prev, next) => {
    return prev.color === next.color &&
           prev.position[0] === next.position[0] &&
           prev.position[1] === next.position[1] &&
           prev.position[2] === next.position[2];
  }
);
```

## perf-keys-for-lists

**Use stable keys for dynamic lists.**

```jsx
// BAD - Index as key causes unnecessary remounts
function Particles({ particles }) {
  return particles.map((p, i) => (
    <Particle key={i} position={p.position} />
  ));
}

// GOOD - Stable unique ID
function Particles({ particles }) {
  return particles.map(p => (
    <Particle key={p.id} position={p.position} />
  ));
}
```

## perf-avoid-inline-objects

**Avoid creating new objects/arrays in JSX.**

```jsx
// BAD - New array created every render
function BadMesh() {
  return <mesh position={[1, 2, 3]} />; // New array each render
}

// GOOD - Stable reference
const POSITION = [1, 2, 3];
function GoodMesh() {
  return <mesh position={POSITION} />;
}

// GOOD - Using individual props
function GoodMesh() {
  return <mesh position-x={1} position-y={2} position-z={3} />;
}

// GOOD - useMemo for computed values
function ComputedMesh({ x }) {
  const position = useMemo(() => [x, x * 2, x * 3], [x]);
  return <mesh position={position} />;
}
```

## perf-dispose-auto

**R3F auto-disposes by default - understand when to disable.**

```jsx
// Auto-dispose is ON by default (good!)
function MyMesh() {
  return (
    <mesh>
      <boxGeometry /> {/* Auto-disposed on unmount */}
      <meshStandardMaterial /> {/* Auto-disposed on unmount */}
    </mesh>
  );
}

// Disable for shared/reused resources
const sharedGeometry = new THREE.BoxGeometry();

function ReusedMesh() {
  return (
    <mesh geometry={sharedGeometry}>
      <meshStandardMaterial dispose={null} />
    </mesh>
  );
}

// Disable on primitive for external objects
function ImportedModel({ object }) {
  return <primitive object={object} dispose={null} />;
}
```
