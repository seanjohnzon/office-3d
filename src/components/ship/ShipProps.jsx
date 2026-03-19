import React from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

export function CrowsNest({ position }) {
  return (
    <group position={position}>
      {/* Nest barrel */}
      <mesh castShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.7, 10]} />
        <meshStandardMaterial color="#5C3010" roughness={0.8} />
      </mesh>
      {/* Floor inside */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.06, 10]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.85} />
      </mesh>
      {/* Rail posts */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = 0.58, a = (deg * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.sin(a)*r, 0.35, Math.cos(a)*r]}>
            <boxGeometry args={[0.05, 0.5, 0.05]} />
            <meshStandardMaterial color="#4A2800" roughness={0.9} />
          </mesh>
        )
      })}
      {/* Telescope prop */}
      <mesh position={[0.3, 0.3, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6, 8]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  )
}

export default function Mast({ position }) {
  return (
    <group position={position}>
      {/* Main mast pole — taller now */}
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[0.22, 10, 0.22]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>
      {/* Lower crossbar */}
      <mesh position={[0, 4.0, 0]} castShadow>
        <boxGeometry args={[5, 0.18, 0.18]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>
      {/* Upper crossbar */}
      <mesh position={[0, 7.5, 0]} castShadow>
        <boxGeometry args={[3.5, 0.15, 0.15]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>
      {/* Main sail */}
      <mesh position={[0, 2.6, 0.1]} castShadow>
        <boxGeometry args={[4.7, 3.5, 0.04]} />
        <meshStandardMaterial color="#F5F0E0" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Upper sail */}
      <mesh position={[0, 6.5, 0.1]} castShadow>
        <boxGeometry args={[3.3, 2.5, 0.04]} />
        <meshStandardMaterial color="#F5F0E0" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Crow's nest at top */}
      <CrowsNest position={[0, 10.3, 0]} />
    </group>
  )
}

export function NavigationWheel({ position }) {
  const spokes = [0, 45, 90, 135]
  return (
    <group position={position}>
      {/* Wheel rim */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.7, 0.08, 8, 20]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Spokes */}
      {spokes.map((deg, i) => (
        <mesh key={i} rotation={[0, 0, (deg * Math.PI) / 180]}>
          <boxGeometry args={[1.4, 0.06, 0.06]} />
          <meshStandardMaterial color="#6B4423" roughness={0.7} />
        </mesh>
      ))}
      {/* Hub */}
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 8]} />
        <meshStandardMaterial color="#5C3010" roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  )
}

export function Cannon({ position, rotateY = 0 }) {
  return (
    <group position={position} rotation={[0, rotateY, 0]}>
      {/* Cannon base */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.35, 0.28, 0.7]} />
        <meshStandardMaterial color="#444" roughness={0.8} metalness={0.4} />
      </mesh>
      {/* Barrel pointing sideways */}
      <mesh position={[0.55, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 0.8, 10]} />
        <meshStandardMaterial color="#555" roughness={0.6} metalness={0.6} />
      </mesh>
    </group>
  )
}

export function LionFigurehead() {
  return (
    <group position={[0, 2.0, 20]}>
      {/* Mane */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[3.6, 2.8, 0.8]} />
        <meshStandardMaterial color="#C07010" roughness={0.7} />
      </mesh>
      {/* Main head */}
      <mesh position={[0, 0, 0.7]}>
        <boxGeometry args={[2.4, 2.0, 1.6]} />
        <meshStandardMaterial color="#D4A020" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.56, 0.3, 1.52]}>
        <boxGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.56, 0.3, 1.52]}>
        <boxGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, -0.2, 1.56]}>
        <boxGeometry args={[0.4, 0.24, 0.24]} />
        <meshStandardMaterial color="#8B5E00" roughness={0.8} />
      </mesh>
      {/* Label */}
      <Text position={[0, -1.76, 0.8]} fontSize={0.44} color="#D4A020" anchorX="center" fontWeight="bold">
        THOUSAND SUNNY
      </Text>
    </group>
  )
}

