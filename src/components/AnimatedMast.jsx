import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedSail({ position, width = 2.8, height = 3.2, color = '#F5F0E0' }) {
  const geoRef = useRef()

  useFrame(({ clock }) => {
    const geo = geoRef.current
    if (!geo) return
    const pos = geo.attributes.position
    const time = clock.getElapsedTime()

    // Compute maxY from original positions
    let maxY = -Infinity
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      if (y > maxY) maxY = y
    }

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const z = pos.getZ(i)
      // Lock top edge
      if (y >= maxY - 0.05) continue
      // Wave deformation on X axis
      const wave = Math.sin(z * 2 + time * 1.5) * 0.15
      pos.setX(i, wave)
    }
    pos.needsUpdate = true
  })

  return (
    <mesh position={position} castShadow>
      <planeGeometry ref={geoRef} args={[width, height, 12, 12]} />
      <meshStandardMaterial color={color} roughness={0.95} side={THREE.DoubleSide} />
    </mesh>
  )
}

function JollyRogerFlag({ position }) {
  const geoRef = useRef()

  useFrame(({ clock }) => {
    const geo = geoRef.current
    if (!geo) return
    const pos = geo.attributes.position
    const time = clock.getElapsedTime()

    let maxY = -Infinity
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      if (y > maxY) maxY = y
    }

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const z = pos.getZ(i)
      if (y >= maxY - 0.05) continue
      const wave = Math.sin(z * 2 + time * 1.5) * 0.08
      pos.setX(i, wave)
    }
    pos.needsUpdate = true
  })

  return (
    <group position={position}>
      <mesh castShadow>
        <planeGeometry ref={geoRef} args={[1.2, 0.8, 12, 8]} />
        <meshStandardMaterial color="#111111" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <Text
        position={[0, 0, 0.05]}
        fontSize={0.45}
        anchorX="center"
        anchorY="middle"
      >
        💀
      </Text>
    </group>
  )
}

export default function AnimatedMast({ position }) {
  return (
    <group position={position}>
      {/* Main mast pole */}
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[0.2, 8, 0.2]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>

      {/* Crossbar */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <boxGeometry args={[3, 0.15, 0.15]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>

      {/* Animated cloth sail */}
      <AnimatedSail position={[0, 3.8, 0.08]} width={2.8} height={3.2} color="#F5F0E0" />

      {/* Crow nest */}
      <mesh position={[0, 8.2, 0]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <meshStandardMaterial color="#5C3010" roughness={0.8} />
      </mesh>

      {/* Jolly Roger flag at mast top */}
      <JollyRogerFlag position={[0.6, 8.5, 0]} />

      {/* Rope: left crossbar end down to deck */}
      <mesh position={[-1.4, 2.75, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 5.5, 6]} />
        <meshStandardMaterial color="#6B4423" roughness={0.9} />
      </mesh>

      {/* Rope: right crossbar end down to deck */}
      <mesh position={[1.4, 2.75, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 5.5, 6]} />
        <meshStandardMaterial color="#6B4423" roughness={0.9} />
      </mesh>
    </group>
  )
}
