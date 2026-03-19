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
  const deckWidth = 20
  const deckDepth = 16
  const plankWidth = deckWidth
  const plankHeight = 0.06
  const plankDepth = 0.9
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
    { x: -1.2, z: -0.6, color: '#FF69B4' },
    { x: 0.8, z: -0.9, color: '#FFD700' },
    { x: -0.3, z: 0.4, color: '#FF69B4' },
    { x: 1.1, z: 0.6, color: '#FFD700' },
    { x: -1.5, z: 0.7, color: '#FF69B4' },
    { x: 0.2, z: -0.2, color: '#FFD700' },
  ]
  return (
    <group position={[0, 0.02, -3]}>
      {/* Lawn base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5, 0.05, 3]} />
        <meshStandardMaterial color="#2D7A2D" roughness={0.9} />
      </mesh>
      {/* Border */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[5.1, 0.03, 3.1]} />
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
    <group position={[0, 1.2, 7]}>
      {/* Mane */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[1.8, 1.4, 0.4]} />
        <meshStandardMaterial color="#C07010" roughness={0.7} />
      </mesh>
      {/* Main head */}
      <mesh position={[0, 0, 0.35]}>
        <boxGeometry args={[1.2, 1.0, 0.8]} />
        <meshStandardMaterial color="#D4A020" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.28, 0.15, 0.76]}>
        <boxGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.28, 0.15, 0.76]}>
        <boxGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, -0.1, 0.78]}>
        <boxGeometry args={[0.2, 0.12, 0.12]} />
        <meshStandardMaterial color="#8B5E00" roughness={0.8} />
      </mesh>
      {/* Label */}
      <Text position={[0, -0.88, 0.4]} fontSize={0.22} color="#D4A020" anchorX="center" fontWeight="bold">
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
      <mesh position={[-9.5, -0.3, -0.5]} castShadow>
        <boxGeometry args={[0.5, 0.6, 18]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[-9.2, -1.1, -0.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 17]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[-8.8, -2.2, -0.5]} castShadow>
        <boxGeometry args={[0.5, 1.2, 15]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[-8.2, -3.3, -0.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 12]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[-9.6, 0.05, -0.5]}>
        <boxGeometry args={[0.12, 0.12, 18]} />
        <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} emissive={goldTrim} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-9.6, 0.4, -0.5]} castShadow>
        <boxGeometry args={[0.25, 0.18, 18]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>

      {/* === STARBOARD SIDE HULL (right, x positive) === */}
      <mesh position={[9.5, -0.3, -0.5]} castShadow>
        <boxGeometry args={[0.5, 0.6, 18]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[9.2, -1.1, -0.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 17]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[8.8, -2.2, -0.5]} castShadow>
        <boxGeometry args={[0.5, 1.2, 15]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[8.2, -3.3, -0.5]} castShadow>
        <boxGeometry args={[0.5, 1.0, 12]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[9.6, 0.05, -0.5]}>
        <boxGeometry args={[0.12, 0.12, 18]} />
        <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} emissive={goldTrim} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[9.6, 0.4, -0.5]} castShadow>
        <boxGeometry args={[0.25, 0.18, 18]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>

      {/* === STERN (back wall at z=-9) === */}
      <mesh position={[0, -1.5, -9]} castShadow>
        <boxGeometry args={[19, 3.5, 0.4]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.05, -9]}>
        <boxGeometry args={[19.5, 0.12, 0.15]} />
        <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} emissive={goldTrim} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.4, -9]} castShadow>
        <boxGeometry args={[19.5, 0.18, 0.3]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>

      {/* === BOW TAPER (front, z=7 to 10) === */}
      <mesh position={[-7.5, -0.5, 7.5]} rotation={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.4, 1.0, 4]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[-5.5, -1.5, 8.5]} rotation={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 1.5, 3]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>
      <mesh position={[7.5, -0.5, 7.5]} rotation={[0, -0.35, 0]} castShadow>
        <boxGeometry args={[0.4, 1.0, 4]} />
        <meshStandardMaterial color={hullGreen} roughness={0.85} />
      </mesh>
      <mesh position={[5.5, -1.5, 8.5]} rotation={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 1.5, 3]} />
        <meshStandardMaterial color={hullDark} roughness={0.9} />
      </mesh>

      {/* === SOLDIER DOCK SYSTEM (port side, 3 hatches) === */}
      {[-3, 0, 3].map((z, i) => (
        <group key={i} position={[-9.55, -0.5, z]}>
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
      <group position={[9.5, 0.5, 1]}>
        <mesh castShadow>
          <boxGeometry args={[0.15, 1.8, 4.0]} />
          <meshStandardMaterial color="#001833" roughness={0.1} metalness={0.2} transparent opacity={0.7} />
        </mesh>
        <mesh position={[-0.1, 0, 0]}>
          <boxGeometry args={[0.05, 1.6, 3.8]} />
          <meshStandardMaterial color="#003366" emissive="#0044AA" emissiveIntensity={0.8} transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[0.08, 1.9, 4.1]} />
          <meshStandardMaterial color={goldTrim} roughness={0.4} metalness={0.6} />
        </mesh>
        <Text position={[0.2, 1.2, 0]} fontSize={0.18} color={goldTrim} rotation={[0, Math.PI/2, 0]} anchorX="center">
          AQUARIUM BAR
        </Text>
      </group>

      {/* === CAPTAIN'S QUARTERS ENTRANCE (stern, center) === */}
      <group position={[0, 0.5, -8.8]}>
        <mesh>
          <boxGeometry args={[1.2, 2.2, 0.15]} />
          <meshStandardMaterial color="#3A2008" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.0, 2.0, 0.08]} />
          <meshStandardMaterial color="#5C3010" roughness={0.7} />
        </mesh>
        <mesh position={[0.3, 0, 0.1]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color={goldTrim} metalness={0.8} roughness={0.2} />
        </mesh>
        <Text position={[0, 1.3, 0.1]} fontSize={0.14} color={goldTrim} anchorX="center">
          CAPTAIN'S QUARTERS
        </Text>
      </group>

      {/* === HELM PLATFORM (stern raised area for steering) === */}
      <mesh position={[0, 0.35, -7]} castShadow receiveShadow>
        <boxGeometry args={[8, 0.3, 4]} />
        <meshStandardMaterial color="#7A5230" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.15, -5.2]} castShadow>
        <boxGeometry args={[8, 0.15, 0.6]} />
        <meshStandardMaterial color="#6B4423" roughness={0.85} />
      </mesh>

      {/* === BOW PLATFORM (front raised area, lion sits on it) === */}
      <mesh position={[0, 0.2, 6.5]} castShadow receiveShadow>
        <boxGeometry args={[6, 0.3, 3]} />
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
    <group position={[0, 2.6, -7.6]}>
      <mesh castShadow>
        <boxGeometry args={[2.8, 1.6, 0.07]} />
        <meshStandardMaterial color="#5C3D1E" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[2.6, 1.44, 0.02]} />
        <meshStandardMaterial color="#F5F2EC" roughness={0.9} />
      </mesh>
      <Text position={[0, 0.38, 0.06]} fontSize={0.18} color="#1A1A2E" anchorX="center" fontWeight="bold">{d.header}</Text>
      <Text position={[0, 0.08, 0.06]} fontSize={0.105} color="#444" anchorX="center">{d.line1}</Text>
      <Text position={[0, -0.22, 0.06]} fontSize={0.095} color={d.statusColor} anchorX="center">{d.line2}</Text>
    </group>
  )
}

