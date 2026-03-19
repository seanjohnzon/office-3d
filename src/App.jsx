import React, { useRef, useState, useEffect } from 'react'
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

function ShipHull() {
  const hullColor = '#5C3010'
  const plankArgs = [20, 0.55, 0.22]
  const hullHeights = [0.3, 0.85, 1.4, 1.95]
  return (
    <group>
      {/* Left hull */}
      {hullHeights.map((y, i) => (
        <mesh key={`lh-${i}`} position={[-10, y, -1]} castShadow>
          <boxGeometry args={[0.22, 0.5, 16]} />
          <meshStandardMaterial color={hullColor} roughness={0.9} />
        </mesh>
      ))}
      {/* Right hull */}
      {hullHeights.map((y, i) => (
        <mesh key={`rh-${i}`} position={[10, y, -1]} castShadow>
          <boxGeometry args={[0.22, 0.5, 16]} />
          <meshStandardMaterial color={hullColor} roughness={0.9} />
        </mesh>
      ))}
      {/* Back hull */}
      {hullHeights.map((y, i) => (
        <mesh key={`bh-${i}`} position={[0, y, -8]} castShadow>
          <boxGeometry args={[20.44, 0.5, 0.22]} />
          <meshStandardMaterial color={hullColor} roughness={0.9} />
        </mesh>
      ))}
      {/* Hull cap rails */}
      <mesh position={[-10, 2.25, -1]}>
        <boxGeometry args={[0.3, 0.12, 16]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>
      <mesh position={[10, 2.25, -1]}>
        <boxGeometry args={[0.3, 0.12, 16]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.25, -8]}>
        <boxGeometry args={[20.44, 0.12, 0.3]} />
        <meshStandardMaterial color="#3A1A05" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Mast({ position }) {
  return (
    <group position={position}>
      {/* Main mast pole */}
      <mesh position={[0, 4, 0]} castShadow>
        <boxGeometry args={[0.2, 8, 0.2]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 5.5, 0]} castShadow>
        <boxGeometry args={[3, 0.15, 0.15]} />
        <meshStandardMaterial color="#4A2800" roughness={0.9} />
      </mesh>
      {/* Sail */}
      <mesh position={[0, 3.8, 0.08]} castShadow>
        <boxGeometry args={[2.8, 3.2, 0.04]} />
        <meshStandardMaterial color="#F5F0E0" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Crow nest */}
      <mesh position={[0, 8.2, 0]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <meshStandardMaterial color="#5C3010" roughness={0.8} />
      </mesh>
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
  }, [showHelp])

  function getState(name) {
    return statuses.find(s => s.name === name)?.state || 'idle'
  }

  const selectedStatus = selectedAgent ? statuses.find(s => s.name === selectedAgent.name) : null

  return (
    <StatusContext.Provider value={statuses}>
    <div style={{ width:'100vw',height:'100vh',background:'#060C18' }}>
      <style>{`@keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.5); } } @keyframes fadeInRow { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } } @keyframes helpFadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
      <RosterBar statuses={statuses} onFocusAgent={setFocusTarget} focusTarget={focusTarget} demoActive={demoActive} ambientEnabled={ambientEnabled} setAmbientEnabled={setAmbientEnabled} hasInteracted={hasInteracted} />
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

        {/* Ship Structure */}
        <WoodenDeck />
        <ShipHull />
        <LionFigurehead />

        {/* Masts */}
        <Mast position={[-3, 0, -4]} />
        <Mast position={[3, 0, -4]} />

        {/* Captain's Log (was Whiteboard) */}
        <CaptainsLog data={whiteboardData} />

        {/* Grass lawn area */}
        <GrassLawn />

        {/* Navigation wheel at Nami's station */}
        <NavigationWheel position={[-6.5, 1.0, -5]} />

        {/* Cannons */}
        <Cannon position={[-9, 0.3, 0]} rotateY={0} />
        <Cannon position={[9, 0.3, 0]} rotateY={Math.PI} />

        {/* Signature crew stations */}
        <KitchenStation position={[0, 0, 6.5]} />
        <WorkshopStation position={[-3, 0, 6.5]} />

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
      <GatewayBanner statuses={statuses} demoActive={demoActive} />
      <CrewTicker statuses={statuses} />

      {!isMobile && <div style={{ position:'fixed',bottom:'46px',right:'18px',color:'#334455',fontFamily:'monospace',fontSize:'11px',pointerEvents:'none' }}>
        Hover character for portrait · Drag to orbit · Scroll to zoom
      </div>}
    </div>
    </StatusContext.Provider>
  )
}
