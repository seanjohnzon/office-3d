import React from 'react'
import { Text } from '@react-three/drei'

export default function WorkshopStation({ position }) {
  return (
    <group position={position}>

      {/* ── WORKBENCH ── */}

      {/* Main bench body */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[2.2, 0.85, 0.9]} />
        <meshStandardMaterial color="#5C3A1E" />
      </mesh>

      {/* Bench top surface */}
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[2.2, 0.06, 0.9]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Bench legs — 4 corner cylinders */}
      <mesh position={[-1.0, 0.42, 0.38]}>
        <cylinderGeometry args={[0.04, 0.04, 0.85, 8]} />
        <meshStandardMaterial color="#4A2A10" />
      </mesh>
      <mesh position={[1.0, 0.42, 0.38]}>
        <cylinderGeometry args={[0.04, 0.04, 0.85, 8]} />
        <meshStandardMaterial color="#4A2A10" />
      </mesh>
      <mesh position={[-1.0, 0.42, -0.38]}>
        <cylinderGeometry args={[0.04, 0.04, 0.85, 8]} />
        <meshStandardMaterial color="#4A2A10" />
      </mesh>
      <mesh position={[1.0, 0.42, -0.38]}>
        <cylinderGeometry args={[0.04, 0.04, 0.85, 8]} />
        <meshStandardMaterial color="#4A2A10" />
      </mesh>

      {/* Vice clamp body */}
      <mesh position={[0.9, 0.92, 0]}>
        <boxGeometry args={[0.2, 0.22, 0.16]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      {/* Vice jaw top */}
      <mesh position={[0.9, 1.04, 0]}>
        <boxGeometry args={[0.18, 0.04, 0.14]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      {/* Vice jaw bottom */}
      <mesh position={[0.9, 0.82, 0]}>
        <boxGeometry args={[0.18, 0.04, 0.14]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* ── WALL TOOL RACK ── */}

      {/* Rack board backing */}
      <mesh position={[0, 1.6, -0.46]}>
        <boxGeometry args={[1.8, 1.2, 0.1]} />
        <meshStandardMaterial color="#4A3010" />
      </mesh>

      {/* Hammer handle */}
      <mesh position={[-0.6, 1.5, -0.4]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      {/* Hammer head */}
      <mesh position={[-0.6, 1.72, -0.4]}>
        <boxGeometry args={[0.18, 0.12, 0.1]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Wrench — L-shape: vertical part */}
      <mesh position={[-0.2, 1.5, -0.4]}>
        <boxGeometry args={[0.06, 0.38, 0.05]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      {/* Wrench — L-shape: horizontal part */}
      <mesh position={[-0.14, 1.68, -0.4]}>
        <boxGeometry args={[0.18, 0.06, 0.05]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Saw blade */}
      <mesh position={[0.2, 1.5, -0.4]}>
        <boxGeometry args={[0.38, 0.02, 0.16]} />
        <meshStandardMaterial color="#CCCCCC" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Saw handle */}
      <mesh position={[0.2, 1.38, -0.4]}>
        <boxGeometry args={[0.1, 0.18, 0.05]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>

      {/* Slingshot — Y-shape: stem */}
      <mesh position={[0.65, 1.48, -0.4]}>
        <boxGeometry args={[0.06, 0.28, 0.06]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      {/* Slingshot left fork */}
      <mesh position={[0.53, 1.66, -0.4]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.06, 0.22, 0.06]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      {/* Slingshot right fork */}
      <mesh position={[0.77, 1.66, -0.4]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.06, 0.22, 0.06]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      {/* Rubber band left */}
      <mesh position={[0.49, 1.76, -0.4]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.04, 0.18, 0.03]} />
        <meshStandardMaterial color="#6B3A2A" />
      </mesh>
      {/* Rubber band right */}
      <mesh position={[0.81, 1.76, -0.4]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.04, 0.18, 0.03]} />
        <meshStandardMaterial color="#6B3A2A" />
      </mesh>

      {/* ── BENCH SURFACE ITEMS ── */}

      {/* Blueprint/schematic */}
      <mesh position={[-0.4, 0.88, 0.1]}>
        <boxGeometry args={[0.6, 0.02, 0.4]} />
        <meshStandardMaterial color="#F5F0DC" />
      </mesh>

      {/* Gear 1 */}
      <mesh position={[0.1, 0.88, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 8]} />
        <meshStandardMaterial color="#AAAAAA" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Gear 2 */}
      <mesh position={[0.2, 0.88, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 8]} />
        <meshStandardMaterial color="#AAAAAA" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Pop Green ammo balls */}
      <mesh position={[0.5, 0.9, 0.2]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#2D7A2D" />
      </mesh>
      <mesh position={[0.6, 0.9, 0.2]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#2D7A2D" />
      </mesh>
      <mesh position={[0.55, 0.9, 0.3]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#2D7A2D" />
      </mesh>

      {/* Toolbox */}
      <mesh position={[-0.7, 0.92, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.2]} />
        <meshStandardMaterial color="#C41E3A" />
      </mesh>
      {/* Toolbox lid */}
      <mesh position={[-0.7, 1.03, 0]}>
        <boxGeometry args={[0.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#A01830" />
      </mesh>
      {/* Toolbox handle */}
      <mesh position={[-0.7, 1.06, 0]}>
        <boxGeometry args={[0.12, 0.03, 0.03]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* ── SHELVING UNIT ── */}

      {/* Shelf frame */}
      <mesh position={[0, 1.0, -0.3]}>
        <boxGeometry args={[1.4, 2.0, 0.35]} />
        <meshStandardMaterial color="#4A3010" transparent opacity={0.15} />
      </mesh>

      {/* Shelf board 1 — bottom */}
      <mesh position={[0, 0.4, -0.3]}>
        <boxGeometry args={[1.3, 0.04, 0.32]} />
        <meshStandardMaterial color="#6B4A20" />
      </mesh>
      {/* Shelf board 2 — middle */}
      <mesh position={[0, 1.0, -0.3]}>
        <boxGeometry args={[1.3, 0.04, 0.32]} />
        <meshStandardMaterial color="#6B4A20" />
      </mesh>
      {/* Shelf board 3 — top */}
      <mesh position={[0, 1.6, -0.3]}>
        <boxGeometry args={[1.3, 0.04, 0.32]} />
        <meshStandardMaterial color="#6B4A20" />
      </mesh>

      {/* Shelf back panel */}
      <mesh position={[0, 1.0, -0.46]}>
        <boxGeometry args={[1.4, 2.0, 0.04]} />
        <meshStandardMaterial color="#4A3010" />
      </mesh>
      {/* Shelf side panels */}
      <mesh position={[-0.68, 1.0, -0.3]}>
        <boxGeometry args={[0.04, 2.0, 0.35]} />
        <meshStandardMaterial color="#4A3010" />
      </mesh>
      <mesh position={[0.68, 1.0, -0.3]}>
        <boxGeometry args={[0.04, 2.0, 0.35]} />
        <meshStandardMaterial color="#4A3010" />
      </mesh>

      {/* ── SHELF CONTENTS ── */}

      {/* Bottom shelf containers */}
      {/* Green jar */}
      <mesh position={[-0.4, 0.5, -0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.18, 10]} />
        <meshStandardMaterial color="#3A8A3A" />
      </mesh>
      {/* Red can */}
      <mesh position={[-0.1, 0.5, -0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 0.16, 10]} />
        <meshStandardMaterial color="#CC2222" />
      </mesh>
      {/* Gray box */}
      <mesh position={[0.25, 0.46, -0.3]}>
        <boxGeometry args={[0.18, 0.1, 0.1]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      {/* Small brown box */}
      <mesh position={[0.48, 0.46, -0.3]}>
        <boxGeometry args={[0.12, 0.1, 0.1]} />
        <meshStandardMaterial color="#7A5030" />
      </mesh>

      {/* Middle shelf containers */}
      {/* Dark green jar */}
      <mesh position={[-0.45, 1.12, -0.3]}>
        <cylinderGeometry args={[0.07, 0.07, 0.2, 10]} />
        <meshStandardMaterial color="#1A5A1A" />
      </mesh>
      {/* Lid on green jar */}
      <mesh position={[-0.45, 1.22, -0.3]}>
        <cylinderGeometry args={[0.075, 0.075, 0.02, 10]} />
        <meshStandardMaterial color="#AAA" />
      </mesh>
      {/* Gray tube */}
      <mesh position={[-0.1, 1.12, -0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.2, 10]} />
        <meshStandardMaterial color="#999999" metalness={0.5} />
      </mesh>
      {/* Small red box */}
      <mesh position={[0.2, 1.07, -0.3]}>
        <boxGeometry args={[0.12, 0.12, 0.1]} />
        <meshStandardMaterial color="#BB1111" />
      </mesh>
      {/* Mystery dark box */}
      <mesh position={[0.45, 1.07, -0.3]}>
        <boxGeometry args={[0.16, 0.12, 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Top shelf containers */}
      {/* Light green vial */}
      <mesh position={[-0.4, 1.72, -0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 10]} />
        <meshStandardMaterial color="#88DD88" transparent opacity={0.8} />
      </mesh>
      {/* Blue vial */}
      <mesh position={[-0.2, 1.72, -0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 10]} />
        <meshStandardMaterial color="#4488CC" transparent opacity={0.8} />
      </mesh>
      {/* Wood box */}
      <mesh position={[0.15, 1.68, -0.3]}>
        <boxGeometry args={[0.2, 0.14, 0.12]} />
        <meshStandardMaterial color="#8B6040" />
      </mesh>
      {/* Small gray canister */}
      <mesh position={[0.45, 1.7, -0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 0.16, 10]} />
        <meshStandardMaterial color="#AAAAAA" metalness={0.6} />
      </mesh>

      {/* ── WORKSHOP SIGN ── */}
      <Text
        position={[0, 2.8, -0.5]}
        fontSize={0.2}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
      >
        USOPP FACTORY
      </Text>

      {/* ── SPARKS PARTICLE HINT ── */}
      <mesh position={[0.3, 0.91, 0.0]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial
          color="#FF8800"
          emissive="#FF8800"
          emissiveIntensity={2.0}
        />
      </mesh>

      {/* ── Brook spec additions ── */}

      {/* Pop Green plant pot 1 */}
      <mesh position={[-0.8, 0.9, 0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.15, 8]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      {/* Pop Green plant pot 2 */}
      <mesh position={[-0.65, 0.9, 0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.15, 8]} />
        <meshStandardMaterial color="#8B5E3C" />
      </mesh>
      {/* Pop Green plant 1 */}
      <mesh position={[-0.8, 1.02, 0.3]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>
      {/* Pop Green plant 2 */}
      <mesh position={[-0.65, 1.02, 0.3]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#32CD32" />
      </mesh>

      {/* Supply crate 1 — bottom */}
      <mesh position={[-0.85, 0.15, -0.3]}>
        <boxGeometry args={[0.4, 0.3, 0.35]} />
        <meshStandardMaterial color="#8B6B3D" />
      </mesh>
      {/* Supply crate 2 — middle */}
      <mesh position={[-0.85, 0.45, -0.3]}>
        <boxGeometry args={[0.4, 0.3, 0.35]} />
        <meshStandardMaterial color="#8B6B3D" />
      </mesh>
      {/* Supply crate 3 — top */}
      <mesh position={[-0.85, 0.75, -0.3]}>
        <boxGeometry args={[0.4, 0.3, 0.35]} />
        <meshStandardMaterial color="#8B6B3D" />
      </mesh>

      {/* Magnifying glass lens */}
      <mesh position={[0.6, 0.93, 0.25]}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.4} roughness={0.3} transparent opacity={0.6} />
      </mesh>
      {/* Magnifying glass handle */}
      <mesh position={[0.68, 0.82, 0.25]}>
        <boxGeometry args={[0.04, 0.2, 0.04]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Telescope */}
      <mesh position={[-0.3, 1.0, 0.35]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.5} />
      </mesh>

    </group>
  )
}
