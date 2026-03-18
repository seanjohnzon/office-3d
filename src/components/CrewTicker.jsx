import React, { useState, useEffect, useRef } from 'react'
import { CREW } from '../data/crewConfig'
import { STATE_COLOR, STATE_LABEL } from './VoxelCharacter'

const STATE_ICON = {
  idle: '💚',
  working: '⚡',
  thinking: '💭',
  offline: '💤',
  standby: '🌙',
}

function useTickerEvents(statuses) {
  const prevRef = useRef({})
  const [ticker, setTicker] = useState(() => {
    // seed with welcome event
    return [{ id: 'boot', ts: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }), text: 'Crew Online — Thousand Sunny operational', color: '#4488FF', icon: '🚢' }]
  })

  useEffect(() => {
    if (!statuses || statuses.length === 0) return
    const newEvents = []
    statuses.forEach(s => {
      const prev = prevRef.current[s.name]
      if (prev !== undefined && prev !== s.state) {
        const agentInfo = CREW.find(c => c.name === s.name)
        const color = agentInfo?.color || '#888888'
        const icon = STATE_ICON[s.state] || '●'
        const ts = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        const fromLabel = STATE_LABEL[prev] || prev
        const toLabel = STATE_LABEL[s.state] || s.state
        newEvents.push({
          id: `${s.name}-${Date.now()}-${Math.random()}`,
          ts,
          text: `${s.name} → ${toLabel}`,
          subtext: `was ${fromLabel}`,
          color,
          icon,
          name: s.name,
          agentColor: color,
        })
      }
      prevRef.current[s.name] = s.state
    })
    if (newEvents.length > 0) {
      setTicker(prev => [...newEvents, ...prev].slice(0, 24))
    }
  }, [statuses])

  return ticker
}

export default function CrewTicker({ statuses }) {
  const events = useTickerEvents(statuses)
  const trackRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const animRef = useRef(null)
  const posRef = useRef(0)

  // Auto-scroll animation
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let lastTime = null

    function animate(ts) {
      if (lastTime === null) lastTime = ts
      const dt = ts - lastTime
      lastTime = ts
      if (!paused) {
        posRef.current -= dt * 0.03 // px per ms → ~30px/s
        const totalWidth = track.scrollWidth
        const visibleWidth = track.parentElement?.clientWidth || 800
        if (Math.abs(posRef.current) >= totalWidth) {
          posRef.current = visibleWidth
        }
        track.style.transform = `translateX(${posRef.current}px)`
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [paused, events])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '32px',
        background: 'rgba(4,10,22,0.96)',
        backdropFilter: 'blur(6px)',
        borderTop: '1px solid rgba(68,136,255,0.25)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        cursor: paused ? 'default' : 'pointer',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      title={paused ? 'Paused — mouse out to resume' : 'Hover to pause'}
    >
      {/* LIVE badge */}
      <div style={{
        flexShrink: 0,
        padding: '0 10px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        borderRight: '1px solid rgba(68,136,255,0.2)',
        background: 'rgba(68,136,255,0.08)',
        color: '#4488FF',
        fontSize: '10px',
        fontFamily: "'Courier New', monospace",
        fontWeight: 'bold',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        zIndex: 1,
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#44DD77',
          boxShadow: '0 0 4px #44DD77',
          display: 'inline-block',
          animation: 'pulseDot 1.4s ease-in-out infinite',
        }} />
        CREW
      </div>

      {/* Scrolling ticker track */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', height: '100%' }}>
        <div
          ref={trackRef}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: '100%',
            gap: '0px',
            willChange: 'transform',
            whiteSpace: 'nowrap',
          }}
        >
          {events.map((ev, i) => (
            <React.Fragment key={ev.id}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 16px',
                height: '100%',
                borderRight: '1px solid rgba(68,136,255,0.10)',
              }}>
                <span style={{ fontSize: '13px' }}>{ev.icon}</span>
                <span style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '11px',
                  color: '#334455',
                }}>{ev.ts}</span>
                <span style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '11px',
                  color: ev.agentColor || ev.color,
                  fontWeight: 'bold',
                }}>{ev.text}</span>
                {ev.subtext && (
                  <span style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '10px',
                    color: '#334455',
                  }}>({ev.subtext})</span>
                )}
              </div>
              {/* separator dot */}
              <div style={{ color: '#223', fontSize: '14px', padding: '0 4px', flexShrink: 0 }}>◆</div>
            </React.Fragment>
          ))}
          {/* duplicate for seamless loop */}
          {events.map((ev, i) => (
            <React.Fragment key={`dup-${ev.id}`}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 16px',
                height: '100%',
                borderRight: '1px solid rgba(68,136,255,0.10)',
              }}>
                <span style={{ fontSize: '13px' }}>{ev.icon}</span>
                <span style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '11px',
                  color: '#334455',
                }}>{ev.ts}</span>
                <span style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '11px',
                  color: ev.agentColor || ev.color,
                  fontWeight: 'bold',
                }}>{ev.text}</span>
                {ev.subtext && (
                  <span style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: '10px',
                    color: '#334455',
                  }}>({ev.subtext})</span>
                )}
              </div>
              <div style={{ color: '#223', fontSize: '14px', padding: '0 4px', flexShrink: 0 }}>◆</div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {paused && (
        <div style={{
          position: 'absolute',
          right: '10px',
          color: '#334455',
          fontSize: '10px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
        }}>⏸ PAUSED</div>
      )}
    </div>
  )
}
