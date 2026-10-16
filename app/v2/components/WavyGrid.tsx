'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface WavyGridProps {
  className?: string;
}

const GRID = 40;
const BOX_W = 0.8;
const BOX_H = 3;
const BOX_D = 0.8;
const GAP = 0.01;
const PITCH = BOX_W + GAP;

const WAVE_SPEED = 6;
const WAVE_FREQ = 1.2;
const WAVE_WIDTH = 3;
const FADE_TIME = 2;
const AMPLITUDE = 0.4;
const MAX_H = 0.4;
const TRAIL_SPACING = 0.1;
const MAX_TRAIL = 128;
const IDLE_TIMEOUT = 3000;
const IDLE_INTERVAL = 1500;

const CAM_RADIUS = 12;
const CAM_FOV = 40;
const ALPHA_RANGE = Math.PI * 0.03;
const BETA_RANGE = Math.PI * 0.05;
const MOUSE_EASE = 0.04;

const BASE_COLOR = new THREE.Color('#3a3a3a');
const HIGH_COLOR = new THREE.Color('#ff6900');

function hash2(x: number, y: number): [number, number] {
  const a = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  const b = Math.sin(x * 269.5 + y * 183.3) * 43758.5453;
  return [a - Math.floor(a), b - Math.floor(b)];
}

export default function WavyGrid({ className }: WavyGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseNorm = useRef({ x: 0, y: 0 });
  const mouseSmooth = useRef({ x: 0, y: 0 });
  const reducedMotion = useRef(false);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseNorm.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNorm.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { reducedMotion.current = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x0a0a0f);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    const camera = new THREE.PerspectiveCamera(
      CAM_FOV,
      container.clientWidth / container.clientHeight,
      0.1,
      200
    );
    camera.up.set(0, 0, -1);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4);
    keyLight.position.set(-20, 10, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.radius = 6;
    keyLight.shadow.camera.left = -22;
    keyLight.shadow.camera.right = 22;
    keyLight.shadow.camera.top = 22;
    keyLight.shadow.camera.bottom = -22;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 60;
    keyLight.shadow.bias = 0.0001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1);
    fillLight.position.set(10, 5, -3);
    scene.add(fillLight);

    const geometry = new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D);
    const material = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      metalness: 0.15,
      roughness: 0.55,
    });

    const count = GRID * GRID;
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const bounds = GRID * PITCH;
    const halfBounds = (GRID - 1) * PITCH / 2;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const cubeOffsets: [number, number][] = [];

    let idx = 0;
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        const x = col * PITCH - halfBounds;
        const z = row * PITCH - halfBounds;
        cubeOffsets.push([x, z]);
        dummy.position.set(x, 0, z);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
        color.copy(BASE_COLOR);
        mesh.setColorAt(idx, color);
        idx++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    const groundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(bounds * 1.5, bounds * 1.5),
      new THREE.ShadowMaterial({ opacity: 0.15 })
    );
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -BOX_H / 2 - 0.01;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);

    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    const hitPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(bounds, bounds),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitPlane.rotation.x = -Math.PI / 2;
    scene.add(hitPlane);

    interface TrailPoint {
      x: number;
      z: number;
      age: number;
      distDelta: number;
    }
    const trail: TrailPoint[] = [];

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = bounds * (0.1 + Math.random() * 0.2);
      trail.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        age: Math.random() * 0.5,
        distDelta: 0.6 + Math.random() * 0.4,
      });
    }

    let lastTrailX = Infinity;
    let lastTrailZ = Infinity;
    let lastMoveTime = 0;
    let lastIdleTime = 0;

    const jitterMap: [number, number][] = cubeOffsets.map((_, i) => {
      const row = Math.floor(i / GRID);
      const col = i % GRID;
      return hash2(col, row);
    });

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      mouseSmooth.current.x += (mouseNorm.current.x - mouseSmooth.current.x) * MOUSE_EASE;
      mouseSmooth.current.y += (mouseNorm.current.y - mouseSmooth.current.y) * MOUSE_EASE;

      const alpha = mouseSmooth.current.y * ALPHA_RANGE;
      const beta = mouseSmooth.current.x * BETA_RANGE;
      camera.position.set(
        -CAM_RADIUS * Math.cos(alpha) * Math.sin(beta),
        CAM_RADIUS * Math.cos(alpha) * Math.cos(beta),
        CAM_RADIUS * Math.sin(alpha)
      );
      camera.lookAt(0, 0, 0);

      mouseVec.set(mouseNorm.current.x, mouseNorm.current.y);
      raycaster.setFromCamera(mouseVec, camera);
      const hits = raycaster.intersectObject(hitPlane);
      if (hits.length > 0) {
        const pt = hits[0].point;
        const dx = pt.x - lastTrailX;
        const dz = pt.z - lastTrailZ;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist >= TRAIL_SPACING) {
          trail.push({ x: pt.x, z: pt.z, age: 0, distDelta: dist });
          lastTrailX = pt.x;
          lastTrailZ = pt.z;
          lastMoveTime = elapsed;
        }
      }

      if (!reducedMotion.current && elapsed - lastMoveTime > IDLE_TIMEOUT / 1000 && elapsed - lastIdleTime > IDLE_INTERVAL / 1000) {
        const rx = (Math.random() * 0.5 - 0.25) * bounds;
        const rz = (Math.random() * 0.5 - 0.25) * bounds;
        trail.push({ x: rx, z: rz, age: 0, distDelta: 0.8 + Math.random() * 0.2 });
        lastIdleTime = elapsed;
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += delta;
        if (trail[i].age > FADE_TIME * 4) {
          trail.splice(i, 1);
        }
      }

      if (trail.length > MAX_TRAIL) {
        trail.splice(0, trail.length - MAX_TRAIL);
      }

      for (let i = 0; i < count; i++) {
        const [cx, cz] = cubeOffsets[i];
        const [jx, jz] = jitterMap[i];
        const sampleX = cx + jx * 0.2;
        const sampleZ = cz + jz * 0.2;

        let height = 0;
        let totalWeight = 0;

        for (let t = 0; t < trail.length; t++) {
          const tp = trail[t];
          const tdx = sampleX - tp.x;
          const tdz = sampleZ - tp.z;
          const tdist = Math.sqrt(tdx * tdx + tdz * tdz);

          const relDist = tdist - WAVE_SPEED * tp.age;
          const window_ = Math.exp(-(relDist * relDist) / (WAVE_WIDTH * WAVE_WIDTH));
          const fade = Math.exp(-tp.age / FADE_TIME);
          const atten = 1 / (1 + tdist * 0.1);
          const weight = fade * window_ * atten * tp.distDelta;

          height += weight * Math.cos(WAVE_FREQ * relDist);
          totalWeight += weight;
        }

        const h = totalWeight > 0 ? height / Math.max(totalWeight, 1) : 0;
        const displacement = Math.max(-MAX_H, Math.min(MAX_H, h * AMPLITUDE));

        dummy.position.set(cx, displacement, cz);
        dummy.scale.set(1, 1, 1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        const t = Math.max(0, Math.min(1, displacement / MAX_H));
        color.copy(BASE_COLOR).lerp(HIGH_COLOR, t);
        mesh.setColorAt(i, color);
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    container.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const onVisChange = () => {
      if (document.hidden) clock.stop();
      else clock.start();
    };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisChange);
      geometry.dispose();
      material.dispose();
      groundPlane.geometry.dispose();
      (groundPlane.material as THREE.Material).dispose();
      hitPlane.geometry.dispose();
      (hitPlane.material as THREE.Material).dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onPointerMove]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />;
}
