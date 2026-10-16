'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControllerProps {
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  targetSection: string;
}

export function CameraController({ mouse, targetSection }: CameraControllerProps) {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0, 7));
  const targetPos = useRef(new THREE.Vector3(0, 0, 7));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    // Mouse parallax on idle
    const mx = mouse.current.x * 0.8;
    const my = mouse.current.y * 0.5;

    // Camera position based on section
    switch (targetSection) {
      case 'about':
        targetPos.current.set(-2.5 + mx * 0.3, 0.5 + my * 0.2, 5.5);
        targetLook.current.set(-2.2, 0.4, 0);
        break;
      case 'work':
        targetPos.current.set(0 + mx * 0.3, -1.2 + my * 0.2, 6);
        targetLook.current.set(0, -1, 0);
        break;
      case 'contact':
        targetPos.current.set(2.5 + mx * 0.3, 0.5 + my * 0.2, 5.5);
        targetLook.current.set(2.2, 0.4, 0);
        break;
      default:
        targetPos.current.set(mx * 0.6, my * 0.4, 7);
        targetLook.current.set(0, 0, 0);
    }

    currentPos.current.lerp(targetPos.current, 0.04);
    currentLook.current.lerp(targetLook.current, 0.04);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLook.current);
  });

  return null;
}
