import React from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

import namiAvatar    from '../assets/avatars/nami.png'
import frankyAvatar  from '../assets/avatars/franky.png'
import chopperAvatar from '../assets/avatars/chopper.png'
import robinAvatar   from '../assets/avatars/robin.png'
import brookAvatar   from '../assets/avatars/brook.png'
import sanjiAvatar   from '../assets/avatars/sanji.png'
import usoppAvatar   from '../assets/avatars/usopp.png'

export const AVATAR_MAP = {
  Nami: namiAvatar,
  Franky: frankyAvatar,
  Chopper: chopperAvatar,
  Robin: robinAvatar,
  Brook: brookAvatar,
  Sanji: sanjiAvatar,
  Usopp: usoppAvatar,
}

export const STATE_COLOR = {
  idle: '#44DD77',
  working: '#4488FF',
  thinking: '#FFCC00',
  offline: '#555566',
  standby: '#AA8833',
}

export const STATE_LABEL = {
  idle: 'Idle',
  working: 'Working',
  thinking: 'Thinking',
  offline: 'Offline',
  standby: 'Standby',
}

export const STATE_ABBR = {
  idle: 'IDL',
  working: 'WRK',
  thinking: 'THK',
  offline: 'OFF',
  standby: 'SBY',
}

export const CHAR_CFG = {
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
    skinColor: '#FFDCAA',   // warm peach (Brook's spec)
    hairColor: '#E6C335',   // golden blonde (Brook's spec)
    topColor: '#1E1C26',    // near-black suit
    pantsColor: '#191722',  // matching dark
    shoeColor: '#141219',   // black dress shoes
    extras: [
      // White shirt collar triangle
      { type: 'box', size: [0.12, 0.10, 0.04], pos: [0, 0.82, 0.11], color: '#F0EDEB' },
      // Dark tie running down center
      { type: 'box', size: [0.05, 0.28, 0.04], pos: [0, 0.66, 0.11], color: '#141432' },
      // Cigarette (right side of mouth)
      { type: 'box', size: [0.16, 0.03, 0.03], pos: [0.12, 1.03, 0.14], color: '#F5F5DC' },
      // Cigarette ember tip
      { type: 'box', size: [0.03, 0.03, 0.03], pos: [0.26, 1.03, 0.14], color: '#FF4400' },
      // Curly eyebrow above RIGHT eye (gold)
      { type: 'box', size: [0.08, 0.04, 0.03], pos: [0.07, 1.08, 0.13], color: '#D4AF20', rot: [0, 0, 0.4] },
    ],
    hairShape: 'sideSweptBrook',  // updated hair shape key
  },
  Usopp: {
    scale: 0.98,
    skinColor: '#E6C8A0',   // light tan (Brook's spec)
    hairColor: '#1E1914',   // dark black (Brook's spec)
    topColor: '#B48C3C',    // khaki shirt
    pantsColor: '#8C5F23',  // brown overalls
    shoeColor: '#503719',   // medium brown boots
    extras: [
      // Suspender straps (overalls indicator) — left strap
      { type: 'box', size: [0.05, 0.30, 0.04], pos: [-0.08, 0.72, 0.11], color: '#784B19' },
      // Suspender strap right
      { type: 'box', size: [0.05, 0.30, 0.04], pos: [0.08, 0.72, 0.11], color: '#784B19' },
      // Long nose (key identity marker — Z-axis protrusion)
      { type: 'box', size: [0.07, 0.07, 0.40], pos: [0, 1.02, 0.26], color: '#E6C8A0' },
      // Bandana/headband across forehead
      { type: 'box', size: [0.30, 0.07, 0.06], pos: [0, 1.10, 0.11], color: '#A08C50' },
      // Goggle frame (copper-brown, on forehead above bandana)
      { type: 'box', size: [0.26, 0.08, 0.06], pos: [0, 1.17, 0.10], color: '#6B4A1E' },
      // Goggle left lens (blue-tint)
      { type: 'box', size: [0.09, 0.06, 0.04], pos: [-0.08, 1.17, 0.13], color: '#B4DCF0' },
      // Goggle right lens
      { type: 'box', size: [0.09, 0.06, 0.04], pos: [0.08, 1.17, 0.13], color: '#B4DCF0' },
      // Slingshot (Y-shape) — wood handle
      { type: 'box', size: [0.05, 0.28, 0.05], pos: [0.32, 0.68, 0], color: '#8B5E3C' },
      // Slingshot fork left
      { type: 'box', size: [0.05, 0.16, 0.05], pos: [0.26, 0.88, 0], color: '#8B5E3C', rot: [0, 0, -0.5] },
      // Slingshot fork right
      { type: 'box', size: [0.05, 0.16, 0.05], pos: [0.38, 0.88, 0], color: '#8B5E3C', rot: [0, 0, 0.5] },
      // Slingshot rubber band (red)
      { type: 'box', size: [0.14, 0.03, 0.03], pos: [0.32, 0.96, 0], color: '#CC2200' },
    ],
    hairShape: 'curlyAfroBig',  // updated hair shape key
  },
}