export function LuffyAtFigurehead() {
  return (
    <group position={[0, 3.8, 20.2]} rotation={[0, Math.PI, 0]}>
      {/* Sitting pose: torso upright, legs hanging forward */}
      {/* Torso */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[0.32, 0.44, 0.18]} />
        <meshStandardMaterial color="#CC2200" roughness={0.7} /> {/* red vest */}
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.96, 0]} castShadow>
        <boxGeometry args={[0.26, 0.26, 0.24]} />
        <meshStandardMaterial color="#F4C28C" roughness={0.6} />
      </mesh>
      {/* Black hair — messy tufts */}
      <mesh position={[0, 1.07, -0.02]} castShadow>
        <boxGeometry args={[0.26, 0.10, 0.22]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[-0.13, 1.03, 0.04]} castShadow>
        <boxGeometry args={[0.07, 0.09, 0.12]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      <mesh position={[0.13, 1.03, 0.04]} castShadow>
        <boxGeometry args={[0.07, 0.09, 0.12]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      {/* Straw hat brim */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <boxGeometry args={[0.62, 0.05, 0.58]} />
        <meshStandardMaterial color="#D4A020" roughness={0.7} />
      </mesh>
      {/* Straw hat crown */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <boxGeometry args={[0.32, 0.18, 0.30]} />
        <meshStandardMaterial color="#D4B830" roughness={0.75} />
      </mesh>
      {/* Red hat band */}
      <mesh position={[0, 1.14, 0]}>
        <boxGeometry args={[0.34, 0.04, 0.32]} />
        <meshStandardMaterial color="#CC0000" roughness={0.6} />
      </mesh>
      {/* Scar under left eye */}
      <mesh position={[-0.07, 0.93, 0.13]}>
        <boxGeometry args={[0.06, 0.03, 0.01]} />
        <meshStandardMaterial color="#8B2222" />
      </mesh>
      {/* Big grin */}
      <mesh position={[0, 0.89, 0.13]}>
        <boxGeometry args={[0.14, 0.035, 0.01]} />
        <meshStandardMaterial color="#1A0A00" />
      </mesh>
      {/* Arms — spread out wide, carefree */}
      <mesh position={[0.24, 0.62, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.11, 0.36, 0.12]} />
        <meshStandardMaterial color="#F4C28C" />
      </mesh>
      <mesh position={[-0.24, 0.62, 0]} rotation={[0, 0, -0.5]} castShadow>
        <boxGeometry args={[0.11, 0.36, 0.12]} />
        <meshStandardMaterial color="#F4C28C" />
      </mesh>
      {/* Sitting legs — thighs forward, lower legs dangling down */}
      {/* Right thigh (horizontal forward) */}
      <mesh position={[0.09, 0.36, 0.22]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.38, 0.13]} />
        <meshStandardMaterial color="#2255BB" />
      </mesh>
      {/* Right lower leg (dangling down) */}
      <mesh position={[0.09, 0.16, 0.40]} castShadow>
        <boxGeometry args={[0.11, 0.38, 0.12]} />
        <meshStandardMaterial color="#2255BB" />
      </mesh>
      {/* Left thigh */}
      <mesh position={[-0.09, 0.36, 0.22]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 0.38, 0.13]} />
        <meshStandardMaterial color="#2255BB" />
      </mesh>
      {/* Left lower leg */}
      <mesh position={[-0.09, 0.16, 0.40]} castShadow>
        <boxGeometry args={[0.11, 0.38, 0.12]} />
        <meshStandardMaterial color="#2255BB" />
      </mesh>
      {/* Sandals */}
      <mesh position={[0.09, 0.01, 0.42]} castShadow>
        <boxGeometry args={[0.13, 0.06, 0.18]} />
        <meshStandardMaterial color="#3A1A00" />
      </mesh>
      <mesh position={[-0.09, 0.01, 0.42]} castShadow>
        <boxGeometry args={[0.13, 0.06, 0.18]} />
        <meshStandardMaterial color="#3A1A00" />
      </mesh>
      {/* Name label */}
      <Text
        position={[0, 1.55, 0]}
        fontSize={0.22}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.025}
        outlineColor="#000"
        renderOrder={10}
      >
        ⚓ LUFFY
      </Text>
      {/* Captain label */}
      <Text
        position={[0, 1.30, 0]}
        fontSize={0.14}
        color="#FF4444"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000"
        renderOrder={10}
      >
        Captain
      </Text>
      {/* Floor glow — red */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.55, 0.1]} receiveShadow>
        <ringGeometry args={[0.30, 0.50, 32]} />
        <meshBasicMaterial color="#FF2200" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function CaptainsLog({ data }) {
  const d = data || { header: "CAPTAIN'S LOG · LIVE", line1: "D2.29 ✓ Dynamic Sky Cycle", line2: "D2.29 → Day/Night Live", statusColor: "#2ecc71" }
  return (
    <group position={[0, 3.0, -22]}>
      <mesh castShadow>
        <boxGeometry args={[6, 3.2, 0.12]} />
        <meshStandardMaterial color="#5C3D1E" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[5.76, 3.04, 0.04]} />
        <meshStandardMaterial color="#F5F2EC" roughness={0.9} />
      </mesh>
      <Text position={[0, 0.76, 0.1]} fontSize={0.36} color="#1A1A2E" anchorX="center" fontWeight="bold">{d.header}</Text>
      <Text position={[0, 0.16, 0.1]} fontSize={0.21} color="#444" anchorX="center">{d.line1}</Text>
      <Text position={[0, -0.44, 0.1]} fontSize={0.19} color={d.statusColor} anchorX="center">{d.line2}</Text>
    </group>
  )
}
