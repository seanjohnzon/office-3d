import React, { useRef, useState, useEffect, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text } from '@react-three/drei'
import * as THREE from 'three'
import { CREW } from './data/crewConfig'
import useGatewayStatus from './data/useGatewayStatus'
import { StatusContext } from './data/StatusContext'

import useIsMobile from './hooks/useIsMobile'
import useDemoMode from './hooks/useDemoMode'
import useAgentSounds from './hooks/useAgentSounds'
import useStateDuration from './hooks/useStateDuration'
import useWhiteboardData from './hooks/useWhiteboardData'
import CommitFeed from './components/CommitFeed'
import RosterBar from './components/RosterBar'
import ActivityFeed from './components/ActivityFeed'
import AgentDetailPanel from './components/AgentDetailPanel'
import HelpOverlay from './components/HelpOverlay'
import CameraFocus from './components/CameraFocus'
import DeskGroup from './components/DeskGroup'
import TaskFlowParticles from './components/TaskFlowParticles'
import NetworkLines from './components/NetworkLines'
import AmbientHologram from './components/AmbientHologram'
import TaskFeed from './components/TaskFeed'
import SprintHUD from './components/SprintHUD'
import GatewayBanner from './components/GatewayBanner'
import CrewTicker from './components/CrewTicker'
import SceneEffects from './components/SceneEffects'
import KitchenStation from './components/KitchenStation'
import WorkshopStation from './components/WorkshopStation'
import AnimatedMast from './components/AnimatedMast'
import CaptainsDashboard from './components/CaptainsDashboard'
import StarField from './components/StarField'
import WakeFoam from './components/WakeFoam'
import ShipBob from './components/ShipBob'
import useDayNightCycle from './hooks/useDayNightCycle'
import DynamicSky from './components/DynamicSky'

// ══ Ship Shape Math ══════════════════════════════════════════════════════════

function shipWidthAtZ(z) {
  // z ranges from -22 (stern) to +20 (bow)
  // Returns half-width at that z position
  const sternZ = -22, bowZ = 20
  const totalLen = bowZ - sternZ
  const t = (z - sternZ) / totalLen  // 0 at stern, 1 at bow
  const sternWidth = 5    // half-width at stern
  const midWidth = 28     // half-width at widest (midship)
  const bowWidth = 2      // half-width at bow tip
  if (t < 0.45) {
    const tt = t / 0.45
    return sternWidth + (midWidth - sternWidth) * Math.sin(tt * Math.PI / 2)
  } else {
    const tt = (t - 0.45) / 0.55
    return midWidth + (bowWidth - midWidth) * Math.sin(tt * Math.PI / 2)
  }
}

function ShipDeck() {
  const plankColors = ['#C4A265', '#B8934A', '#A07840', '#C4A265', '#B8934A']
  const planks = []
  const sternZ = -22, bowZ = 20
  const plankDepth = 1.2
  const numPlanks = Math.ceil((bowZ - sternZ) / plankDepth)

  for (let i = 0; i < numPlanks; i++) {
    const z = sternZ + i * plankDepth + plankDepth / 2
    const halfW = shipWidthAtZ(z)
    const color = plankColors[i % plankColors.length]
    planks.push(
      <mesh key={`plank-${i}`} position={[0, 0, z]} receiveShadow castShadow>
        <boxGeometry args={[halfW * 2, 0.08, plankDepth - 0.05]} />
        <meshStandardMaterial color={color} roughness={0.82} />
      </mesh>
    )
    planks.push(
      <mesh key={`gap-${i}`} position={[0, 0.04, z - plankDepth / 2]}>
        <boxGeometry args={[halfW * 2 + 0.1, 0.01, 0.05]} />
        <meshStandardMaterial color="#6B3A10" roughness={1} />
      </mesh>
    )
  }
  return <group>{planks}</group>
}

function ShipHullShaped() {
  const hullColor = '#C4A265'
  const hullDark = '#8B6914'
  const goldTrim = '#D4870A'
  const segments = []

  const sternZ = -22, bowZ = 20
  const numSegs = 20
  const segLen = (bowZ - sternZ) / numSegs

  for (let i = 0; i < numSegs; i++) {
    const z1 = sternZ + i * segLen
    const z2 = z1 + segLen
    const zMid = (z1 + z2) / 2
    const w1 = shipWidthAtZ(z1)
    const w2 = shipWidthAtZ(z2)
    const wMid = (w1 + w2) / 2
    const dw = w2 - w1
    const angle = Math.atan2(dw, segLen)

    segments.push(
      <mesh key={`port-${i}`} position={[-wMid, -0.8, zMid]} rotation={[0, -angle, 0]} castShadow>
        <boxGeometry args={[0.5, 2.2, segLen + 0.2]} />
        <meshStandardMaterial color={i < 4 || i > 16 ? hullDark : hullColor} roughness={0.85} />
      </mesh>
    )
    segments.push(
      <mesh key={`ptrim-${i}`} position={[-wMid - 0.05, 0.15, zMid]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[0.12, 0.12, segLen + 0.2]} />
        <meshStandardMaterial color={goldTrim} roughness={0.3} metalness={0.7} emissive={goldTrim} emissiveIntensity={0.15} />
      </mesh>
    )
    segments.push(
      <mesh key={`pcap-${i}`} position={[-wMid - 0.08, 0.45, zMid]} rotation={[0, -angle, 0]} castShadow>
        <boxGeometry args={[0.28, 0.18, segLen + 0.1]} />
        <meshStandardMaterial color="#5C3010" roughness={0.8} />
      </mesh>
    )
    segments.push(
      <mesh key={`star-${i}`} position={[wMid, -0.8, zMid]} rotation={[0, angle, 0]} castShadow>
        <boxGeometry args={[0.5, 2.2, segLen + 0.2]} />
        <meshStandardMaterial color={i < 4 || i > 16 ? hullDark : hullColor} roughness={0.85} />
      </mesh>
    )
    segments.push(
      <mesh key={`strim-${i}`} position={[wMid + 0.05, 0.15, zMid]} rotation={[0, angle, 0]}>
        <boxGeometry args={[0.12, 0.12, segLen + 0.2]} />
        <meshStandardMaterial color={goldTrim} roughness={0.3} metalness={0.7} emissive={goldTrim} emissiveIntensity={0.15} />
      </mesh>
    )
    segments.push(
      <mesh key={`scap-${i}`} position={[wMid + 0.08, 0.45, zMid]} rotation={[0, angle, 0]} castShadow>
        <boxGeometry args={[0.28, 0.18, segLen + 0.1]} />
        <meshStandardMaterial color="#5C3010" roughness={0.8} />
      </mesh>
    )
  }

  const sternW = shipWidthAtZ(sternZ) * 2
  segments.push(
    <mesh key="stern" position={[0, -0.8, sternZ]} castShadow>
      <boxGeometry args={[sternW, 2.2, 0.5]} />
      <meshStandardMaterial color={hullDark} roughness={0.85} />
    </mesh>
  )
  segments.push(
    <mesh key="sterntrim" position={[0, 0.15, sternZ]}>
      <boxGeometry args={[sternW + 0.2, 0.12, 0.15]} />
      <meshStandardMaterial color={goldTrim} roughness={0.3} metalness={0.7} />
    </mesh>
  )

  ;[-9, 0, 9].forEach((hz, hi) => {
    const hw = shipWidthAtZ(hz)
    segments.push(
      <group key={`dock-${hi}`} position={[-hw - 0.1, -0.5, hz]}>
        <mesh castShadow>
          <boxGeometry args={[0.2, 1.5, 2.5]} />
          <meshStandardMaterial color="#1A3A1A" roughness={0.9} />
        </mesh>
        <mesh position={[0.12, 0, 0]}>
          <boxGeometry args={[0.08, 1.6, 2.6]} />
          <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
    )
  })

  ;[[-4, 3], [0, 3], [4, 3]].forEach(([az], ai) => {
    const aqW = shipWidthAtZ(az)
    segments.push(
      <mesh key={`aq-${ai}`} position={[aqW + 0.1, 0.5, az]}>
        <boxGeometry args={[0.15, 2.5, 2.4]} />
        <meshStandardMaterial color="#88CCFF" transparent opacity={0.5} roughness={0} />
      </mesh>
    )
    segments.push(
      <mesh key={`aqglow-${ai}`} position={[aqW - 0.1, 0.5, az]}>
        <boxGeometry args={[0.08, 2.3, 2.2]} />
        <meshStandardMaterial color="#004488" emissive="#0044AA" emissiveIntensity={0.6} transparent opacity={0.4} />
      </mesh>
    )
  })

  segments.push(
    <group key="captdoor" position={[0, 0.5, sternZ + 0.4]}>
      <mesh castShadow>
        <boxGeometry args={[2.0, 3.0, 0.2]} />
        <meshStandardMaterial color="#3A2008" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[1.6, 2.7, 0.1]} />
        <meshStandardMaterial color="#5C3010" roughness={0.7} />
      </mesh>
      <Text position={[0, 1.8, 0.2]} fontSize={0.25} color="#D4870A" anchorX="center">CAPTAIN'S QUARTERS</Text>
    </group>
  )

  segments.push(
    <mesh key="helmplatform" position={[0, 0.4, -18]} castShadow receiveShadow>
      <boxGeometry args={[shipWidthAtZ(-18) * 1.5, 0.4, 8]} />
      <meshStandardMaterial color="#8B5E3C" roughness={0.85} />
    </mesh>
  )

  segments.push(
    <mesh key="bowplatform" position={[0, 0.3, 16]} castShadow receiveShadow>
      <boxGeometry args={[shipWidthAtZ(16) * 1.8, 0.35, 6]} />
      <meshStandardMaterial color="#8B5E3C" roughness={0.85} />
    </mesh>
  )

  return <group>{segments}</group>
}

