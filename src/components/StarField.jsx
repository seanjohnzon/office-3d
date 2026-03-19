import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function StarField() {
  const meshRef = useRef()
  
  const [positions, colors] = useMemo(() => {
    const count = 8000
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Random point on sphere of radius 80
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 80 + Math.random() * 20
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = Math.abs(r * Math.cos(phi)) // upper hemisphere only (above y=0)
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      // Slight color variation: white to blue-white
      const brightness = 0.8 + Math.random() * 0.2
      col[i * 3] = brightness * (0.85 + Math.random() * 0.15)
      col[i * 3 + 1] = brightness * (0.9 + Math.random() * 0.1)
      col[i * 3 + 2] = brightness
    }
    return [pos, col]
  }, [])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.01 // very slow drift
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.25}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  )
}
