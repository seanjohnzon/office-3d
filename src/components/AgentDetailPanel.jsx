import React from 'react'
import { STATE_COLOR, STATE_LABEL, AVATAR_MAP } from './VoxelCharacter'

export default function AgentDetailPanel({ agent, status, onClose, duration }) {
  const dotColor = STATE_COLOR[status?.state] || '#555566'
  const avatarUrl = AVATAR_MAP[agent.name]
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: '260px',
      background: 'rgba(8,18,32,0.96)',
      border: `1px solid ${agent.color}`,
      borderRadius: '12px',
      padding: '18px',
      fontFamily: "'Courier New', monospace",
      zIndex: 300,
      boxShadow: `0 0 18px ${agent.color}55, 0 0 4px ${agent.color}33`,
    }}>
      <button
        onClick={onClose}
        style={{ position:'absolute',top:'10px',right:'12px',background:'none',border:'none',color:'#889',fontSize:'18px',cursor:'pointer',lineHeight:1,padding:0 }}
      >×</button>
      {avatarUrl && (
        <div style={{ display:'flex',justifyContent:'center',marginBottom:'12px' }}>
          <img src={avatarUrl} alt={agent.name} style={{ width:'36px',height:'36px',borderRadius:'50%',objectFit:'cover',border:`2px solid ${agent.color}` }} />
        </div>
      )}
      <div style={{ color:agent.color,fontSize:'16px',fontWeight:'bold',marginBottom:'4px' }}>{agent.name}</div>
      <div style={{ color:'#889',fontSize:'11px',marginBottom:'12px' }}>{agent.role}</div>
      <div style={{ display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px' }}>
        <div style={{ width:'8px',height:'8px',borderRadius:'50%',background:dotColor,boxShadow:`0 0 5px ${dotColor}`,flexShrink:0 }} />
        <span style={{ color:dotColor,fontSize:'12px' }}>{STATE_LABEL[status?.state] || 'Idle'}</span>
      </div>
      {duration && (
        <div style={{ color:'#667788',fontSize:'11px',fontFamily:"'Courier New',monospace",marginBottom:'8px' }}>
          In state for: {duration.label}
        </div>
      )}
      {status?.model && (
        <div style={{ color:'#557799',fontSize:'10px',marginBottom:'4px' }}>Model: {status.model}</div>
      )}
      {status?.outputTokens > 0 && (
        <div style={{ color:'#557799',fontSize:'10px' }}>Tokens: {status.outputTokens}</div>
      )}
    </div>
  )
}
