# Post-processing

@react-three/postprocessing provides efficient post-processing effects.

## postpro-effect-composer

**Use EffectComposer from @react-three/postprocessing.**

```jsx
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

function Scene() {
  return (
    <>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial emissive="orange" emissiveIntensity={2} />
      </mesh>

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
}
```

## postpro-common-effects

**Common post-processing effects.**

```jsx
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  DepthOfField,
  Noise,
  Vignette,
  SMAA,
  ToneMapping,
  HueSaturation,
  BrightnessContrast,
  SSAO,
  Outline,
  SelectiveBloom
} from '@react-three/postprocessing';

// Bloom for glow
<Bloom intensity={1} luminanceThreshold={0.5} luminanceSmoothing={0.9} />

// Depth of Field
<DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} />

// Anti-aliasing (use SMAA instead of MSAA)
<SMAA />

// Screen-space ambient occlusion
<SSAO samples={31} radius={0.1} intensity={20} />

// Outline selected objects
<Outline selection={selectedRef} edgeStrength={3} />
```

## postpro-selective-bloom

**Use SelectiveBloom for optimized glow.**

```jsx
import { SelectiveBloom } from '@react-three/postprocessing';

function Scene() {
  const glowRef = useRef();

  return (
    <>
      {/* This mesh will glow */}
      <mesh ref={glowRef}>
        <sphereGeometry />
        <meshStandardMaterial emissive="orange" />
      </mesh>

      {/* This mesh won't glow */}
      <mesh position={[2, 0, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="blue" />
      </mesh>

      <EffectComposer>
        <SelectiveBloom
          selection={glowRef}
          intensity={2}
          luminanceThreshold={0.1}
        />
      </EffectComposer>
    </>
  );
}
```

## postpro-custom-shader

**Create custom effects with shaders.**

```jsx
import { Effect } from 'postprocessing';
import { forwardRef, useMemo } from 'react';
import { Uniform } from 'three';

const fragmentShader = `
  uniform float intensity;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    outputColor = vec4(inputColor.rgb * intensity, inputColor.a);
  }
`;

class CustomEffectImpl extends Effect {
  constructor({ intensity = 1.0 }) {
    super('CustomEffect', fragmentShader, {
      uniforms: new Map([['intensity', new Uniform(intensity)]])
    });
  }
}

const CustomEffect = forwardRef(({ intensity }, ref) => {
  const effect = useMemo(() => new CustomEffectImpl({ intensity }), [intensity]);
  return <primitive ref={ref} object={effect} />;
});

// Usage
<EffectComposer>
  <CustomEffect intensity={0.5} />
</EffectComposer>
```

## postpro-performance

**Optimize post-processing performance.**

```jsx
<EffectComposer
  multisampling={0} // Disable MSAA (use SMAA instead)
  frameBufferType={THREE.HalfFloatType} // Better performance
>
  <SMAA /> {/* Cheaper than MSAA */}
  <Bloom mipmapBlur /> {/* mipmapBlur is more efficient */}
</EffectComposer>
```

## Theme-Aware Effects

**Adjust effects based on theme (dark/light mode).**

```jsx
import { useTheme } from 'next-themes';

function ThemeAwareEffects() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <EffectComposer>
      <Bloom
        intensity={isDark ? 0.6 : 0.35}
        luminanceThreshold={isDark ? 0.2 : 0.4}
      />
      <Vignette
        darkness={isDark ? 0.7 : 0.3}
        offset={0.1}
      />
    </EffectComposer>
  );
}
```

## Effect Combinations

**Common effect combinations.**

```jsx
// Cinematic look
<EffectComposer>
  <SMAA />
  <Bloom intensity={0.5} luminanceThreshold={0.8} />
  <Vignette darkness={0.5} />
  <ChromaticAberration offset={[0.002, 0.002]} />
</EffectComposer>

// Stylized/game look
<EffectComposer>
  <SMAA />
  <Bloom intensity={1.5} luminanceThreshold={0.2} />
  <HueSaturation saturation={0.2} />
</EffectComposer>

// Realistic
<EffectComposer>
  <SMAA />
  <SSAO samples={31} radius={0.1} intensity={15} />
  <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} />
  <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
</EffectComposer>
```
