import { useRef, useState, useEffect, useCallback } from 'react'

export default function useAgentSounds() {
  const ctxRef = useRef(null)
  const droneNodesRef = useRef(null) // { osc1, osc2, gain1, gain2, filter }
  const [ambientEnabled, setAmbientEnabledState] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // ── Lazy AudioContext creation ──────────────────────────────────────────
  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return ctxRef.current
  }

  // ── Mark first interaction ──────────────────────────────────────────────
  useEffect(() => {
    function onInteraction() {
      setHasInteracted(true)
      // Resume context if it was created in suspended state
      if (ctxRef.current && ctxRef.current.state === 'suspended') {
        ctxRef.current.resume()
      }
    }
    window.addEventListener('pointerdown', onInteraction, { once: true })
    window.addEventListener('keydown', onInteraction, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onInteraction)
      window.removeEventListener('keydown', onInteraction)
    }
  }, [])

  // ── Play a single note ──────────────────────────────────────────────────
  function playNote(ctx, freq, durationMs, type, gainVal, startTime, decay = false) {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)
    gainNode.gain.setValueAtTime(gainVal, startTime)
    if (decay) {
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + durationMs / 1000)
    } else {
      gainNode.gain.setValueAtTime(gainVal, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + durationMs / 1000)
    }
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.start(startTime)
    osc.stop(startTime + durationMs / 1000 + 0.01)
  }

  // ── State-change sound playback ─────────────────────────────────────────
  const playStateChange = useCallback((agentName, newState, oldState) => {
    if (!hasInteracted) return
    try {
      const ctx = getCtx()
      if (ctx.state === 'suspended') ctx.resume()
      const now = ctx.currentTime

      switch (newState) {
        case 'working': {
          // Ascending two-note beep: 440Hz → 660Hz, 80ms each, sine, gain 0.12
          playNote(ctx, 440, 80, 'sine', 0.12, now)
          playNote(ctx, 660, 80, 'sine', 0.12, now + 0.09)
          break
        }
        case 'thinking': {
          // Triplet pulse: 330Hz × 3, 60ms each with 30ms gap, triangle, gain 0.10
          for (let i = 0; i < 3; i++) {
            playNote(ctx, 330, 60, 'triangle', 0.10, now + i * 0.09)
          }
          break
        }
        case 'idle': {
          // Descending soft chime: 660Hz → 440Hz → 330Hz, 100ms each, sine, gain 0.08
          playNote(ctx, 660, 100, 'sine', 0.08, now)
          playNote(ctx, 440, 100, 'sine', 0.08, now + 0.11)
          playNote(ctx, 330, 100, 'sine', 0.08, now + 0.22)
          break
        }
        case 'offline': {
          // Short low thud: 80Hz, 150ms, sawtooth, gain 0.07, quick decay
          playNote(ctx, 80, 150, 'sawtooth', 0.07, now, true)
          break
        }
        default:
          break
      }
    } catch (e) {
      // Audio errors are non-fatal
      console.warn('[useAgentSounds] playStateChange error:', e)
    }
  }, [hasInteracted])

  // ── Start ambient drone ─────────────────────────────────────────────────
  function startDrone(ctx) {
    if (droneNodesRef.current) return // already running

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(120, ctx.currentTime)
    filter.connect(ctx.destination)

    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(40, ctx.currentTime)
    gain1.gain.setValueAtTime(0.025, ctx.currentTime)
    osc1.connect(gain1)
    gain1.connect(filter)
    osc1.start()

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(80, ctx.currentTime)
    gain2.gain.setValueAtTime(0.025, ctx.currentTime)
    osc2.connect(gain2)
    gain2.connect(filter)
    osc2.start()

    droneNodesRef.current = { osc1, osc2, gain1, gain2, filter }
  }

  function stopDrone() {
    if (!droneNodesRef.current) return
    const { osc1, osc2, gain1, gain2 } = droneNodesRef.current
    const ctx = ctxRef.current
    if (ctx) {
      const now = ctx.currentTime
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
      osc1.stop(now + 0.6)
      osc2.stop(now + 0.6)
    } else {
      try { osc1.stop() } catch (_) {}
      try { osc2.stop() } catch (_) {}
    }
    droneNodesRef.current = null
  }

  // ── Ambient toggle ──────────────────────────────────────────────────────
  const setAmbientEnabled = useCallback((enabled) => {
    if (!hasInteracted) return
    try {
      const ctx = getCtx()
      if (ctx.state === 'suspended') ctx.resume()
      if (enabled) {
        startDrone(ctx)
      } else {
        stopDrone()
      }
      setAmbientEnabledState(enabled)
    } catch (e) {
      console.warn('[useAgentSounds] setAmbientEnabled error:', e)
    }
  }, [hasInteracted])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDrone()
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {})
        ctxRef.current = null
      }
    }
  }, [])

  return { playStateChange, setAmbientEnabled, ambientEnabled, hasInteracted }
}
