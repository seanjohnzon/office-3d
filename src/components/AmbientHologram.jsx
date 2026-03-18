import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CREW } from '../data/crewConfig'
import { StatusContext } from '../data/StatusContext'

export default function AmbientHologram({ confTablePos }) {
  const statuses = React.useContext(StatusContext)
  const count = 18
  const refs = useRef([])
  const offsets = useRef(Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2,
    phase: Math.random() * Math.PI * 2,
    radius: 0.2 + Math.random() * 0.5,
    speed: 0.3 + Math.random() * 0.3,
    color: i % 2 === 0 ? '#5533FF' : '#AA44FF',
  })))

  useFrame(({ clock }) => {
    const anyWorking = CREW.some(a => {
      const st = statuses.find(s => s.name === a.name)?.state || 'idle'
      return st === 'working' || st === 'thinking'
    })
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      mesh.visible = !anyWorking
      if (!anyWorking) {
        const o = offsets.current[i]
        const t = clock.elapsedTime * o.speed + o.phase
        const angle = o.angle + clock.elapsedTime * 0.4
        const x = confTablePos[0] + Math.cos(angle) * o.radius * 0.6
        const z = confTablePos[2] + Math.sin(angle) * o.radius * 0.6
        const y = confTablePos[1] + 0.7 + ((t % (Math.PI * 2)) / (Math.PI * 2)) * 2.2
        mesh.position.set(x, y, z)
        if (mesh.material) {
          const fadeTop = Math.min(1, (2.2 - (y - confTablePos[1] - 0.7)) / 1.0)
          mesh.material.opacity = Math.max(0, fadeTop * 0.7)
        }
      }
    })
  })

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el }} visible={false}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial
            color={offsets.current[i].color}
            emissive={offsets.current[i].color}
            emissiveIntensity={2.0}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </>
  )
}