function StrategyRoom() {
  return (
    <group position={[0, 0, -5]}>
      {/* Back wall */}
      <mesh position={[0, 1.5, -1.8]} castShadow>
        <boxGeometry args={[5, 3, 0.15]} />
        <meshStandardMaterial color="#4A3010" roughness={0.85} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-2.4, 1.5, -0.5]} castShadow>
        <boxGeometry args={[0.15, 3, 2.5]} />
        <meshStandardMaterial color="#4A3010" roughness={0.85} />
      </mesh>
      {/* Right wall */}
      <mesh position={[2.4, 1.5, -0.5]} castShadow>
        <boxGeometry args={[0.15, 3, 2.5]} />
        <meshStandardMaterial color="#4A3010" roughness={0.85} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.1, -0.9]} castShadow>
        <boxGeometry args={[5, 0.12, 3]} />
        <meshStandardMaterial color="#3A2008" roughness={0.8} />
      </mesh>
      {/* Round meeting table */}
      <mesh position={[0, 0.6, -0.4]} castShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.08, 16]} />
        <meshStandardMaterial color="#8B6914" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Table leg */}
      <mesh position={[0, 0.3, -0.4]} castShadow>
        <cylinderGeometry args={[0.07, 0.12, 0.52, 8]} />
        <meshStandardMaterial color="#6B4F10" roughness={0.6} />
      </mesh>
      {/* Hologram map on table */}
      <mesh position={[0, 0.67, -0.4]}>
        <cylinderGeometry args={[0.6, 0.6, 0.02, 16]} />
        <meshStandardMaterial color="#002244" emissive="#0044FF" emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
      {/* Log Pose on table */}
      <mesh position={[0.3, 0.68, -0.2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.14, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.7} />
      </mesh>
      <Text position={[0, 3.3, -1.75]} fontSize={0.2} color="#D4A020" anchorX="center">
        STRATEGY ROOM
      </Text>
    </group>
  )
}

