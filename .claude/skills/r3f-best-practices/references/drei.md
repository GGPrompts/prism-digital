# Drei Helpers

@react-three/drei provides essential abstractions. Use them correctly.

## drei-use-gltf

**Use useGLTF for model loading with preloading.**

```jsx
import { useGLTF } from '@react-three/drei';

function Model() {
  const { scene, nodes, materials } = useGLTF('/model.glb');
  return <primitive object={scene} />;
}

// Preload for instant loading
useGLTF.preload('/model.glb');

// With Draco compression
function DracoModel() {
  const { scene } = useGLTF('/model.glb', '/draco/');
  return <primitive object={scene} />;
}
```

## drei-use-texture

**Use useTexture for texture loading.**

```jsx
import { useTexture } from '@react-three/drei';

function TexturedMesh() {
  // Single texture
  const texture = useTexture('/texture.png');

  // Multiple textures
  const [colorMap, normalMap, roughnessMap] = useTexture([
    '/color.png',
    '/normal.png',
    '/roughness.png'
  ]);

  // Object form
  const textures = useTexture({
    map: '/color.png',
    normalMap: '/normal.png',
    roughnessMap: '/roughness.png'
  });

  return (
    <mesh>
      <boxGeometry />
      <meshStandardMaterial {...textures} />
    </mesh>
  );
}

// Preload
useTexture.preload('/texture.png');
```

## drei-environment

**Use Environment for realistic lighting.**

```jsx
import { Environment } from '@react-three/drei';

// Preset environments
<Environment preset="city" />
// Options: apartment, city, dawn, forest, lobby, night, park, studio, sunset, warehouse

// Custom HDR
<Environment files="/env.hdr" />

// Background visible
<Environment background preset="sunset" />

// Ground projection
<Environment ground={{ height: 15, radius: 60 }} preset="city" />
```

## drei-orbit-controls

**Use OrbitControls from Drei.**

```jsx
import { OrbitControls } from '@react-three/drei';

function Scene() {
  return (
    <>
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
    </>
  );
}
```

## drei-html

**Use Html for DOM overlays in 3D space.**

```jsx
import { Html } from '@react-three/drei';

function Label({ position, text }) {
  return (
    <Html
      position={position}
      center
      distanceFactor={10}
      occlude
      transform
    >
      <div className="label">{text}</div>
    </Html>
  );
}
```

## drei-text

**Use Text for 3D text.**

```jsx
import { Text, Text3D } from '@react-three/drei';

// 2D text in 3D space (SDF, very performant)
<Text
  color="black"
  fontSize={1}
  maxWidth={10}
  font="/fonts/Inter-Bold.woff"
  anchorX="center"
  anchorY="middle"
>
  Hello World
</Text>

// 3D extruded text
<Text3D
  font="/fonts/helvetiker_regular.typeface.json"
  size={1}
  height={0.2}
  bevelEnabled
>
  Hello
  <meshStandardMaterial color="orange" />
</Text3D>
```

## drei-instances

**Use Instances for optimized instancing.**

```jsx
import { Instances, Instance } from '@react-three/drei';

function Particles({ count = 1000 }) {
  return (
    <Instances limit={count} range={count}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial />

      {Array.from({ length: count }, (_, i) => (
        <Instance
          key={i}
          position={[Math.random() * 10, Math.random() * 10, Math.random() * 10]}
          color={`hsl(${Math.random() * 360}, 100%, 50%)`}
        />
      ))}
    </Instances>
  );
}
```

## drei-use-helper

**Use useHelper for debug visualization.**

```jsx
import { useHelper } from '@react-three/drei';
import { DirectionalLightHelper, BoxHelper } from 'three';

function DebugLight() {
  const lightRef = useRef();
  useHelper(lightRef, DirectionalLightHelper, 1, 'red');
  return <directionalLight ref={lightRef} />;
}
```

## drei-bounds

**Use Bounds to fit camera to objects.**

```jsx
import { Bounds, useBounds } from '@react-three/drei';

function FitToView() {
  return (
    <Bounds fit clip observe margin={1.2}>
      <Model />
    </Bounds>
  );
}
```

## drei-center

**Use Center to center objects.**

```jsx
import { Center } from '@react-three/drei';

<Center top>
  <Model />
</Center>
```

## drei-float

**Use Float for floating animation.**

```jsx
import { Float } from '@react-three/drei';

<Float
  speed={1}
  rotationIntensity={1}
  floatIntensity={1}
  floatingRange={[-0.1, 0.1]}
>
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
</Float>
```

## drei-use-cursor

**Use useCursor for hover cursor.**

```jsx
import { useCursor } from '@react-three/drei';

function HoverMesh() {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <mesh
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
}
```
