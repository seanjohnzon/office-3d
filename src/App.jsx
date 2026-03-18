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

// ══ Office scenery ═══════════════════════════════════════════════════════════
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
  return(<group position={[0,1.6,-5.88]}><mesh castShadow><boxGeometry args={[2.8,1.6,0.07]}/><meshStandardMaterial color="#5C3D1E" roughness={0.7}/></mesh><mesh position={[0,0,0.04]}><boxGeometry args={[2.6,1.44,0.02]}/><meshStandardMaterial color="#F5F2EC" roughness={0.9}/></mesh><Text position={[0,0.38,0.06]} fontSize={0.18} color="#1A1A2E" anchorX="center" fontWeight="bold">SPRINT 2 · LIVE</Text><Text position={[0,0.08,0.06]} fontSize={0.11} color="#444" anchorX="center">D2.14 ✓ Network  D2.15 ✓ Demo  D2.16 ✓ Sound  D2.17 ✓ Ticker</Text><Text position={[0,-0.22,0.06]} fontSize={0.10} color="#2ecc71" anchorX="center">D2.18 ✓ Duration  D2.16-18 ✓ / D2.19 → Bloom FX</Text></group>)
}

// ══ Main App ═════════════════════════════════════════════════════════════════
export default function App() {
  const rawStatuses = useGatewayStatus()
  const { statuses, demoActive } = useDemoMode(rawStatuses)
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
        camera={{ position: isMobile ? [16,18,18] : [12,14,14], fov: isMobile ? 50 : 45 }}
        style={{ width:'100%',height:'100%',paddingTop:isMobile?'44px':'60px',paddingBottom:'32px',boxSizing:'border-box' }}
        gl={{ antialias:true }}
        touch-action="none"
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
          <DeskGroup
            key={agent.name}
            agent={agent}
            agentState={getState(agent.name)}
            onClick={() => setSelectedAgent(agent)}
          />
        ))}

        <TaskFlowParticles />
        <NetworkLines />
        <AmbientHologram confTablePos={[0,0,2.8]} />

        <SceneEffects />

        <OrbitControls ref={orbitRef} target={[0,1,0]} enableDamping dampingFactor={0.06}
          minDistance={6} maxDistance={32} maxPolarAngle={Math.PI/2.1}
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
