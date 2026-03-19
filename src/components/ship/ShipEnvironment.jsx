import React from 'react'
import * as THREE from 'three'

export default function OceanSkyEnvironment() {
  return (
    <>
      {/* Sky dome — bright blue gradient suggestion */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[120, 16, 16]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>
      {/* Horizon band — lighter near waterline */}
      <mesh position={[0, -8, 0]}>
        <sphereGeometry args={[118, 16, 8]} />
        <meshBasicMaterial color="#B8E4F5" side={THREE.BackSide} />
      </mesh>
      {/* Ocean floor plane — extends to horizon */}
      <mesh position={[0, -6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2E7DB8" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Ocean near-ship — closer, brighter */}
      <mesh position={[0, -5.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#4A9FD4" roughness={0.2} metalness={0.15} transparent opacity={0.85} />
      </mesh>
      {/* Cloud 1 */}
      <group position={[-40, 25, -60]}>
        <mesh><boxGeometry args={[12, 4, 6]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
        <mesh position={[5, 1.5, 0]}><boxGeometry args={[8, 5, 5]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
        <mesh position={[-4, 1, 0]}><boxGeometry args={[6, 3, 5]} /><meshBasicMaterial color="#F5F5F5" /></mesh>
      </group>
      {/* Cloud 2 */}
      <group position={[50, 28, -70]}>
        <mesh><boxGeometry args={[10, 3, 5]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
        <mesh position={[3, 1.5, 0]}><boxGeometry args={[7, 4, 5]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
      </group>
      {/* Cloud 3 */}
      <group position={[0, 22, -80]}>
        <mesh><boxGeometry args={[14, 4, 7]} /><meshBasicMaterial color="#F8F8FF" /></mesh>
        <mesh position={[-5, 2, 0]}><boxGeometry args={[8, 5, 6]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
        <mesh position={[6, 1.5, 0]}><boxGeometry args={[10, 4, 5]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
      </group>
      {/* Distant island silhouette left */}
      <mesh position={[-80, -2, -90]}>
        <boxGeometry args={[20, 8, 8]} />
        <meshBasicMaterial color="#3A7A3A" />
      </mesh>
      <mesh position={[-78, 2, -88]}>
        <coneGeometry args={[4, 12, 6]} />
        <meshBasicMaterial color="#2A6A2A" />
      </mesh>
      {/* Distant island right */}
      <mesh position={[75, -3, -85]}>
        <boxGeometry args={[14, 6, 6]} />
        <meshBasicMaterial color="#3A7A3A" />
      </mesh>
    </>
  )
}

export function WoodenDeck() {
  const plankColors = ['#8B5E3C', '#7A5230', '#6B4423']
  const planks = []
  const deckWidth = 60
  const deckDepth = 50
  const plankWidth = deckWidth
  const plankHeight = 0.06
  const plankDepth = 1.2
  const numPlanks = Math.ceil(deckDepth / plankDepth)
  const startZ = -deckDepth / 2

  for (let i = 0; i < numPlanks; i++) {
    const color = plankColors[i % plankColors.length]
    const z = startZ + i * plankDepth + plankDepth / 2
    planks.push(
      <mesh key={`plank-${i}`} position={[0, 0, z]} receiveShadow>
        <boxGeometry args={[plankWidth, plankHeight, plankDepth - 0.04]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    )
    // Plank gap line
    planks.push(
      <mesh key={`gap-${i}`} position={[0, 0.035, z - plankDepth / 2]}>
        <boxGeometry args={[plankWidth, 0.01, 0.04]} />
        <meshStandardMaterial color="#3A2010" roughness={1} />
      </mesh>
    )
  }
  return <group>{planks}</group>
}

export function GrassLawn() {
  const flowers = [
    { x: -3.6, z: -1.8, color: '#FF69B4' },
    { x: 2.4, z: -2.7, color: '#FFD700' },
    { x: -0.9, z: 1.2, color: '#FF69B4' },
    { x: 3.3, z: 1.8, color: '#FFD700' },
    { x: -4.5, z: 2.1, color: '#FF69B4' },
    { x: 0.6, z: -0.6, color: '#FFD700' },
  ]
  return (
    <group position={[0, 0.1, -5]}>
      {/* Lawn base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[16, 0.05, 10]} />
        <meshStandardMaterial color="#2D7A2D" roughness={0.9} />
      </mesh>
      {/* Border */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[16.2, 0.03, 10.2]} />
        <meshStandardMaterial color="#3A9A3A" roughness={0.9} wireframe={false} transparent opacity={0.4} />
      </mesh>
      {/* Flowers */}
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, 0.04, f.z]}>
          {/* Stem */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.18, 6]} />
            <meshStandardMaterial color="#1A5C1A" roughness={0.9} />
          </mesh>
          {/* Bloom */}
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.07, 6, 5]} />
            <meshStandardMaterial color={f.color} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
