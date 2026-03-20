import React, { useState, useEffect, useRef } from 'react'
import useMCTasks, { isDone, isInProgress, isQueued, isBlocked } from '../hooks/useMCTasks'
import { CREW } from '../data/crewConfig'
import { STATE_COLOR, STATE_LABEL } from './VoxelCharacter'

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtTokens(n) {
  if (!n || n === 0) return '0'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

function fmtModel(model) {
  if (!model) return '—'
  return model.replace(/^claude-/, '')
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const GITHUB_API = 'https://api.github.com/repos/seanjohnzon/office-3d/commits?per_page=5'

// ── sprint data hook ──────────────────────────────────────────────────────────

// Delegates to shared useMCTasks singleton -- no redundant fetch
function useSprintData() {
  const { tasks, online } = useMCTasks()
  if (tasks.length === 0 && !online) return null
  const done       = tasks.filter(t => isDone(t.status)).length
  const inProgress = tasks.filter(t => isInProgress(t.status)).length
  const queued     = tasks.filter(t => isQueued(t.status)).length
  const blocked    = tasks.filter(t => isBlocked(t.status)).length
  const total      = tasks.length
  return { done, inProgress, queued, blocked, total, online }
}

// ── commits hook ─────────────────────────────────────────────────────────────

function useCommitsData(visible) {
  const [commits, setCommits] = useState([])
  const timerRef = useRef(null)

  async function fetchCommits() {
    try {
      const res = await fetch(GITHUB_API, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) return
      const data = await res.json()
      setCommits(data.slice(0, 3).map(c => ({
        sha: c.sha.slice(0, 7),
        message: c.commit.message.split('\n')[0].slice(0, 40),
      })))
    } catch (_) {}
  }

  useEffect(() => {
    if (!visible) return
    fetchCommits()
    timerRef.current = setInterval(fetchCommits, 60000)
    return () => clearInterval(timerRef.current)
  }, [visible])

  return commits
}

// ── progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ done, total }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const filled = Math.round(pct / 5) // 20 chars wide
  const empty = 20 - filled
  const bar = '█'.repeat(filled) + '░'.repeat(empty)
  return (
    <span style={{ color: '#D4A020', fontFamily: 'monospace', letterSpacing: '-0.5px' }}>
      {bar}
    </span>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function CaptainsDashboard({ visible, onClose, statuses, demoActive }) {
  const sprint = useSprintData()
  const commits = useCommitsData(visible)
  const [lastUpdated, setLastUpdated] = useState(nowTime())
  const timerRef = useRef(null)

  // Update clock every second while visible
  useEffect(() => {
    if (!visible) return
    setLastUpdated(nowTime())
    timerRef.current = setInterval(() => setLastUpdated(nowTime()), 1000)
    return () => clearInterval(timerRef.current)
  }, [visible])

  if (!visible) return null

  // Determine gateway status from statuses
  const onlineCount = statuses.filter(s => s.state !== 'offline').length
  const gatewayStatus = demoActive ? 'DEMO' : onlineCount > 0 ? 'ONLINE' : 'OFFLINE'
  const gatewayColor = demoActive ? '#BB88FF' : onlineCount > 0 ? '#00FF88' : '#FF4444'

  // Crew rows — show all CREW members
  const crewRows = CREW.map(agent => {
    const st = statuses.find(s => s.name === agent.name) || { state: 'offline', model: null, outputTokens: 0 }
    const isComingSoon = !agent.ip && st.state === 'standby'
    const dotColor = isComingSoon ? '#334455' : (STATE_COLOR[st.state] || '#334455')
    const stateLabel = isComingSoon ? 'COMING SOON' : (STATE_LABEL[st.state] || st.state).toUpperCase()
    return { agent, st, isComingSoon, dotColor, stateLabel }
  })

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(4,8,20,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Courier New', Courier, monospace",
        animation: 'dashboardFadeIn 0.25s ease-out',
        overflowY: 'auto',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes dashboardFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '780px',
          border: '1px solid rgba(212,160,32,0.4)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(212,160,32,0.12), 0 0 120px rgba(0,0,0,0.8)',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          background: 'rgba(212,160,32,0.08)',
          borderBottom: '1px solid rgba(212,160,32,0.3)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ color: '#D4A020', fontWeight: 'bold', fontSize: '15px', letterSpacing: '1.5px' }}>
            ⚓ THOUSAND SUNNY — CAPTAIN'S BRIDGE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: '#557799', fontSize: '12px', letterSpacing: '0.5px' }}>
              [ESC to close]
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '1px solid rgba(212,160,32,0.3)', borderRadius: '6px',
                color: '#D4A020', fontSize: '16px', cursor: 'pointer', padding: '2px 8px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Crew Status ── */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(100,160,255,0.15)' }}>
          <div style={{ color: '#557799', fontSize: '10px', letterSpacing: '2px', marginBottom: '10px', textTransform: 'uppercase' }}>
            CREW STATUS
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              {crewRows.map(({ agent, st, isComingSoon, dotColor, stateLabel }) => (
                <tr key={agent.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {/* Dot */}
                  <td style={{ padding: '6px 8px 6px 0', width: '16px', verticalAlign: 'middle' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '10px', height: '10px',
                      borderRadius: '50%',
                      background: isComingSoon ? 'transparent' : dotColor,
                      border: isComingSoon ? `2px solid ${dotColor}` : 'none',
                      boxShadow: isComingSoon ? 'none' : `0 0 6px ${dotColor}88`,
                      flexShrink: 0,
                    }} />
                  </td>
                  {/* Name */}
                  <td style={{ padding: '6px 12px 6px 0', color: '#DDDDDD', fontWeight: 'bold', width: '80px', verticalAlign: 'middle' }}>
                    {agent.name}
                  </td>
                  {/* Role */}
                  <td style={{ padding: '6px 12px 6px 0', color: '#557799', width: '120px', fontSize: '12px', verticalAlign: 'middle' }}>
                    {agent.role.toLowerCase()}
                  </td>
                  {/* State */}
                  <td style={{ padding: '6px 12px 6px 0', color: dotColor, fontWeight: 'bold', fontSize: '11px', width: '110px', verticalAlign: 'middle' }}>
                    {stateLabel}
                  </td>
                  {/* Model — hidden on mobile */}
                  {!isComingSoon && (
                    <td className="hide-mobile" style={{ padding: '6px 12px 6px 0', color: '#445566', fontSize: '11px', width: '110px', verticalAlign: 'middle' }}>
                      {fmtModel(st.model)}
                    </td>
                  )}
                  {isComingSoon && (
                    <td className="hide-mobile" style={{ padding: '6px 12px 6px 0', color: 'transparent', fontSize: '11px', width: '110px' }} />
                  )}
                  {/* Tokens — hidden on mobile */}
                  {!isComingSoon && (
                    <td className="hide-mobile" style={{ padding: '6px 0 6px 0', color: '#334466', fontSize: '11px', textAlign: 'right', verticalAlign: 'middle' }}>
                      {fmtTokens(st.outputTokens)}
                    </td>
                  )}
                  {isComingSoon && (
                    <td className="hide-mobile" style={{ padding: '6px 0', textAlign: 'right' }} />
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Sprint + Commits ── */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          borderBottom: '1px solid rgba(100,160,255,0.15)',
        }}>
          {/* Sprint */}
          <div style={{
            flex: '1 1 240px',
            padding: '16px 20px',
            borderRight: '1px solid rgba(100,160,255,0.15)',
          }}>
            <div style={{ color: '#557799', fontSize: '10px', letterSpacing: '2px', marginBottom: '12px', textTransform: 'uppercase' }}>
              SPRINT SUMMARY
            </div>
            {sprint ? (
              <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ProgressBar done={sprint.done} total={sprint.total} />
                  <span style={{ color: '#88AACC', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {sprint.done}/{sprint.total} done
                  </span>
                </div>
                <div style={{ color: '#4488CC' }}>in-progress: <span style={{ color: '#88AACC' }}>{sprint.inProgress}</span></div>
                <div style={{ color: '#4488CC' }}>queued: <span style={{ color: '#88AACC' }}>{sprint.queued}</span></div>
                <div style={{ color: sprint.blocked > 0 ? '#FF4444' : '#4488CC' }}>
                  blocked: <span style={{ color: sprint.blocked > 0 ? '#FF4444' : '#88AACC' }}>{sprint.blocked}</span>
                </div>
                {!sprint.online && (
                  <div style={{ color: '#FF6644', fontSize: '10px', marginTop: '4px' }}>⚠ cached data</div>
                )}
              </div>
            ) : (
              <div style={{ color: '#334455', fontSize: '12px' }}>
                <div style={{ marginBottom: '4px', color: '#334466' }}>— fetching tasks…</div>
              </div>
            )}
          </div>

          {/* Commits */}
          <div style={{ flex: '1 1 240px', padding: '16px 20px' }}>
            <div style={{ color: '#557799', fontSize: '10px', letterSpacing: '2px', marginBottom: '12px', textTransform: 'uppercase' }}>
              RECENT COMMITS
            </div>
            {commits.length > 0 ? (
              <div style={{ fontSize: '12px', lineHeight: '1.8' }}>
                {commits.map(c => (
                  <div key={c.sha} style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                    <span style={{ color: '#D4A020', fontFamily: 'monospace', fontSize: '11px', flexShrink: 0 }}>{c.sha}</span>
                    <span style={{ color: '#88AACC', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#334455', fontSize: '12px' }}>— loading…</div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          background: 'rgba(4,8,20,0.6)',
          padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#557799' }}>GATEWAY:</span>
              <span style={{
                color: gatewayColor,
                fontWeight: 'bold',
                textShadow: `0 0 8px ${gatewayColor}66`,
              }}>{gatewayStatus}</span>
            </span>
            <span style={{ color: '#334455' }}>·</span>
            <span style={{ color: '#557799' }}>
              Demo: <span style={{ color: demoActive ? '#BB88FF' : '#334455' }}>{demoActive ? 'ON' : 'OFF'}</span>
            </span>
          </div>
          <div style={{ color: '#334466', fontSize: '11px', fontFamily: 'monospace' }}>
            Last updated: <span style={{ color: '#557799' }}>{lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Responsive: hide model/tokens columns on small screens */}
      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
