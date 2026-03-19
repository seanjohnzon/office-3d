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
import ShipDeck, { shipWidthAtZ, ShipHullShaped, ThousandSunnyHull } from './components/ship/ShipStructure'
import OceanSkyEnvironment, { WoodenDeck, GrassLawn } from './components/ship/ShipEnvironment'
import Mast, { CrowsNest, NavigationWheel, Cannon, LionFigurehead, LuffyAtFigurehead, CaptainsLog } from './components/ship/ShipProps'
import StrategyRoom, { RoomBox, AquariumBar, TangerineGrove, MusicLounge, SickBay, RobinsLibrary, CrowsNestTower, MensQuarters } from './components/ship/ShipRooms'
import SceneErrorBoundary from './components/SceneErrorBoundary'

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
          <ShipDeck />
          <ShipHullShaped />
          <LionFigurehead />
          <LuffyAtFigurehead />

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

      {!isMobile && <div style={{ position:'fixed',bottom:'46px',right:'18px',color:'#334455',fontFamily:'monospace',fontSize:'11px',pointerEvents:'none' }}>
        Hover character for portrait · Drag to orbit · Scroll to zoom
      </div>}
    </div>
    </StatusContext.Provider>
  )
}
