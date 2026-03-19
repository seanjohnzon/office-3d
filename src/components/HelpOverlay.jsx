import React from 'react'
import useIsMobile from '../hooks/useIsMobile'

const SHORTCUTS = [
  { key: '1 – 7', desc: 'Focus on crew member desk' },
  { key: 'R / Esc', desc: 'Reset camera view' },
  { key: 'H / ?', desc: 'Toggle this help screen' },
  { key: 'C', desc: "Captain's Bridge — crew command HUD" },
  { key: 'Drag', desc: 'Orbit camera' },
  { key: 'Scroll', desc: 'Zoom in / out' },
  { key: 'Click card', desc: 'Focus that desk (top bar)' },
  { key: 'Click desk', desc: 'Show agent detail panel' },
]

export default function HelpOverlay({ visible, onClose }) {
  const { isMobile } = useIsMobile()
  if (!visible) return null
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
        zIndex: 500,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          background: 'rgba(6,12,24,0.95)',
          border: '1px solid rgba(100,160,255,0.3)',
          borderRadius: isMobile ? '16px 16px 0 0' : '16px',
          padding: isMobile ? '20px 20px 28px' : '28px 36px',
          minWidth: isMobile ? '100%' : '380px',
          maxWidth: isMobile ? '100%' : 'none',
          maxHeight: isMobile ? '70vh' : 'none',
          overflowY: 'auto',
          animation: 'helpFadeIn 0.2s ease',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '14px',
            background: 'none', border: 'none',
            color: '#667788', fontSize: '20px', cursor: 'pointer',
          }}
        >
          ×
        </button>

        {/* Title */}
        <div style={{
          color: '#FFD700',
          fontFamily: "'Courier New', monospace",
          fontWeight: 'bold',
          fontSize: '15px',
          marginBottom: '18px',
          letterSpacing: '1px',
        }}>
          KEYBOARD SHORTCUTS
        </div>

        {/* Rows */}
        {SHORTCUTS.map(({ key, desc }) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
            <span style={{
              background: '#0D2137',
              color: '#64A0FF',
              fontFamily: 'monospace',
              border: '1px solid rgba(100,160,255,0.4)',
              borderRadius: '6px',
              padding: '2px 10px',
              fontSize: '12px',
              minWidth: '70px',
              textAlign: 'center',
              flexShrink: 0,
            }}>
              {key}
            </span>
            <span style={{ color: '#AAB8CC', fontSize: '13px' }}>{desc}</span>
          </div>
        ))}

        {/* Footer */}
        <div style={{
          color: '#334466',
          fontSize: '10px',
          marginTop: '18px',
          textAlign: 'center',
          fontFamily: "'Courier New', monospace",
        }}>
          Press H to close
        </div>
      </div>
    </div>
  )
}
