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
import OceanPlane from './OceanPlane'
import StarField from './components/StarField'
import WakeFoam from './components/WakeFoam'

// ══ Thousand Sunny Scene ══════════════════════════════════════════════════════

function CosmicBackdrop() {
  return (
    <>
      {/* Space floor plane */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0A1525" roughness={1} />
      </mesh>
      {/* Distant planet with rings */}
      <mesh position={[28, -8, -38]}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshStandardMaterial color="#1B2A4A" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[28, -8, -38]} rotation={[0.3, 0, 0.2]}>
        <torusGeometry args={[14, 0.35, 8, 64]} />
        <meshStandardMaterial color="#2A3D6A" roughness={1} />
      </mesh>
      {/* Smaller moon */}
      <mesh position={[-24, 10, -38]}>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshStandardMaterial color="#2E3A5A" roughness={1} />
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
  const hullGreen = '#2C5F2E'
  const hullDark = '#1A3D1C'
  const goldTrim = '#C8A000'

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
  const d = data || { header: "CAPTAIN'S LOG · LIVE", line1: "D2.22 ✓ Glow Ring", line2: "D2.23 → Dynamic Board", statusColor: "#2ecc71" }
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
    <div style={{ width:'100vw',height:'100vh',background:'#060C18' }}>
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
      >
        <ambientLight intensity={0.45} color="#C8D8F0" />
        <directionalLight position={[8, 16, 10]} intensity={1.4} color="#FFF5E0" castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5} shadow-camera-far={80}
          shadow-camera-left={-20} shadow-camera-right={20}
          shadow-camera-top={20} shadow-camera-bottom={-20}
        />
        <directionalLight position={[-6, 8, -4]} intensity={0.3} color="#8899FF" />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFE8C0" distance={20} />

        <Stars radius={80} depth={40} count={3000} factor={3} fade speed={0.3} />
        <CosmicBackdrop />
        <OceanPlane />
        <SceneErrorBoundary><StarField /></SceneErrorBoundary>
        <SceneErrorBoundary><WakeFoam /></SceneErrorBoundary>

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

        <SceneEffects />

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