export function HoverPortrait({ avatarUrl, agentName, agentState, hovered }) {
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
          <span style={{ color: dotColor, marginLeft: '6px' }}>● {STATE_LABEL[agentState] || 'Idle'}</span>
        </div>
      </div>
    </Html>
  )
}

export function CharacterLabel({ name }) {
  return (
    null // Currently rendered inline via <Text> in AgentStation — placeholder for future extraction
  )
}

export default function VoxelCharacter({ name, isSitting, walkPhase, bobY }) {
  const cfg = CHAR_CFG[name] || CHAR_CFG.Nami

  // Sitting vs standing body-part offsets
  const torsoY = isSitting ? 0.64 : 0.62
  const headY  = isSitting ? 0.98 : 0.96
  const armY   = isSitting ? 0.56 : 0.54
  const armFwd = isSitting ? 0.10 : 0

  // Arm swing (walking animation, zero when sitting)
  const aSwing = isSitting ? 0 : Math.sin(walkPhase) * 0.45
  const lSwing = isSitting ? 0 : Math.sin(walkPhase + Math.PI) * 0.40

  return (
    <group scale={[cfg.scale, cfg.scale, cfg.scale]} position={[0, bobY / cfg.scale, 0]}>

      {/* Legs */}
      {isSitting ? (
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

      {/* Torso */}
      <mesh position={[0, torsoY, 0]} castShadow>
        <boxGeometry args={[0.32, 0.44, name === 'Franky' ? 0.22 : 0.18]} />
        <meshStandardMaterial color={cfg.topColor} roughness={0.7} />
      </mesh>

      {/* Arms */}
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

      {/* Head */}
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

      {/* Hair / Head accessories */}
      {cfg.hairShape === 'block' && (
        <mesh position={[0, headY + 0.18, -0.02]} castShadow>
          <boxGeometry args={[0.28, 0.16, 0.24]} />
          <meshStandardMaterial color={cfg.hairColor} />
        </mesh>
      )}
      {cfg.hairShape === 'pompadour' && (
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
        <>
          {/* Afro sphere */}
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
        <>
          {/* Base hair top */}
          <mesh position={[0, headY + 0.14, -0.02]} castShadow>
            <boxGeometry args={[0.28, 0.12, 0.22]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
          {/* Side-swept bang */}
          <mesh position={[-0.10, headY + 0.06, 0.08]} rotation={[0, 0, 0.5]} castShadow>
            <boxGeometry args={[0.16, 0.22, 0.14]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
        </>
      )}
      {cfg.hairShape === 'curlyAfro' && (
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
      {cfg.hairShape === 'sideSweptBrook' && (
        <>
          {/* Base hair top */}
          <mesh position={[0, headY + 0.14, -0.02]} castShadow>
            <boxGeometry args={[0.28, 0.12, 0.22]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
          {/* Side-swept bang — wider, covers left eye completely */}
          <mesh position={[-0.10, headY + 0.04, 0.08]} castShadow>
            <boxGeometry args={[0.18, 0.24, 0.16]} />
            <meshStandardMaterial color={cfg.hairColor} />
          </mesh>
        </>
      )}
      {cfg.hairShape === 'curlyAfroBig' && (
        <>
          {/* Main afro mass — wider and taller */}
          <mesh position={[0, headY + 0.16, 0]} castShadow>
            <boxGeometry args={[0.40, 0.26, 0.38]} />
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
          {/* Curly side tufts coming down to mid-face */}
          <mesh position={[0.22, headY + 0.04, 0]} castShadow>
            <boxGeometry args={[0.10, 0.22, 0.28]} />
            <meshStandardMaterial color={cfg.hairColor} roughness={0.95} />
          </mesh>
          <mesh position={[-0.22, headY + 0.04, 0]} castShadow>
            <boxGeometry args={[0.10, 0.22, 0.28]} />
            <meshStandardMaterial color={cfg.hairColor} roughness={0.95} />
          </mesh>
        </>
      )}

      {/* Character-specific extras */}
      {cfg.extras.map((e, i) => (
        <mesh key={i} position={e.pos} rotation={e.rot || [0,0,0]} castShadow>
          <boxGeometry args={e.size} />
          <meshStandardMaterial color={e.color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