function RoomBox({ position, size, wallColor, label, children }) {
  const [w, h, d] = size
  const wc = wallColor || '#6B4423'
  const wallThick = 0.2
  const doorW = 2.0, doorH = 2.2

  return (
    <group position={position}>
      <mesh position={[0, -wallThick/2, 0]} receiveShadow>
        <boxGeometry args={[w, wallThick, d]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.85} />
      </mesh>
      <mesh position={[0, h/2, -d/2]} castShadow>
        <boxGeometry args={[w, h, wallThick]} />
        <meshStandardMaterial color={wc} roughness={0.8} />
      </mesh>
      <mesh position={[-w/2, h/2, 0]} castShadow>
        <boxGeometry args={[wallThick, h, d]} />
        <meshStandardMaterial color={wc} roughness={0.8} />
      </mesh>
      <mesh position={[w/2, h/2, 0]} castShadow>
        <boxGeometry args={[wallThick, h, d]} />
        <meshStandardMaterial color={wc} roughness={0.8} />
      </mesh>
      <mesh position={[-(w/2 - (w - doorW)/4), h/2, d/2]} castShadow>
        <boxGeometry args={[(w - doorW) / 2, h, wallThick]} />
        <meshStandardMaterial color={wc} roughness={0.8} />
      </mesh>
      <mesh position={[(w/2 - (w - doorW)/4), h/2, d/2]} castShadow>
        <boxGeometry args={[(w - doorW) / 2, h, wallThick]} />
        <meshStandardMaterial color={wc} roughness={0.8} />
      </mesh>
      <mesh position={[0, h - (h - doorH)/2, d/2]} castShadow>
        <boxGeometry args={[doorW, h - doorH, wallThick]} />
        <meshStandardMaterial color={wc} roughness={0.8} />
      </mesh>
      {label && (
        <Text position={[0, h + 0.3, d/2 + 0.1]} fontSize={0.35} color="#FFD700" anchorX="center">
          {label}
        </Text>
      )}
      {children}
    </group>
  )
}

// ══ Thousand Sunny Scene ══════════════════════════════════════════════════════

