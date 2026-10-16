import * as THREE from 'three';

export function generateRibbonPoints(count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  // Primary loop: large sweeping ribbon
  for (let i = 0; i < count * 0.45; i++) {
    const t = (i / (count * 0.45)) * Math.PI * 2;
    const twist = t * 1.5;
    const radius = 2.2 + Math.sin(t * 2) * 0.4;
    const x = Math.cos(t) * radius + Math.cos(twist) * 0.3;
    const y = Math.sin(t) * 1.3 + Math.sin(t * 3) * 0.18;
    const z = Math.sin(twist) * 0.6 + Math.cos(t * 1.5) * 0.25;
    points.push(new THREE.Vector3(x, y, z));
  }

  // Secondary inner spiral
  for (let i = 0; i < count * 0.25; i++) {
    const t = (i / (count * 0.25)) * Math.PI * 4;
    const radius = 1.0 + Math.sin(t * 0.7) * 0.3;
    const x = Math.cos(t) * radius;
    const y = Math.sin(t) * 0.7 + (t / (Math.PI * 4) - 0.5) * 0.8;
    const z = Math.cos(t * 2) * 0.4;
    points.push(new THREE.Vector3(x, y, z));
  }

  // Scattered field particles
  for (let i = 0; i < count * 0.3; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.5 + Math.random() * 1.8;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = (r * Math.sin(phi) * Math.sin(theta)) * 0.6;
    const z = r * Math.cos(phi) * 0.5;
    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

export function buildParticleGeometry(points: THREE.Vector3[]) {
  const positions = new Float32Array(points.length * 3);
  const sizes = new Float32Array(points.length);
  const colors = new Float32Array(points.length * 3);
  const opacities = new Float32Array(points.length);

  // Palette colors
  const palette = [
    new THREE.Color('#FF6900'), // vibrant orange
    new THREE.Color('#FFA000'), // golden amber
    new THREE.Color('#C90008'), // crimson red
    new THREE.Color('#790B20'), // dark burgundy
    new THREE.Color('#FF8C42'), // light orange
  ];

  points.forEach((p, i) => {
    positions[i * 3] = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;

    // Vary size based on distance from center
    const dist = p.length();
    sizes[i] = 0.04 + Math.random() * 0.06 * (1 / (1 + dist * 0.3));

    // Color from palette with distance-based variation
    const colorIdx = Math.floor(Math.random() * palette.length);
    const col = palette[colorIdx];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    opacities[i] = 0.5 + Math.random() * 0.5;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

  return geometry;
}

export function buildConnectionLines(
  points: THREE.Vector3[],
  maxDistance = 0.55,
  maxConnections = 2500
): { positions: Float32Array; count: number } {
  const linePositions: number[] = [];

  const subset = points.slice(0, Math.min(points.length, 800));

  for (let i = 0; i < subset.length && linePositions.length / 6 < maxConnections; i++) {
    for (let j = i + 1; j < subset.length && linePositions.length / 6 < maxConnections; j++) {
      const dist = subset[i].distanceTo(subset[j]);
      if (dist < maxDistance) {
        linePositions.push(
          subset[i].x, subset[i].y, subset[i].z,
          subset[j].x, subset[j].y, subset[j].z
        );
      }
    }
  }

  return {
    positions: new Float32Array(linePositions),
    count: linePositions.length / 6,
  };
}

export function lerpColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
  return new THREE.Color(
    a.r + (b.r - a.r) * t,
    a.g + (b.g - a.g) * t,
    a.b + (b.b - a.b) * t
  );
}
