import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import ringUrl from "../../assets/models/ring.glb?url";
import { StudioEnv, PremiumBloom } from "./premium";

/**
 * PortalScene — PRD §7.3 FinalCTA portal.
 * Real ring model (Poly by Google "Halo", CC-BY 3.0 — docs/ASSETS.md)
 * doubled into two counter-precessing instances, plus a procedural
 * pulsing core. The section is short, so the scene stays well under
 * the triangle budget.
 */

/* One tinted, material-deep-cloned instance of the ring per usage —
   cloning materials keeps the two rings' colors independent (a plain
   scene.clone shares material instances with the source). Emissive is
   tinted too: the scene has no lights, so emissive carries the color.
   Phase 7 P4: metallic PBR body (env-lit via StudioEnv) with a strong
   emissive halo so the bloom picks it up. */
function useRingInstance(color, opacity) {
  const { scene } = useGLTF(ringUrl);

  return useMemo(() => {
    const instance = scene.clone(true);
    instance.traverse((child) => {
      if (child.isMesh && child.material) {
        const tint = (material) => {
          const copy = material.clone();
          if (copy.color) copy.color.set(color).lerp(new THREE.Color("#ffffff"), 0.25);
          if (copy.emissive) {
            copy.emissive.set(color);
            copy.emissiveIntensity = 1.6;
          }
          copy.metalness = 0.9;
          copy.roughness = 0.25;
          copy.transparent = true;
          copy.opacity = opacity;
          return copy;
        };
        child.material = Array.isArray(child.material)
          ? child.material.map(tint)
          : tint(child.material);
      }
    });
    return instance;
  }, [scene, color, opacity]);
}

function PortalRing({ position, scale, wobbleX, speed, color, opacity }) {
  const model = useRingInstance(color, opacity);
  const gimbal = useRef(null);

  /* The source torus lies in the XY plane (axis +Z), so it already
     faces the camera — stargate-style. The gimbal adds a slow
     precession wobble; the ring's own spin is invisible (a torus is
     rotationally symmetric in-plane). */
  useFrame(({ clock }) => {
    if (!gimbal.current) return;
    const t = clock.getElapsedTime();
    gimbal.current.rotation.y = Math.sin(t * speed) * 0.45;
    gimbal.current.rotation.x = Math.cos(t * speed * 0.8) * wobbleX;
  });

  /* Source ring is ~197 units across; scale 0.016 → ~3.2 units.
     The faint procedural torus marks the ring's rim. */
  return (
    <group position={position}>
      <group ref={gimbal}>
        <primitive object={model} scale={scale} />
        <mesh>
          <torusGeometry args={[1.6, 0.013, 8, 96]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity * 0.35}
          />
        </mesh>
      </group>
    </group>
  );
}

function Core() {
  const mesh = useRef(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const pulse = 1 + Math.sin(clock.getElapsedTime() * 1.6) * 0.12;
    mesh.current.scale.setScalar(pulse);
  });

  return (
    <Float speed={1.2} floatIntensity={0.8}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#312e81"
          emissive="#6366f1"
          emissiveIntensity={2.2}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

export default function PortalScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      {/* D7 premium layer: env-lit metallic rings + bloom halo */}
      <StudioEnv intensity={0.8} />
      <PremiumBloom intensity={0.75} luminanceThreshold={0.55} />

      <PortalRing
        position={[0, 0, -0.2]}
        scale={0.017}
        wobbleX={0.16}
        speed={0.35}
        color="#6366f1"
        opacity={0.95}
      />
      <PortalRing
        position={[0, 0, 0.4]}
        scale={0.012}
        wobbleX={-0.28}
        speed={-0.5}
        color="#22d3ee"
        opacity={0.8}
      />
      <Core />
    </Canvas>
  );
}

useGLTF.preload(ringUrl);