function OceanSkyEnvironment() {
  return (
    <>
      {/* Sky dome — bright blue gradient suggestion */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[120, 16, 16]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>
      {/* Horizon band — lighter near waterline */}
      <mesh position={[0, -8, 0]}>
        <sphereGeometry args={[118, 16, 8]} />
        <meshBasicMaterial color="#B8E4F5" side={THREE.BackSide} />
      </mesh>
      {/* Ocean floor plane — extends to horizon */}
      <mesh position={[0, -6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#2E7DB8" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Ocean near-ship — closer, brighter */}
      <mesh position={[0, -5.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#4A9FD4" roughness={0.2} metalness={0.15} transparent opacity={0.85} />
      </mesh>
      {/* Cloud 1 */}
      <group position={[-40, 25, -60]}>
        <mesh><boxGeometry args={[12, 4, 6]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
        <mesh position={[5, 1.5, 0]}><boxGeometry args={[8, 5, 5]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
        <mesh position={[-4, 1, 0]}><boxGeometry args={[6, 3, 5]} /><meshBasicMaterial color="#F5F5F5" /></mesh>
      </group>
      {/* Cloud 2 */}
      <group position={[50, 28, -70]}>
        <mesh><boxGeometry args={[10, 3, 5]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
        <mesh position={[3, 1.5, 0]}><boxGeometry args={[7, 4, 5]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
      </group>
      {/* Cloud 3 */}
      <group position={[0, 22, -80]}>
        <mesh><boxGeometry args={[14, 4, 7]} /><meshBasicMaterial color="#F8F8FF" /></mesh>
        <mesh position={[-5, 2, 0]}><boxGeometry args={[8, 5, 6]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
        <mesh position={[6, 1.5, 0]}><boxGeometry args={[10, 4, 5]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
      </group>
      {/* Distant island silhouette left */}
      <mesh position={[-80, -2, -90]}>
        <boxGeometry args={[20, 8, 8]} />
        <meshBasicMaterial color="#3A7A3A" />
      </mesh>
      <mesh position={[-78, 2, -88]}>
        <coneGeometry args={[4, 12, 6]} />
        <meshBasicMaterial color="#2A6A2A" />
      </mesh>
      {/* Distant island right */}
      <mesh position={[75, -3, -85]}>
        <boxGeometry args={[14, 6, 6]} />
        <meshBasicMaterial color="#3A7A3A" />
      </mesh>
    </>
  )
}

function WoodenDeck() {
  const plankColors = ['#8B5E3C', '#7A5230', '#6B4423']
  const planks = []
  const deckWidth = 60
  const deckDepth = 50
  const plankWidth = deckWidth
  const plankHeight = 0.06
  const plankDepth = 1.2
  const numPlanks = Math.ceil(deckDepth / plankDepth)
  const startZ = -deckDepth / 2

  for (let i = 0; i < numPlanks; i++) {
    const color = plankColors[i % plankColors.length]
    const z = startZ + i * plankDepth + plankDepth / 2
    planks.push(
      <mesh key={`plank-${i}`} position={[0, 0, z]} receiveShadow>
        <boxGeometry args={[plankWidth, plankHeight, plankDepth - 0.04]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
    )
    // Plank gap line
    planks.push(
      <mesh key={`gap-${i}`} position={[0, 0.035, z - plankDepth / 2]}>
        <boxGeometry args={[plankWidth, 0.01, 0.04]} />
        <meshStandardMaterial color="#3A2010" roughness={1} />
      </mesh>
    )
  }
  return <group>{planks}</group>
}

function GrassLawn() {
  const flowers = [
    { x: -3.6, z: -1.8, color: '#FF69B4' },
    { x: 2.4, z: -2.7, color: '#FFD700' },
    { x: -0.9, z: 1.2, color: '#FF69B4' },
    { x: 3.3, z: 1.8, color: '#FFD700' },
    { x: -4.5, z: 2.1, color: '#FF69B4' },
    { x: 0.6, z: -0.6, color: '#FFD700' },
  ]
  return (
    <group position={[0, 0.1, -5]}>
      {/* Lawn base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[16, 0.05, 10]} />
        <meshStandardMaterial color="#2D7A2D" roughness={0.9} />
      </mesh>
      {/* Border */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[16.2, 0.03, 10.2]} />
        <meshStandardMaterial color="#3A9A3A" roughness={0.9} wireframe={false} transparent opacity={0.4} />
      </mesh>
      {/* Flowers */}
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, 0.04, f.z]}>
          {/* Stem */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.18, 6]} />
            <meshStandardMaterial color="#1A5C1A" roughness={0.9} />
          </mesh>
          {/* Bloom */}
          <mesh position={[0, 0.22, 0]}>
            <sphereGeometry args={[0.07, 6, 5]} />
            <meshStandardMaterial color={f.color} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function LionFigurehead() {
  return (
    <group position={[0, 2.0, 20]}>
      {/* Mane */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[3.6, 2.8, 0.8]} />
        <meshStandardMaterial color="#C07010" roughness={0.7} />
      </mesh>
      {/* Main head */}
      <mesh position={[0, 0, 0.7]}>
        <boxGeometry args={[2.4, 2.0, 1.6]} />
        <meshStandardMaterial color="#D4A020" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.56, 0.3, 1.52]}>
        <boxGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.56, 0.3, 1.52]}>
        <boxGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, -0.2, 1.56]}>
        <boxGeometry args={[0.4, 0.24, 0.24]} />
        <meshStandardMaterial color="#8B5E00" roughness={0.8} />
      </mesh>
      {/* Label */}
      <Text position={[0, -1.76, 0.8]} fontSize={0.44} color="#D4A020" anchorX="center" fontWeight="bold">
        THOUSAND SUNNY
      </Text>
    </group>
  )
}

function ThousandSunnyHull() {
  const hullGreen = '#C4A265'
  const hullDark = '#8B6914'
  const goldTrim = '#D4870A'

  return (
    <group>
      {/* === PORT SIDE HULL (left, x negative) === */}
      <mesh position={[-28, -0.3, -1.5]} castShadow>
        <boxGeometry args={[0.5, 0.6, 54]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[-27, -1.1, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 51]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[-26, -2.2, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.2, 45]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[-24, -3.3, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 36]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[-28.5, 0.05, -1.5]}>
        <boxGeometry args={[0.12, 0.12, 54]} />
        <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} emissive={goldTrim} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-28.5, 0.4, -1.5]} castShadow>
        <boxGeometry args={[0.25, 0.18, 54]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>

      {/* === STARBOARD SIDE HULL (right, x positive) === */}
      <mesh position={[28, -0.3, -1.5]} castShadow>
        <boxGeometry args={[0.5, 0.6, 54]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[27, -1.1, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 51]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[26, -2.2, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.2, 45]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[24, -3.3, -1.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 36]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[28.5, 0.05, -1.5]}>
        <boxGeometry args={[0.12, 0.12, 54]} />
        <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} emissive={goldTrim} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[28.5, 0.4, -1.5]} castShadow>
        <boxGeometry args={[0.25, 0.18, 54]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>

      {/* === STERN (back wall at z=-26) === */}
      <mesh position={[0, -1.5, -26]} castShadow>
        <boxGeometry args={[57, 3.5, 0.4]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.05, -26]}>
        <boxGeometry args={[58.5, 0.12, 0.15]} />
        <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} emissive={goldTrim} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.4, -26]} castShadow>
        <boxGeometry args={[58.5, 0.18, 0.3]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>

      {/* === BOW TAPER (front, z=22 to 30) === */}
      <mesh position={[-22.5, -0.5, 22.5]} rotation={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.4, 1.0, 12]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[-16.5, -1.5, 25.5]} rotation={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 1.5, 9]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[22.5, -0.5, 22.5]} rotation={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[0.4, 1.0, 12]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[16.5, -1.5, 25.5]} rotation={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 1.5, 9]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>

      {/* === SOLDIER DOCK SYSTEM (port side, 3 hatches) === */}
      {[-9, 0, 9].map((z, i) => (
        <group key={i} position={[-28.6, -0.5, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 1.2, 1.8]} />
            <meshStandardMaterial color="#1A3A1A" roughness={0.9} />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <boxGeometry args={[0.06, 1.3, 1.9]} />
            <meshStandardMaterial color={goldTrim} roughness={0.5} metalness={0.5} />
          </mesh>
          <Text position={[0.14, 0, 0]} fontSize={0.22} color={goldTrim} rotation={[0, Math.PI/2, 0]} anchorX="center">
            {`S-${i + 1}`}
          </Text>
        </group>
      ))}

      {/* === AQUARIUM BAR (starboard side, glowing blue panel) === */}
      <group position={[28.5, 0.5, 3]}>
        <mesh castShadow>
          <boxGeometry args={[0.15, 4, 12]} />
          <meshStandardMaterial color="#001833" roughness={0.1} metalness={0.2} transparent opacity={0.7} />
        </mesh>
        <mesh position={[-0.1, 0, 0]}>
          <boxGeometry args={[0.05, 3.8, 11.8]} />
          <meshStandardMaterial color="#003366" emissive="#0044AA" emissiveIntensity={0.8} transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[0.08, 4.1, 12.1]} />
          <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} />
        </mesh>
        <Text position={[0.2, 2.2, 0]} fontSize={0.4} color={goldTrim} rotation={[0, Math.PI/2, 0]} anchorX="center">
          AQUARIUM BAR
        </Text>
      </group>

      {/* === CAPTAIN'S QUARTERS ENTRANCE (stern, center) === */}
      <group position={[0, 0.5, -25.5]}>
        <mesh>
          <boxGeometry args={[2.4, 4.4, 0.3]} />
          <meshStandardMaterial color="#3A2008" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[2.0, 4.0, 0.16]} />
          <meshStandardMaterial color="#5C3010" roughness={0.7} />
        </mesh>
        <mesh position={[0.6, 0, 0.2]}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshStandardMaterial color={goldTrim} metalness={0.8} roughness={0.2} />
        </mesh>
        <Text position={[0, 2.6, 0.2]} fontSize={0.28} color={goldTrim} anchorX="center">
          CAPTAIN'S QUARTERS
        </Text>
      </group>

      {/* === HELM PLATFORM (stern raised area for steering) === */}
      <mesh position={[0, 0.35, -20]} castShadow receiveShadow>
        <boxGeometry args={[20, 0.4, 10]} />
        <meshStandardMaterial color="#7A5230" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.15, -15]} castShadow>
        <boxGeometry args={[20, 0.15, 0.6]} />
        <meshStandardMaterial color="#6B4423" roughness={0.85} />
      </mesh>

      {/* === BOW PLATFORM (front raised area, lion sits on it) === */}
      <mesh position={[0, 0.3, 18]} castShadow receiveShadow>
        <boxGeometry args={[16, 0.4, 6]} />
        <meshStandardMaterial color="#7A5230" roughness={0.85} />
      </mesh>
    </group>
  )
}

function CrowsNest({ position }) {
  return (
    <group position={position}>
      {/* Nest barrel */}
      <mesh castShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.7, 10]} />
        <meshStandardMaterial color="#5C3010" roughness={0.8} />
      </mesh>
      {/* Floor inside */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.06, 10]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.85} />
      </mesh>
      {/* Rail posts */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = 0.58, a = (deg * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.sin(a)*r, 0.35, Math.cos(a)*r]}>
            <boxGeometry args={[0.05, 0.5, 0.05]} />
            <meshStandardMaterial color="#4A2800" roughness={0.9} />
          </mesh>
        )
      })}
      {/* Telescope prop */}
      <mesh position={[0.3, 0.3, 0]} rotation={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.04, 0.06, 0.6, 8]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  )
}

