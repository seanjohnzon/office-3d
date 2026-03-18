import { useState, useEffect, useRef } from 'react'
import { CREW } from '../data/crewConfig'

// Per-agent demo state cycles
const DEMO_CYCLES = {
  Nami:    ['idle', 'working', 'idle', 'thinking'],
  Franky:  ['working', 'working', 'idle', 'working'],
  Chopper: ['idle', 'thinking', 'idle', 'working'],
}

// Phase offsets so agents don't all change at once
const PHASE_OFFSETS = {
  Nami:    0,
  Franky:  1,
  Chopper: 2,
}

// Active crew = those with an IP configured
const ACTIVE_CREW = CREW.filter(c => c.ip !== null)

function buildDemoStatuses(idx, tokenBase) {
  return CREW.map(crew => {
    if (crew.ip === null) {
      // No gateway — always standby in demo
      return { name: crew.name, state: 'standby' }
    }
    const cycles = DEMO_CYCLES[crew.name]
    const offset = PHASE_OFFSETS[crew.name] ?? 0
    if (!cycles) {
      return { name: crew.name, state: 'standby' }
    }
    const state = cycles[(idx + offset) % cycles.length]
    const isActive = state === 'working' || state === 'thinking'
    return {
      name:         crew.name,
      state,
      model:        isActive ? 'claude-sonnet-4' : undefined,
      outputTokens: isActive ? tokenBase + offset * 200 : undefined,
    }
  })
}

/**
 * useDemoMode — watches rawStatuses from useGatewayStatus.
 * If ALL active crew are offline for >5 seconds, activates demo mode and
 * returns a simulated statuses array that cycles crew through realistic states.
 * Deactivates immediately if any gateway comes back online.
 */
export default function useDemoMode(rawStatuses) {
  const [demoActive, setDemoActive] = useState(false)
  const [demoStatuses, setDemoStatuses] = useState([])

  // Refs — no re-renders for internal interval state
  const allOfflineTimerRef = useRef(null)
  const cycleIntervalRef   = useRef(null)
  const indexRef           = useRef(0)
  const tokenBaseRef       = useRef(1000)
  const demoActiveRef      = useRef(false)

  // Keep ref in sync with state (safe to read inside interval callbacks)
  useEffect(() => {
    demoActiveRef.current = demoActive
  }, [demoActive])

  // ── Watch for all-offline / any-online transitions ─────────────────────────
  useEffect(() => {
    const anyOnline = ACTIVE_CREW.some(crew => {
      const s = rawStatuses.find(s => s.name === crew.name)
      return s && s.state !== 'offline'
    })

    if (anyOnline) {
      // Gateway came back — exit demo mode immediately
      if (demoActiveRef.current) setDemoActive(false)
      // Cancel any pending activation timer
      if (allOfflineTimerRef.current) {
        clearTimeout(allOfflineTimerRef.current)
        allOfflineTimerRef.current = null
      }
      return
    }

    // All offline path
    const allOffline = ACTIVE_CREW.every(crew => {
      const s = rawStatuses.find(s => s.name === crew.name)
      return !s || s.state === 'offline'
    })

    if (allOffline && !demoActiveRef.current && !allOfflineTimerRef.current) {
      // Start 5-second grace period before activating demo
      allOfflineTimerRef.current = setTimeout(() => {
        allOfflineTimerRef.current = null
        setDemoActive(true)
      }, 5000)
    }

    if (!allOffline && allOfflineTimerRef.current) {
      clearTimeout(allOfflineTimerRef.current)
      allOfflineTimerRef.current = null
    }
  }, [rawStatuses])

  // ── Start / stop the demo cycle interval ──────────────────────────────────
  useEffect(() => {
    if (!demoActive) {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current)
        cycleIntervalRef.current = null
      }
      // Reset counters for next activation
      indexRef.current     = 0
      tokenBaseRef.current = 1000
      return
    }

    // Immediately render first frame of demo
    setDemoStatuses(buildDemoStatuses(indexRef.current, tokenBaseRef.current))

    // Then cycle every 4 seconds
    cycleIntervalRef.current = setInterval(() => {
      indexRef.current     += 1
      tokenBaseRef.current += 47
      setDemoStatuses(buildDemoStatuses(indexRef.current, tokenBaseRef.current))
    }, 4000)

    return () => {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current)
        cycleIntervalRef.current = null
      }
    }
  }, [demoActive])

  return {
    statuses:   demoActive ? demoStatuses : rawStatuses,
    demoActive,
  }
}
