# NexusPlay — 3D Asset Registry (PRD §7.3)

Every shipped model file is logged here **before** integration. Rule: only
CC0 / CC-BY (or owner-provided) sources; `.glb` only; optimized via
`gltf-transform`; per-model ≤ 500 KB, total ≤ 2 MB.

Location: `frontend/src/assets/models/`

---

## Optimized files (shipped)

| File | Used by | Triangles | Raw size | Optimized | License |
|---|---|---|---|---|---|
| `trophy.glb` | `three/HeroScene.jsx` (landing hero centerpiece) | 244 tris | 32.9 KB | **8.3 KB** | CC0 |
| `ring.glb` | `three/PortalScene.jsx` (FinalCTA portal) | 200 tris | 6.3 KB | **3.0 KB** | CC-BY 3.0 |

**Total optimized payload: 11.3 KB** (budget ≤ 2 MB — 0.6% used; every model
≤ 500 KB ✔). Compression: Meshopt; textures WebP where present. All models
Y-up, real-world scale, base at y = 0.

> Phase 7 P4-rev: the Kenney Mini Arena diorama pieces (`statue/column/
> banner/wall-gate.glb`) were **removed** with `DioramaScene.jsx` (owner:
> low-poly look didn't match) — the auth side panel now uses the
> owner-supplied live-wallpaper video below. `trophy.glb` + `ring.glb`
> stay in use.

---

## Live-wallpaper video (auth screens, Phase 7 P4-rev)

| File | Source | Transcode | License |
|---|---|---|---|
| `frontend/public/wallpapers/auth-loop.mp4` (+ poster jpg) | **Owner-supplied** "Omen Valorant" live wallpaper (`Downloads/omen-valorant-live-wallpaper.mp4`) | ffmpeg: 3840×2160 30s 77 MB → 1280×720 H.264, audio stripped, `+faststart`, CRF 28 → **5.4 MB**; poster frame 420 KB | Owner-provided — personal collection; confirm redistribution rights before any public deployment |

Used by `components/landing/LiveWallpaper.jsx` (full-page auth backdrop):
`<video autoplay muted loop playsinline preload=metadata>` + cursor
parallax/spotlight (reduced-motion safe). Served from `/public`, streams
lazily — never enters the JS bundle.

---

## Source records

### Kenney — Mini Arena (pack)
- **Files**: `trophy.glb`, `statue.glb`, `column.glb`, `banner.glb`,
  `wall-gate.glb`
- **Author**: Kenney (www.kenney.nl), additional credit Tony Schär
- **Source**: https://kenney.nl/assets/mini-arena
  (pack zip: `kenney.nl/media/pages/assets/mini-arena/.../kenney_mini-arena.zip`,
  downloaded 2026-09-26)
- **License**: Creative Commons Zero (CC0 1.0)
  http://creativecommons.org/publicdomain/zero/1.0/
  (pack `License.txt` states: usable for personal, educational, commercial;
  crediting Kenney appreciated but not required)
- **Notes**: Pack version 1.1 (2024). Original pack contains 21 GLB models;
  only the five listed above are shipped.

### Poly by Google — "Halo"
- **File**: `ring.glb`
- **Author**: Poly by Google (via poly.pizza archive)
- **Source**: https://poly.pizza/m/5jiuuz7sOV_
  (GLB: `static.poly.pizza/7ad8b58a-48f6-444c-930d-05342b8f17fb.glb`,
  downloaded 2026-09-26)
- **License**: Creative Commons Attribution 3.0 (CC-BY 3.0)
- **Attribution (required)**: rendered as a visible credit line in the
  landing page footer ("3D ring model: Poly by Google, CC-BY 3.0 via
  poly.pizza") in addition to this file.

---

## Optimization pipeline

Run from the directory containing the source GLB (Kenney GLBs reference
`Textures/colormap.png` relatively):

```bash
npx gltf-transform optimize in.glb out.glb --compress meshopt --texture-compress webp
```

- Decoder: `meshoptimizer` (bundled with three; drei's GLTF loader wires the
  MeshoptDecoder automatically).
- Textures ≤ 512px in all shipped models (Kenney colormap 512×512 PNG → WebP).
- Raw pack files are **not** committed; re-download from the sources above.

## Budget check (PRD §7.3)

| Budget | Limit | Actual |
|---|---|---|
| Per model | ≤ 500 KB | max 13.0 KB ✔ |
| Total 3D payload | ≤ 2 MB | 47.5 KB ✔ |
| Triangles per scene | ≤ 100k | hero ≈ 1.5k, portal ≈ 0.5k, diorama ≈ 2.5k ✔ |
| Hero 3D lazy-loaded | after LCP | `Lazy3D` gate (unchanged from Phase 1) ✔ |
