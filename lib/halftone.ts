export interface LuminanceMap {
  res: number;
  data: Float32Array;
  sample: (u: number, v: number) => number;
}

export interface DotField {
  count: number;
  positions: Float32Array;
  lum: Float32Array;
  size: Float32Array;
  layer: Float32Array;
  rand: Float32Array;
}

// Fades the photo's background so the dots concentrate on the subject.
function vignette(u: number, v: number) {
  const d = Math.hypot(u - 0.5, (v - 0.5) * 0.92);
  const t = Math.min(Math.max((d - 0.36) / 0.2, 0), 1);
  return 1 - t * t * (3 - 2 * t);
}

export function loadLuminance(src: string, res = 192): Promise<LuminanceMap> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = res;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return reject(new Error('2D canvas unavailable'));
      ctx.drawImage(img, 0, 0, res, res);
      const px = ctx.getImageData(0, 0, res, res).data;
      const data = new Float32Array(res * res);
      for (let i = 0; i < res * res; i++) {
        const l = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
        const u = (i % res) / res;
        const v = Math.floor(i / res) / res;
        data[i] = Math.pow(l, 1.25) * vignette(u, v);
      }
      const sample = (u: number, v: number) => {
        const x = Math.min(res - 1, Math.max(0, Math.round(u * (res - 1))));
        const y = Math.min(res - 1, Math.max(0, Math.round(v * (res - 1))));
        return data[y * res + x];
      };
      resolve({ res, data, sample });
    };
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Plane spans [-1, 1] on both axes; image v runs top→bottom so y is flipped.
export function buildDotField(map: LuminanceMap, grid: number, stipple: number): DotField {
  const rng = mulberry32(42);
  const cell = 2 / grid;
  const pos: number[] = [];
  const lum: number[] = [];
  const size: number[] = [];
  const layer: number[] = [];
  const rand: number[] = [];

  for (let gy = 0; gy < grid; gy++) {
    for (let gx = 0; gx < grid; gx++) {
      // Offset alternate rows for a classic halftone screen.
      const u = (gx + 0.5 + (gy % 2) * 0.5) / grid;
      const v = (gy + 0.5) / grid;
      const l = map.sample(u, v);
      if (l < 0.05) continue;
      pos.push(u * 2 - 1, 1 - v * 2, 0);
      lum.push(l);
      size.push(cell * (0.2 + 0.95 * Math.sqrt(l)));
      layer.push(0);
      rand.push(rng());
    }
  }

  let placed = 0;
  let attempts = 0;
  while (placed < stipple && attempts < stipple * 30) {
    attempts++;
    const u = rng();
    const v = rng();
    const l = map.sample(u, v);
    if (rng() > l * l * 1.6) continue;
    pos.push(u * 2 - 1, 1 - v * 2, 0);
    lum.push(l);
    size.push(cell * (0.28 + rng() * 0.22));
    layer.push(1);
    rand.push(rng());
    placed++;
  }

  return {
    count: lum.length,
    positions: new Float32Array(pos),
    lum: new Float32Array(lum),
    size: new Float32Array(size),
    layer: new Float32Array(layer),
    rand: new Float32Array(rand),
  };
}
