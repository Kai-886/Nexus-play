/**
 * WebGL capability detection — PRD §7.1.
 * Cached module-level; every 3D scene gates on this.
 */
let cached = null;

export function supportsWebGL() {
  if (cached !== null) return cached;

  try {
    const canvas = document.createElement("canvas");
    cached = Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl")
    );
  } catch {
    cached = false;
  }

  return cached;
}

export default supportsWebGL;
