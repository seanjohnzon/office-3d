import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { CREW } from '../data/crewConfig'
import { STATE_COLOR, STATE_ABBR, STATE_LABEL, CHAR_CFG, AVATAR_MAP, HoverPortrait } from './VoxelCharacter'
import VoxelCharacter from './VoxelCharacter'

function Monitor({ agentColor, agentState, agentName }) {
  const monitorGlow = agentState === 'working' ? 1.0 : agentState === 'thinking' ? 0.5 : agentState === 'offline' ? 0 : 0.12
  const hudLabel = agentName ? `${agentName.toUpperCase().slice(0,4)} | ${STATE_ABBR[agentState] || 'IDL'}` : ''
  return (
    <group position={[0,0.77,-0.28]}>
      <mesh castShadow><boxGeometry args={[0.88,0.52,0.05]} /><meshStandardMaterial color="#0A0A12" /></mesh>
      <mesh position={[0,0,0.03]}><boxGeometry args={[0.76,0.42,0.01]} /><meshStandardMaterial color={agentState === 'offline' ? '#111' : '#001a33'} emissive={agentColor} emissiveIntensity={monitorGlow} /></mesh>
      <mesh position={[0,-0.35,0.03]}><boxGeometry args={[0.07,0.16,0.07]} /><meshStandardMaterial color="#222" /></mesh>
      <mesh position={[0,-0.44,0.06]}><boxGeometry args={[0.24,0.03,0.16]} /><meshStandardMaterial color="#222" /></mesh>
      {agentName && agentState !== 'offline' && (
        <Text
          position={[0, 0.04, 0.06]}
          fontSize={0.07}
          color={agentColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.008}
          outlineColor="#000020"
          renderOrder={5}
        >
          {hudLabel}
        </Text>
      )}
    </group>
  )
}

function Chair() {
  return (
    <group position={[0,0,0.75]}>
      <mesh position={[0,0.42,0]} castShadow><boxGeometry args={[0.55,0.07,0.55]} /><meshStandardMaterial color="#1A1A2E" /></mesh>
      <mesh position={[0,0.72,-0.25]} castShadow><boxGeometry args={[0.55,0.5,0.07]} /><meshStandardMaterial color="#1A1A2E" /></mesh>
      {[[-0.24,0.19,0.22],[0.24,0.19,0.22],[-0.24,0.19,-0.22],[0.24,0.19,-0.22]].map(([lx,ly,lz],i) => (
        <mesh key={i} position={[lx,ly,lz]}><boxGeometry args={[0.05,0.38,0.05]} /><meshStandardMaterial color="#111122" /></mesh>
      ))}
    </group>
  )
}

function Desk({ agentColor, agentState, agentName }) {
  return (
    <group>
      <RoundedBox args={[2.0,0.09,1.0]} radius={0.04} position={[0,0.72,0]} castShadow receiveShadow>
        <meshStandardMaterial color="#7A5C1E" roughness={0.4} metalness={0.1} />
      </RoundedBox>
      {[[-0.88,0.35,-0.42],[0.88,0.35,-0.42],[-0.88,0.35,0.42],[0.88,0.35,0.42]].map(([lx,ly,lz],i) => (
        <mesh key={i} position={[lx,ly,lz]} castShadow>
          <boxGeometry args={[0.06,0.70,0.06]} />
          <meshStandardMaterial color="#5A3E0A" />
        </mesh>
      ))}
      <Chair />
      <Monitor agentColor={agentColor} agentState={agentState} agentName={agentName} />
      <mesh position={[0,0.775,0.12]} receiveShadow><boxGeometry args={[0.55,0.02,0.18]} /><meshStandardMaterial color="#222233" /></mesh>
      <mesh position={[0,0.775,0.51]}><boxGeometry args={[2.0,0.03,0.02]} /><meshStandardMaterial color={agentColor} emissive={agentColor} emissiveIntensity={2.5} /></mesh>
    </group>
  )
}

const PATROL_WAYPOINTS = [
  [0,   0, 1.1],
  [-0.7, 0, 1.5],
  [0.7,  0, 1.5],
]
const WALK_SPEED = 0.55
const WAIT_MIN   = 1.2
const WAIT_RANGE = 1.4

