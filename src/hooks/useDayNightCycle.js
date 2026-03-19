import { useState, useEffect } from 'react'

// Lerp between two hex colors by t (0-1)
function lerpHex(hexA, hexB, t) {
  const parseHex = h => {
    const c = h.replace('#', '')
    return [
      parseInt(c.slice(0, 2), 16),
      parseInt(c.slice(2, 4), 16),
      parseInt(c.slice(4, 6), 16),
    ]
  }
  const a = parseHex(hexA)
  const b = parseHex(hexB)
  const r = Math.round(a[0] + (b[0] - a[0]) * t)
  const g = Math.round(a[1] + (b[1] - a[1]) * t)
  const bl = Math.round(a[2] + (b[2] - a[2]) * t)
  return '#' + [r, g, bl].map(v => v.toString(16).padStart(2, '0')).join('')
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function computeSkyState() {
  const now = new Date()
  // Local time as decimal hours (0-24)
  const hours = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600
  const timeOfDay = hours / 24 // 0.0 to 1.0

  // Day arc factor: 0 at night, peaks 1.0 at solar noon (timeOfDay=0.5)
  // Valid 6am (0.25) to 6pm (0.75)
  const dayArc = Math.max(0, Math.sin(((timeOfDay - 0.25) / 0.5) * Math.PI))

  // Dawn/dusk factor: peaks near horizon crossing times
  // Dawn: 0.25, Dusk: 0.75
  const dawnFactor = Math.exp(-((timeOfDay - 0.25) ** 2) / (2 * 0.018 ** 2)) * (timeOfDay < 0.5 ? 1 : 0)
  const duskFactor = Math.exp(-((timeOfDay - 0.75) ** 2) / (2 * 0.018 ** 2)) * (timeOfDay >= 0.5 ? 1 : 0)
  const horizonFactor = clamp(dawnFactor + duskFactor, 0, 1)

  // Sky top color: midnight navy → dawn navy → noon rich blue → dusk navy → midnight navy
  let skyTopColor
  if (dayArc === 0) {
    skyTopColor = '#0a0f2e'
  } else if (horizonFactor > 0.01) {
    // Near dawn/dusk: blend from navy to slightly lighter
    skyTopColor = lerpHex('#0a0f2e', '#1a3a6e', horizonFactor)
  } else {
    // During day: lerp from dawn navy to noon rich blue
    skyTopColor = lerpHex('#0a1a4a', '#1a6bc4', dayArc)
  }

  // Sky horizon color
  let skyHorizonColor
  if (horizonFactor > 0.01) {
    // Dawn/dusk: orange-pink glow
    const dawnDusk = lerpHex('#FF6B35', '#FF9AA2', timeOfDay < 0.5 ? dawnFactor : duskFactor)
    skyHorizonColor = lerpHex('#0a0f2e', dawnDusk, horizonFactor)
  } else if (dayArc > 0) {
    // Daytime: light blue
    skyHorizonColor = lerpHex('#0a1a4a', '#5BA8D0', dayArc)
  } else {
    // Night
    skyHorizonColor = '#050814'
  }

  // Sun angle: 0=sunrise (6am), PI/2=noon, PI=sunset (6pm)
  // Only meaningful when sunVisible
  const sunAngle = clamp((timeOfDay - 0.25) / 0.5, 0, 1) * Math.PI

  const sunVisible = timeOfDay >= 0.25 && timeOfDay <= 0.75
  const moonVisible = timeOfDay < 0.25 || timeOfDay > 0.75

  // Ambient color: night deep indigo → dawn warm gold → noon cool white → dusk warm gold → night
  let ambientColor
  if (horizonFactor > 0.01) {
    ambientColor = lerpHex('#1a1a4a', '#FFD080', horizonFactor)
  } else if (dayArc > 0) {
    ambientColor = lerpHex('#FFD080', '#D8E8FF', dayArc)
  } else {
    ambientColor = '#1a1a4a'
  }

  // Ambient intensity: 0.15 night → 0.65 noon
  const ambientIntensity = 0.15 + dayArc * 0.5

  // Directional light intensity: 0.1 night → 1.4 noon
  const dirLightIntensity = 0.1 + dayArc * 1.3

  // Stars opacity: 1.0 night → 0.0 noon, smooth
  const starsOpacity = clamp(1.0 - dayArc, 0, 1)

  // Sun color: orange near horizon, white at high noon
  // Use sine of sunAngle elevation: sin(sunAngle) = height factor (0 at horizon, 1 at noon)
  const sunElevation = sunVisible ? Math.sin(sunAngle) : 0
  const sunColor = lerpHex('#FF8C00', '#FFFFFF', sunElevation)

  return {
    timeOfDay,
    skyTopColor,
    skyHorizonColor,
    sunAngle,
    sunVisible,
    moonVisible,
    ambientColor,
    ambientIntensity,
    dirLightIntensity,
    starsOpacity,
    sunColor,
  }
}

export default function useDayNightCycle() {
  const [skyState, setSkyState] = useState(() => computeSkyState())

  useEffect(() => {
    const interval = setInterval(() => {
      setSkyState(computeSkyState())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return skyState
}