function Mast({ position }) {
  return (
    <group position={position}>
      {/* Main mast pole — taller now */}
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[0.22, 10, 0.22]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>
      {/* Lower crossbar */}
      <mesh position={[0, 4.0, 0]} castShadow>
        <boxGeometry args={[5, 0.18, 0.18]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>
      {/* Upper crossbar */}
      <mesh position={[0, 7.5, 0]} castShadow>
        <boxGeometry args={[3.5, 0.15, 0.15]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>
      {/* Main sail */}
      <mesh position={[0, 2.6, 0.1]} castShadow>
        <boxGeometry args={[4.7, 3.5, 0.04]} />
        <meshStandardMaterial color="#F5F0E0" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Upper sail */}
      <mesh position={[0, 6.5, 0.1]} castShadow>
        <boxGeometry args={[3.3, 2.5, 0.04]} />
        <meshStandardMaterial color="#F5F0E0" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Crow's nest at top */}
      <CrowsNest position={[0, 10.3, 0]} />
    </group>
  )
}

function NavigationWheel({ position }) {
  const spokes = [0, 45, 90, 135]
  return (
    <group position={position}>
      {/* Wheel rim */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.7, 0.08, 8, 20]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Spokes */}
      {spokes.map((deg, i) => (
        <mesh key={i} rotation={[0, 0, (deg * Math.PI) / 180]}>
          <boxGeometry args={[1.4, 0.06, 0.06]} />
          <meshStandardMaterial color="#6B4423" roughness={0.7} />
        </mesh>
      ))}
      {/* Hub */}
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 8]} />
        <meshStandardMaterial color="#5C3010" roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  )
}

function Cannon({ position, rotateY = 0 }) {
  return (
    <group position={position} rotation={[0, rotateY, 0]}>
      {/* Cannon base */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.35, 0.28, 0.7]} />
        <meshStandardMaterial color="#444" roughness={0.8} metalness={0.4} />
      </mesh>
      {/* Barrel pointing sideways */}
      <mesh position={[0.55, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.13, 0.8, 10]} />
        <meshStandardMaterial color="#555" roughness={0.6} metalness={0.6} />
      </mesh>
    </group>
  )
}

function CaptainsLog({ data }) {
  const d = data || { header: "CAPTAIN'S LOG · LIVE", line1: "D2.29 ✓ Dynamic Sky Cycle", line2: "D2.29 → Day/Night Live", statusColor: "#2ecc71" }
  return (
    <group position={[0, 3.0, -22]}>
      <mesh castShadow>
        <boxGeometry args={[6, 3.2, 0.12]} />
        <meshStandardMaterial color="#5C3D1E" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.07]}>
        <boxGeometry args={[5.76, 3.04, 0.04]} />
        <meshStandardMaterial color="#F5F2EC" roughness={0.9} />
      </mesh>
      <Text position={[0, 0.76, 0.1]} fontSize={0.36} color="#1A1A2E" anchorX="center" fontWeight="bold">{d.header}</Text>
      <Text position={[0, 0.16, 0.1]} fontSize={0.21} color="#444" anchorX="center">{d.line1}</Text>
      <Text position={[0, -0.44, 0.1]} fontSize={0.19} color={d.statusColor} anchorX="center">{d.line2}</Text>
    </group>
  )
}

function StrategyRoom() {
  return (
    <group position={[0, 0, -15]}>
      {/* Back wall */}
      <mesh position={[0, 1.5, -5.4]} castShadow>
        <boxGeometry args={[14, 3, 0.15]} />
        <meshStandardMaterial color="#4A3010" roughness={0.85} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-6.8, 1.5, -1.5]} castShadow>
        <boxGeometry args={[0.15, 3, 7.5]} />
        <meshStandardMaterial color="#4A3010" roughness={0.85} />
      </mesh>
      {/* Right wall */}
      <mesh position={[6.8, 1.5, -1.5]} castShadow>
        <boxGeometry args={[0.15, 3, 7.5]} />
        <meshStandardMaterial color="#4A3010" roughness={0.85} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.1, -2.7]} castShadow>
        <boxGeometry args={[14, 0.12, 9]} />
        <meshStandardMaterial color="#3A2008" roughness={0.8} />
      </mesh>
      {/* Round meeting table */}
      <mesh position={[0, 0.6, -1.2]} castShadow>
        <cylinderGeometry args={[2.4, 2.4, 0.08, 16]} />
        <meshStandardMaterial color="#8B6914" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Table leg */}
      <mesh position={[0, 0.3, -1.2]} castShadow>
        <cylinderGeometry args={[0.18, 0.32, 0.52, 8]} />
        <meshStandardMaterial color="#6B4F10" roughness={0.6} />
      </mesh>
      {/* Hologram map on table */}
      <mesh position={[0, 0.67, -1.2]}>
        <cylinderGeometry args={[1.6, 1.6, 0.02, 16]} />
        <meshStandardMaterial color="#002244" emissive="#0044FF" emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
      {/* Log Pose on table */}
      <mesh position={[0.8, 0.68, -0.6]}>
        <cylinderGeometry args={[0.06, 0.06, 0.14, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
      </mesh>
      <Text position={[0, 3.3, -5.25]} fontSize={0.4} color="#D4A020" anchorX="center">
        STRATEGY ROOM
      </Text>
    </group>
  )
}

function AquariumBar() {
  return (
    <group position={[18, 0, -8]}>
      {/* Aquarium glass walls — port side */}
      <mesh position={[-7, 3.0, 0]} castShadow>
        <boxGeometry args={[0.2, 6, 12]} />
        <meshStandardMaterial color="#88CCFF" transparent opacity={0.4} roughness={0.0} metalness={0.1} />
      </mesh>
      {/* Aquarium glass — starboard side */}
      <mesh position={[7, 3.0, 0]} castShadow>
        <boxGeometry args={[0.2, 6, 12]} />
        <meshStandardMaterial color="#88CCFF" transparent opacity={0.4} roughness={0.0} metalness={0.1} />
      </mesh>
      {/* Aquarium glass — back */}
      <mesh position={[0, 3.0, -6]}>
        <boxGeometry args={[14, 6, 0.2]} />
        <meshStandardMaterial color="#88CCFF" transparent opacity={0.35} roughness={0.0} metalness={0.1} />
      </mesh>
      {/* Water inside — glowing blue */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[13.6, 3.6, 11.6]} />
        <meshStandardMaterial color="#1A4A6B" emissive="#004488" emissiveIntensity={0.4} transparent opacity={0.6} />
      </mesh>
      {/* Aquarium point light (blue) */}
      <pointLight position={[0, 4, 0]} intensity={0.8} color="#4488FF" distance={16} />
      {/* Checkered floor */}
      {Array.from({ length: 7 }, (_, i) =>
        Array.from({ length: 6 }, (_, j) => (
          <mesh key={`${i}-${j}`} position={[-6 + i * 2, -0.02, -5 + j * 2]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[1.96, 1.96]} />
            <meshStandardMaterial color={(i + j) % 2 === 0 ? '#FFFFFF' : '#1A1A1A'} />
          </mesh>
        ))
      )}
      {/* Bar counter */}
      <mesh position={[0, 1.1, 4.4]} castShadow>
        <boxGeometry args={[10, 1.8, 1.0]} />
        <meshStandardMaterial color="#5C3010" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.04, 4.4]}>
        <boxGeometry args={[10.2, 0.12, 1.1]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.4} />
      </mesh>
      {/* Bar stools */}
      {[-3, -1, 1, 3].map((x, i) => (
        <group key={i} position={[x, 0, 3.2]}>
          <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.36, 0.28, 0.12, 10]} /><meshStandardMaterial color="#2A2A4A" /></mesh>
          <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.08, 0.08, 0.38, 8]} /><meshStandardMaterial color="#888" /></mesh>
        </group>
      ))}
      {/* Central mast with alcohol shelves */}
      <mesh position={[0, 3.0, -1.0]} castShadow>
        <boxGeometry args={[0.8, 6.4, 0.8]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>
      {/* Drink bottles on central mast shelves */}
      {[-1.6, 0.4, 2.4].map((y, row) =>
        [-0.3, 0, 0.3].map((x, col) => (
          <mesh key={`${row}-${col}`} position={[x + 0.5, y, -1.0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.44, 6]} />
            <meshStandardMaterial color={['#8B0000','#006400','#FFD700','#4B0082','#FF4500','#1A1A8B','#DC143C','#006400','#FFD700'][row*3+col]} roughness={0.3} metalness={0.1} />
          </mesh>
        ))
      )}
      {/* Fish silhouettes in aquarium */}
      {[[-4, 2.4, -2], [2, 1.6, -4], [-2, 3.0, 0], [4, 2.0, -3], [0, 1.2, -4.4]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.6, 0.24, 0.16]} />
          <meshStandardMaterial color={['#FF6B35','#FFD700','#4ECDC4','#FF69B4','#FFA500'][i]} emissive={['#FF6B35','#FFD700','#4ECDC4','#FF69B4','#FFA500'][i]} emissiveIntensity={0.3} transparent opacity={0.8} />
        </mesh>
      ))}
      <Text position={[0, 6.2, -5.8]} fontSize={0.44} color="#FFD700" anchorX="center">AQUARIUM BAR</Text>
    </group>
  )
}

