import { useRef, useState, useEffect } from 'react'

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000)
  if (totalSec < 60) return 'just now'
  const totalMin = Math.floor(totalSec / 60)
  if (totalMin < 60) return `${totalMin}m`
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export default function useStateDuration(statuses) {
  // { [name]: { state, since: Date } }
  const trackRef = useRef({})
  // ticker to force re-render every 10s
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(interval)
  }, [])

  // Update tracking on each statuses change
  useEffect(() => {
    if (!statuses) return
    const now = new Date()
    statuses.forEach(({ name, state }) => {
      const existing = trackRef.current[name]
      if (!existing || existing.state !== state) {
        trackRef.current[name] = { state, since: now }
      }
    })
  }, [statuses])

  // Build return map
  const result = {}
  if (statuses) {
    const now = new Date()
    statuses.forEach(({ name, state }) => {
      const entry = trackRef.current[name]
      if (entry) {
        const sinceMs = now - entry.since
        result[name] = {
          state,
          sinceMs,
          label: formatDuration(sinceMs),
        }
      } else {
        result[name] = { state, sinceMs: 0, label: 'just now' }
      }
    })
  }
  return result
}