export default function DeskGroup({ agent, agentState, onClick }) {
  const [hovered, setHovered] = useState(false)
  const charGroupRef = useRef()
  const ringMatRef = useRef()
  const avatarUrl = AVATAR_MAP[agent.name]
  const ringPhase = useRef(Math.random() * Math.PI * 2)

  const patrol = useRef({
    wpIdx: 0,
    nextWp: 1,
    progress: 0,
    waiting: true,
    waitLeft: WAIT_MIN + Math.random() * WAIT_RANGE,
    walkPhase: 0,
    facing: Math.PI,
  })
  const tgtPos = useRef(new THREE.Vector3())
  const tgtFacing = useRef(Math.PI)
  const bobOffset = useRef(0)
  const bobDir = useRef(1)

  const isSitting = agentState === 'working' || agentState === 'thinking'
  const [px, , pz] = agent.position

  useFrame((_, dt) => {
    if (!charGroupRef.current) return
    const g = charGroupRef.current
    const p = patrol.current

    if (isSitting) {
      tgtPos.current.set(px, 0, pz + 0.68)
      tgtFacing.current = Math.PI
      p.walkPhase = 0

      if (agentState === 'thinking') {
        bobOffset.current += dt * 2.4 * bobDir.current
        if (bobOffset.current > 0.06) bobDir.current = -1
        if (bobOffset.current < 0)   bobDir.current =  1
      } else {
        bobOffset.current = 0
        bobDir.current = 1
      }
    } else {
      bobOffset.current = 0

      if (agentState === 'offline' || agentState === 'standby') {
        tgtPos.current.set(px, 0, pz + 1.1)
        tgtFacing.current = Math.PI
        p.walkPhase = 0
      } else {
        if (p.waiting) {
          p.waitLeft -= dt
          if (p.waitLeft <= 0) { p.waiting = false; p.progress = 0 }
          p.walkPhase = 0
        } else {
          const from = PATROL_WAYPOINTS[p.wpIdx]
          const to   = PATROL_WAYPOINTS[p.nextWp]
          const dx = to[0] - from[0]
          const dz = to[2] - from[2]
          const dist = Math.sqrt(dx*dx + dz*dz) || 0.001
          p.progress = Math.min(1, p.progress + (WALK_SPEED * dt) / dist)
          p.walkPhase += dt * 6.5

          const cx = px + from[0] + dx * p.progress
          const cz = pz + from[2] + dz * p.progress
          tgtPos.current.set(cx, 0, cz)
          tgtFacing.current = Math.atan2(dx, dz)

          if (p.progress >= 1) {
            p.wpIdx = p.nextWp
            p.nextWp = (p.nextWp + 1) % PATROL_WAYPOINTS.length
            p.waiting = true
            p.waitLeft = WAIT_MIN + Math.random() * WAIT_RANGE
          }
        }
      }
    }

    g.position.lerp(tgtPos.current, 0.08)
    const df = tgtFacing.current - g.rotation.y
    const dn = ((df + Math.PI) % (Math.PI * 2)) - Math.PI
    g.rotation.y += dn * 0.08

    // Animate floor ring pulse
    if (ringMatRef.current) {
      ringPhase.current += dt * (agentState === 'working' ? 3.0 : agentState === 'thinking' ? 5.0 : 1.2)
      const pulse = 0.3 + 0.3 * Math.sin(ringPhase.current)
      ringMatRef.current.opacity = agentState === 'offline' ? 0.08 : pulse
    }
  })

  const initPos = [px, 0, pz + 1.1]

  return (
    <>
      {/* Fixed desk */}
      <group position={[px, 0, pz]}>
        <Desk agentColor={agent.color} agentState={agentState} agentName={agent.name} />
      </group>

      {/* Animated character group */}
      <group
        ref={charGroupRef}
        position={initPos}
        rotation={[0, Math.PI, 0]}
        onPointerEnter={e => { e.stopPropagation(); setHovered(true) }}
        onPointerLeave={() => setHovered(false)}
        onClick={e => { e.stopPropagation(); onClick() }}
      >
        {/* Floor glow ring — pulses at state-dependent speed */}
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
          <ringGeometry args={[0.30, 0.44, 32]} />
          <meshBasicMaterial ref={ringMatRef} color={STATE_COLOR[agentState] || '#555'} transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>

        {/* The voxel character body */}
        <VoxelCharacter
          name={agent.name}
          isSitting={isSitting}
          walkPhase={patrol.current.walkPhase}
          bobY={bobOffset.current}
        />

        {/* Hover portrait (anime) */}
        {avatarUrl && (
          <HoverPortrait
            avatarUrl={avatarUrl}
            agentName={agent.name}
            agentState={agentState}
            hovered={hovered}
          />
        )}

        {/* Name tag above head */}
        <Text
          position={[0, 1.70, 0]}
          fontSize={0.17}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
          renderOrder={10}
        >
          {agent.name}
        </Text>
      </group>
    </>
  )
}
