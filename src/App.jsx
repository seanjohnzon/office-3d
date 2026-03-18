import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox, Stars, Html } from '@react-three/drei'
import * as THREE from 'three'
import { CREW } from './data/crewConfig'
import useGatewayStatus from './data/useGatewayStatus'

// ?????? Portrait avatars (anime) ??? HUD bar + hover cards only ??????????????????????????????????????????????????????
import namiAvatar    from './assets/avatars/nami.png'
import frankyAvatar  from './assets/avatars/franky.png'
import chopperAvatar from './assets/avatars/chopper.png'
import robinAvatar   from './assets/avatars/robin.png'
import brookAvatar   from './assets/avatars/brook.png'
import sanjiAvatar   from './assets/avatars/sanji-3d.png'
import usoppAvatar   from './assets/avatars/usopp-3d.png'

const AVATAR_MAP = { Nami: namiAvatar, Franky: frankyAvatar, Chopper: chopperAvatar, Robin: robinAvatar, Brook: brookAvatar, Sanji: sanjiAvatar, Usopp: usoppAvatar }
const STATE_COLOR = { idle: '#44DD77', working: '#4488FF', thinking: '#FFCC00', offline: '#555566', standby: '#AA8833' }
const STATE_LABEL = { idle: 'Idle', working: 'Working', thinking: 'Thinking', offline: 'Offline', standby: 'Standby' }
const STATE_ABBR  = { idle: 'IDL', working: 'WRK', thinking: 'THK', offline: 'OFF', standby: 'SBY' }

// ══ Status context — passes live gateway data into Canvas ════════════════
const StatusContext = React.createContext([])

// ?????? Voxel character configs ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
const CHAR_CFG = {
  Nami: {
    scale: 1.0,
    skinColor: '#F4C28C', hairColor: '#E86000',
    topColor: '#E86000',  pantsColor: '#2255BB', shoeColor: '#2A1A0A',
    extras: [
      // Clima-Tact: thin orange staff at right side
      { type: 'box', size: [0.04, 0.55, 0.04], pos: [0.32, 0.72, 0], color: '#FF8C00' },
    ],
    hairShape: 'block', // orange block hair
  },
  Franky: {
    scale: 1.06,
    skinColor: '#F4C28C', hairColor: '#1875D1',
    topColor: '#A8B0B8',  pantsColor: '#2A3A4A', shoeColor: '#1A1A1A',
    extras: [
      // Silver chest plate detail
      { type: 'box', size: [0.28, 0.32, 0.04], pos: [0, 0.64, 0.10], color: '#C8D0D8' },
      // Gold star on chest
      { type: 'box', size: [0.10, 0.10, 0.05], pos: [0, 0.68, 0.12], color: '#FFD700' },
    ],
    hairShape: 'pompadour',
  },
  Chopper: {
    scale: 0.75,
    skinColor: '#8B5A2B', hairColor: '#FF69B4',   // brown body, pink hat
    topColor: '#8B5A2B',  pantsColor: '#6B3A1A', shoeColor: '#3A1A00',
    extras: [
      // Antler left
      { type: 'box', size: [0.05, 0.22, 0.04], pos: [-0.12, 1.28, 0], color: '#7B4A10', rot: [0,0,0.35] },
      { type: 'box', size: [0.05, 0.12, 0.04], pos: [-0.20, 1.42, 0], color: '#7B4A10', rot: [0,0,0.7] },
      // Antler right
      { type: 'box', size: [0.05, 0.22, 0.04], pos: [0.12, 1.28, 0], color: '#7B4A10', rot: [0,0,-0.35] },
      { type: 'box', size: [0.05, 0.12, 0.04], pos: [0.20, 1.42, 0], color: '#7B4A10', rot: [0,0,-0.7] },
      // Blue nose dot
      { type: 'box', size: [0.08, 0.06, 0.04], pos: [0, 1.02, 0.14], color: '#4169E1' },
    ],
    hairShape: 'chopperHat',
  },
  Robin: {
    scale: 1.0,
    skinColor: '#D4A574', hairColor: '#1A1A1A',
    topColor: '#7B52AB',  pantsColor: '#4A3060', shoeColor: '#1A0A20',
    extras: [
      // Book in left hand area
      { type: 'box', size: [0.14, 0.18, 0.04], pos: [-0.26, 0.58, 0.08], color: '#8B4513' },
      { type: 'box', size: [0.12, 0.16, 0.02], pos: [-0.26, 0.58, 0.11], color: '#F5F0E8' },
    ],
    hairShape: 'darkLong',
  },
  Brook: {
    scale: 1.07,
    skinColor: '#EAEAEA', hairColor: '#111111',   // white skull, black afro
    topColor: '#111111',  pantsColor: '#0A0A0A', shoeColor: '#050505',
    extras: [],
    hairShape: 'afroHat', // afro sphere + top hat
    skullFace: true,
  },
  Sanji: {
    scale: 1.02,
    skinColor: '#F4C28C', hairColor: '#C8A800',   // blonde
    topColor: '#111111',  pantsColor: '#1A1A2A', shoeColor: '#050505',
    extras: [
      // Cigarette in mouth area
      { type: 'box', size: [0.14, 0.03, 0.03], pos: [0.10, 1.04, 0.13], color: '#F5F5DC' },
      { type: 'box', size: [0.03, 0.03, 0.03], pos: [0.22, 1.04, 0.13], color: '#FF4400' },
      // Suit lapel detail
      { type: 'box', size: [0.08, 0.18, 0.04], pos: [-0.06, 0.68, 0.11], color: '#222230' },
      { type: 'box', size: [0.08, 0.18, 0.04], pos: [0.06, 0.68, 0.11], color: '#222230' },
    ],
    hairShape: 'sideSwept',
  },
  Usopp: {
    scale: 0.98,
    skinColor: '#8B6914', hairColor: '#1A0A00',   // dark brown
    topColor: '#8B4513',  pantsColor: '#556B2F', shoeColor: '#2A1A00',
    extras: [
      // Long nose — signature sniperking
      { type: 'box', size: [0.06, 0.06, 0.36], pos: [0, 1.02, 0.22], color: '#8B6914' },
      // Goggles on head
      { type: 'box', size: [0.28, 0.10, 0.08], pos: [0, 1.12, 0.09], color: '#2A4A2A' },
      { type: 'box', size: [0.10, 0.06, 0.04], pos: [-0.12, 1.12, 0.12], color: '#4A8A4A' },
      { type: 'box', size: [0.10, 0.06, 0.04], pos: [0.12, 1.12, 0.12], color: '#4A8A4A' },
    ],
    hairShape: 'curlyAfro',
  },
}

