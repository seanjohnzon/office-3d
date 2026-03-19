import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * ShipBob — gently bobs and tilts the entire ship scene on the ocean.
 * Wraps children in a <group> and animates via ref (no setState).
 *
 * Motion design:
 *   • Vertical heave:  ±0.15 units  @ 0.4 Hz
 *   • Pitch (x-tilt):  ±1.5°        @ 0.3 Hz
 *   • Roll  (z-tilt):  ±0.7°        @ 0.5 Hz  (slight phase offset)
 */
export default function ShipBob({ children }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    const g = groupRef.current
    if (!g) return
    const t = clock.getElapsedTime()

    // Vertical heave — slow oceanic lift
    g.position.y = Math.sin(t * 2 * Math.PI * 0.4) * 0.15

    // Pitch — bow dips and rises (rotation around X axis)
    g.rotation.x = Math.sin(t * 2 * Math.PI * 0.3) * (1.5 * Math.PI / 180)

    // Roll — side-to-side lean (rotation around Z axis, phase offset)
    g.rotation.z = Math.sin(t * 2 * Math.PI * 0.5 + 0.8) * (0.7 * Math.PI / 180)
  })

  return <group ref={groupRef}>{children}</group>
}
