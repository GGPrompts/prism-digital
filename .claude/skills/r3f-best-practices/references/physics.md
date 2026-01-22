# Physics (Rapier)

@react-three/rapier provides physics simulation.

## physics-setup

**Basic physics setup with Rapier.**

```jsx
import { Physics, RigidBody } from '@react-three/rapier';

function Scene() {
  return (
    <Physics gravity={[0, -9.81, 0]} debug>
      {/* Dynamic body */}
      <RigidBody>
        <mesh>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>

      {/* Static ground */}
      <RigidBody type="fixed">
        <mesh position={[0, -2, 0]}>
          <boxGeometry args={[10, 0.5, 10]} />
          <meshStandardMaterial />
        </mesh>
      </RigidBody>
    </Physics>
  );
}
```

## physics-body-types

**Understand RigidBody types.**

```jsx
// Dynamic - Affected by forces and collisions
<RigidBody type="dynamic">
  <mesh />
</RigidBody>

// Fixed - Immovable, infinite mass
<RigidBody type="fixed">
  <mesh />
</RigidBody>

// Kinematic - Moved programmatically, not by physics
<RigidBody type="kinematicPosition">
  <mesh />
</RigidBody>

// Kinematic velocity-based
<RigidBody type="kinematicVelocity">
  <mesh />
</RigidBody>
```

## physics-colliders

**Use appropriate colliders.**

```jsx
// Auto-collider from mesh
<RigidBody colliders="hull">  {/* convex hull */}
<RigidBody colliders="cuboid"> {/* box */}
<RigidBody colliders="ball">   {/* sphere */}
<RigidBody colliders="trimesh"> {/* exact mesh (expensive) */}

// Manual colliders
import { CuboidCollider, BallCollider, CapsuleCollider } from '@react-three/rapier';

<RigidBody colliders={false}>
  <CuboidCollider args={[0.5, 0.5, 0.5]} />
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
</RigidBody>
```

## physics-events

**Handle collision events.**

```jsx
<RigidBody
  onCollisionEnter={({ manifold, target, other }) => {
    console.log('Collision with', other.rigidBodyObject.name);
  }}
  onCollisionExit={({ target, other }) => {
    console.log('Collision ended');
  }}
  onIntersectionEnter={({ target, other }) => {
    // For sensor colliders
    console.log('Entered trigger zone');
  }}
>
  <mesh name="player">
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
</RigidBody>
```

## physics-api-ref

**Use ref for physics API access.**

```jsx
function Player() {
  const rigidBodyRef = useRef();

  const jump = () => {
    rigidBodyRef.current.applyImpulse({ x: 0, y: 10, z: 0 }, true);
  };

  const move = (direction) => {
    rigidBodyRef.current.setLinvel({ x: direction.x * 5, y: 0, z: direction.z * 5 });
  };

  useFrame(() => {
    const position = rigidBodyRef.current.translation();
    const velocity = rigidBodyRef.current.linvel();
  });

  return (
    <RigidBody ref={rigidBodyRef}>
      <mesh>
        <capsuleGeometry args={[0.5, 1]} />
        <meshStandardMaterial />
      </mesh>
    </RigidBody>
  );
}
```

## physics-performance

**Optimize physics performance.**

```jsx
<Physics
  gravity={[0, -9.81, 0]}
  timeStep="vary"
  updatePriority={-50}
  interpolate={true}
>
  {/* Use simple colliders instead of trimesh */}
  <RigidBody colliders="cuboid">
    <mesh />
  </RigidBody>

  {/* Sensor for trigger zones (no physics response) */}
  <RigidBody sensor>
    <CuboidCollider args={[5, 5, 5]} />
  </RigidBody>
</Physics>
```

## Common Physics Patterns

### Character Controller

```jsx
function Character() {
  const rigidBody = useRef();
  const isGrounded = useRef(false);

  useFrame(() => {
    const { forward, backward, left, right, jump } = getInput();

    const velocity = rigidBody.current.linvel();
    const moveSpeed = 5;

    rigidBody.current.setLinvel({
      x: (right - left) * moveSpeed,
      y: velocity.y,
      z: (backward - forward) * moveSpeed,
    });

    if (jump && isGrounded.current) {
      rigidBody.current.applyImpulse({ x: 0, y: 8, z: 0 });
    }
  });

  return (
    <RigidBody
      ref={rigidBody}
      lockRotations
      onCollisionEnter={() => { isGrounded.current = true; }}
      onCollisionExit={() => { isGrounded.current = false; }}
    >
      <mesh>
        <capsuleGeometry args={[0.5, 1]} />
        <meshStandardMaterial />
      </mesh>
    </RigidBody>
  );
}
```

### Throwing Objects

```jsx
function ThrowableBox() {
  const rigidBody = useRef();

  const throwBox = (direction, force) => {
    rigidBody.current.applyImpulse({
      x: direction.x * force,
      y: direction.y * force,
      z: direction.z * force,
    }, true);
  };

  return (
    <RigidBody ref={rigidBody} restitution={0.5} friction={0.5}>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
    </RigidBody>
  );
}
```