function TangerineGrove() {
  // Nami's tangerine grove on the upper deck area (port-stern)
  const trees = [
    { x: -0.8, z: 0 },
    { x: 0.8, z: 0.2 },
    { x: 0, z: -0.8 },
    { x: -0.7, z: -1.0 },
  ]
  return (
    <group position={[-16, 0.4, -14]}>
      {/* Grove floor — slightly raised platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[10, 0.1, 8]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.9} />
      </mesh>
      {/* Trees */}
      {trees.map((t, i) => (
        <group key={i} position={[t.x * 2.5, 0, t.z * 2.5]}>
          {/* Trunk */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.1, 1.0, 7]} />
            <meshStandardMaterial color="#8B4513" roughness={0.9} />
          </mesh>
          {/* Canopy */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <sphereGeometry args={[0.5, 8, 7]} />
            <meshStandardMaterial color="#2E7D32" roughness={0.8} />
          </mesh>
          {/* Tangerines — 4-6 per tree */}
          {[
            [0.2, 1.0, 0.2], [-0.2, 1.1, 0.1], [0.1, 1.3, -0.2],
            [-0.1, 0.95, -0.2], [0.3, 1.2, -0.1], [-0.3, 1.15, 0.15],
          ].map(([ox, oy, oz], j) => (
            <mesh key={j} position={[ox, oy, oz]}>
              <sphereGeometry args={[0.075, 6, 5]} />
              <meshStandardMaterial color="#FF8C00" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Wooden bench */}
      <mesh position={[1.2, 0.22, 0.5]} castShadow>
        <boxGeometry args={[0.8, 0.06, 0.32]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.7} />
      </mesh>
      <mesh position={[0.92, 0.12, 0.5]} castShadow><boxGeometry args={[0.06, 0.22, 0.32]} /><meshStandardMaterial color="#6B3A10" /></mesh>
      <mesh position={[1.48, 0.12, 0.5]} castShadow><boxGeometry args={[0.06, 0.22, 0.32]} /><meshStandardMaterial color="#6B3A10" /></mesh>
      {/* Robin's flowers */}
      {[[-1.2, 0, 1.0], [-1.0, 0, 0.2], [-1.4, 0, 0.6]].map(([fx, fy, fz], i) => (
        <group key={i} position={[fx, fy, fz]}>
          <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.02, 0.02, 0.22, 5]} /><meshStandardMaterial color="#2E7D32" /></mesh>
          <mesh position={[0, 0.24, 0]}><sphereGeometry args={[0.065, 6, 5]} /><meshStandardMaterial color={['#FF69B4','#9B59B6','#FF1493'][i]} roughness={0.7} /></mesh>
        </group>
      ))}
      <Text position={[0, 1.8, -1.6]} fontSize={0.18} color="#FF8C00" anchorX="center">NAMI'S GROVE</Text>
    </group>
  )
}

function MusicLounge() {
  return (
    <group position={[16, 0, -14]}>
      {/* Floor — polished dark wood */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[10, 0.08, 8]} />
        <meshStandardMaterial color="#2C1810" roughness={0.4} metalness={0.05} />
      </mesh>
      {/* Upright piano */}
      <group position={[-1.0, 0, -1.2]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.1, 1.1, 0.5]} />
          <meshStandardMaterial color="#0A0A0A" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Piano keys */}
        <mesh position={[0, 0.08, 0.22]}>
          <boxGeometry args={[1.0, 0.04, 0.12]} />
          <meshStandardMaterial color="#F5F5F5" roughness={0.4} />
        </mesh>
        {/* Black keys */}
        {[-0.36, -0.18, 0.06, 0.24, 0.42].map((kx, i) => (
          <mesh key={i} position={[kx, 0.12, 0.20]}>
            <boxGeometry args={[0.05, 0.04, 0.07]} />
            <meshStandardMaterial color="#111" />
          </mesh>
        ))}
        {/* Piano lid */}
        <mesh position={[0, 1.18, -0.08]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[1.1, 0.04, 0.38]} />
          <meshStandardMaterial color="#111" roughness={0.15} metalness={0.1} />
        </mesh>
        {/* Piano stool */}
        <mesh position={[0, 0.26, 0.5]}><boxGeometry args={[0.44, 0.06, 0.34]} /><meshStandardMaterial color="#1A0A05" roughness={0.6} /></mesh>
        <mesh position={[-0.18, 0.13, 0.5]}><boxGeometry args={[0.05, 0.26, 0.05]} /><meshStandardMaterial color="#333" /></mesh>
        <mesh position={[0.18, 0.13, 0.5]}><boxGeometry args={[0.05, 0.26, 0.05]} /><meshStandardMaterial color="#333" /></mesh>
      </group>
      {/* Violin on stand */}
      <group position={[0.8, 0, -1.0]}>
        <mesh position={[0, 0.6, 0]}><boxGeometry args={[0.04, 0.9, 0.04]} /><meshStandardMaterial color="#444" /></mesh>
        <mesh position={[0, 0.9, 0]}><boxGeometry args={[0.22, 0.04, 0.22]} /><meshStandardMaterial color="#666" /></mesh>
        {/* Violin body */}
        <mesh position={[0, 1.1, 0]}><boxGeometry args={[0.15, 0.32, 0.06]} /><meshStandardMaterial color="#8B3A10" roughness={0.3} metalness={0.05} /></mesh>
        <mesh position={[0, 1.4, 0]}><boxGeometry args={[0.08, 0.18, 0.05]} /><meshStandardMaterial color="#7A2E08" roughness={0.3} /></mesh>
      </group>
      {/* Tea set on side table */}
      <group position={[1.2, 0, 0.5]}>
        <mesh position={[0, 0.32, 0]}><boxGeometry args={[0.5, 0.04, 0.38]} /><meshStandardMaterial color="#5C3010" roughness={0.7} /></mesh>
        <mesh position={[0.06, 0.35, 0]}><cylinderGeometry args={[0.07, 0.06, 0.1, 8]} /><meshStandardMaterial color="#E8DCC8" roughness={0.5} /></mesh>
        <mesh position={[-0.1, 0.38, 0]}><cylinderGeometry args={[0.09, 0.08, 0.14, 8]} /><meshStandardMaterial color="#E8DCC8" roughness={0.5} /></mesh>
        <mesh position={[0.15, 0.36, 0.1]}><cylinderGeometry args={[0.05, 0.05, 0.08, 8]} /><meshStandardMaterial color="#E8DCC8" roughness={0.5} /></mesh>
        {/* Table legs */}
        <mesh position={[0, 0.15, 0]}><boxGeometry args={[0.48, 0.3, 0.36]} /><meshStandardMaterial color="#4A2800" roughness={0.8} /></mesh>
      </group>
      {/* Sheet music stand */}
      <mesh position={[-0.2, 0, 0.8]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.04, 1.0, 0.04]} />
        <meshStandardMaterial color="#888" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[-0.2, 0.8, 0.88]} rotation={[-0.3, 0.5, 0]}>
        <boxGeometry args={[0.35, 0.28, 0.02]} />
        <meshStandardMaterial color="#F5F0E0" roughness={0.9} />
      </mesh>
      {/* Skull candelabra */}
      <group position={[1.2, 0, -1.0]}>
        <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.08, 0.55, 0.08]} /><meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} /></mesh>
        <mesh position={[0, 0.6, 0]}><boxGeometry args={[0.18, 0.14, 0.16]} /><meshStandardMaterial color="#DDEEDD" roughness={0.6} /></mesh>
        {[[-0.15, 0.72], [0, 0.76], [0.15, 0.72]].map(([cx, cy], i) => (
          <group key={i} position={[cx, cy, 0]}>
            <mesh><cylinderGeometry args={[0.015, 0.015, 0.12, 5]} /><meshStandardMaterial color="#F5F5DC" /></mesh>
            <pointLight position={[0, 0.08, 0]} intensity={0.3} color="#FFA020" distance={3} />
          </group>
        ))}
      </group>
      <Text position={[0, 1.7, -1.6]} fontSize={0.2} color="#FFD700" anchorX="center">MUSIC LOUNGE</Text>
      <pointLight position={[0, 1.5, 0]} intensity={0.5} color="#FFAA40" distance={5} />
    </group>
  )
}

