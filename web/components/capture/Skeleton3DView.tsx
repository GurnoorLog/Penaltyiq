"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface Skeleton3DViewProps {
  landmarksRef: React.MutableRefObject<number[][]>;
  visible: boolean;
  frozenLandmarks?: number[][] | null;
}

const POSE_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28],
  [27, 29], [28, 30], [29, 31], [30, 32], [27, 31], [28, 32],
];

const LANDMARK_COLOR = "#00FFFF";
const CONNECTION_COLOR = "#FFD700";

function normalizeLandmarks(landmarks: number[][]): number[][] {
  if (landmarks.length < 33) return landmarks;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of landmarks) {
    if (p[0] < minX) minX = p[0];
    if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
    if (p[2] !== undefined) {
      if (p[2] < minZ) minZ = p[2];
      if (p[2] > maxZ) maxZ = p[2];
    }
  }
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const rangeZ = (maxZ - minZ) || 1;
  return landmarks.map(p => [
    (p[0] - minX) / rangeX * 2 - 1,
    (p[1] - minY) / rangeY * 2 - 1,
    p[2] !== undefined ? (p[2] - minZ) / rangeZ * 2 - 1 : 0,
  ]);
}

const SPHERE_GEOMETRY = new THREE.SphereGeometry(0.03, 12, 12);
const SPHERE_MATERIAL = new THREE.MeshStandardMaterial({
  color: LANDMARK_COLOR,
  emissive: LANDMARK_COLOR,
  emissiveIntensity: 0.3,
});

function SkeletonContent({ landmarksRef, frozenLandmarks }: { landmarksRef: React.MutableRefObject<number[][]>; frozenLandmarks?: number[][] | null }) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRefs = useRef<THREE.Mesh[]>([]);
  const lineRef = useRef<THREE.LineSegments>(null);

  useFrame(() => {
    const lm = frozenLandmarks ?? landmarksRef.current;
    if (!lm || lm.length < 33) return;
    const normalized = normalizeLandmarks(lm);

    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (i < normalized.length) {
          child.position.set(normalized[i][0], normalized[i][1], normalized[i][2] ?? 0);
        }
      });
    }

    if (lineRef.current) {
      const attr = lineRef.current.geometry.attributes.position;
      if (attr) {
        const array = attr.array as Float32Array;
        for (let k = 0; k < POSE_CONNECTIONS.length; k++) {
          const [i, j] = POSE_CONNECTIONS[k];
          const idx = k * 6;
          if (i < normalized.length && j < normalized.length) {
            array[idx] = normalized[i][0];
            array[idx + 1] = normalized[i][1];
            array[idx + 2] = normalized[i][2] ?? 0;
            array[idx + 3] = normalized[j][0];
            array[idx + 4] = normalized[j][1];
            array[idx + 5] = normalized[j][2] ?? 0;
          }
        }
        attr.needsUpdate = true;
      }
    }
  });

  const spheres = Array.from({ length: 33 }, (_, i) => (
    <mesh
      key={i}
      ref={(el) => { if (el) sphereRefs.current[i] = el; }}
      geometry={SPHERE_GEOMETRY}
      material={SPHERE_MATERIAL}
    />
  ));

  const lineGeom = new THREE.BufferGeometry();
  lineGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(POSE_CONNECTIONS.length * 6), 3));

  return (
    <group ref={groupRef}>
      {spheres}
      <lineSegments ref={lineRef} geometry={lineGeom}>
        <lineBasicMaterial color={CONNECTION_COLOR} />
      </lineSegments>
    </group>
  );
}

export function Skeleton3DView({ landmarksRef, visible, frozenLandmarks }: Skeleton3DViewProps) {
  if (!visible) return null;

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-white/10">
      <div className="absolute z-10 m-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium text-cyan-200">
        3D pose visualization · stylized depth
      </div>
      <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <SkeletonContent landmarksRef={landmarksRef} frozenLandmarks={frozenLandmarks} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}
