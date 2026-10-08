import * as THREE from "three";

/* ---------------------------------------------------------------
   PBR material factory — re-skins GLB models with physically-
   based finishes. Returns plain THREE materials; apply by
   traversing the cloned scene.
   --------------------------------------------------------------- */

const FINISHES = {
  /* Polished championship gold (hero trophy) */
  gold: () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#d4af37"),
      metalness: 1,
      roughness: 0.16,
      envMapIntensity: 1.6,
    }),

  /* Deep brushed gold — slightly rougher variant */
  goldSatin: () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#b8912f"),
      metalness: 1,
      roughness: 0.34,
      envMapIntensity: 1.25,
    }),

  /* Dark obsidian plinth/base with faint sheen */
  obsidian: () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#12142b"),
      metalness: 0.6,
      roughness: 0.32,
      envMapIntensity: 1.1,
    }),

  /* Polished near-white marble (diorama pieces) */
  marble: () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#c9cdf2"),
      metalness: 0.1,
      roughness: 0.22,
      envMapIntensity: 1.15,
    }),
};

/**
 * Apply a finish to every mesh material of a cloned scene.
 * `picker` (optional) receives each material and returns the finish
 * name to use — lets one model mix gold + obsidian by part name.
 */
export function applyFinish(root, finish, picker) {
  root.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const pick = picker
      ? picker(child)
      : Array.isArray(child.material)
        ? child.material[0]?.name || ""
        : child.material.name || "";
    const factory = FINISHES[typeof finish === "string" && !picker ? finish : pick] || FINISHES[finish];
    if (!factory) return;
    child.material = factory();
  });
  return root;
}

export const finishes = FINISHES;
