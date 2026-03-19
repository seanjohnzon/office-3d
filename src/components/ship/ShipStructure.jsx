import React from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

// ══ Ship Shape Math ══════════════════════════════════════════════════════════

export function shipWidthAtZ(z) {
  // z ranges from -22 (stern) to +20 (bow)
  // Returns half-width at that z position
  const sternZ = -22, bowZ = 20
  const totalLen = bowZ - sternZ
  const t = (z - sternZ) / totalLen  // 0 at stern, 1 at bow
  const sternWidth = 5    // half-width at stern
  const midWidth = 28     // half-width at widest (midship)
  const bowWidth = 2      // half-width at bow tip
  if (t < 0.45) {
    const tt = t / 0.45
    return sternWidth + (midWidth - sternWidth) * Math.sin(tt * Math.PI / 2)
  } else {
    const tt = (t - 0.45) / 0.55
    return midWidth + (bowWidth - midWidth) * Math.sin(tt * Math.PI / 2)
  }
}

export default function ShipDeck() {
  const plankColors = ['#C4A265', '#B8934A', '#A07840', '#C4A265', '#B8934A']
  const planks = []
  const sternZ = -22, bowZ = 20
  const plankDepth = 1.2
  const numPlanks = Math.ceil((bowZ - sternZ) / plankDepth)

  for (let i = 0; i < numPlanks; i++) {
    const z = sternZ + i * plankDepth + plankDepth / 2
    const halfW = shipWidthAtZ(z)
    const color = plankColors[i % plankColors.length]
    planks.push(
      <mesh key={`plank-${i}`} position={[0, 0, z]} receiveShadow castShadow>
        <boxGeometry args={[halfW * 2, 0.08, plankDepth - 0.05]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>
    )
    planks.push(
      <mesh key={`gap-${i}`} position={[0, 0.04, z - plankDepth / 2]}>
        <boxGeometry args={[halfW * 2 + 0.1, 0.01, 0.05]} />
        <meshStandardMaterial color="#6B3A10" roughness={1} />
      </mesh>
    )
  }
  return <group>{planks}</group>
}

export function ShipHullShaped() {
  const hullColor = '#C4A265'
  const hullDark = '#8B6914'
  const goldTrim = '#D4870A'
  const segments = []

  const sternZ = -22, bowZ = 20
  const numSegs = 20
  const segLen = (bowZ - sternZ) / numSegs

  for (let i = 0; i < numSegs; i++) {
    const z1 = sternZ + i * segLen
    const z2 = z1 + segLen
    const zMid = (z1 + z2) / 2
    const w1 = shipWidthAtZ(z1)
    const w2 = shipWidthAtZ(z2)
    const wMid = (w1 + w2) / 2
    const dw = w2 - w1
    const angle = Math.atan2(dw, segLen)

    segments.push(
      <mesh key={`port-${i}`} position={[-wMid, -0.8, zMid]} rotation={[0, -angle, 0]} castShadow>
        <boxGeometry args={[0.5, 2.2, segLen + 0.2]} />
        <meshStandardMaterial color={i < 4 || i > 16 ? hullDark : hullColor} roughness={0.85} />
      </mesh>
    )
    segments.push(
      <mesh key={`ptrim-${i}`} position={[-wMid - 0.05, 0.15, zMid]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[0.12, 0.12, segLen + 0.2]} />
        <meshStandardMaterial color={goldTrim} roughness={0.3} metalness={0.7} emissive={goldTrim} emissiveIntensity={0.15} />
      </mesh>
    )
    segments.push(
      <mesh key={`pcap-${i}`} position={[-wMid - 0.08, 0.45, zMid]} rotation={[0, -angle, 0]} castShadow>
        <boxGeometry args={[0.28, 0.18, segLen + 0.1]} />
        <meshStandardMaterial color="#5C3010" roughness={0.8} />
      </mesh>
    )
    segments.push(
      <mesh key={`star-${i}`} position={[wMid, -0.8, zMid]} rotation={[0, angle, 0]} castShadow>
        <boxGeometry args={[0.5, 2.2, segLen + 0.2]} />
        <meshStandardMaterial color={i < 4 || i > 16 ? hullDark : hullColor} roughness={0.85} />
      </mesh>
    )
    segments.push(
      <mesh key={`strim-${i}`} position={[wMid + 0.05, 0.15, zMid]} rotation={[0, angle, 0]}>
        <boxGeometry args={[0.12, 0.12, segLen + 0.2]} />
        <meshStandardMaterial color={goldTrim} roughness={0.3} metalness={0.7} emissive={goldTrim} emissiveIntensity={0.15} />
      </mesh>
    )
    segments.push(
      <mesh key={`scap-${i}`} position={[wMid + 0.08, 0.45, zMid]} rotation={[0, angle, 0]} castShadow>
        <boxGeometry args={[0.28, 0.18, segLen + 0.1]} />
        <meshStandardMaterial color="#5C3010" roughness={0.8} />
      </mesh>
    )
  }

  const sternW = shipWidthAtZ(sternZ) * 2
  segments.push(
    <mesh key="stern" position={[0, -0.8, sternZ]} castShadow>
      <boxGeometry args={[sternW, 2.2, 0.5]} />
      <meshStandardMaterial color={hullDark} roughness={0.85} />
    </mesh>
  )
  segments.push(
    <mesh key="sterntrim" position={[0, 0.15, sternZ]}>
      <boxGeometry args={[sternW + 0.2, 0.12, 0.15]} />
      <meshStandardMaterial color={goldTrim} roughness={0.3} metalness={0.7} />
    </mesh>
  )

  ;[-9, 0, 9].forEach((hz, hi) => {
    const hw = shipWidthAtZ(hz)
    segments.push(
      <group key={`dock-${hi}`} position={[-hw - 0.1, -0.5, hz]}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 1.5, 2.5]} />
          <meshStandardMaterial color="#1A3A1A" roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0, 0]}>
          <boxGeometry args={[0.08, 1.6, 2.6]} />
          <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
    )
  })

  ;[[-4, 3], [0, 3], [4, 3]].forEach(([az], ai) => {
    const aqW = shipWidthAtZ(az)
    segments.push(
      <mesh key={`aq-${ai}`} position={[aqW + 0.1, 0.5, az]}>
        <boxGeometry args={[0.15, 2.5, 2.4]} />
        <meshStandardMaterial color="#88CCFF" transparent opacity={0.5} roughness={0} />
      </mesh>
    )
    segments.push(
      <mesh key={`aqglow-${ai}`} position={[aqW - 0.1, 0.5, az]}>
        <boxGeometry args={[0.08, 2.3, 2.2]} />
        <meshStandardMaterial color="#004488" emissive="#0044AA" emissiveIntensity={0.6} transparent opacity={0.4} />
      </mesh>
    )
  })

  segments.push(
    <group key="captdoor" position={[0, 0.5, sternZ + 0.4]}>
      <mesh castShadow>
        <boxGeometry args={[2.0, 3.0, 0.2]} />
        <meshStandardMaterial color="#3A2008" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[1.6, 2.7, 0.1]} />
        <meshStandardMaterial color="#5C3010" roughness={0.7} />
      </mesh>
      <Text position={[0, 1.8, 0.2]} fontSize={0.25} color="#D4870A" anchorX="center">CAPTAIN'S QUARTERS</Text>
    </group>
  )

  segments.push(
    <mesh key="helmplatform" position={[0, 0.4, -18]} castShadow receiveShadow>
      <boxGeometry args={[shipWidthAtZ(-18) * 1.5, 0.4, 8]} />
      <meshStandardMaterial color="#8B5E3C" roughness={0.85} />
    </mesh>
  )

  segments.push(
    <mesh key="bowplatform" position={[0, 0.3, 16]} castShadow receiveShadow>
      <boxGeometry args={[shipWidthAtZ(16) * 1.8, 0.35, 6]} />
      <meshStandardMaterial color="#8B5E3C" roughness={0.85} />
    </mesh>
  )

  return <group>{segments}</group>
}