// ?????? Voxel humanoid character ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function VoxelCharacter({ name, isSitting, walkPhase, bobY }) {
  const cfg = CHAR_CFG[name] || CHAR_CFG.Nami

  // Sitting vs standing body-part offsets
  // Root of this component is at floor-level (y=0)
  const torsoY = isSitting ? 0.64 : 0.62
  const headY  = isSitting ? 0.98 : 0.96
  const armY   = isSitting ? 0.56 : 0.54
  const armFwd = isSitting ? 0.10 : 0

  // Arm swing (walking animation, zero when sitting)
  const aSwing = isSitting ? 0 : Math.sin(walkPhase) * 0.45
  const lSwing = isSitting ? 0 : Math.sin(walkPhase + Math.PI) * 0.40

  return (
    <group scale={[cfg.scale, cfg.scale, cfg.scale]} position={[0, bobY / cfg.scale, 0]}>

      {/* ?????? Legs ????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
      {isSitting ? (
        // Sitting: thighs horizontal forward, lower legs vertical
        <>
          {/* Right thigh */}
          <mesh position={[0.08, 0.38, 0.22]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <boxGeometry args={[0.12, 0.38, 0.13]} />
            <meshStandardMaterial color={cfg.pantsColor} />
          </mesh>
          {/* Right lower leg */}
          <mesh position={[0.08, 0.18, 0.42]} castShadow>
            <boxGeometry args={[0.11, 0.36, 0.13]} />
            <meshStandardMaterial color={cfg.pantsColor} />
          </mesh>
          {/* Left thigh */}
          <mesh position={[-0.08, 0.38, 0.22]} rotation={[Math.PI/2, 0, 0]} castShadow>
            <boxGeometry args={[0.12, 0.38, 0.13]} />
            <meshStandardMaterial color={cfg.pantsColor} />
          </mesh>
          {/* Left lower leg */}
          <mesh position={[-0.08, 0.18, 0.42]} castShadow>
            <boxGeometry args={[0.11, 0.36, 0.13]} />
            <meshStandardMaterial color={cfg.pantsColor} />
          </mesh>
          {/* Shoes */}
          <mesh position={[0.08, 0.04, 0.43]} castShadow>
            <boxGeometry args={[0.13, 0.09, 0.17]} />
            <meshStandardMaterial color={cfg.shoeColor} />
          </mesh>
          <mesh position={[-0.08, 0.04, 0.43]} castShadow>
            <boxGeometry args={[0.13, 0.09, 0.17]} />
            <meshStandardMaterial color={cfg.shoeColor} />
          </mesh>
        </>
      ) : (
        // Standing: legs swing when walking
        <>
          <group position={[0.08, 0.20, 0]} rotation={[lSwing, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.40, 0.13]} />
              <meshStandardMaterial color={cfg.pantsColor} />
            </mesh>
            <mesh position={[0, -0.26, 0.02]} castShadow>
              <boxGeometry args={[0.13, 0.09, 0.17]} />
              <meshStandardMaterial color={cfg.shoeColor} />
            </mesh>
          </group>
          <group position={[-0.08, 0.20, 0]} rotation={[-lSwing, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.12, 0.40, 0.13]} />
              <meshStandardMaterial color={cfg.pantsColor} />
            </mesh>
            <mesh position={[0, -0.26, 0.02]} castShadow>
              <boxGeometry args={[0.13, 0.09, 0.17]} />
              <meshStandardMaterial color={cfg.shoeColor} />
            </mesh>
          </group>
        </>
      )}

      {/* ?????? Torso ?????????????????????????????????????????????????????????????????????????????????????????????????????? */}
      <mesh position={[0, torsoY, 0]} castShadow>
        <boxGeometry args={[0.32, 0.44, name === 'Franky' ? 0.22 : 0.18]} />
        <meshStandardMaterial color={cfg.topColor} roughness={0.7} />
      </mesh>

      {/* ?????? Arms ????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
      <group position={[0.22, armY, armFwd]} rotation={[-aSwing, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.11, 0.38, 0.12]} />
          <meshStandardMaterial color={cfg.skinColor} />
        </mesh>
      </group>
      <group position={[-0.22, armY, armFwd]} rotation={[aSwing, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.11, 0.38, 0.12]} />
          <meshStandardMaterial color={cfg.skinColor} />
        </mesh>
      </group>

      {/* ?????? Head ????????????????????????????????????????????????????????????????????????????????????????????????????????? */}
      <mesh position={[0, headY, 0]} castShadow>
        <boxGeometry args={[0.26, 0.26, 0.24]} />
        <meshStandardMaterial color={cfg.skinColor} roughness={0.6} />
      </mesh>

      {/* Brook skull eye sockets */}
      {cfg.skullFace && (
        <>
          <mesh position={[0.07, headY + 0.02, 0.13]}>
            <boxGeometry args={[0.06, 0.07, 0.02]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <mesh position={[-0.07, headY + 0.02, 0.13]}>
            <boxGeometry args={[0.06, 0.07, 0.02]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        </>
      )}

      {/* ?????? Hair / Head accessories ??????????????????????????????????????????????????? */}
      {cfg.hairShape === 'block' && (
        <mesh position={[0, headY + 0.18, -0.02]} castShadow>
          <boxGeometry args={[0.28, 0.16, 0.24]} />
          <meshStandardMaterial color={cfg.hairColor} />
        </mesh>
      )}
      {cfg.hairShape === 'pompadour' && (
        // Franky's tall blue pompadour
        <>
          <mesh position={[0, headY + 0.22, 0]} castShadow>
            <boxGeometry args={[0.22, 0.28, 0.20]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
          <mesh position={[0, headY + 0.36, 0]} castShadow>
            <boxGeometry args={[0.16, 0.14, 0.16]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
        </>
      )}
      {cfg.hairShape === 'chopperHat' && (
        // Chopper pink hat with cross
        <>
          <mesh position={[0, headY + 0.15, 0]} castShadow>
            <boxGeometry args={[0.30, 0.20, 0.28]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
          {/* Brim */}
          <mesh position={[0, headY + 0.06, 0]} castShadow>
            <boxGeometry args={[0.38, 0.05, 0.36]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
          {/* Cross vertical */}
          <mesh position={[0, headY + 0.18, 0.15]}>
            <boxGeometry args={[0.04, 0.16, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3} />
          </mesh>
          {/* Cross horizontal */}
          <mesh position={[0, headY + 0.22, 0.15]}>
            <boxGeometry args={[0.12, 0.04, 0.02]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3} />
          </mesh>
        </>
      )}
      {cfg.hairShape === 'darkLong' && (
        // Robin's dark elegant hair
        <>
          <mesh position={[0, headY + 0.14, -0.04]} castShadow>
            <boxGeometry args={[0.28, 0.14, 0.20]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
          {/* Side hair strands */}
          <mesh position={[0.14, headY - 0.02, -0.02]} castShadow>
            <boxGeometry args={[0.06, 0.22, 0.14]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
          <mesh position={[-0.14, headY - 0.02, -0.02]} castShadow>
            <boxGeometry args={[0.06, 0.22, 0.14]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
        </>
      )}
      {cfg.hairShape === 'afroHat' && (
        // Brook: dark sphere afro + tall top hat
        <>
          {/* Afro sphere (spec-approved exception) */}
          <mesh position={[0, headY + 0.08, 0]} castShadow>
            <sphereGeometry args={[0.22, 10, 10]} />
            <meshStandardMaterial color="#111" roughness={0.9} />
          </mesh>
          {/* Hat brim */}
          <mesh position={[0, headY + 0.30, 0]} castShadow>
            <boxGeometry args={[0.38, 0.05, 0.36]} />
            <meshStandardMaterial color="#0A0A0A" />
          </mesh>
          {/* Hat cylinder */}
          <mesh position={[0, headY + 0.52, 0]} castShadow>
            <boxGeometry args={[0.24, 0.44, 0.22]} />
            <meshStandardMaterial color="#0A0A0A" />
          </mesh>
          {/* Hat top */}
          <mesh position={[0, headY + 0.75, 0]} castShadow>
            <boxGeometry args={[0.26, 0.05, 0.24]} />
            <meshStandardMaterial color="#0A0A0A" />
          </mesh>
        </>
      )}
      {cfg.hairShape === 'sideSwept' && (
        // Sanji: blonde side-swept bang covering one eye
        <>
          {/* Base hair top */}
          <mesh position={[0, headY + 0.14, -0.02]} castShadow>
            <boxGeometry args={[0.28, 0.12, 0.22]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
          {/* Side-swept bang — left side, angled forward */}
          <mesh position={[-0.10, headY + 0.06, 0.08]} rotation={[0, 0, 0.5]} castShadow>
            <boxGeometry args={[0.16, 0.22, 0.14]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
        </>
      )}
      {cfg.hairShape === 'curlyAfro' && (
        // Usopp: big dark curly afro
        <>
          {/* Main afro mass */}
          <mesh position={[0, headY + 0.16, 0]} castShadow>
            <boxGeometry args={[0.36, 0.24, 0.34]} />
            <meshStandardMaterial color={cfg.hairColor} roughness={0.95} />
          </mesh>
          {/* Bumpy top */}
          <mesh position={[-0.10, headY + 0.28, 0.04]} castShadow>
            <boxGeometry args={[0.14, 0.12, 0.14]} />
            <meshStandardMaterial color={cfg.hairColor} roughness={0.95} />
          </mesh>
          <mesh position={[0.10, headY + 0.30, -0.04]} castShadow>
            <boxGeometry args={[0.14, 0.14, 0.14]} />
            <meshStandardMaterial color={cfg.hairColor} roughness={0.95} />
          </mesh>
          {/* Wide sides */}
          <mesh position={[0.18, headY + 0.08, 0]} castShadow>
            <boxGeometry args={[0.08, 0.20, 0.26]} />
            <meshStandardMaterial color={cfg.hairColor} roughness={0.95} />
          </mesh>
          <mesh position={[-0.18, headY + 0.08, 0]} castShadow>
            <boxGeometry args={[0.08, 0.20, 0.26]} />
            <meshStandardMaterial color={cfg.hairColor} roughness={0.95} />
          </mesh>
        </>
      )}

      {/* ?????? Character-specific extras ????????????????????????????????????????????? */}
      {cfg.extras.map((e, i) => (
        <mesh key={i} position={e.pos} rotation={e.rot || [0,0,0]} castShadow>
          <boxGeometry args={e.size} />
          <meshStandardMaterial color={e.color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// ?????? Hover portrait card ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function HoverPortrait({ avatarUrl, agentName, agentState, hovered }) {
  const dotColor = STATE_COLOR[agentState] || '#555566'
  return (
    <Html position={[0, 2.1, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
      <div style={{ opacity: hovered ? 1 : 0, transition: 'opacity 200ms ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <div style={{ position: 'relative', width: '88px', height: '88px' }}>
          <div style={{ position: 'absolute', inset: '-4px', borderRadius: '50%', border: `3px solid ${dotColor}`, boxShadow: `0 0 14px ${dotColor}88` }} />
          <img src={avatarUrl} alt={agentName} style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ background: 'rgba(8,12,28,0.9)', border: `1px solid ${dotColor}55`, borderRadius: '20px', padding: '3px 12px', fontFamily: 'monospace', fontSize: '11px', color: '#EEE', whiteSpace: 'nowrap' }}>
          <span style={{ fontWeight: 'bold' }}>{agentName}</span>
          <span style={{ color: dotColor, marginLeft: '6px' }}>??? {STATE_LABEL[agentState] || 'Idle'}</span>
        </div>
      </div>
    </Html>
  )
}

// ?????? Desk geometry ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function Desk({ agentColor, agentState, agentName }) {
  const monitorGlow = agentState === 'working' ? 1.0 : agentState === 'thinking' ? 0.5 : agentState === 'offline' ? 0 : 0.12
  const hudLabel = agentName ? `${agentName.toUpperCase().slice(0,4)} | ${STATE_ABBR[agentState] || 'IDL'}` : ''
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
      {/* Chair */}
      <group position={[0,0,0.75]}>
        <mesh position={[0,0.42,0]} castShadow><boxGeometry args={[0.55,0.07,0.55]} /><meshStandardMaterial color="#1A1A2E" /></mesh>
        <mesh position={[0,0.72,-0.25]} castShadow><boxGeometry args={[0.55,0.5,0.07]} /><meshStandardMaterial color="#1A1A2E" /></mesh>
        {[[-0.24,0.19,0.22],[0.24,0.19,0.22],[-0.24,0.19,-0.22],[0.24,0.19,-0.22]].map(([lx,ly,lz],i) => (
          <mesh key={i} position={[lx,ly,lz]}><boxGeometry args={[0.05,0.38,0.05]} /><meshStandardMaterial color="#111122" /></mesh>
        ))}
      </group>
      {/* Monitor */}
      <group position={[0,0.77,-0.28]}>
        <mesh castShadow><boxGeometry args={[0.88,0.52,0.05]} /><meshStandardMaterial color="#0A0A12" /></mesh>
        <mesh position={[0,0,0.03]}><boxGeometry args={[0.76,0.42,0.01]} /><meshStandardMaterial color={agentState === 'offline' ? '#111' : '#001a33'} emissive={agentColor} emissiveIntensity={monitorGlow} /></mesh>
        <mesh position={[0,-0.35,0.03]}><boxGeometry args={[0.07,0.16,0.07]} /><meshStandardMaterial color="#222" /></mesh>
        <mesh position={[0,-0.44,0.06]}><boxGeometry args={[0.24,0.03,0.16]} /><meshStandardMaterial color="#222" /></mesh>
        {/* Monitor HUD text */}
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
      <mesh position={[0,0.775,0.12]} receiveShadow><boxGeometry args={[0.55,0.02,0.18]} /><meshStandardMaterial color="#222233" /></mesh>
      <mesh position={[0,0.775,0.51]}><boxGeometry args={[2.0,0.03,0.02]} /><meshStandardMaterial color={agentColor} emissive={agentColor} emissiveIntensity={0.6} /></mesh>
    </group>
  )
}

// ?????? Agent station ??? character + patrol + hover ???????????????????????????????????????????????????????????????????????????????????????
const PATROL_WAYPOINTS = [
  [0,   0, 1.1],
  [-0.7, 0, 1.5],
  [0.7,  0, 1.5],
]
const WALK_SPEED = 0.55      // units/sec
const WAIT_MIN   = 1.2
const WAIT_RANGE = 1.4

function AgentStation({ agent, agentState, onClick }) {
  const [hovered, setHovered] = useState(false)
  const charGroupRef = useRef()
  const avatarUrl = AVATAR_MAP[agent.name]

  // Patrol state (mutable, no re-render needed)
  const patrol = useRef({
    wpIdx: 0,
    nextWp: 1,
    progress: 0,
    waiting: true,
    waitLeft: WAIT_MIN + Math.random() * WAIT_RANGE,
    walkPhase: 0,
    facing: Math.PI, // default face away from camera (toward desk/monitor)
  })
  // Lerp target
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
      // Snap to desk sitting position
      tgtPos.current.set(px, 0, pz + 0.68)
      tgtFacing.current = Math.PI
      p.walkPhase = 0

      // Thinking bob
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
        // Stand still in front of desk
        tgtPos.current.set(px, 0, pz + 1.1)
        tgtFacing.current = Math.PI
        p.walkPhase = 0
      } else {
        // Idle patrol
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

    // Smoothly lerp position and facing
    g.position.lerp(tgtPos.current, 0.08)
    const df = tgtFacing.current - g.rotation.y
    // Normalize angle diff
    const dn = ((df + Math.PI) % (Math.PI * 2)) - Math.PI
    g.rotation.y += dn * 0.08
  })

  // Set initial position to avoid teleport on first frame
  const initPos = [px, 0, pz + 1.1]

  return (
    <>
      {/* Fixed desk ??? always at agent base position */}
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
        {/* Floor glow ring */}
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
          <ringGeometry args={[0.30, 0.44, 32]} />
          <meshBasicMaterial color={STATE_COLOR[agentState] || '#555'} transparent opacity={0.55} side={THREE.DoubleSide} />
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

// ?????? Office scenery ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function CosmicBackdrop() {
  return (
    <>
      <mesh position={[14, -10, -18]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshStandardMaterial color="#1B2A4A" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[14, -10, -18]} rotation={[0.3, 0, 0.2]}>
        <torusGeometry args={[14, 0.35, 8, 64]} />
        <meshStandardMaterial color="#2A3D6A" roughness={1} />
      </mesh>
      <mesh position={[-12, 8, -20]}>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshStandardMaterial color="#2E3A5A" roughness={1} />
      </mesh>
    </>
  )
}

function OfficeShell() {
  const fc = '#E8DCC8', wc = '#D4C9B4', tc = '#B8A898'
  return (
    <group>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,0]} receiveShadow>
        <planeGeometry args={[14,12]} /><meshStandardMaterial color={fc} roughness={0.8} />
      </mesh>
      {[-6,-4,-2,0,2,4,6].map(x=>(<mesh key={`fx${x}`} rotation={[-Math.PI/2,0,0]} position={[x,0.002,0]}><planeGeometry args={[0.04,12]}/><meshStandardMaterial color={tc}/></mesh>))}
      {[-5,-3,-1,1,3,5].map(z=>(<mesh key={`fz${z}`} rotation={[-Math.PI/2,0,0]} position={[0,0.002,z]}><planeGeometry args={[14,0.04]}/><meshStandardMaterial color={tc}/></mesh>))}
      <mesh position={[0,2.0,-6]} receiveShadow><planeGeometry args={[14,4]}/><meshStandardMaterial color={wc} roughness={0.85} side={THREE.FrontSide}/></mesh>
      <mesh position={[-7,2.0,0]} rotation={[0,Math.PI/2,0]} receiveShadow><planeGeometry args={[12,4]}/><meshStandardMaterial color={wc} roughness={0.85} side={THREE.FrontSide}/></mesh>
      <mesh position={[7,2.0,0]} rotation={[0,-Math.PI/2,0]} receiveShadow><planeGeometry args={[12,4]}/><meshStandardMaterial color={wc} roughness={0.85} side={THREE.FrontSide}/></mesh>
      <mesh position={[0,0.08,-5.96]}><boxGeometry args={[14,0.16,0.06]}/><meshStandardMaterial color={tc}/></mesh>
      <mesh position={[-6.96,0.08,0]}><boxGeometry args={[0.06,0.16,12]}/><meshStandardMaterial color={tc}/></mesh>
    </group>
  )
}

function ConfTable({ position }) {
  return (
    <group position={position}>
      <mesh position={[0,0.55,0]} castShadow receiveShadow><cylinderGeometry args={[0.9,0.9,0.08,32]}/><meshStandardMaterial color="#8B6914" roughness={0.5} metalness={0.1}/></mesh>
      <mesh position={[0,0.28,0]} castShadow><cylinderGeometry args={[0.07,0.12,0.56,12]}/><meshStandardMaterial color="#6B4F10" roughness={0.6}/></mesh>
      {[0,72,144,216,288].map((deg,i)=>{const r=1.25,a=(deg*Math.PI)/180;return(<group key={i} position={[Math.sin(a)*r,0,Math.cos(a)*r]} rotation={[0,-a,0]}><mesh position={[0,0.22,0]} castShadow><boxGeometry args={[0.38,0.06,0.38]}/><meshStandardMaterial color="#2a2a35"/></mesh><mesh position={[0,0.48,-0.17]} castShadow><boxGeometry args={[0.38,0.44,0.06]}/><meshStandardMaterial color="#2a2a35"/></mesh></group>)})}
    </group>
  )
}

function Bookshelf() {
  const books=['#E74C3C','#3498DB','#2ECC71','#F39C12','#9B59B6','#1ABC9C','#E67E22','#2980B9','#27AE60','#8E44AD']
  return(<group position={[-6.5,0,-2]}><mesh position={[0,1.0,0]} castShadow><boxGeometry args={[0.22,2.0,1.6]}/><meshStandardMaterial color="#7A5C1E" roughness={0.6}/></mesh>{books.map((c,i)=>(<mesh key={i} position={[0.02,0.25+Math.floor(i/5)*0.7+0.06,-0.6+(i%5)*0.26]} castShadow><boxGeometry args={[0.16,0.6,0.22]}/><meshStandardMaterial color={c} roughness={0.8}/></mesh>))}</group>)
}

function Plant({position}) {
  return(<group position={position}><mesh position={[0,0.2,0]} castShadow><cylinderGeometry args={[0.18,0.22,0.4,10]}/><meshStandardMaterial color="#C1440E" roughness={0.9}/></mesh><mesh position={[0,0.52,0]} castShadow><sphereGeometry args={[0.32,8,6]}/><meshStandardMaterial color="#2D7A2D" roughness={0.8}/></mesh><mesh position={[0.18,0.64,0.08]} castShadow><sphereGeometry args={[0.18,7,6]}/><meshStandardMaterial color="#3A9A3A" roughness={0.8}/></mesh></group>)
}

function Whiteboard() {
  return(<group position={[0,1.6,-5.88]}><mesh castShadow><boxGeometry args={[2.8,1.6,0.07]}/><meshStandardMaterial color="#5C3D1E" roughness={0.7}/></mesh><mesh position={[0,0,0.04]}><boxGeometry args={[2.6,1.44,0.02]}/><meshStandardMaterial color="#F5F2EC" roughness={0.9}/></mesh><Text position={[0,0.38,0.06]} fontSize={0.22} color="#1A1A2E" anchorX="center" fontWeight="bold">SPRINT 2 · LIVE</Text><Text position={[0,0.02,0.06]} fontSize={0.14} color="#444" anchorX="center">D2.5 Task Flow Active</Text><Text position={[0,-0.32,0.06]} fontSize={0.11} color="#777" anchorX="center">CREW-011 ✓  CREW-012 → QA</Text></group>)
}

// ══ Task Flow Particles — data packets flying between working agents ══════════════════
function TaskFlowParticles() {
  const statuses = React.useContext(StatusContext)
  const maxParticles = 40
  // Each particle: { active, t, from[3], to[3], color, duration }
  const particles = useRef(
    Array.from({ length: maxParticles }, () => ({ active: false, t: 0, from: [0,0,0], to: [0,0,0], color: '#4488FF', duration: 3 }))
  )
  const meshRefs = useRef([])
  const spawnTimers = useRef({}) // name -> time until next spawn

  // Get desk world position for an agent (desk surface height ~1.0)
  function deskPos(agent) {
    return [agent.position[0], 1.1, agent.position[2]]
  }

  useFrame((_, dt) => {
    const workingAgents = CREW.filter(a => {
      const st = statuses.find(s => s.name === a.name)?.state || 'idle'
      return st === 'working' || st === 'thinking'
    })

    // Tick spawn timers for working agents
    workingAgents.forEach(agent => {
      if (spawnTimers.current[agent.name] === undefined) spawnTimers.current[agent.name] = Math.random() * 3
      spawnTimers.current[agent.name] -= dt
      if (spawnTimers.current[agent.name] <= 0) {
        // Find a free particle slot
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

    // Animate active particles
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
      // Arc: lerp X/Z, add Y lift via sine
      const lx = p.from[0] + (p.to[0] - p.from[0]) * p.t
      const lz = p.from[2] + (p.to[2] - p.from[2]) * p.t
      const ly = p.from[1] + (p.to[1] - p.from[1]) * p.t + Math.sin(p.t * Math.PI) * 1.8
      mesh.position.set(lx, ly, lz)
      // Fade out near destination
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

// ══ Ambient Hologram — drifts up from conf table when nobody is working ══════════════
function AmbientHologram({ confTablePos }) {
  const statuses = React.useContext(StatusContext)
  const count = 18
  const refs = useRef([])
  // Stagger start offsets
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

// ══ Agent Detail Panel (HTML overlay) ═══════════════════════════════════════════════════
function AgentDetailPanel({ agent, status, onClose }) {
  const dotColor = STATE_COLOR[status?.state] || '#555566'
  const avatarUrl = AVATAR_MAP[agent.name]
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: '260px',
      background: 'rgba(8,18,32,0.96)',
      border: `1px solid ${agent.color}`,
      borderRadius: '12px',
      padding: '18px',
      fontFamily: "'Courier New', monospace",
      zIndex: 300,
      boxShadow: `0 0 18px ${agent.color}55, 0 0 4px ${agent.color}33`,
    }}>
      <button
        onClick={onClose}
        style={{ position:'absolute',top:'10px',right:'12px',background:'none',border:'none',color:'#889',fontSize:'18px',cursor:'pointer',lineHeight:1,padding:0 }}
      >×</button>
      {avatarUrl && (
        <div style={{ display:'flex',justifyContent:'center',marginBottom:'12px' }}>
          <img src={avatarUrl} alt={agent.name} style={{ width:'36px',height:'36px',borderRadius:'50%',objectFit:'cover',border:`2px solid ${agent.color}` }} />
        </div>
      )}
      <div style={{ color:agent.color,fontSize:'16px',fontWeight:'bold',marginBottom:'4px' }}>{agent.name}</div>
      <div style={{ color:'#889',fontSize:'11px',marginBottom:'12px' }}>{agent.role}</div>
      <div style={{ display:'flex',alignItems:'center',gap:'6px',marginBottom:'8px' }}>
        <div style={{ width:'8px',height:'8px',borderRadius:'50%',background:dotColor,boxShadow:`0 0 5px ${dotColor}`,flexShrink:0 }} />
        <span style={{ color:dotColor,fontSize:'12px' }}>{STATE_LABEL[status?.state] || 'Idle'}</span>
      </div>
      {status?.model && (
        <div style={{ color:'#557799',fontSize:'10px',marginBottom:'4px' }}>Model: {status.model}</div>
      )}
      {status?.outputTokens > 0 && (
        <div style={{ color:'#557799',fontSize:'10px' }}>Tokens: {status.outputTokens}</div>
      )}
    </div>
  )
}

// ?????? Top roster HUD ??? DO NOT TOUCH ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function RosterBar({ statuses }) {
  return (
    <div style={{ position:'fixed',top:0,left:0,right:0,height:'60px',background:'linear-gradient(135deg,#0D2137 0%,#1A2F4A 100%)',borderBottom:'1px solid rgba(100,160,255,0.25)',display:'flex',alignItems:'center',padding:'0 20px',gap:'16px',zIndex:200,fontFamily:"'Courier New',monospace",boxShadow:'0 2px 16px rgba(0,0,0,0.6)' }}>
      <div style={{ display:'flex',alignItems:'center',gap:'8px',marginRight:'10px' }}>
        <span style={{ fontSize:'22px' }}>???</span>
        <div>
          <div style={{ color:'#FFD700',fontWeight:'bold',fontSize:'13px',lineHeight:1.1 }}>STRAW HAT HQ</div>
          <div style={{ color:'#557799',fontSize:'10px' }}>Mission Control ?? Live</div>
        </div>
      </div>
      <div style={{ width:'1px',height:'36px',background:'rgba(100,160,255,0.2)' }} />
      {CREW.map(agent=>{
        const st=statuses.find(s=>s.name===agent.name)||{state:'idle'}
        const dotColor=STATE_COLOR[st.state]||'#555'
        const av=AVATAR_MAP[agent.name]
        return(
          <div key={agent.name} style={{ display:'flex',alignItems:'center',gap:'10px',background:'rgba(255,255,255,0.04)',border:`1px solid ${agent.color}33`,borderRadius:'10px',padding:'5px 14px 5px 6px' }}>
            <div style={{ position:'relative',width:'36px',height:'36px',flexShrink:0 }}>
              <div style={{ position:'absolute',inset:'-3px',borderRadius:'50%',border:`2.5px solid ${dotColor}`,boxShadow:`0 0 8px ${dotColor}88`,zIndex:1 }} />
              {av?<img src={av} alt={agent.name} style={{ width:'36px',height:'36px',borderRadius:'50%',objectFit:'cover',display:'block' }}/>:
                <div style={{ width:'36px',height:'36px',borderRadius:'50%',background:agent.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'bold',color:'#000' }}>{agent.name[0]}</div>}
            </div>
            <div>
              <div style={{ color:'#EEE',fontSize:'12px',fontWeight:'bold',lineHeight:1.15 }}>{agent.name}</div>
              <div style={{ color:'#889',fontSize:'10px',lineHeight:1.1 }}>{agent.role}</div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'4px',marginLeft:'4px' }}>
              <div style={{ width:'7px',height:'7px',borderRadius:'50%',background:dotColor,boxShadow:`0 0 5px ${dotColor}` }} />
              <span style={{ color:dotColor,fontSize:'10px',textTransform:'capitalize' }}>{STATE_LABEL[st.state]||'Idle'}</span>
            </div>
          </div>
        )
      })}
      <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:'6px',color:'#88AACC',fontSize:'11px' }}>
        <span style={{ width:'8px',height:'8px',borderRadius:'50%',background:'#44FF88',boxShadow:'0 0 6px #44FF88',display:'inline-block',animation:'pulseDot 1.4s ease-in-out infinite' }} />
        D2.5 · Live
      </div>
    </div>
  )
}

// ?????? Main App ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
export default function App() {
  const statuses = useGatewayStatus()
  const orbitRef = useRef()
  const [selectedAgent, setSelectedAgent] = useState(null)

  function getState(name) {
    return statuses.find(s => s.name === name)?.state || 'idle'
  }

  const selectedStatus = selectedAgent ? statuses.find(s => s.name === selectedAgent.name) : null

  return (
    <StatusContext.Provider value={statuses}>
    <div style={{ width:'100vw',height:'100vh',background:'#060C18' }}>
      <style>{`@keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.5); } }`}</style>
      <RosterBar statuses={statuses} />
      <Canvas
        shadows
        camera={{ position:[12,14,14], fov:45 }}
        style={{ width:'100%',height:'100%',paddingTop:'60px',boxSizing:'border-box' }}
        gl={{ antialias:true }}
      >
        <ambientLight intensity={0.40} color="#C8D8F0" />
        <directionalLight position={[8,16,10]} intensity={1.4} color="#FFF5E0" castShadow
          shadow-mapSize={[2048,2048]}
          shadow-camera-near={0.5} shadow-camera-far={60}
          shadow-camera-left={-14} shadow-camera-right={14}
          shadow-camera-top={14} shadow-camera-bottom={-14}
        />
        <directionalLight position={[-6,8,-4]} intensity={0.3} color="#8899FF" />
        <pointLight position={[0,4,0]} intensity={0.4} color="#FFE8C0" distance={16} />

        <Stars radius={80} depth={40} count={3000} factor={3} fade speed={0.3} />
        <CosmicBackdrop />
        <OfficeShell />
        <Whiteboard />
        <Bookshelf />
        <Plant position={[-6.3,0,4.5]} />
        <Plant position={[6.3,0,4.5]} />
        <ConfTable position={[0,0,2.8]} />

        {CREW.map(agent => (
          <AgentStation
            key={agent.name}
            agent={agent}
            agentState={getState(agent.name)}
            onClick={() => setSelectedAgent(agent)}
          />
        ))}

        <TaskFlowParticles />
        <AmbientHologram confTablePos={[0,0,2.8]} />

        <OrbitControls ref={orbitRef} target={[0,1,0]} enableDamping dampingFactor={0.06}
          minDistance={6} maxDistance={32} maxPolarAngle={Math.PI/2.1} />
      </Canvas>

      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          status={selectedStatus}
          onClose={() => setSelectedAgent(null)}
        />
      )}

      <div style={{ position:'fixed',bottom:'14px',right:'18px',color:'#334455',fontFamily:'monospace',fontSize:'11px',pointerEvents:'none' }}>
        Hover character for portrait · Drag to orbit · Scroll to zoom
      </div>
    </div>
    </StatusContext.Provider>
  )
}
