import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function OceanPlane() {
  const geoRef = useRef()

  useFrame(({ clock }) => {
    const geo = geoRef.current
    if (!geo) return

    const t = clock.getElapsedTime()
    const pos = geo.attributes.position

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)

      // Primary wave: slow, large rolling swells
      const primary = Math.sin(x * 0.4 + t * 0.6) * 0.3 + Math.cos(z * 0.4 + t * 0.5) * 0.3

      // Secondary wave: faster, smaller chop
      const secondary = Math.sin(x * 1.2 + t * 1.4) * 0.08 + Math.cos(z * 1.2 + t * 1.1) * 0.08

      pos.setY(i, primary + secondary)
    }

    pos.needsUpdate = true
    geo.computeVertexNormals()
  })

  return (
    <group>
      {/* Main animated ocean plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry ref={geoRef} args={[120, 120, 64, 64]} />
        <meshStandardMaterial
          color="#0a2a4a"
          emissive="#001122"
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Foam highlight shimmer layer — static, slightly above */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
        <planeGeometry args={[110, 110, 1, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.05}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  )
}