export function ThousandSunnyHull() {
  const hullGreen = '#C4A265'
  const hullDark = '#8B6914'
  const goldTrim = '#D4870A'

  return (
    <group>
      {/* === PORT SIDE HULL (left, x negative) === */}
      <mesh position={[-28, -0.3, -1.5]} castShadow>
        <boxGeometry args={[0.5, 0.6, 54]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[-27, -1.1, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 51]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[-26, -2.2, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.2, 45]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[-24, -3.3, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 36]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[-28.5, 0.05, -1.5]}>
        <boxGeometry args={[0.12, 0.12, 54]} />
        <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} emissive={goldTrim} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-28.5, 0.4, -1.5]} castShadow>
        <boxGeometry args={[0.25, 0.18, 54]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>

      {/* === STARBOARD SIDE HULL (right, x positive) === */}
      <mesh position={[28, -0.3, -1.5]} castShadow>
        <boxGeometry args={[0.5, 0.6, 54]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[27, -1.1, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 51]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[26, -2.2, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.2, 45]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[24, -3.3, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 36]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[28.5, 0.05, -1.5]}>
        <boxGeometry args={[0.12, 0.12, 54]} />
        <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} emissive={goldTrim} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[28.5, 0.4, -1.5]} castShadow>
        <boxGeometry args={[0.25, 0.18, 54]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>

      {/* === STERN (back wall at z=-26) === */}
      <mesh position={[0, -1.5, -26]} castShadow>
        <boxGeometry args={[57, 3.5, 0.4]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.05, -26]}>
        <boxGeometry args={[58.5, 0.12, 0.15]} />
        <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} emissive={goldTrim} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.4, -26]} castShadow>
        <boxGeometry args={[58.5, 0.18, 0.3]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>

      {/* === BOW TAPER (front, z=22 to 30) === */}
      <mesh position={[-22.5, -0.5, 22.5]} rotation={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.4, 1.0, 12]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[-16.5, -1.5, 25.5]} rotation={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 1.5, 9]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[22.5, -0.5, 22.5]} rotation={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[0.4, 1.0, 12]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[16.5, -1.5, 25.5]} rotation={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 1.5, 9]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>

      {/* === SOLDIER DOCK SYSTEM (port side, 3 hatches) === */}
      {[-9, 0, 9].map((z, i) => (
        <group key={i} position={[-28.6, -0.5, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 1.2, 1.8]} />
            <meshStandardMaterial color="#1A3A1A" roughness={0.9} />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <boxGeometry args={[0.06, 1.3, 1.9]} />
            <meshStandardMaterial color={goldTrim} roughness={0.5} metalness={0.5} />
          </mesh>
          <Text position={[0.14, 0, 0]} fontSize={0.22} color={goldTrim} rotation={[0, Math.PI/2, 0]} anchorX="center">
            {`S-${i + 1}`}
          </Text>
        </group>
      ))}

      {/* === AQUARIUM BAR (starboard side, glowing blue panel) === */}
      <group position={[28.5, 0.5, 3]}>
        <mesh castShadow>
          <boxGeometry args={[0.15, 4, 12]} />
          <meshStandardMaterial color="#001833" roughness={0.1} metalness={0.2} transparent opacity={0.7} />
        </mesh>
        <mesh position={[-0.1, 0, 0]}>
          <boxGeometry args={[0.05, 3.8, 11.8]} />
          <meshStandardMaterial color="#003366" emissive="#0044AA" emissiveIntensity={0.8} transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[0.08, 4.1, 12.1]} />
          <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} />
        </mesh>
        <Text position={[0.2, 2.2, 0]} fontSize={0.4} color={goldTrim} rotation={[0, Math.PI/2, 0]} anchorX="center">
          AQUARIUM BAR
        </Text>
      </group>

      {/* === CAPTAIN'S QUARTERS ENTRANCE (stern, center) === */}
      <group position={[0, 0.5, -25.5]}>
        <mesh>
          <boxGeometry args={[2.4, 4.4, 0.3]} />
          <meshStandardMaterial color="#3A2008" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[2.0, 4.0, 0.16]} />
          <meshStandardMaterial color="#5C3010" roughness={0.7} />
        </mesh>
        <mesh position={[0.6, 0, 0.2]}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshStandardMaterial color={goldTrim} metalness={0.8} roughness={0.2} />
        </mesh>
        <Text position={[0, 2.6, 0.2]} fontSize={0.28} color={goldTrim} anchorX="center">
          CAPTAIN'S QUARTERS
        </Text>
      </group>

      {/* === HELM PLATFORM (stern raised area for steering) === */}
      <mesh position={[0, 0.35, -20]} castShadow receiveShadow>
        <boxGeometry args={[20, 0.4, 10]} />
        <meshStandardMaterial color="#7A5230" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.15, -15]} castShadow>
        <boxGeometry args={[20, 0.15, 0.6]} />
        <meshStandardMaterial color="#6B4423" roughness={0.85} />
      </mesh>

      {/* === BOW PLATFORM (front raised area, lion sits on it) === */}
      <mesh position={[0, 0.3, 18]} castShadow receiveShadow>
        <boxGeometry args={[16, 0.4, 6]} />
        <meshStandardMaterial color="#7A5230" roughness={0.85} />
      </mesh>
    </group>
  )
}