function AquariumBar() {
  return (
    <group position={[0, -1.5, -3]}>
      {/* Aquarium glass walls — port side */}
      <mesh position={[-3.5, 1.5, 0]} castShadow>
        <boxGeometry args={[0.1, 3, 6]} />
        <meshStandardMaterial color="#88CCFF" transparent opacity={0.4} roughness={0.0} metalness={0.1} />
      </mesh>
      {/* Aquarium glass — starboard side */}
      <mesh position={[3.5, 1.5, 0]} castShadow>
        <boxGeometry args={[0.1, 3, 6]} />
        <meshStandardMaterial color="#88CCFF" transparent opacity={0.4} roughness={0.0} metalness={0.1} />
      </mesh>
      {/* Aquarium glass — back */}
      <mesh position={[0, 1.5, -3]}>
        <boxGeometry args={[7, 3, 0.1]} />
        <meshStandardMaterial color="#88CCFF" transparent opacity={0.35} roughness={0.0} metalness={0.1} />
      </mesh>
      {/* Water inside — glowing blue */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[6.8, 1.8, 5.8]} />
        <meshStandardMaterial color="#1A4A6B" emissive="#004488" emissiveIntensity={0.4} transparent opacity={0.6} />
      </mesh>
      {/* Aquarium point light (blue) */}
      <pointLight position={[0, 2, 0]} intensity={0.8} color="#4488FF" distance={8} />
      {/* Checkered floor */}
      {Array.from({ length: 7 }, (_, i) =>
        Array.from({ length: 6 }, (_, j) => (
          <mesh key={`${i}-${j}`} position={[-3 + i, -0.02, -2.5 + j]} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[0.98, 0.98]} />
            <meshStandardMaterial color={(i + j) % 2 === 0 ? '#FFFFFF' : '#1A1A1A'} />
          </mesh>
        ))
      )}
      {/* Bar counter */}
      <mesh position={[0, 0.55, 2.2]} castShadow>
        <boxGeometry args={[5, 0.9, 0.5]} />
        <meshStandardMaterial color="#5C3010" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.02, 2.2]}>
        <boxGeometry args={[5.1, 0.06, 0.55]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.4} />
      </mesh>
      {/* Bar stools */}
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <group key={i} position={[x, 0, 1.6]}>
          <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[0.18, 0.14, 0.06, 10]} /><meshStandardMaterial color="#2A2A4A" /></mesh>
          <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.04, 0.04, 0.38, 8]} /><meshStandardMaterial color="#888" /></mesh>
        </group>
      ))}
      {/* Central mast with alcohol shelves */}
      <mesh position={[0, 1.5, -0.5]} castShadow>
        <boxGeometry args={[0.4, 3.2, 0.4]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>
      {/* Drink bottles on central mast shelves */}
      {[-0.8, 0.2, 1.2].map((y, row) =>
        [-0.15, 0, 0.15].map((x, col) => (
          <mesh key={`${row}-${col}`} position={[x + 0.25, y, -0.5]}>
            <cylinderGeometry args={[0.04, 0.04, 0.22, 6]} />
            <meshStandardMaterial color={['#8B0000','#006400','#FFD700','#4B0082','#FF4500','#1A1A8B','#DC143C','#006400','#FFD700'][row*3+col]} roughness={0.3} metalness={0.1} />
          </mesh>
        ))
      )}
      {/* Fish silhouettes in aquarium */}
      {[[-2, 1.2, -1], [1, 0.8, -2], [-1, 1.5, 0], [2, 1.0, -1.5], [0, 0.6, -2.2]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.3, 0.12, 0.08]} />
          <meshStandardMaterial color={['#FF6B35','#FFD700','#4ECDC4','#FF69B4','#FFA500'][i]} emissive={['#FF6B35','#FFD700','#4ECDC4','#FF69B4','#FFA500'][i]} emissiveIntensity={0.3} transparent opacity={0.8} />
        </mesh>
      ))}
      <Text position={[0, 3.1, -2.9]} fontSize={0.22} color="#FFD700" anchorX="center">AQUARIUM BAR</Text>
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
    <group position={[-5, 0.4, -5]}>
      {/* Grove floor — slightly raised platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[4, 0.1, 3.5]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.9} />
      </mesh>
      {/* Trees */}
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
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
    <group position={[5, 0, -5]}>
      {/* Floor — polished dark wood */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[4, 0.06, 3.5]} />
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
    <group position={[-5, 0, 0]}>
      {/* Floor — clean white-ish */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[3.5, 0.05, 3]} />
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
    <group position={[-5, 0, -5]}>
      {/* Circular floor */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.5, 20]} />
        <meshStandardMaterial color="#3E2723" roughness={0.6} />
      </mesh>
      {/* Bookshelf arcs — 8 shelf units arranged in circle */}
      {Array.from({length: 8}, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const r = 2.2
        const x = Math.sin(angle) * r
        const z = Math.cos(angle) * r
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -angle, 0]}>
            {/* Shelf unit */}
            <mesh position={[0, 1.0, 0]} castShadow>
              <boxGeometry args={[0.8, 2.0, 0.22]} />
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
    <group position={[0, 0, -1]}>
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
    <group position={[0, 0, 4]}>
      {/* Floor */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <boxGeometry args={[7, 0.05, 4]} />
        <meshStandardMaterial color="#8B6914" roughness={0.85} />
      </mesh>
      {/* Bunk beds — port side, 3 double-deckers */}
      {[-2.5, 0, 2.5].map((bx, bi) => (
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
        camera={{ position: isMobile ? [0, 22, 26] : [0, 18, 22], fov: isMobile ? 50 : 42 }}
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
        <directionalLight position={[8, 16, 10]} intensity={skyState.dirLightIntensity} color="#FFF5E0" castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5} shadow-camera-far={80}
          shadow-camera-left={-20} shadow-camera-right={20}
          shadow-camera-top={20} shadow-camera-bottom={-20}
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
          <WoodenDeck />
          <ThousandSunnyHull />
          <LionFigurehead />

          {/* Masts */}
          <AnimatedMast position={[-3, 0, -4]} />
          <AnimatedMast position={[3, 0, -4]} />

          {/* Captain's Log (was Whiteboard) */}
          <CaptainsLog data={whiteboardData} />

          {/* Grass lawn area */}
          <GrassLawn />

          {/* Helm at stern */}
          <NavigationWheel position={[0, 1.85, -7]} />

          {/* Cannons */}
          <Cannon position={[-9, 0.3, -2]} rotateY={Math.PI / 2} />
          <Cannon position={[-9, 0.3, 1]} rotateY={Math.PI / 2} />
          <Cannon position={[9, 0.3, -2]} rotateY={-Math.PI / 2} />
          <Cannon position={[9, 0.3, 1]} rotateY={-Math.PI / 2} />

          {/* Strategy Room (center back) */}
          <StrategyRoom />

          {/* Signature crew stations */}
          <KitchenStation position={[3, 0, 4.5]} />
          <WorkshopStation position={[-4, 0, 4.5]} />

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

        <OrbitControls ref={orbitRef} target={[0, 1, 0]} enableDamping dampingFactor={0.06}
          minDistance={6} maxDistance={40} maxPolarAngle={Math.PI / 2.1}
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
