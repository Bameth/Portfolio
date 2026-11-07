import type { BufferGeometry } from "three";
import { clamp } from "@/lib/env";

/**
 * Prépare la répartition des glyphes sur le visage : normales lissées, lecture de la photo
 * (tons et zones de détail) et tirage de points réguliers plutôt que purement aléatoires.
 */

/** Normales lissées, y compris aux coutures UV où les sommets sont dupliqués. À appeler sur une géométrie indexée. */
export function smoothNormals(geo: BufferGeometry) {
  geo.computeVertexNormals();
  const pos = geo.attributes.position, nor = geo.attributes.normal;
  const sums = new Map<string, [number, number, number]>();
  const keyOf = (i: number) => `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
  for (let i = 0; i < pos.count; i++) {
    const key = keyOf(i), s = sums.get(key) ?? [0, 0, 0];
    s[0] += nor.getX(i);
    s[1] += nor.getY(i);
    s[2] += nor.getZ(i);
    sums.set(key, s);
  }
  for (let i = 0; i < pos.count; i++) {
    const [x, y, z] = sums.get(keyOf(i))!, len = Math.hypot(x, y, z) || 1;
    nor.setXYZ(i, x / len, y / len, z / len);
  }
  nor.needsUpdate = true;
}

/** Surface totale d'une géométrie non indexée. */
export function surfaceArea(geo: BufferGeometry) {
  const a = geo.attributes.position.array;
  let area = 0;
  for (let i = 0; i + 8 < a.length; i += 9) {
    const ux = a[i + 3] - a[i], uy = a[i + 4] - a[i + 1], uz = a[i + 5] - a[i + 2];
    const vx = a[i + 6] - a[i], vy = a[i + 7] - a[i + 1], vz = a[i + 8] - a[i + 2];
    area += Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
  }
  return area;
}

const MAP_SIZE = 512;

/** Moyenne glissante séparable, en temps constant quel que soit le rayon. */
function boxBlur(src: Float32Array, size: number, radius: number) {
  const pass = (from: Float32Array, step: number, lineStep: number) => {
    const to = new Float32Array(from.length);
    for (let line = 0; line < size; line++) {
      let sum = 0;
      const at = (i: number) => from[line * lineStep + clamp(i, 0, size - 1) * step];
      for (let i = -radius; i <= radius; i++) sum += at(i);
      for (let i = 0; i < size; i++) {
        to[line * lineStep + i * step] = sum / (radius * 2 + 1);
        sum += at(i + radius + 1) - at(i - radius);
      }
    }
    return to;
  };
  return pass(pass(src, 1, size), size, 1);
}

/** Percentile approché par histogramme, sans trier le tableau. */
function percentile(values: Float32Array, q: number) {
  const BINS = 1024;
  let max = 0;
  for (const v of values) if (v > max) max = v;
  if (!max) return 0;
  const bins = new Uint32Array(BINS);
  for (const v of values) bins[Math.min(BINS - 1, Math.floor((v / max) * BINS))]++;
  let seen = 0;
  for (let i = 0; i < BINS; i++) {
    seen += bins[i];
    if (seen >= values.length * q) return ((i + 1) / BINS) * max;
  }
  return max;
}

export interface PhotoMaps {
  /** Ton de la photo avec contraste local renforcé (0 à 1). */
  tone: (u: number, v: number) => number;
  /** Quantité de détail autour du point : yeux, sourcils, bouche (0 à 1). */
  detail: (u: number, v: number) => number;
}

/** Analyse la texture du modèle. Renvoie `null` si l'image n'est pas lisible. */
export function readPhotoMaps(image: CanvasImageSource, flipY: boolean): PhotoMaps | null {
  const M = MAP_SIZE, canvas = document.createElement("canvas");
  canvas.width = canvas.height = M;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  let data: Uint8ClampedArray;
  try {
    ctx.drawImage(image, 0, 0, M, M);
    data = ctx.getImageData(0, 0, M, M).data;
  } catch {
    return null;
  }
  const lum = new Float32Array(M * M);
  for (let i = 0; i < lum.length; i++) lum[i] = (data[i * 4] * 0.3 + data[i * 4 + 1] * 0.59 + data[i * 4 + 2] * 0.11) / 255;

  // Contraste asymétrique : on creuse fort les zones sombres (moustache, barbe, sourcils)
  // mais on éclaircit à peine, pour ne pas faire gonfler les lèvres, très claires sur la texture.
  const near = boxBlur(lum, M, 14), wide = boxBlur(lum, M, 24), fine = boxBlur(lum, M, 2);
  const tone = lum.map((l, i) => clamp(l + 1.8 * Math.min(0, l - near[i]) + 0.6 * Math.max(0, l - wide[i]), 0, 1));
  const grad = new Float32Array(M * M);
  for (let y = 1; y < M - 1; y++) {
    for (let x = 1; x < M - 1; x++) {
      const i = y * M + x;
      grad[i] = Math.abs(fine[i + 1] - fine[i - 1]) + Math.abs(fine[i + M] - fine[i - M]);
    }
  }
  const spread = boxBlur(grad, M, 4);
  const high = percentile(spread, 0.97) || 1;

  const read = (map: Float32Array, u: number, v: number) => {
    const x = clamp(Math.floor(u * M), 0, M - 1), y = clamp(Math.floor((flipY ? 1 - v : v) * M), 0, M - 1);
    return map[y * M + x];
  };
  return {
    tone: (u, v) => read(tone, u, v),
    detail: (u, v) => clamp(read(spread, u, v) / high, 0, 1),
  };
}

/**
 * Choisit `count` points parmi les candidats en imposant une distance minimale entre eux (Poisson disc),
 * réduite là où `detail` est élevé pour y concentrer les glyphes. Renvoie les indices retenus.
 */
export function pickEvenly(positions: Float32Array, detail: Float32Array, count: number, area: number) {
  const total = positions.length / 3, base = Math.sqrt((0.7 * area) / count);
  const grid = new Map<number, number[]>(), picked: number[] = [], rejected: number[] = [];
  const OFFSET = 512, SPAN = 1024;
  const cellOf = (v: number) => Math.floor(v / base) + OFFSET;
  const keyOf = (x: number, y: number, z: number) => (x * SPAN + y) * SPAN + z;
  for (let i = 0; i < total && picked.length < count; i++) {
    const x = positions[i * 3], y = positions[i * 3 + 1], z = positions[i * 3 + 2];
    const cx = cellOf(x), cy = cellOf(y), cz = cellOf(z), min = base * (1 - 0.45 * detail[i]), min2 = min * min;
    let free = true;
    for (let dx = -1; dx <= 1 && free; dx++) for (let dy = -1; dy <= 1 && free; dy++) for (let dz = -1; dz <= 1 && free; dz++) {
      for (const j of grid.get(keyOf(cx + dx, cy + dy, cz + dz)) ?? []) {
        const ax = positions[j * 3] - x, ay = positions[j * 3 + 1] - y, az = positions[j * 3 + 2] - z;
        if (ax * ax + ay * ay + az * az < min2) { free = false; break; }
      }
    }
    if (!free) { rejected.push(i); continue; }
    picked.push(i);
    const key = keyOf(cx, cy, cz), bucket = grid.get(key);
    if (bucket) bucket.push(i);
    else grid.set(key, [i]);
  }
  // Pas assez de place : on complète avec des candidats écartés.
  for (let k = 0; picked.length < count && k < rejected.length; k++) picked.push(rejected[k]);
  return picked;
}

/** Redistribue des valeurs selon leur rang pour exploiter toute la plage de tons. */
export function equalize(values: Float32Array) {
  const order = Array.from(values.keys()).sort((a, b) => values[a] - values[b]);
  const out = new Float32Array(values.length);
  order.forEach((idx, rank) => { out[idx] = rank / Math.max(1, values.length - 1); });
  return out;
}

