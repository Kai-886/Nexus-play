import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import trophyUrl from "../../assets/models/trophy.glb?url";
import {
  StudioEnv,
  PremiumLighting,
  PremiumBloom,
} from "./premium";
import { applyFinish } from "./premiumFinish";

/**
 * HeroScene — PRD §7.2/§7.3 landing hero scene. Instanced particle
 * field, floating wireframe icosahedra, fog-faded grid floor, plus the
 * real trophy centerpiece model (Kenney, CC0 — docs/ASSETS.md).
 * Pointer parallax + subtle scroll drift.
 *
 * Performance (§7.1): dpr capped, frameloop pauses when the tab or the
 * canvas is hidden, particle counts scale down on small screens.
 */

/* Pointer parallax driver — camera arrives as a useFrame argument
   (idiomatic R3F; no hook-state mutation) */
function Rig({ pointer, scroll }) {
  useFrame(({ camera }) => {
    const px = pointer.current.x;
    const py = pointer.current.y;
    camera.position.x += (px * 0.6 - camera.position.x) * 0.045;
    camera.position.y += (0.4 + py * 0.35 - camera.position.y) * 0.045;
    camera.lookAt(0, 0.2, 0);

    // Scroll drift: scene sinks slightly as the hero pins away
    const drift = Math.min(scroll.current * 0.0009, 1.4);
    camera.position.z = 7 + drift;
  });

  return null;
}

/* Deterministic PRNG (mulberry32) — stable field layout across
   renders; keeps the purity linter happy too. */
function seededRandom(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Instanced star/particle field */
function ParticleField({ count }) {
  const mesh = useRef(null);

  const { positions, seeds } = useMemo(() => {
    const rand = seededRandom(1337);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (rand() - 0.5) * 22;
      positions[i * 3 + 1] = rand() * 10 - 3;
      positions[i * 3 + 2] = (rand() - 0.5) * 14 - 2;
      seeds[i] = rand() * Math.PI * 2;
    }
    return { positions, seeds };
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    const array = mesh.current.instanceMatrix.array;
    for (let i = 0; i < count; i += 1) {
      const s = seeds[i];
      dummy.position.set(
        positions[i * 3],
        positions[i * 3 + 1] + Math.sin(t * 0.6 + s) * 0.35,
        positions[i * 3 + 2]
      );
      dummy.rotation.set(s + t * 0.12, s, 0);
      dummy.scale.setScalar(0.5 + ((Math.sin(s * 3.7) + 1) / 2) * 0.5);
      dummy.updateMatrix();
      array.set(dummy.matrix.elements, i * 16);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[0.045, 0]} />
      <meshBasicMaterial color="#8ab4ff" transparent opacity={0.55} />
    </instancedMesh>
  );
}

/* Floating wireframe icosahedra — the "arena shards" */
function Shard({ position, scale, speed, color }) {
  const mesh = useRef(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    mesh.current.rotation.x = t * speed * 0.5;
    mesh.current.rotation.y = t * speed;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={mesh} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
      </mesh>
    </Float>
  );
}

/* Centerpiece trophy — real model (Kenney Mini Arena, CC0 —
   see docs/ASSETS.md), re-skinned with PBR gold + obsidian by part
   name (Phase 7 P4, D7 premium-procedural). Floats and slowly turns
   above the arena; StudioEnv gives the metal real reflections. */
function TrophyModel({ lowPower }) {
  const { scene } = useGLTF(trophyUrl);
  const group = useRef(null);

  const dressed = useMemo(() => {
    const clone = scene.clone(true);
    applyFinish(clone, "gold", (child) => {
      const n = (
        (Array.isArray(child.material) ? child.material[0]?.name : child.material?.name) || ""
      ).toLowerCase();
      // Base/plinth parts go obsidian; everything else is gold
      return /base|plinth|stand|bottom/.test(n) ? "obsidian" : "gold";
    });
    return clone;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.35;
    group.current.position.y = 1.55 + Math.sin(t * 0.9) * 0.14;
  });

  /* Centerpiece — horizontally centered (owner request); raised so it
     clears the left-aligned headline block. */
  return (
    <group ref={group} position={[0, 1.55, 0]} scale={lowPower ? 1.4 : 1.95}>
      <primitive object={dressed} />
    </group>
  );
}

useGLTF.preload(trophyUrl);

/* Fog-faded grid floor — gridHelper is already a horizontal
   XZ-plane object; it must NOT be wrapped in a mesh (it is not
   a geometry, and mis-attaching it breaks frustum culling). */
function GridFloor() {
  return (
    <gridHelper
      args={[30, 46, "#3b3f7a", "#181b38"]}
      position={[0, -3.2, -2]}
    />
  );
}

function Scene({ pointer, scroll, lowPower }) {
  return (
    <>
      <fog attach="fog" args={["#05060f", 8, 22]} />

      {/* D7 premium layer: procedural studio env (reflections on the
          gold trophy) + shading rig. Env is frames={1} — no per-frame
          cost; skipped on lowPower to save the texture alloc. */}
      {!lowPower && <StudioEnv intensity={0.9} />}
      <PremiumLighting />
      {!lowPower && <PremiumBloom intensity={0.5} luminanceThreshold={0.7} />}

      <Rig pointer={pointer} scroll={scroll} />

      <ParticleField count={lowPower ? 140 : 320} />

      <TrophyModel lowPower={lowPower} />

      <Shard position={[-4.6, 1.4, -2]} scale={1.5} speed={0.24} color="#6366f1" />
      <Shard position={[4.9, 2.2, -3.5]} scale={2.1} speed={0.17} color="#a78bfa" />
      <Shard position={[2.6, -1.6, -1.2]} scale={0.9} speed={0.32} color="#22d3ee" />

      <GridFloor />
    </>
  );
}

export default function HeroScene() {
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);
  const [visible, setVisible] = useState(true);
  const holder = useRef(null);

  const lowPower =
    typeof window !== "undefined" &&
    (window.innerWidth < 768 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // Track page scroll for the camera drift (hero pin range only)
  useEffect(() => {
    const onScroll = () => {
      scroll.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Pause the render loop when the hero scrolls out of view — the
     bloom composer + particle field otherwise keep burning GPU while
     the bento/cards animate in (the perceived handoff lag). */
  useEffect(() => {
    const el = holder.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "80px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={holder}
      className="absolute inset-0"
      onPointerMove={(e) => {
        pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      }}
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        frameloop={visible ? "always" : "never"}
      >
        <Scene pointer={pointer} scroll={scroll} lowPower={lowPower} />
      </Canvas>
    </div>
  );
}
