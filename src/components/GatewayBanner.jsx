import React, { useEffect, useState } from 'react'
import { CREW } from '../data/crewConfig'

export default function GatewayBanner({ statuses, demoActive }) {
  const [visible, setVisible] = useState(true)

  const activeCrew = CREW.filter(c => c.ip !== null)
  const allOffline = statuses.length === 0 || statuses.every(s => s.state === 'offline')
  const allOnline = !allOffline && statuses.filter(s => s.state !== 'offline').length >= activeCrew.length

  useEffect(() => {
    // When demo mode is active, always show — skip auto-hide
    if (demoActive) {
      setVisible(true)
      return
    }
    if (allOnline) {
      const t = setTimeout(() => setVisible(false), 8000)
      return () => clearTimeout(t)
    } else {
      setVisible(true)
    }
  }, [allOnline, demoActive])

  if (!visible) return null

  let icon, text, color

  if (demoActive) {
    icon  = '✨'
    text  = 'Demo Mode — Simulating crew activity. Run locally for live data.'
    color = '#BB88FF'
  } else if (allOffline) {
    icon  = '🌐'
    text  = 'All gateways offline — waiting for connection…'
    color = '#FF8C00'
  } else if (allOnline) {
    icon  = '✅'
    text  = 'All crew online — live data active'
    color = '#44DD77'
  } else {
    const onlineCount = statuses.filter(s => s.state !== 'offline').length
    const total       = activeCrew.length
    icon  = '⚡'
    text  = `${onlineCount}/${total} crew online`
    color = '#FFCC00'
  }

  return (
    <div style={{
      position:       'fixed',
      bottom:         '60px',
      left:           '50%',
      transform:      'translateX(-50%)',
      zIndex:         100,
      background:     'rgba(6, 12, 24, 0.82)',
      border:         `1px solid ${color}33`,
      borderRadius:   '20px',
      padding:        '5px 14px',
      fontFamily:     'monospace',
      fontSize:       '11px',
      color:          color,
      pointerEvents:  'none',
      userSelect:     'none',
      whiteSpace:     'nowrap',
      backdropFilter: 'blur(8px)',
      transition:     'opacity 0.4s ease',
    }}>
      {icon} {text}
    </div>
  )
}
