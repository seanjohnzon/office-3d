import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox, Stars, useTexture, Html } from '@react-three/drei'
import * as THREE from 'three'
import { CREW } from './data/crewConfig'
import useGatewayStatus from './data/useGatewayStatus'

import namiAvatar    from './assets/avatars/nami.png'
import frankyAvatar  from './assets/avatars/franky.png'
import chopperAvatar from './assets/avatars/chopper.png'
import robinAvatar   from './assets/avatars/robin.png'
import brookAvatar   from './assets/avatars/brook.png'

export const AVATAR_MAP = {
  Nami:    namiAvatar,
  Franky:  frankyAvatar,
  Chopper: chopperAvatar,
  Robin:   robinAvatar,
  Brook:   brookAvatar,
}

const STATE_COLOR = { idle: '#44DD77', working: '#4488FF', thinking: '#FFCC00', offline: '#555566' }
const STATE_LABEL = { idle: 'Idle', working: 'Working', thinking: 'Thinking', offline: 'Offline' }

// ?????? Cosmic backdrop ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
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

// ?????? Office shell ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function OfficeShell() {
  const floorColor = '#E8DCC8'
  const wallColor  = '#D4C9B4'
  const trimColor  = '#B8A898'
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color={floorColor} roughness={0.8} />
      </mesh>
      {[-6,-4,-2,0,2,4,6].map(x => (
        <mesh key={`fx${x}`} rotation={[-Math.PI/2,0,0]} position={[x, 0.002, 0]}>
          <planeGeometry args={[0.04, 12]} />
          <meshStandardMaterial color={trimColor} roughness={1} />
        </mesh>
      ))}
      {[-5,-3,-1,1,3,5].map(z => (
        <mesh key={`fz${z}`} rotation={[-Math.PI/2,0,0]} position={[0, 0.002, z]}>
          <planeGeometry args={[14, 0.04]} />
          <meshStandardMaterial color={trimColor} roughness={1} />
        </mesh>
      ))}
      <mesh position={[0, 2.0, -6]} receiveShadow>
        <planeGeometry args={[14, 4]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} side={THREE.FrontSide} />
      </mesh>
      <mesh position={[-7, 2.0, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} side={THREE.FrontSide} />
      </mesh>
      <mesh position={[7, 2.0, 0]} rotation={[0, -Math.PI/2, 0]} receiveShadow>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} side={THREE.FrontSide} />
      </mesh>
      <mesh position={[0, 0.08, -5.96]}>
        <boxGeometry args={[14, 0.16, 0.06]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>
      <mesh position={[-6.96, 0.08, 0]}>
        <boxGeometry args={[0.06, 0.16, 12]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>
    </group>
  )
}

