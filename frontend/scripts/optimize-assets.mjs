/**
 * Asset optimization — PRD Phase 1 / §8.5.
 * Converts landing PNGs to WebP with width caps + alpha-safe quality.
 * Usage: node scripts/optimize-assets.mjs
 * Originals are kept (gitignored src/assets/landing/originals/).
 */
import sharp from "sharp";
import { mkdir, readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC_DIR = new URL("../src/assets/landing", import.meta.url).pathname
  // Windows path fixup from file URL
  .replace(/^\/([A-Za-z]:)/, "$1");
const KEEP_DIR = path.join(SRC_DIR, "originals");
const MANIFEST = path.join(SRC_DIR, "manifest.json");

const RULES = [
  { match: /^hero\.png$/, width: 1920, quality: 72 },
  { match: /^footer-bg\.png$/, width: 1600, quality: 70 },
  { match: /^login-bg\.png$/, width: 1200, quality: 72 },
];

await mkdir(KEEP_DIR, { recursive: true });

const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith(".png"));
const results = [];

for (const file of files) {
  const srcPath = path.join(SRC_DIR, file);
  const keepPath = path.join(KEEP_DIR, file);
  const outName = file.replace(/\.png$/, ".webp");
  const outPath = path.join(SRC_DIR, outName);

  const rule = RULES.find((r) => r.match.test(file)) ?? { width: 1024, quality: 70 };

  const before = (await stat(srcPath)).size;

  // Preserve the original once (script is safe to re-run)
  try {
    await stat(keepPath);
  } catch {
    await rename(srcPath, keepPath);
  }

  await sharp(path.join(KEEP_DIR, file))
    .resize({ width: rule.width, withoutEnlargement: true })
    .webp({ quality: rule.quality, alphaQuality: 85, effort: 5 })
    .toFile(outPath);

  const after = (await stat(outPath)).size;
  results.push({
    file: outName,
    width: rule.width,
    bytesBefore: before,
    bytesAfter: after,
    savedPct: Math.round((1 - after / before) * 100),
  });
  console.log(`${outName}: ${(before / 1024 / 1024).toFixed(2)}MB -> ${(after / 1024).toFixed(0)}KB (-${results.at(-1).savedPct}%)`);
}

await writeFile(MANIFEST, JSON.stringify({ generated: new Date().toISOString(), results }, null, 2));
console.log(`\nTotal before: ${(results.reduce((s, r) => s + r.bytesBefore, 0) / 1024 / 1024).toFixed(2)}MB`);
console.log(`Total after:  ${(results.reduce((s, r) => s + r.bytesAfter, 0) / 1024).toFixed(0)}KB`);
