import { useRef, useContext, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { StatusContext } from '../data/StatusContext'
import { CREW } from '../data/crewConfig'

const STATE_COLOR = {
  idle: '#44DD77',
  working: '#4488FF',
  thinking: '#FFCC00',
  offline: '#555566',
  standby: '#AA8833',
}

const INACTIVE_STATES = new Set(['offline', 'standby'])
const INTENSE_STATES = new Set(['working', 'thinking'])
const Y_OFFSET = 0.8

// A single animated connection line between two desk positions
function NetworkLine({ startPos, endPos, color, isIntense, phaseOffset }) {
  const matRef = useRef()

  const posArray = useMemo(() => new Float32Array([
    startPos[0], startPos[1] + Y_OFFSET, startPos[2],
    endPos[0],   endPos[1]   + Y_OFFSET, endPos[2],
  ]), [startPos, endPos])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    const t = clock.getElapsedTime()
    const freq   = isIntense ? 2.0 : 1.0
    const minOp  = 0.15
    const maxOp  = isIntense ? 0.8 : 0.6
    matRef.current.opacity =
      minOp + (maxOp - minOp) * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 * freq + phaseOffset))
  })

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={posArray}
          count={2}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={0.3}
        linewidth={2}
        depthWrite={false}
      />
    </line>
  )
}

// Main component — rendered inside <Canvas>
export default function NetworkLines() {
  const statuses = useContext(StatusContext)

  // Build a name→state lookup
  const stateMap = useMemo(() => {
    const m = {}
    statuses.forEach(s => { m[s.name] = s.state })
    return m
  }, [statuses])

  // Active agents: those whose state is not offline/standby
  const activeAgents = useMemo(
    () => CREW.filter(a => !INACTIVE_STATES.has(stateMap[a.name] || 'idle')),
    [stateMap]
  )

  // Build connection pairs: every combination of 2 active agents
  const connections = useMemo(() => {
    const pairs = []
    for (let i = 0; i < activeAgents.length; i++) {
      for (let j = i + 1; j < activeAgents.length; j++) {
        const a = activeAgents[i]
        const b = activeAgents[j]
        const stateA = stateMap[a.name] || 'idle'
        const stateB = stateMap[b.name] || 'idle'
        const isIntense = INTENSE_STATES.has(stateA) || INTENSE_STATES.has(stateB)
        // Use source agent color (or blend: pick the "more active" one)
        const color = INTENSE_STATES.has(stateA)
          ? (STATE_COLOR[stateA] ?? a.color ?? '#44DD77')
          : (STATE_COLOR[stateB] ?? b.color ?? '#44DD77')
        // Unique phase offset per pair for independent breathing
        const phaseOffset = ((i * 7 + j * 13) % 100) / 100 * Math.PI * 2
        pairs.push({ a, b, color, isIntense, phaseOffset, key: `${a.name}-${b.name}` })
      }
    }
    return pairs
  }, [activeAgents, stateMap])

  return (
    <group>
      {connections.map(({ a, b, color, isIntense, phaseOffset, key }) => (
        <NetworkLine
          key={key}
          startPos={a.position}
          endPos={b.position}
          color={color}
          isIntense={isIntense}
          phaseOffset={phaseOffset}
        />
      ))}
    </group>
  )
}