// ?????? Conference table ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function ConfTable({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.08, 32]} />
        <meshStandardMaterial color="#8B6914" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.12, 0.56, 12]} />
        <meshStandardMaterial color="#6B4F10" roughness={0.6} />
      </mesh>
      {[0,72,144,216,288].map((deg, i) => {
        const r = 1.25, a = (deg * Math.PI) / 180
        return (
          <group key={i} position={[Math.sin(a)*r, 0, Math.cos(a)*r]} rotation={[0,-a,0]}>
            <mesh position={[0,0.22,0]} castShadow>
              <boxGeometry args={[0.38,0.06,0.38]} />
              <meshStandardMaterial color="#2a2a35" />
            </mesh>
            <mesh position={[0,0.48,-0.17]} castShadow>
              <boxGeometry args={[0.38,0.44,0.06]} />
              <meshStandardMaterial color="#2a2a35" />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// ?????? Desk furniture (no character body ??? that's the avatar sprite now) ???????????????????????????
function Desk({ agentColor, agentState }) {
  const monitorGlow = agentState === 'working' ? 1.0 : agentState === 'thinking' ? 0.5 : agentState === 'offline' ? 0 : 0.15
  const screenColor = agentState === 'offline' ? '#111' : '#001a33'
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
      <group position={[0,0,0.75]}>
        <mesh position={[0,0.42,0]} castShadow>
          <boxGeometry args={[0.55,0.07,0.55]} />
          <meshStandardMaterial color="#1A1A2E" roughness={0.7} />
        </mesh>
        <mesh position={[0,0.72,-0.25]} castShadow>
          <boxGeometry args={[0.55,0.5,0.07]} />
          <meshStandardMaterial color="#1A1A2E" roughness={0.7} />
        </mesh>
        {[[-0.24,0.19,0.22],[0.24,0.19,0.22],[-0.24,0.19,-0.22],[0.24,0.19,-0.22]].map(([lx,ly,lz],i) => (
          <mesh key={i} position={[lx,ly,lz]}>
            <boxGeometry args={[0.05,0.38,0.05]} />
            <meshStandardMaterial color="#111122" />
          </mesh>
        ))}
      </group>
      <group position={[0,0.77,-0.28]}>
        <mesh castShadow>
          <boxGeometry args={[0.88,0.52,0.05]} />
          <meshStandardMaterial color="#0A0A12" />
        </mesh>
        <mesh position={[0,0,0.03]}>
          <boxGeometry args={[0.76,0.42,0.01]} />
          <meshStandardMaterial color={screenColor} emissive={agentColor} emissiveIntensity={monitorGlow} />
        </mesh>
        <mesh position={[0,-0.35,0.03]}>
          <boxGeometry args={[0.07,0.16,0.07]} />
          <meshStandardMaterial color="#222" />
        </mesh>
        <mesh position={[0,-0.44,0.06]}>
          <boxGeometry args={[0.24,0.03,0.16]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      </group>
      <mesh position={[0,0.775,0.12]} receiveShadow>
        <boxGeometry args={[0.55,0.02,0.18]} />
        <meshStandardMaterial color="#222233" roughness={0.9} />
      </mesh>
      <mesh position={[0,0.775,0.51]}>
        <boxGeometry args={[2.0,0.03,0.02]} />
        <meshStandardMaterial color={agentColor} emissive={agentColor} emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

// ?????? Avatar body sprite (replaces blocky 3D character) ????????????????????????????????????????????????????????????????????????
function AvatarBody({ avatarUrl, agentState, bodyRef }) {
  const texture = useTexture(avatarUrl)
  const dotColor = STATE_COLOR[agentState] || '#555566'
  const isSitting = agentState === 'working' || agentState === 'thinking'
  const bodyY = isSitting ? 1.55 : 2.0
  const bodyZ = isSitting ? 0.65 : 0.85

  return (
    <group position={[0, bodyY, bodyZ]}>
      {/* Status glow ring behind character */}
      <sprite scale={[1.3, 1.3, 1.0]}>
        <spriteMaterial attach="material" color={dotColor} transparent opacity={0.22} />
      </sprite>
      {/* Character avatar sprite ??? the actual body */}
      <sprite ref={bodyRef} scale={[1.1, 1.1, 1.0]}>
        <spriteMaterial attach="material" map={texture} transparent alphaTest={0.05}
          opacity={agentState === 'offline' ? 0.4 : 1.0}
        />
      </sprite>
      {/* Thinking bubbles */}
      {agentState === 'thinking' && (
        <>
          <mesh position={[0.6, 0.55, 0]}>
            <sphereGeometry args={[0.05,8,8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.75, 0.72, 0]}>
            <sphereGeometry args={[0.08,8,8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0.9, 0.92, 0]}>
            <sphereGeometry args={[0.13,8,8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.3} />
          </mesh>
        </>
      )}
    </group>
  )
}

// ?????? Hover portrait card (only visible on hover) ?????????????????????????????????????????????????????????????????????????????????????????????
function HoverPortrait({ avatarUrl, agentName, agentState, hovered }) {
  const dotColor = STATE_COLOR[agentState] || '#555566'

  return (
    <Html
      position={[0, 4.2, 0.85]}
      center
      distanceFactor={8}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[10, 0]}
    >
      <div style={{
        opacity: hovered ? 1 : 0,
        transition: 'opacity 200ms ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '6px',
      }}>
        {/* Portrait image with status ring */}
        <div style={{
          position: 'relative',
          width: '96px', height: '96px',
        }}>
          <div style={{
            position: 'absolute', inset: '-4px',
            borderRadius: '50%',
            border: `3px solid ${dotColor}`,
            boxShadow: `0 0 14px ${dotColor}88, 0 0 4px ${dotColor}`,
          }} />
          <img
            src={avatarUrl}
            alt={agentName}
            style={{
              width: '96px', height: '96px',
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
        {/* Name + state pill */}
        <div style={{
          background: 'rgba(8,12,28,0.88)',
          border: `1px solid ${dotColor}55`,
          borderRadius: '20px',
          padding: '3px 12px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#EEE',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(4px)',
        }}>
          <span style={{ fontWeight: 'bold' }}>{agentName}</span>
          <span style={{ color: dotColor, marginLeft: '6px', fontSize: '11px' }}>
            ??? {STATE_LABEL[agentState] || 'Idle'}
          </span>
        </div>
      </div>
    </Html>
  )
}

// ?????? Full agent station ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function AgentStation({ agent, agentState, onClick }) {
  const bodyRef = useRef()
  const [hovered, setHovered] = useState(false)
  const isSitting = agentState === 'working' || agentState === 'thinking'
  const avatarUrl = AVATAR_MAP[agent.name]

  useFrame(({ clock }) => {
    if (bodyRef.current && isSitting) {
      // Subtle typing bob on the sprite
      const mat = bodyRef.current.material
      if (mat) {
        // We can't move sprite position easily via ref (it's a THREE.Sprite)
        // Instead animate via parent group ??? see bodyGroupRef below
      }
    }
  })

  const [px, , pz] = agent.position

  return (
    <group
      position={[px, 0, pz]}
      onClick={onClick}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerLeave={() => setHovered(false)}
    >
      <Desk agentColor={agent.color} agentState={agentState} />

      {/* Avatar as character body */}
      {avatarUrl && (
        <AvatarBody
          avatarUrl={avatarUrl}
          agentState={agentState}
          bodyRef={bodyRef}
        />
      )}

      {/* Hover-only portrait card */}
      {avatarUrl && (
        <HoverPortrait
          avatarUrl={avatarUrl}
          agentName={agent.name}
          agentState={agentState}
          hovered={hovered}
        />
      )}

      {/* Name label (always visible, below avatar) */}
      <Text
        position={[0, 0.62, 0.85]}
        fontSize={0.18}
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
  )
}

// ?????? Decorations ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function Bookshelf() {
  const books = ['#E74C3C','#3498DB','#2ECC71','#F39C12','#9B59B6','#1ABC9C','#E67E22','#2980B9','#27AE60','#8E44AD']
  return (
    <group position={[-6.5, 0, -2]}>
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.22, 2.0, 1.6]} />
        <meshStandardMaterial color="#7A5C1E" roughness={0.6} />
      </mesh>
      {books.map((c, i) => (
        <mesh key={i} position={[0.02, 0.25+Math.floor(i/5)*0.7+0.06, -0.6+(i%5)*0.26]} castShadow>
          <boxGeometry args={[0.16, 0.6, 0.22]} />
          <meshStandardMaterial color={c} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Plant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.4, 10]} />
        <meshStandardMaterial color="#C1440E" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <sphereGeometry args={[0.32, 8, 6]} />
        <meshStandardMaterial color="#2D7A2D" roughness={0.8} />
      </mesh>
      <mesh position={[0.18, 0.64, 0.08]} castShadow>
        <sphereGeometry args={[0.18, 7, 6]} />
        <meshStandardMaterial color="#3A9A3A" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Whiteboard() {
  return (
    <group position={[0, 1.6, -5.88]}>
      <mesh castShadow>
        <boxGeometry args={[2.8, 1.6, 0.07]} />
        <meshStandardMaterial color="#5C3D1E" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[2.6, 1.44, 0.02]} />
        <meshStandardMaterial color="#F5F2EC" roughness={0.9} />
      </mesh>
      <Text position={[0, 0.32, 0.06]} fontSize={0.19} color="#333" anchorX="center">ACTIVE TASKS</Text>
      <Text position={[0, 0.0, 0.06]} fontSize={0.13} color="#777" anchorX="center">Sprint 2 ??? Phase D2</Text>
      <Text position={[0, -0.3, 0.06]} fontSize={0.11} color="#999" anchorX="center">CREW-009 ???  CREW-014 ???  CREW-015 ???</Text>
    </group>
  )
}

// ?????? Top roster HUD (unchanged) ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
function RosterBar({ statuses }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '60px',
      background: 'linear-gradient(135deg, #0D2137 0%, #1A2F4A 100%)',
      borderBottom: '1px solid rgba(100,160,255,0.25)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: '16px',
      zIndex: 200, fontFamily: "'Courier New', monospace",
      boxShadow: '0 2px 16px rgba(0,0,0,0.6)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '10px' }}>
        <span style={{ fontSize: '22px' }}>???</span>
        <div>
          <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '13px', lineHeight: 1.1 }}>STRAW HAT HQ</div>
          <div style={{ color: '#557799', fontSize: '10px' }}>Mission Control ?? Live</div>
        </div>
      </div>
      <div style={{ width: '1px', height: '36px', background: 'rgba(100,160,255,0.2)' }} />

      {CREW.map(agent => {
        const st = statuses.find(s => s.name === agent.name) || { state: 'idle' }
        const dotColor = STATE_COLOR[st.state] || '#555'
        const avatarUrl = AVATAR_MAP[agent.name]
        return (
          <div key={agent.name} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${agent.color}33`,
            borderRadius: '10px', padding: '5px 14px 5px 6px',
          }}>
            <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', inset: '-3px',
                borderRadius: '50%',
                border: `2.5px solid ${dotColor}`,
                boxShadow: `0 0 8px ${dotColor}88`,
                zIndex: 1,
              }} />
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={agent.name}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: agent.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: 'bold', color: '#000',
                }}>{agent.name[0]}</div>
              )}
            </div>
            <div>
              <div style={{ color: '#EEE', fontSize: '12px', fontWeight: 'bold', lineHeight: 1.15 }}>{agent.name}</div>
              <div style={{ color: '#889', fontSize: '10px', lineHeight: 1.1 }}>{agent.role}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: dotColor, boxShadow: `0 0 5px ${dotColor}`,
              }} />
              <span style={{ color: dotColor, fontSize: '10px', textTransform: 'capitalize' }}>
                {STATE_LABEL[st.state] || 'Idle'}
              </span>
            </div>
          </div>
        )
      })}
      <div style={{ marginLeft: 'auto', color: '#334455', fontSize: '11px' }}>Phase D2</div>
    </div>
  )
}

// ?????? Main App ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
export default function App() {
  const [focused, setFocused] = useState(null)
  const statuses = useGatewayStatus()
  const orbitRef = useRef()

  function getState(name) {
    return statuses.find(s => s.name === name)?.state || 'idle'
  }

  function handleClick(name) {
    setFocused(prev => (prev === name ? null : name))
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#060C18' }}>
      <RosterBar statuses={statuses} />
      <Canvas
        shadows
        camera={{ position: [12, 14, 14], fov: 45 }}
        style={{ width: '100%', height: '100%', paddingTop: '60px', boxSizing: 'border-box' }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.35} color="#C8D8F0" />
        <directionalLight
          position={[8, 16, 10]} intensity={1.4} color="#FFF5E0" castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5} shadow-camera-far={60}
          shadow-camera-left={-14} shadow-camera-right={14}
          shadow-camera-top={14} shadow-camera-bottom={-14}
        />
        <directionalLight position={[-6, 8, -4]} intensity={0.3} color="#8899FF" />
        <pointLight position={[0, 4, 0]} intensity={0.4} color="#FFE8C0" distance={16} />

        <Stars radius={80} depth={40} count={3000} factor={3} fade speed={0.3} />
        <CosmicBackdrop />
        <OfficeShell />
        <Whiteboard />
        <Bookshelf />
        <Plant position={[-6.3, 0, 4.5]} />
        <Plant position={[6.3, 0, 4.5]} />
        <ConfTable position={[0, 0, 2.8]} />

        {CREW.map(agent => (
          <AgentStation
            key={agent.name}
            agent={agent}
            agentState={getState(agent.name)}
            onClick={() => handleClick(agent.name)}
          />
        ))}

        <OrbitControls
          ref={orbitRef}
          target={[0, 1, 0]}
          enableDamping dampingFactor={0.06}
          minDistance={6} maxDistance={32}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>

      <div style={{
        position: 'fixed', bottom: '14px', right: '18px',
        color: '#334455', fontFamily: 'monospace', fontSize: '11px', pointerEvents: 'none',
      }}>
        Hover desk to see portrait ?? Drag to orbit ?? Scroll to zoom
      </div>
    </div>
  )
}
