# useFrame & Animation

useFrame is R3F's render loop hook. Misuse causes performance disasters.

## frame-priority

**Use priority parameter for execution order.**

Lower numbers run first. Default is 0.

```jsx
// Physics runs first, then animation, then camera
function Physics() {
  useFrame(() => {
    world.step();
  }, -100); // Runs first
}

function Animation() {
  useFrame(() => {
    updateAnimations();
  }, 0); // Default priority
}

function CameraFollow() {
  useFrame(() => {
    camera.lookAt(target);
  }, 100); // Runs last
}
```

## frame-delta-time

**Always use delta for frame-rate independent animation.**

```jsx
// BAD - Speed varies with frame rate
useFrame(() => {
  ref.current.rotation.y += 0.01;
});

// GOOD - Consistent speed
useFrame((state, delta) => {
  ref.current.rotation.y += 1 * delta; // 1 radian per second
});

// GOOD - Using clock for time-based effects
useFrame(({ clock }) => {
  ref.current.position.y = Math.sin(clock.elapsedTime) * 2;
});
```

## frame-conditional-subscription

**Disable useFrame when not needed.**

```jsx
// GOOD - Active only when needed
function OptionalAnimation({ active }) {
  useFrame(() => {
    // Animation logic
  }, active ? 0 : null); // null disables the subscription
}

// Alternative with early return
function ConditionalAnimation({ paused }) {
  useFrame((state, delta) => {
    if (paused) return;
    // Animation logic
  });
}
```

## frame-destructure-state

**Destructure only what you need from state.**

```jsx
// Use what you need
useFrame(({ clock, camera, pointer }) => {
  // clock.elapsedTime, clock.getDelta()
  // camera - the default camera
  // pointer - normalized mouse position (-1 to 1)
});

// Full state object contents:
// gl, scene, camera, raycaster, pointer, mouse, clock,
// viewport, size, set, get, invalidate, advance, events
```

## frame-render-on-demand

**Use invalidate() for on-demand rendering.**

```jsx
// Enable frameloop="demand" on Canvas
<Canvas frameloop="demand">
  <Scene />
</Canvas>

// Manually request render when needed
function OnDemandAnimation() {
  const { invalidate } = useThree();

  const handleClick = () => {
    invalidate(); // Trigger single render
  };

  useEffect(() => {
    const unsubscribe = someStore.subscribe(() => {
      invalidate();
    });
    return unsubscribe;
  }, [invalidate]);
}
```

## frame-avoid-heavy-computation

**Move heavy computations outside useFrame.**

```jsx
// BAD - Expensive calculation every frame
useFrame(() => {
  const expensiveResult = heavyComputation(); // 60x per second!
  ref.current.position.copy(expensiveResult);
});

// GOOD - Compute less frequently
function SmartComponent() {
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3());

  // Update target occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      setTargetPosition(heavyComputation());
    }, 100); // 10 times per second
    return () => clearInterval(interval);
  }, []);

  // Lerp to target every frame (cheap)
  useFrame(() => {
    ref.current.position.lerp(targetPosition, 0.1);
  });
}
```

## Animation Patterns

### Smooth Lerping

```jsx
useFrame((state, delta) => {
  // Smooth follow with lerp
  ref.current.position.lerp(targetPosition, delta * 5);

  // Smooth rotation with slerp
  ref.current.quaternion.slerp(targetQuaternion, delta * 3);
});
```

### Oscillating Motion

```jsx
useFrame(({ clock }) => {
  // Sine wave oscillation
  ref.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.5;

  // Circular motion
  ref.current.position.x = Math.cos(clock.elapsedTime) * 2;
  ref.current.position.z = Math.sin(clock.elapsedTime) * 2;
});
```

### Spring Animation (with @react-spring/three)

```jsx
import { useSpring, animated } from '@react-spring/three';

function SpringBox() {
  const [active, setActive] = useState(false);

  const { scale } = useSpring({
    scale: active ? 1.5 : 1,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  return (
    <animated.mesh
      scale={scale}
      onClick={() => setActive(!active)}
    >
      <boxGeometry />
      <meshStandardMaterial />
    </animated.mesh>
  );
}
```
