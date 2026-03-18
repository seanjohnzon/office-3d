import React from 'react'
import useGitHubCommits from '../hooks/useGitHubCommits'
import useIsMobile from '../hooks/useIsMobile'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function CommitFeed() {
  const commits = useGitHubCommits()
  const { isMobile } = useIsMobile()
  const visible = commits.slice(0, isMobile ? 2 : 4)

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? '48px' : '48px',
      left: isMobile ? '4px' : '50%',
      right: isMobile ? '4px' : 'auto',
      transform: isMobile ? 'none' : 'translateX(-50%)',
      width: isMobile ? 'auto' : '420px',
      background: 'rgba(0, 10, 30, 0.82)',
      border: '1px solid rgba(100, 200, 255, 0.2)',
      backdropFilter: 'blur(8px)',
      borderRadius: isMobile ? '6px' : '8px',
      padding: isMobile ? '8px 8px' : '10px 12px',
      fontFamily: "'Courier New', monospace",
      fontSize: isMobile ? '10px' : '11px',
      color: '#a0d4ff',
      zIndex: 195,
      pointerEvents: 'none',
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
        <span style={{ fontSize: '12px' }}>⎇</span> Commits
      </div>

      {/* Commit rows */}
      {visible.length === 0 ? (
        <div style={{ color: '#334455', textAlign: 'center', padding: '6px 0' }}>
          Loading commit history…
        </div>
      ) : visible.map((c, i) => (
        <div
          key={c.sha}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '6px',
            padding: '3px 0',
            borderBottom: i < visible.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            animation: 'commitSlideIn 0.35s ease both',
            animationDelay: `${i * 0.06}s`,
            minWidth: 0,
          }}
        >
          <span style={{ color: '#4488CC', flexShrink: 0, fontWeight: 'bold' }}>[{c.sha}]</span>
          <span style={{
            color: '#a0d4ff',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{c.message}</span>
          <span style={{ color: '#557799', flexShrink: 0, whiteSpace: 'nowrap' }}>
            — {c.author} · {timeAgo(c.date)}
          </span>
        </div>
      ))}

      <style>{`
        @keyframes commitSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
