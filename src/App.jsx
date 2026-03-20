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
import VoxelCharacter from './components/VoxelCharacter'
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
import ShipDeck, { shipWidthAtZ, ShipHullShaped, ThousandSunnyHull, ThousandSunnyDeck } from './components/ship/ShipStructure'
import OceanSkyEnvironment, { WoodenDeck, GrassLawn } from './components/ship/ShipEnvironment'
import Mast, { CrowsNest, NavigationWheel, Cannon, LionFigurehead, LuffyAtFigurehead, CaptainsLog } from './components/ship/ShipProps'
import StrategyRoom, { RoomBox, AquariumBar, TangerineGrove, MusicLounge, SickBay, RobinsLibrary, CrowsNestTower, MensQuarters } from './components/ship/ShipRooms'
import SceneErrorBoundary from './components/SceneErrorBoundary'


function SunnyProps() {
  const mastWood   = '#6B3A0F'
  const sailCream  = '#F5EDD0'
  const lionYellow = '#E8A020'
  const lionGold   = '#C87010'
  const metalGray  = '#7A8A8A'
  const ropeColor  = '#C8A878'

  return (
    <group>

      {/* MAIN MAST - center of deck, tall */}
      {/* Base step */}
      <mesh position={[0, 0.35, -1]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color={mastWood} roughness={0.8} />
      </mesh>
      {/* Lower mast */}
      <mesh position={[0, 4.0, -1]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 8.0, 10]} />
        <meshStandardMaterial color={mastWood} roughness={0.8} />
      </mesh>
      {/* Upper mast */}
      <mesh position={[0, 10.5, -1]} castShadow>
        <cylinderGeometry args={[0.12, 0.20, 5.0, 8]} />
        <meshStandardMaterial color={mastWood} roughness={0.8} />
      </mesh>
      {/* Mast tip */}
      <mesh position={[0, 13.2, -1]} castShadow>
        <cylinderGeometry args={[0.04, 0.12, 1.0, 6]} />
        <meshStandardMaterial color={mastWood} roughness={0.8} />
      </mesh>

      {/* CROW'S NEST */}
      {/* Platform */}
      <mesh position={[0, 8.8, -1]} castShadow>
        <boxGeometry args={[2.2, 0.18, 2.2]} />
        <meshStandardMaterial color={mastWood} roughness={0.7} />
      </mesh>
      {/* Crow nest walls */}
      <mesh position={[0, 9.3, -2.0]} castShadow>
        <boxGeometry args={[2.2, 0.8, 0.18]} />
        <meshStandardMaterial color={mastWood} roughness={0.8} />
      </mesh>
      <mesh position={[0, 9.3, 0.0]} castShadow>
        <boxGeometry args={[2.2, 0.8, 0.18]} />
        <meshStandardMaterial color={mastWood} roughness={0.8} />
      </mesh>
      <mesh position={[-1.0, 9.3, -1]} castShadow>
        <boxGeometry args={[0.18, 0.8, 2.2]} />
        <meshStandardMaterial color={mastWood} roughness={0.8} />
      </mesh>
      <mesh position={[1.0, 9.3, -1]} castShadow>
        <boxGeometry args={[0.18, 0.8, 2.2]} />
        <meshStandardMaterial color={mastWood} roughness={0.8} />
      </mesh>

      {/* MAIN SAIL - furled horizontal crossbeam + rolled sail */}
      {/* Crossbeam */}
      <mesh position={[0, 7.0, -1]} castShadow>
        <boxGeometry args={[9.0, 0.24, 0.24]} />
        <meshStandardMaterial color={mastWood} roughness={0.8} />
      </mesh>
      {/* Rolled sail lying along x axis */}
      <mesh position={[0, 6.55, -1]} rotation={[0, 0, Math.PI/2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 8.2, 10]} />
        <meshStandardMaterial color={sailCream} roughness={0.9} />
      </mesh>

      {/* LION FIGUREHEAD at bow */}
      {/* Lion mane */}
      <mesh position={[0, 1.8, -12.5]} castShadow>
        <sphereGeometry args={[1.8, 10, 8]} />
        <meshStandardMaterial color={lionYellow} roughness={0.7} />
      </mesh>
      {/* Lion face */}
      <mesh position={[0, 1.8, -13.8]} castShadow>
        <sphereGeometry args={[1.2, 10, 8]} />
        <meshStandardMaterial color="#F0C060" roughness={0.6} />
      </mesh>
      {/* Left eye */}
      <mesh position={[-0.45, 2.1, -14.9]} castShadow>
        <sphereGeometry args={[0.18, 7, 7]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Right eye */}
      <mesh position={[0.45, 2.1, -14.9]} castShadow>
        <sphereGeometry args={[0.18, 7, 7]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 1.7, -15.0]} castShadow>
        <boxGeometry args={[0.28, 0.18, 0.18]} />
        <meshStandardMaterial color={lionGold} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Mouth */}
      <mesh position={[0, 1.35, -14.95]} castShadow>
        <boxGeometry args={[0.6, 0.14, 0.14]} />
        <meshStandardMaterial color={lionGold} roughness={0.7} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 0.8, -11.8]} castShadow>
        <cylinderGeometry args={[0.7, 0.9, 2.0, 10]} />
        <meshStandardMaterial color={lionYellow} roughness={0.7} />
      </mesh>

      {/* HELM WHEEL at stern */}
      {/* Pedestal */}
      <mesh position={[0, 0.7, 8.5]} castShadow>
        <boxGeometry args={[0.5, 1.4, 0.5]} />
        <meshStandardMaterial color={mastWood} roughness={0.8} />
      </mesh>
      {/* Hub */}
      <mesh position={[0, 1.8, 8.2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.18, 12]} />
        <meshStandardMaterial color={mastWood} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 1.8, 8.0]} castShadow>
        <torusGeometry args={[1.1, 0.10, 8, 20]} />
        <meshStandardMaterial color={mastWood} roughness={0.6} />
      </mesh>
      {/* Spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const angle = (deg * Math.PI) / 180
        return (
          <mesh key={i} position={[0, 1.8, 8.0]} rotation={[0, 0, angle]} castShadow>
            <boxGeometry args={[0.08, 2.2, 0.08]} />
            <meshStandardMaterial color={mastWood} roughness={0.7} />
          </mesh>
        )
      })}
      {/* Handles */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const angle = (deg * Math.PI) / 180
        const x = Math.sin(angle) * 1.1
        const y = 1.8 + Math.cos(angle) * 1.1
        return (
          <mesh key={i} position={[x, y, 7.92]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.28, 6]} />
            <meshStandardMaterial color={mastWood} roughness={0.7} />
          </mesh>
        )
      })}

      {/* ROPE LINES from mast to bow/stern */}
      {/* Forward stay */}
      <mesh position={[0, 5.0, -5.5]} rotation={[0.7, 0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 10.0, 6]} />
        <meshStandardMaterial color={ropeColor} roughness={0.9} />
      </mesh>
      {/* Aft stay */}
      <mesh position={[0, 5.0, 4.5]} rotation={[-0.7, 0, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 10.0, 6]} />
        <meshStandardMaterial color={ropeColor} roughness={0.9} />
      </mesh>

    </group>
  )
}

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
    <div style={{ width:'100vw',height:'100dvh',background:'#87CEEB',overflow:'hidden',position:'fixed',top:0,left:0 }}>
      <style>{`@keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(1.5); } } @keyframes fadeInRow { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } } @keyframes helpFadeIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
      <RosterBar statuses={statuses} onFocusAgent={setFocusTarget} focusTarget={focusTarget} demoActive={demoActive} ambientEnabled={ambientEnabled} setAmbientEnabled={setAmbientEnabled} hasInteracted={hasInteracted} showDashboard={showDashboard} setShowDashboard={setShowDashboard} />
      <SprintHUD />
      <ActivityFeed statuses={statuses} />
      <CommitFeed />
      <TaskFeed />
      <Canvas
        shadows
        camera={{ position: isMobile ? [0, 55, 80] : [0, 35, 70], fov: isMobile ? 50 : 50 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        style={{ width:'100%',height:'100%',paddingTop:isMobile?'44px':'60px',paddingBottom:isMobile?'0':'32px',boxSizing:'border-box',touchAction:'none',WebkitUserSelect:'none',userSelect:'none' }}
        gl={{ antialias:true }}
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
          shadow-mapSize={isMobile ? [512, 512] : [2048, 2048]}
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
          <ThousandSunnyDeck />
          <LionFigurehead />
          <LuffyAtFigurehead />

          {/* Masts */}
          <AnimatedMast position={[-8, 0, -12]} />
          <AnimatedMast position={[8, 0, -12]} />

          {/* SunnyProps - decorative mast, crow nest, figurehead, helm */}
          <SunnyProps />

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

          {CREW.filter(agent => agent.name !== 'Luffy').map(agent => (
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

        <OrbitControls
          ref={orbitRef}
          target={[0, 0, -5]}
          enableDamping
          dampingFactor={0.08}
          minDistance={8}
          maxDistance={120}
          maxPolarAngle={Math.PI / 2.3}
          enableZoom={true}
          enableRotate={true}
          enablePan={true}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
          mouseButtons={{
            LEFT: THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN,
          }}
          zoomSpeed={isMobile ? 0.6 : 1.0}
          rotateSpeed={isMobile ? 0.6 : 0.8}
          panSpeed={isMobile ? 0.8 : 1.0}
        />
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

      <div style={{ position:'fixed',bottom:'46px',right:'18px',color:'#334455',fontFamily:'monospace',fontSize:'11px',pointerEvents:'none' }}>
        {typeof window !== 'undefined' && ('ontouchstart' in window)
          ? '1-finger rotate · 2-finger pinch zoom'
          : 'Hover for portrait · Drag to orbit · Scroll to zoom'}
      </div>
    </div>
    </StatusContext.Provider>
  )
}
