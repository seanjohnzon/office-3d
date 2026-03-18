import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CREW } from '../data/crewConfig'
import { StatusContext } from '../data/StatusContext'

export default function TaskFlowParticles() {
  const statuses = React.useContext(StatusContext)
  const maxParticles = 40
  const particles = useRef(
    Array.from({ length: maxParticles }, () => ({ active: false, t: 0, from: [0,0,0], to: [0,0,0], color: '#4488FF', duration: 3 }))
  )
  const meshRefs = useRef([])
  const spawnTimers = useRef({})

  function deskPos(agent) {
    return [agent.position[0], 1.1, agent.position[2]]
  }

  useFrame((_, dt) => {
    const workingAgents = CREW.filter(a => {
      const st = statuses.find(s => s.name === a.name)?.state || 'idle'
      return st === 'working' || st === 'thinking'
    })

    workingAgents.forEach(agent => {
      if (spawnTimers.current[agent.name] === undefined) spawnTimers.current[agent.name] = Math.random() * 3
      spawnTimers.current[agent.name] -= dt
      if (spawnTimers.current[agent.name] <= 0) {
        const slot = particles.current.findIndex(p => !p.active)
        if (slot !== -1 && workingAgents.length > 1) {
          const targets = workingAgents.filter(a => a.name !== agent.name)
          const target = targets[Math.floor(Math.random() * targets.length)]
          const p = particles.current[slot]
          p.active = true
          p.t = 0
          p.from = deskPos(agent)
          p.to = deskPos(target)
          p.color = agent.color
          p.duration = 2.5 + Math.random() * 1.5
        }
        spawnTimers.current[agent.name] = 3 + Math.random() * 2
      }
    })

    particles.current.forEach((p, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      if (!p.active) {
        mesh.visible = false
        return
      }
      p.t += dt / p.duration
      if (p.t >= 1) {
        p.active = false
        mesh.visible = false
        return
      }
      mesh.visible = true
      const lx = p.from[0] + (p.to[0] - p.from[0]) * p.t
      const lz = p.from[2] + (p.to[2] - p.from[2]) * p.t
      const ly = p.from[1] + (p.to[1] - p.from[1]) * p.t + Math.sin(p.t * Math.PI) * 1.8
      mesh.position.set(lx, ly, lz)
      const opacity = p.t < 0.75 ? 1.0 : 1.0 - (p.t - 0.75) / 0.25
      if (mesh.material) {
        mesh.material.color.set(p.color)
        mesh.material.emissive.set(p.color)
        mesh.material.opacity = opacity * 0.9
        mesh.material.emissiveIntensity = opacity * 1.5
      }
    })
  })

  return (
    <>
      {Array.from({ length: maxParticles }, (_, i) => (
        <mesh key={i} ref={el => { meshRefs.current[i] = el }} visible={false}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial
            color={particles.current[i]?.color || '#4488FF'}
            emissive={particles.current[i]?.color || '#4488FF'}
            emissiveIntensity={1.5}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </>
  )
}