function SickBay() {
  return (
    <group position={[-14, 0, -2]}>
      {/* Floor — clean white-ish */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[8, 0.05, 7]} />
        <meshStandardMaterial color="#F0F0F0" roughness={0.8} />
      </mesh>
      {/* Medical cabinet with red cross */}
      <mesh position={[0, 0.8, -1.3]} castShadow>
        <boxGeometry args={[1.2, 1.5, 0.3]} />
        <meshStandardMaterial color="#F5F5F0" roughness={0.7} />
      </mesh>
      {/* Red cross */}
      <mesh position={[0, 0.9, -1.16]}>
        <boxGeometry args={[0.12, 0.45, 0.02]} />
        <meshStandardMaterial color="#DC143C" emissive="#DC143C" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.9, -1.16]}>
        <boxGeometry args={[0.45, 0.12, 0.02]} />
        <meshStandardMaterial color="#DC143C" emissive="#DC143C" emissiveIntensity={0.2} />
      </mesh>
      {/* Patient bed */}
      <mesh position={[0.5, 0.28, 0.2]} castShadow>
        <boxGeometry args={[1.8, 0.18, 0.8]} />
        <meshStandardMaterial color="#D4C8A8" roughness={0.7} />
      </mesh>
      <mesh position={[0.5, 0.4, 0.2]}>
        <boxGeometry args={[1.75, 0.1, 0.75]} />
        <meshStandardMaterial color="#F8F8F8" roughness={0.8} />
      </mesh>
      {/* Bed legs */}
      {[[-0.84, -0.36], [0.84, -0.36], [-0.84, 0.36], [0.84, 0.36]].map(([lx, lz], i) => (
        <mesh key={i} position={[0.5 + lx, 0.1, 0.2 + lz]}>
          <boxGeometry args={[0.06, 0.2, 0.06]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* Medicine bottles */}
      {[[-0.4, 0, -0.94], [-0.15, 0, -0.94], [0.1, 0, -0.94]].map(([mx, my, mz], i) => (
        <mesh key={i} position={[mx, 1.2, mz]}>
          <cylinderGeometry args={[0.05, 0.05, 0.18, 7]} />
          <meshStandardMaterial color={['#CC0000','#0000CC','#00AA00'][i]} roughness={0.3} transparent opacity={0.8} />
        </mesh>
      ))}
      {/* Chopper's rolling stool (small) */}
      <mesh position={[-0.6, 0.2, 0.4]}><cylinderGeometry args={[0.16, 0.14, 0.06, 8]} /><meshStandardMaterial color="#E84393" roughness={0.7} /></mesh>
      <mesh position={[-0.6, 0.1, 0.4]}><cylinderGeometry args={[0.03, 0.03, 0.2, 6]} /><meshStandardMaterial color="#888" /></mesh>
      <Text position={[0, 1.7, -1.28]} fontSize={0.18} color="#DC143C" anchorX="center">SICK BAY</Text>
    </group>
  )
}

function RobinsLibrary() {
  // Circular library room — stern port side
  // Bookshelves lining the walls, globe, poneglyph, reading lamp
  const bookColors = ['#8B0000','#1A3A6E','#2D6A2D','#8B4513','#4B0082','#C8A000','#1A1A6E','#6A2D2D','#2D5A5A','#5A2D5A']
  return (
    <group position={[-14, 0, -14]}>
      {/* Circular floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 24]} />
        <meshStandardMaterial color="#3E2723" roughness={0.6} />
      </mesh>
      {/* Bookshelf arcs — 8 shelf units arranged in circle */}
      {Array.from({length: 8}, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const r = 5.5
        const x = Math.sin(angle) * r
        const z = Math.cos(angle) * r
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -angle, 0]}>
            {/* Shelf unit */}
            <mesh position={[0, 1.0, 0]} castShadow>
              <boxGeometry args={[1.8, 2.0, 0.22]} />
              <meshStandardMaterial color="#3E2723" roughness={0.7} />
            </mesh>
            {/* Books on 3 shelves */}
            {[0.2, 0.8, 1.4].map((sy, si) =>
              [0, 1, 2].map((bk) => (
                <mesh key={`${si}-${bk}`} position={[-0.25 + bk * 0.24, sy, 0.05]} castShadow>
                  <boxGeometry args={[0.18, 0.44, 0.15]} />
                  <meshStandardMaterial color={bookColors[(i * 3 + si + bk) % bookColors.length]} roughness={0.8} />
                </mesh>
              ))
            )}
          </group>
        )
      })}
      {/* Reading desk — center */}
      <mesh position={[0, 0.44, 0.3]} castShadow>
        <boxGeometry args={[1.2, 0.08, 0.7]} />
        <meshStandardMaterial color="#5D4037" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.22, 0.3]} castShadow>
        <boxGeometry args={[1.1, 0.44, 0.65]} />
        <meshStandardMaterial color="#4E342E" roughness={0.7} />
      </mesh>
      {/* Open book on desk */}
      <mesh position={[0, 0.5, 0.3]} rotation={[0, 0.1, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.35]} />
        <meshStandardMaterial color="#F5F0E0" roughness={0.9} />
      </mesh>
      <mesh position={[-0.26, 0.51, 0.3]} rotation={[0, 0.1, -0.1]}>
        <boxGeometry args={[0.5, 0.02, 0.35]} />
        <meshStandardMaterial color="#F0EBE0" roughness={0.9} />
      </mesh>
      {/* Globe */}
      <group position={[0.7, 0.55, -0.2]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 10, 8]} />
          <meshStandardMaterial color="#2E7DB8" roughness={0.5} metalness={0.1} />
        </mesh>
        {/* Continents suggestion */}
        <mesh position={[0.1, 0.05, 0.18]}>
          <boxGeometry args={[0.16, 0.08, 0.04]} />
          <meshStandardMaterial color="#4CAF50" roughness={0.8} />
        </mesh>
        {/* Stand */}
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.04, 0.08, 0.12, 8]} />
          <meshStandardMaterial color="#C8A000" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, -0.36, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 10]} />
          <meshStandardMaterial color="#C8A000" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
      {/* Poneglyph — dark stone block with gold markings */}
      <group position={[-0.7, 0, -0.5]}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.32, 0.5, 0.28]} />
          <meshStandardMaterial color="#2F2F2F" roughness={0.9} />
        </mesh>
        {/* Gold inscription lines */}
        {[0.08, 0.18, 0.28, 0.38].map((py, i) => (
          <mesh key={i} position={[0, py, 0.15]}>
            <boxGeometry args={[0.22, 0.02, 0.01]} />
            <meshStandardMaterial color="#C8A020" emissive="#C8A020" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </group>
      {/* Reading lamp */}
      <group position={[-0.5, 0, 0.6]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
          <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.22, 0]}>
          <coneGeometry args={[0.18, 0.22, 8]} />
          <meshStandardMaterial color="#C8A020" roughness={0.5} metalness={0.2} emissive="#FFD700" emissiveIntensity={0.2} />
        </mesh>
        <pointLight position={[0, 1.1, 0]} intensity={0.6} color="#FFDD80" distance={3} />
      </group>
      {/* Flowers (Robin's) */}
      {[[0.4, 0, 0.8], [0.6, 0, 0.6], [0.2, 0, 0.9]].map(([fx, fy, fz], i) => (
        <group key={i} position={[fx, fy, fz]}>
          <mesh position={[0, 0.14, 0]}><cylinderGeometry args={[0.015, 0.015, 0.26, 5]} /><meshStandardMaterial color="#2E7D32" /></mesh>
          <mesh position={[0, 0.28, 0]}><sphereGeometry args={[0.055, 6, 5]} /><meshStandardMaterial color={['#FF69B4','#DA70D6','#FF1493'][i]} /></mesh>
        </group>
      ))}
      <Text position={[0, 2.2, -2.1]} fontSize={0.2} color="#C8A020" anchorX="center">LIBRARY</Text>
    </group>
  )
}

