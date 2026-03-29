import React, { useState, useEffect } from 'react'
import useIsMobile from '../hooks/useIsMobile'

const STATUS_BADGES = {
  'in-progress': { emoji: '🟢', color: '#2ecc71' },
  'queued':      { emoji: '🟡', color: '#f39c12' },
  'blocked':     { emoji: '🔴', color: '#e74c3c' },
  'open':        { emoji: '⚪', color: '#778ca3' },
}

const ACTIVE_STATUSES = new Set(['in-progress', 'queued', 'blocked', 'open'])

function getInitials(assigneeId) {
  if (!assigneeId) return '??'
  // Strip common prefixes and get initials
  const clean = assigneeId
    .replace(/^agent[-_]?/i, '')
    .replace(/[-_]/g, ' ')
    .trim()
  const words = clean.split(' ').filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

function truncate(str, max) {
  if (!str) return ''
  return str.length <= max ? str : str.slice(0, max - 1) + '…'
}

const TASK_SNAPSHOT_URLS = [
  'https://seanjohnzon.github.io/mission-control/data/tasks.json',
  './data/tasks.json',
]

function normalizeTasks(data) {
  return Array.isArray(data) ? data : (data?.tasks || [])
}

function selectDisplayTasks(arr) {
  const statusOrder = { 'in-progress': 0, 'queued': 1, 'blocked': 2, 'open': 3 }
  return arr
    .filter(t => ACTIVE_STATUSES.has(t.status) && (t.assigned || t.assignee_id))
    .sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9))
    .slice(0, 8)
}

async function fetchTaskSnapshot() {
  for (const url of TASK_SNAPSHOT_URLS) {
    try {
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) continue
      const data = await response.json()
      const selected = selectDisplayTasks(normalizeTasks(data))
      if (selected.length) return selected
    } catch (err) {
      // keep trying fallbacks
    }
  }
  return []
}

export default function TaskFeed() {
  const { isMobile } = useIsMobile()
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)

  async function fetchTasks() {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'

    if (!isHttps) {
      try {
        const response = await fetch('http://10.0.0.152:18800/api/tasks', { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        setTasks(selectDisplayTasks(normalizeTasks(data)))
        setError(null)
        return
      } catch (err) {
        // Fall through to static snapshot for public/demo resilience
      }
    }

    const snapshotTasks = await fetchTaskSnapshot()
    if (snapshotTasks.length) {
      setTasks(snapshotTasks)
      setError(null)
      return
    }

    setTasks([])
    setError('offline')
  }

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [])

  // Hide on mobile — competes with CommitFeed for space
  if (isMobile) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '14px',
      left: '14px',
      width: '240px',
      maxHeight: '280px',
      background: 'rgba(6,12,24,0.88)',
      border: '1px solid rgba(100, 200, 255, 0.18)',
      backdropFilter: 'blur(8px)',
      borderRadius: '8px',
      padding: '10px 12px',
      fontFamily: "'Courier New', monospace",
      fontSize: '11px',
      color: '#a0d4ff',
      zIndex: 195,
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '7px',
        borderBottom: '1px solid rgba(100, 200, 255, 0.12)',
        paddingBottom: '5px',
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        color: '#88AACC',
        fontSize: '10px',
      }}>
        <span style={{ fontSize: '12px' }}>📋</span> Task Board
      </div>

      {/* Task rows */}
      {error ? (
        <div style={{ color: '#334455', textAlign: 'center', padding: '6px 0' }}>
          API offline
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ color: '#334455', textAlign: 'center', padding: '6px 0' }}>
          Loading tasks…
        </div>
      ) : tasks.map((task, i) => {
        const badge = STATUS_BADGES[task.status] || STATUS_BADGES['open']
        return (
          <div
            key={task.id || i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 0',
              borderBottom: i < tasks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              animation: 'taskSlideIn 0.35s ease both',
              animationDelay: `${i * 0.05}s`,
              minWidth: 0,
            }}
          >
            <span style={{ flexShrink: 0, fontSize: '9px' }}>{badge.emoji}</span>
            <span style={{
              flex: 1,
              color: '#a0d4ff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '10px',
            }}>
              {truncate(task.title || task.name || 'Untitled', 28)}
            </span>
            <span style={{
              flexShrink: 0,
              fontSize: '9px',
              color: badge.color,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '3px',
              padding: '1px 3px',
              letterSpacing: '0.5px',
            }}>
              {getInitials(task.assigned || task.assignee_id)}
            </span>
          </div>
        )
      })}

      {/* Fade-out gradient at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '28px',
        background: 'linear-gradient(transparent, rgba(6,12,24,0.92))',
        pointerEvents: 'none',
        borderRadius: '0 0 8px 8px',
      }} />

      <style>{`
        @keyframes taskSlideIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
