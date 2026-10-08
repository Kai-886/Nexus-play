import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import * as THREE from "three";

/**
 * premium.jsx — PRD §7.3 "premium rendering layer" (Phase 7, Decision D7).
 *
 * Shared procedural look-upgrade for every WebGL scene: a studio
 * environment map built from drei Lightformers (zero network payload),
 * a PBR material factory that re-skins GLB models with physically-based
 * gold/obsidian/marble finishes, contact shadows for grounding, and a
 * selective bloom composer. Lives only inside lazy 3D chunks — never
 * imported by the initial bundle.
 */

/* ---------------------------------------------------------------
   StudioEnv — procedural environment: dark inner room with brand-
   colored light strips (indigo key, violet fill, cyan rim) + a
   warm top strip so gold reads as gold. Replaces flat ambient
   lighting; gives PBR materials real reflections.
   --------------------------------------------------------------- */
export function StudioEnv({ intensity = 1 }) {
  return (
    <Environment resolution={256} frames={1} background={false}>
      {/* Inner room shell — very dark blue so reflections have depth */}
      <mesh scale={100}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#05060f" side={THREE.BackSide} />
      </mesh>

      {/* Key light — indigo strip, upper left */}
      <Lightformer
        form="rect"
        intensity={5 * intensity}
        color="#6366f1"
        position={[-5, 4, 3]}
        rotation={[0, Math.PI / 4, 0]}
        scale={[10, 3, 1]}
      />

      {/* Fill light — violet, right */}
      <Lightformer
        form="rect"
        intensity={2.4 * intensity}
        color="#a78bfa"
        position={[5, 1, 2]}
        rotation={[0, -Math.PI / 4, 0]}
        scale={[8, 2.4, 1]}
      />

      {/* Rim light — cyan, behind */}
      <Lightformer
        form="rect"
        intensity={3.2 * intensity}
        color="#22d3ee"
        position={[0, 2, -6]}
        scale={[12, 2, 1]}
      />

      {/* Warm top strip — makes gold materials sparkle */}
      <Lightformer
        form="rect"
        intensity={4 * intensity}
        color="#fff7e0"
        position={[0, 8, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[8, 8, 1]}
      />

      {/* Cool floor bounce */}
      <Lightformer
        form="rect"
        intensity={1.6 * intensity}
        color="#312e81"
        position={[0, -6, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[10, 10, 1]}
      />
    </Environment>
  );
}


/* ---------------------------------------------------------------
   PremiumLighting — standard light rig to pair with StudioEnv
   (env map provides reflections; these provide shading/shadows).
   --------------------------------------------------------------- */
export function PremiumLighting({ shadows = false }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.6}
        color="#e0e7ff"
        castShadow={shadows}
      />
      <pointLight position={[-4, 2, -3]} intensity={8} color="#6366f1" />
      <pointLight position={[3, -1, 3]} intensity={4} color="#22d3ee" />
    </>
  );
}



/* ---------------------------------------------------------------
   Bloom — selective-ish glow via luminance threshold. Frames the
   scene's emissive/emblem highlights without washing out text
   overlays (the scenes sit behind DOM content).
   --------------------------------------------------------------- */
export function PremiumBloom({ intensity = 0.55, luminanceThreshold = 0.62 }) {
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        intensity={intensity}
        luminanceThreshold={luminanceThreshold}
        luminanceSmoothing={0.32}
        mipmapBlur
        kernelSize={KernelSize.LARGE}
        blendFunction={BlendFunction.SCREEN}
      />
    </EffectComposer>
  );
}