function CrowsNestTower() {
  // Elevated observation tower — positioned above the deck level
  // Usopp's lookout post with telescope, gym equipment
  return (
    <group position={[0, 0, -4]}>
      {/* Tower column rising from deck */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.45, 7.2, 10]} />
        <meshStandardMaterial color="#5C3010" roughness={0.85} />
      </mesh>
      {/* Rope ladder rungs */}
      {[1, 1.8, 2.6, 3.4, 4.2, 5.0, 5.8].map((ry, i) => (
        <mesh key={i} position={[0.38, ry, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.3, 5]} />
          <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
        </mesh>
      ))}
      {/* Crow's nest basket */}
      <mesh position={[0, 7.5, 0]} castShadow>
        <cylinderGeometry args={[1.1, 0.9, 0.8, 12]} />
        <meshStandardMaterial color="#5C3010" roughness={0.85} />
      </mesh>
      {/* Nest floor */}
      <mesh position={[0, 7.12, 0]}>
        <cylinderGeometry args={[0.88, 0.88, 0.06, 12]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
      </mesh>
      {/* Railing posts */}
      {Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.sin(a)*0.95, 8.1, Math.cos(a)*0.95]}>
            <boxGeometry args={[0.05, 0.7, 0.05]} />
            <meshStandardMaterial color="#4A2800" roughness={0.9} />
          </mesh>
        )
      })}
      {/* Railing ring */}
      <mesh position={[0, 8.45, 0]}>
        <torusGeometry args={[0.95, 0.04, 6, 16]} />
        <meshStandardMaterial color="#4A2800" roughness={0.8} />
      </mesh>
      {/* Telescope — pointing outward */}
      <group position={[0.5, 7.5, 0.5]} rotation={[0, -0.5, -0.3]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.09, 0.8, 8]} />
          <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.4, 8]} />
          <meshStandardMaterial color="#666" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
      {/* Dumbbells (Zoro's training gear) */}
      <group position={[-0.4, 7.25, 0.2]}>
        <mesh rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.08, 8]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.22, 0, 0]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.08, 8]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      {/* Second dumbbell */}
      <group position={[-0.2, 7.25, 0.4]}>
        <mesh rotation={[0, 0.5, Math.PI/2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-0.22, 0, 0]} rotation={[0, 0.5, Math.PI/2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.08, 8]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.22, 0, 0]} rotation={[0, 0.5, Math.PI/2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.08, 8]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      {/* Jolly Roger flag at very top */}
      <mesh position={[0, 9.5, 0]} castShadow>
        <boxGeometry args={[0.06, 1.5, 0.06]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>
      <mesh position={[0.55, 10.1, 0]}>
        <boxGeometry args={[1.0, 0.65, 0.02]} />
        <meshStandardMaterial color="#111111" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Skull on flag */}
      <mesh position={[0.55, 10.2, 0.02]}>
        <boxGeometry args={[0.22, 0.18, 0.01]} />
        <meshStandardMaterial color="#EEEEEE" />
      </mesh>
      {/* Straw hat brim on flag */}
      <mesh position={[0.55, 10.06, 0.02]}>
        <boxGeometry args={[0.35, 0.06, 0.01]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <Text position={[0, 7.7, -1.15]} fontSize={0.18} color="#FFD700" anchorX="center">CROW'S NEST</Text>
    </group>
  )
}

function MensQuarters() {
  // Forward section of the ship — hammock bunks, lockers, wanted posters
  return (
    <group position={[0, 0, 10]}>
      {/* Floor */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[20, 0.05, 10]} />
        <meshStandardMaterial color="#8B6914" roughness={0.85} />
      </mesh>
      {/* Bunk beds — port side, 3 double-deckers */}
      {[-7, 0, 7].map((bx, bi) => (
        <group key={bi} position={[bx, 0, -1.5]}>
          {/* Frame */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.06, 1.0, 1.6]} />
            <meshStandardMaterial color="#5C3010" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.8, 0.06, 1.6]} />
            <meshStandardMaterial color="#6B3A10" roughness={0.8} />
          </mesh>
          {/* Lower bunk */}
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[0.72, 0.08, 1.5]} />
            <meshStandardMaterial color="#8B5E3C" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[0.7, 0.06, 1.48]} />
            <meshStandardMaterial color="#F0EBE0" roughness={0.9} />
          </mesh>
          {/* Upper bunk */}
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[0.72, 0.08, 1.5]} />
            <meshStandardMaterial color="#8B5E3C" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.78, 0]}>
            <boxGeometry args={[0.7, 0.06, 1.48]} />
            <meshStandardMaterial color="#E8E0D0" roughness={0.9} />
          </mesh>
          {/* Pillow upper */}
          <mesh position={[0, 0.84, -0.6]}>
            <boxGeometry args={[0.55, 0.07, 0.28]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
          {/* Pillow lower */}
          <mesh position={[0, 0.34, -0.6]}>
            <boxGeometry args={[0.55, 0.07, 0.28]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Lockers — starboard side */}
      {[-2.2, -1.1, 0, 1.1, 2.2].map((lx, li) => (
        <group key={li} position={[lx, 0, 1.7]}>
          <mesh position={[0, 0.65, 0]} castShadow>
            <boxGeometry args={[0.85, 1.3, 0.35]} />
            <meshStandardMaterial color="#4A4A5A" roughness={0.6} metalness={0.3} />
          </mesh>
          {/* Locker handle */}
          <mesh position={[0.25, 0.68, 0.18]}>
            <boxGeometry args={[0.04, 0.14, 0.03]} />
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Locker door seam */}
          <mesh position={[0, 0.65, 0.175]}>
            <boxGeometry args={[0.82, 1.26, 0.01]} />
            <meshStandardMaterial color="#333" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Wanted posters on wall */}
      {[[-2.5, 1.2, -1.98], [-1.2, 1.2, -1.98], [0, 1.2, -1.98], [1.2, 1.2, -1.98]].map(([px, py, pz], pi) => (
        <group key={pi} position={[px, py, pz]}>
          <mesh>
            <boxGeometry args={[0.4, 0.52, 0.02]} />
            <meshStandardMaterial color="#F5E8C0" roughness={0.9} />
          </mesh>
          {/* WANTED text suggestion */}
          <mesh position={[0, 0.16, 0.01]}>
            <boxGeometry args={[0.32, 0.06, 0.01]} />
            <meshStandardMaterial color="#8B0000" roughness={0.8} />
          </mesh>
          {/* Face placeholder — different colors per person */}
          <mesh position={[0, -0.04, 0.01]}>
            <boxGeometry args={[0.28, 0.22, 0.01]} />
            <meshStandardMaterial color={['#F4C28C','#F4C28C','#8B5A2B','#D4A574'][pi]} roughness={0.8} />
          </mesh>
          {/* Bounty bar */}
          <mesh position={[0, -0.2, 0.01]}>
            <boxGeometry args={[0.32, 0.06, 0.01]} />
            <meshStandardMaterial color="#1A1A2A" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* Kotatsu-style sunken table center */}
      <mesh position={[0, 0.14, 0.2]} castShadow>
        <boxGeometry args={[1.2, 0.06, 0.8]} />
        <meshStandardMaterial color="#6B4423" roughness={0.6} />
      </mesh>
      {/* Emergency alarm bell */}
      <group position={[2.8, 1.6, -1.8]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.16, 0.2, 10]} />
          <meshStandardMaterial color="#CC8800" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      <Text position={[0, 1.8, -1.95]} fontSize={0.2} color="#C8A020" anchorX="center">MEN'S QUARTERS</Text>
    </group>
  )
}

// ══ Scene Error Boundary (prevents black-screen from effect component crashes) ══
class SceneErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false } }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err) { console.warn('[SceneErrorBoundary] caught:', err) }
  render() { return this.state.hasError ? null : this.props.children }
}

