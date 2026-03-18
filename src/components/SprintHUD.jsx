import React, { useState, useEffect } from 'react'
import useIsMobile from '../hooks/useIsMobile'

const SPRINT_LABEL = 'Sprint 2 — 3D Office'

// Map status → done or not
function isDone(status) {
  return status === 'done' || status === 'complete' || status === 'completed' || status === 'closed'
}

export default function SprintHUD() {
  const { isMobile } = useIsMobile()
  const [stats, setStats] = useState(null)
  const [expanded, setExpanded] = useState(false)

  function fetchStats() {
    fetch('http://10.0.0.152:18800/api/tasks')
      .then(r => r.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.tasks || [])
        // Filter to current sprint
        const sprint = arr.filter(t =>
          t.sprint === SPRINT_LABEL ||
          (t.sprint && t.sprint.includes('Sprint 2'))
        )
        if (sprint.length === 0) {
          // Fallback: use all tasks if sprint field missing
          const total = arr.length
          const done = arr.filter(t => isDone(t.status)).length
          setStats({ total, done, byStatus: summarizeStatuses(arr) })
          return
        }
        const total = sprint.length
        const done = sprint.filter(t => isDone(t.status)).length
        setStats({ total, done, byStatus: summarizeStatuses(sprint) })
      })
      .catch(() => {
        // Offline — show hardcoded sprint progress (D2.1–D2.12 phases done)
        setStats({ total: 15, done: 13, byStatus: { done: 13, 'in-progress': 1, queued: 1 }, offline: true })
      })
  }

  function summarizeStatuses(tasks) {
    const counts = {}
    for (const t of tasks) {
      counts[t.status] = (counts[t.status] || 0) + 1
    }
    return counts
  }

  useEffect(() => {
    fetchStats()
    const iv = setInterval(fetchStats, 60000)
    return () => clearInterval(iv)
  }, [])

  if (!stats) return null

  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const barColor = pct >= 80 ? '#2ecc71' : pct >= 50 ? '#f39c12' : '#e74c3c'

  return (
    <div
      onClick={() => setExpanded(p => !p)}
      style={{
        position: 'fixed',
        top: isMobile ? '50px' : '66px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(6,12,24,0.82)',
        border: '1px solid rgba(100,200,255,0.18)',
        backdropFilter: 'blur(8px)',
        borderRadius: '20px',
        padding: expanded ? '10px 18px 12px' : '5px 16px',
        fontFamily: "'Courier New', monospace",
        fontSize: '11px',
        color: '#a0d4ff',
        zIndex: 210,
        cursor: 'pointer',
        pointerEvents: 'auto',
        transition: 'padding 0.25s ease, border-radius 0.25s ease',
        minWidth: expanded ? '220px' : 'unset',
        userSelect: 'none',
      }}
    >
      {/* Collapsed: pill with progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
        <span style={{ color: '#88aacc', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {isMobile ? 'S2' : 'Sprint 2'}
        </span>
        {/* Bar */}
        <div style={{
          width: isMobile ? '54px' : '80px',
          height: '5px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`,
            height: '100%',
            background: barColor,
            borderRadius: '3px',
            transition: 'width 0.6s ease',
            boxShadow: `0 0 6px ${barColor}88`,
          }} />
        </div>
        <span style={{ color: barColor, fontWeight: 'bold', fontSize: '11px' }}>
          {stats.done}/{stats.total}
        </span>
        {stats.offline && <span style={{ color: '#334', fontSize: '9px' }}>●</span>}
      </div>

      {/* Expanded: breakdown */}
      {expanded && (
        <div style={{ marginTop: '8px', borderTop: '1px solid rgba(100,200,255,0.10)', paddingTop: '8px' }}>
          <div style={{ color: '#88aacc', fontSize: '10px', letterSpacing: '0.8px', marginBottom: '6px', textTransform: 'uppercase' }}>
            Sprint 2 — 3D Office
          </div>
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: isDone(status) ? '#2ecc71' : status === 'in-progress' ? '#3498db' : status === 'blocked' ? '#e74c3c' : '#778ca3' }}>
              <span>{status}</span>
              <span style={{ fontWeight: 'bold' }}>{count}</span>
            </div>
          ))}
          <div style={{ marginTop: '6px', borderTop: '1px solid rgba(100,200,255,0.08)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', color: '#a0d4ff' }}>
            <span>Progress</span>
            <span style={{ color: barColor, fontWeight: 'bold' }}>{pct}%</span>
          </div>
          {stats.offline && (
            <div style={{ marginTop: '4px', color: '#445', fontSize: '9px', textAlign: 'center' }}>
              task board offline · cached estimate
            </div>
          )}
        </div>
      )}
    </div>
  )
}
