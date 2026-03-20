import React, { useState } from 'react'
import useIsMobile from '../hooks/useIsMobile'
import useMCTasks, { isDone, summarizeStatuses } from '../hooks/useMCTasks'

// Sprint label — update when sprint rolls over, or leave empty to show all tasks
const SPRINT_LABEL = ''

export default function SprintHUD() {
  const { isMobile } = useIsMobile()
  const { tasks, online, loading } = useMCTasks()
  const [expanded, setExpanded] = useState(false)

  if (loading && tasks.length === 0) return null

  // Filter to sprint or show all
  const sprint = SPRINT_LABEL
    ? tasks.filter(t => t.sprint === SPRINT_LABEL || (t.sprint && t.sprint.includes(SPRINT_LABEL)))
    : []
  const source = sprint.length > 0 ? sprint : tasks
  const total = source.length
  const done = source.filter(t => isDone(t.status)).length
  const byStatus = summarizeStatuses(source)
  const offline = !online

  const pct = total > 0 ? Math.round((done / total) * 100) : 0
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
          {isMobile ? 'MC' : 'Tasks'}
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
        <span style={{ color: offline && total === 0 ? '#445' : barColor, fontWeight: 'bold', fontSize: '11px' }}>
          {offline && total === 0 ? '—' : `${done}/${total}`}
        </span>
        {offline && <span style={{ color: '#445', fontSize: '9px' }}>●</span>}
      </div>

      {/* Expanded: breakdown */}
      {expanded && (
        <div style={{ marginTop: '8px', borderTop: '1px solid rgba(100,200,255,0.10)', paddingTop: '8px' }}>
          <div style={{ color: '#88aacc', fontSize: '10px', letterSpacing: '0.8px', marginBottom: '6px', textTransform: 'uppercase' }}>
            {SPRINT_LABEL || 'Mission Control — All Tasks'}
          </div>
          {Object.entries(byStatus).map(([status, count]) => (
            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: isDone(status) ? '#2ecc71' : status === 'in-progress' ? '#3498db' : status === 'blocked' ? '#e74c3c' : '#778ca3' }}>
              <span>{status}</span>
              <span style={{ fontWeight: 'bold' }}>{count}</span>
            </div>
          ))}
          <div style={{ marginTop: '6px', borderTop: '1px solid rgba(100,200,255,0.08)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', color: '#a0d4ff' }}>
            <span>Progress</span>
            <span style={{ color: barColor, fontWeight: 'bold' }}>{pct}%</span>
          </div>
          {offline && (
            <div style={{ marginTop: '4px', color: '#556', fontSize: '9px', textAlign: 'center' }}>
              task board · LAN only
            </div>
          )}
        </div>
      )}
    </div>
  )
}