// ══ Main App ═════════════════════════════════════════════════════════════════
export default function App() {
  const rawStatuses = useGatewayStatus()
  const { statuses, demoActive } = useDemoMode(rawStatuses)
  const whiteboardData = useWhiteboardData()
  const skyState = useDayNightCycle()
  const orbitRef = useRef()
  const { isMobile } = useIsMobile()
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [focusTarget, setFocusTarget] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const { playStateChange, setAmbientEnabled, ambientEnabled, hasInteracted } = useAgentSounds()
  const durations = useStateDuration(statuses)
  const prevStatusesRef = useRef(null)

  useEffect(() => {
    if (prevStatusesRef.current === null) {
      // First mount — just store, don't play sounds
      prevStatusesRef.current = statuses
      return
    }
    const prev = prevStatusesRef.current
    statuses.forEach(s => {
      const prevEntry = prev.find(p => p.name === s.name)
      if (prevEntry && prevEntry.state !== s.state) {
        playStateChange(s.name, s.state, prevEntry.state)
      }
    })
    prevStatusesRef.current = statuses
  }, [statuses, playStateChange])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        setShowHelp(prev => !prev)
        return
      }
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false)
        return
      }
      if (e.key === 'Escape' && showDashboard) {
        setShowDashboard(false)
        return
      }
      if (e.key === 'c' || e.key === 'C') {
        if (!showHelp) {
          setShowDashboard(prev => !prev)
          return
        }
      }
      if (e.key === 'r' || e.key === 'R' || e.key === 'Escape') {
        setFocusTarget(null)
        return
      }
      const idx = parseInt(e.key, 10)
      if (!isNaN(idx) && idx >= 1 && idx <= CREW.length) {
        setFocusTarget(CREW[idx - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showHelp, showDashboard])

  function getState(name) {
    return statuses.find(s => s.name === name)?.state || 'idle'
  }

  const selectedStatus = selectedAgent ? statuses.find(s => s.name === selectedAgent.name) : null

  return (
    <StatusContext.Provider value={statuses}>
    <div style={{ width:'100vw',height:'100vh',background:'#87CEEB' }}>
      <style>{`@keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.5); } } @keyframes fadeInRow { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } } @keyframes helpFadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
      <RosterBar statuses={statuses} onFocusAgent={setFocusTarget} focusTarget={focusTarget} demoActive={demoActive} ambientEnabled={ambientEnabled} setAmbientEnabled={setAmbientEnabled} hasInteracted={hasInteracted} showDashboard={showDashboard} setShowDashboard={setShowDashboard} />
      <SprintHUD />
      <ActivityFeed statuses={statuses} />
      <CommitFeed />
      <TaskFeed />
      <Canvas
        shadows
        camera={{ position: isMobile ? [0, 55, 80] : [0, 35, 70], fov: isMobile ? 50 : 50 }}
        style={{ width:'100%',height:'100%',paddingTop:isMobile?'44px':'60px',paddingBottom:'32px',boxSizing:'border-box' }}
        gl={{ antialias:true }}
        touch-action="none"
        onCreated={({ gl, scene }) => {
          scene.fog = null // Sunny sails in clear bright skies — no fog
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            console.warn('WebGL context lost — will attempt restore')
          })
        }}
      >
        <ambientLight intensity={skyState.ambientIntensity} color={skyState.ambientColor} />
        <directionalLight position={[20, 40, 25]} intensity={skyState.dirLightIntensity} color="#FFF5E0" castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5} shadow-camera-far={200}
          shadow-camera-left={-60} shadow-camera-right={60}
          shadow-camera-top={60} shadow-camera-bottom={-60}
        />
        <directionalLight position={[-6, 8, -4]} intensity={0.8} color="#AACCFF" />
        <directionalLight position={[0, 4, 12]} intensity={0.6} color="#FFD700" /> {/* warm fill from bow */}
        <pointLight position={[0, 5, 0]} intensity={1.2} color="#FFE8C0" distance={30} />
        <pointLight position={[0, 8, 6]} intensity={0.6} color="#FFD080" distance={20} /> {/* figurehead glow */}

        <OceanSkyEnvironment />

        {/* World-fixed elements — NOT bobbed */}
        <DynamicSky skyState={skyState} />
        <SceneErrorBoundary><StarField opacity={skyState.starsOpacity} /></SceneErrorBoundary>
        <SceneErrorBoundary><WakeFoam /></SceneErrorBoundary>

        {/* Ship content — all bobs with the ocean */}
        <ShipBob>
          {/* Ship Structure */}
          <ShipDeck />
          <ShipHullShaped />
          <LionFigurehead />

          {/* Masts */}
          <AnimatedMast position={[-8, 0, -12]} />
          <AnimatedMast position={[8, 0, -12]} />

          {/* Captain's Log (was Whiteboard) */}
          <CaptainsLog data={whiteboardData} />

          {/* Grass lawn area */}
          <GrassLawn />

          {/* Helm at stern */}
          <NavigationWheel position={[0, 2.2, -20]} />

          {/* Cannons */}
          <Cannon position={[-28, 0.3, -6]} rotateY={Math.PI / 2} />
          <Cannon position={[-28, 0.3, 3]} rotateY={Math.PI / 2} />
          <Cannon position={[28, 0.3, -6]} rotateY={-Math.PI / 2} />
          <Cannon position={[28, 0.3, 3]} rotateY={-Math.PI / 2} />

          {/* Strategy Room (center back) */}
          <StrategyRoom />

          {/* Signature crew stations */}
          <KitchenStation position={[6, 0, 12]} />
          <WorkshopStation position={[-10, 0, 8]} />

          {/* Aquarium Bar — lower deck feel, stern area */}
          <AquariumBar />
          {/* Nami's Tangerine Grove */}
          <TangerineGrove />
          {/* Music Lounge — Brook */}
          <MusicLounge />
          {/* Sick Bay — Chopper */}
          <SickBay />
          {/* Robin's Library — circular bookshelves, poneglyph, globe */}
          <RobinsLibrary />
          {/* Crow's Nest Tower — telescope, gym, Jolly Roger */}
          <CrowsNestTower />
          {/* Men's Quarters — bunks, lockers, wanted posters */}
          <MensQuarters />

          {CREW.map(agent => (
            <DeskGroup
              key={agent.name}
              agent={agent}
              agentState={getState(agent.name)}
              onClick={() => setSelectedAgent(agent)}
              isSelected={selectedAgent?.name === agent.name}
            />
          ))}

          <TaskFlowParticles />
          <NetworkLines />
          <AmbientHologram confTablePos={[0, 0.5, -2]} />
        </ShipBob>

        <SceneErrorBoundary><SceneEffects /></SceneErrorBoundary>

        <OrbitControls ref={orbitRef} target={[0, 0, -5]} enableDamping dampingFactor={0.06}
          minDistance={6} maxDistance={120} maxPolarAngle={Math.PI / 2.3}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_ROTATE }}
          enableZoom enableRotate enablePan={!isMobile} />
        <CameraFocus target={focusTarget} orbitRef={orbitRef} />
      </Canvas>

      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          status={selectedStatus}
          onClose={() => setSelectedAgent(null)}
          duration={durations[selectedAgent?.name]}
        />
      )}

      <HelpOverlay visible={showHelp} onClose={() => setShowHelp(false)} />
      <CaptainsDashboard visible={showDashboard} onClose={() => setShowDashboard(false)} statuses={statuses} demoActive={demoActive} />
      <GatewayBanner statuses={statuses} demoActive={demoActive} />
      <CrewTicker statuses={statuses} />

      {!isMobile && <div style={{ position:'fixed',bottom:'46px',right:'18px',color:'#334455',fontFamily:'monospace',fontSize:'11px',pointerEvents:'none' }}>
        Hover character for portrait · Drag to orbit · Scroll to zoom
      </div>}
    </div>
    </StatusContext.Provider>
  )
}
