import React from 'react'
import { Text } from '@react-three/drei'

export default function KitchenStation({ position }) {
  return (
    <group position={position}>

      {/* ── Counter / Bench ── */}
      {/* Main counter body */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[2.2, 0.85, 0.8]} />
        <meshStandardMaterial color="#6B3A1E" />
      </mesh>

      {/* Counter top (stone surface) */}
      <mesh position={[0, 0.86, 0]}>
        <boxGeometry args={[2.2, 0.06, 0.8]} />
        <meshStandardMaterial color="#D4C4A0" />
      </mesh>

      {/* Counter front decorative panel strip */}
      <mesh position={[0, 0.42, 0.37]}>
        <boxGeometry args={[2.2, 0.85, 0.06]} />
        <meshStandardMaterial color="#5A2E14" />
      </mesh>

      {/* ── Stove / Cooktop ── */}
      {/* Stove body */}
      <mesh position={[0, 0.92, -0.05]}>
        <boxGeometry args={[1.0, 0.2, 0.6]} />
        <meshStandardMaterial color="#333344" />
      </mesh>

      {/* Burner 1 – front-left */}
      <mesh position={[-0.3, 0.96, -0.1]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
        <meshStandardMaterial color="#222222" emissive="#FF4400" emissiveIntensity={0.6} />
      </mesh>

      {/* Burner 2 – front-right */}
      <mesh position={[0.3, 0.96, -0.1]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
        <meshStandardMaterial color="#222222" emissive="#FF4400" emissiveIntensity={0.6} />
      </mesh>

      {/* Burner 3 – back-left */}
      <mesh position={[-0.3, 0.96, 0.1]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
        <meshStandardMaterial color="#222222" emissive="#FF4400" emissiveIntensity={0.6} />
      </mesh>

      {/* Burner 4 – back-right */}
      <mesh position={[0.3, 0.96, 0.1]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
        <meshStandardMaterial color="#222222" emissive="#FF4400" emissiveIntensity={0.6} />
      </mesh>

      {/* ── Cooking Items ── */}
      {/* Large pot body */}
      <mesh position={[-0.3, 1.1, -0.1]}>
        <cylinderGeometry args={[0.22, 0.22, 0.3, 12]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Pot lid */}
      <mesh position={[-0.3, 1.26, -0.1]}>
        <cylinderGeometry args={[0.24, 0.24, 0.06, 12]} />
        <meshStandardMaterial color="#999999" />
      </mesh>

      {/* Pan (flat cylinder) */}
      <mesh position={[0.3, 0.98, 0.0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 8]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      {/* Pan handle */}
      <mesh position={[0.48, 0.98, 0.0]}>
        <boxGeometry args={[0.28, 0.04, 0.04]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* ── Lower Shelf with Bottles ── */}
      {/* Shelf board */}
      <mesh position={[0, 1.6, -0.3]}>
        <boxGeometry args={[1.4, 0.06, 0.3]} />
        <meshStandardMaterial color="#7A5230" />
      </mesh>

      {/* Bottle 1 – red (hot sauce / chili oil) */}
      <mesh position={[-0.3, 1.72, -0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.22, 8]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>

      {/* Bottle 2 – green (herbs / oil) */}
      <mesh position={[0, 1.72, -0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.22, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>

      {/* Bottle 3 – gold (seasoning / soy sauce) */}
      <mesh position={[0.3, 1.72, -0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.22, 8]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>

      {/* ── Upper Shelf with More Items ── */}
      {/* Upper shelf board */}
      <mesh position={[0, 2.1, -0.3]}>
        <boxGeometry args={[1.4, 0.06, 0.3]} />
        <meshStandardMaterial color="#7A5230" />
      </mesh>

      {/* Upper bottle 1 – dark red */}
      <mesh position={[-0.2, 2.22, -0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.22, 8]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>

      {/* Upper bottle 2 – gold */}
      <mesh position={[0.2, 2.22, -0.3]}>
        <cylinderGeometry args={[0.06, 0.06, 0.22, 8]} />
        <meshStandardMaterial color="#DAA520" />
      </mesh>

      {/* ── Hanging Pots Rack ── */}
      {/* Rack bar */}
      <mesh position={[0, 2.4, -0.1]}>
        <boxGeometry args={[1.8, 0.05, 0.05]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Chain 1 – left */}
      <mesh position={[-0.5, 2.25, -0.1]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Chain 2 – center */}
      <mesh position={[0, 2.25, -0.1]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Chain 3 – right */}
      <mesh position={[0.5, 2.25, -0.1]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Hanging pot 1 – left */}
      <mesh position={[-0.5, 2.06, -0.1]}>
        <cylinderGeometry args={[0.14, 0.14, 0.18, 8]} />
        <meshStandardMaterial color="#777777" />
      </mesh>

      {/* Hanging pot 2 – center */}
      <mesh position={[0, 2.06, -0.1]}>
        <cylinderGeometry args={[0.14, 0.14, 0.18, 8]} />
        <meshStandardMaterial color="#777777" />
      </mesh>

      {/* Hanging pot 3 – right */}
      <mesh position={[0.5, 2.06, -0.1]}>
        <cylinderGeometry args={[0.14, 0.14, 0.18, 8]} />
        <meshStandardMaterial color="#777777" />
      </mesh>

      {/* ── Galley Sign ── */}
      <Text
        position={[0, 2.7, -0.35]}
        fontSize={0.22}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
      >
        GALLEY
      </Text>

      {/* ── Brook spec additions ── */}

      {/* Cutting board */}
      <mesh position={[0.2, 0.89, 0.15]}>
        <boxGeometry args={[0.4, 0.02, 0.28]} />
        <meshStandardMaterial color="#D4B483" />
      </mesh>
      {/* Tomato on cutting board */}
      <mesh position={[0.18, 0.92, 0.10]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial color="#CC2200" />
      </mesh>
      {/* Lettuce on cutting board */}
      <mesh position={[0.26, 0.91, 0.18]}>
        <boxGeometry args={[0.10, 0.05, 0.08]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>

      {/* Refrigerator */}
      <mesh position={[-0.9, 0.7, -0.3]}>
        <boxGeometry args={[0.5, 1.4, 0.45]} />
        <meshStandardMaterial color="#E8E8E8" />
      </mesh>
      {/* Fridge handle */}
      <mesh position={[-0.66, 0.8, -0.14]}>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Wine rack frame */}
      <mesh position={[0.85, 1.35, -0.35]}>
        <boxGeometry args={[0.3, 0.6, 0.15]} />
        <meshStandardMaterial color="#4A2800" />
      </mesh>
      {/* Wine bottle 1 */}
      <mesh position={[0.73, 1.20, -0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 8]} />
        <meshStandardMaterial color="#722F37" />
      </mesh>
      {/* Wine bottle 2 */}
      <mesh position={[0.97, 1.20, -0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 8]} />
        <meshStandardMaterial color="#4B0082" />
      </mesh>
      {/* Wine bottle 3 */}
      <mesh position={[0.73, 1.44, -0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 8]} />
        <meshStandardMaterial color="#8B0000" />
      </mesh>
      {/* Wine bottle 4 */}
      <mesh position={[0.97, 1.44, -0.35]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.22, 8]} />
        <meshStandardMaterial color="#556B2F" />
      </mesh>

    </group>
  )
}
