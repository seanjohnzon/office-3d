import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 60

export default function WakeFoam() {
  const meshRef = useRef()
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: (Math.random() - 0.5) * 6,    // spread behind ship
      z: -(4 + Math.random() * 12),      // behind ship (negative Z)
      y: -1.42 + Math.random() * 0.06,   // at ocean surface
      vx: (Math.random() - 0.5) * 0.02,
      vy: 0.005 + Math.random() * 0.01,
      life: Math.random(),              // 0-1
      speed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2
    }))
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()
    particles.forEach((p, i) => {
      p.life += 0.008 * p.speed
      if (p.life > 1) {
        // reset
        p.x = (Math.random() - 0.5) * 5
        p.z = -(4 + Math.random() * 10)
        p.y = -1.42
        p.life = 0
        p.phase = Math.random() * Math.PI * 2
      }
      const scale = (1 - p.life) * 0.5 + 0.1
      dummy.position.set(
        p.x + Math.sin(t * 2 + p.phase) * 0.1,
        p.y + p.life * 0.08,
        p.z - p.life * 3
      )
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.18, 6, 6]} />
      <meshStandardMaterial
        color="#e8f4ff"
        emissive="#aaddff"
        emissiveIntensity={0.3}
        transparent
        opacity={0.6}
        roughness={0.2}
      />
    </instancedMesh>
  )
}
