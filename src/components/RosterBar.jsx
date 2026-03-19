import React from 'react'
import { CREW } from '../data/crewConfig'
import { STATE_COLOR, STATE_LABEL, AVATAR_MAP } from './VoxelCharacter'
import useIsMobile from '../hooks/useIsMobile'
import useStateDuration from '../hooks/useStateDuration'

function useLiveClock() {
  const [time, setTime] = React.useState(() => {
    const d = new Date()
    return d.toLocaleTimeString('en-US', { hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit' })
  })
  React.useEffect(() => {
    const t = setInterval(() => {
      const d = new Date()
      setTime(d.toLocaleTimeString('en-US', { hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit' }))
    }, 1000)
    return () => clearInterval(t)
  }, [])
  return time
}

export default function RosterBar({ statuses, onFocusAgent, focusTarget, demoActive, ambientEnabled, setAmbientEnabled, hasInteracted, showDashboard, setShowDashboard }) {
  const clock = useLiveClock()
  const { isMobile } = useIsMobile()
  const durations = useStateDuration(statuses)
  return (
    <div style={{ position:'fixed',top:0,left:0,right:0,height:isMobile?'44px':'60px',background:'linear-gradient(135deg,#0D2137 0%,#1A2F4A 100%)',borderBottom:'1px solid rgba(100,160,255,0.25)',display:'flex',alignItems:'center',padding:isMobile?'0 8px':'0 20px',gap:isMobile?'6px':'16px',zIndex:200,fontFamily:"'Courier New',monospace",boxShadow:'0 2px 16px rgba(0,0,0,0.6)',overflowX:isMobile?'auto':'visible',overflowY:'hidden' }}>
      <div style={{ display:'flex',alignItems:'center',gap:isMobile?'4px':'8px',marginRight:isMobile?'4px':'10px',flexShrink:0 }}>
        <span style={{ fontSize:isMobile?'16px':'22px' }}>⛵</span>
        {!isMobile && <div>
          <div style={{ color:'#FFD700',fontWeight:'bold',fontSize:'13px',lineHeight:1.1 }}>STRAW HAT HQ</div>
          <div style={{ color:'#557799',fontSize:'10px',display:'flex',alignItems:'center',gap:'5px' }}>
            SUNNY-005 · Live
            {demoActive && <>
              <span style={{ display:'inline-block',width:'6px',height:'6px',borderRadius:'50%',background:'#BB88FF',boxShadow:'0 0 5px #BB88FF',animation:'pulseDot 1.4s ease-in-out infinite' }} />
              <span style={{ color:'#BB88FF',fontSize:'9px',fontWeight:'bold',letterSpacing:'0.5px' }}>DEMO</span>
            </>}
          </div>
        </div>}
      </div>
      <div style={{ width:'1px',height:isMobile?'28px':'36px',background:'rgba(100,160,255,0.2)',flexShrink:0 }} />
      {CREW.map(agent=>{
        const st=statuses.find(s=>s.name===agent.name)||{state:'idle'}
        const dotColor=STATE_COLOR[st.state]||'#555'
        const av=AVATAR_MAP[agent.name]
        const isFocused = focusTarget?.name === agent.name
        const iconSize = isMobile ? '28px' : '36px'
        const dur = durations[agent.name]
        return(
          <div key={agent.name} onClick={() => onFocusAgent && onFocusAgent(isFocused ? null : agent)} style={{ display:'flex',alignItems:'center',gap:isMobile?'0':'10px',background:isFocused?`${agent.color}22`:'rgba(255,255,255,0.04)',border:`1px solid ${isFocused?agent.color:agent.color+'33'}`,borderRadius:isMobile?'8px':'10px',padding:isMobile?'3px':('5px 14px 5px 6px'),cursor:'pointer',boxShadow:isFocused?`0 0 12px ${agent.color}55`:'none',transition:'all 0.2s ease',flexShrink:0 }}>
            <div style={{ position:'relative',width:iconSize,height:iconSize,flexShrink:0 }}>
              <div style={{ position:'absolute',inset:isMobile?'-2px':'-3px',borderRadius:'50%',border:`2px solid ${dotColor}`,boxShadow:`0 0 8px ${dotColor}88`,zIndex:1 }} />
              {av?<img src={av} alt={agent.name} style={{ width:iconSize,height:iconSize,borderRadius:'50%',objectFit:'cover',display:'block' }}/>:
                <div style={{ width:iconSize,height:iconSize,borderRadius:'50%',background:agent.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:isMobile?'11px':'14px',fontWeight:'bold',color:'#000' }}>{agent.name[0]}</div>}
            </div>
            {!isMobile && <div>
              <div style={{ color:'#EEE',fontSize:'12px',fontWeight:'bold',lineHeight:1.15 }}>{agent.name}</div>
              <div style={{ color:'#889',fontSize:'10px',lineHeight:1.1 }}>{agent.role}</div>
            </div>}
            {!isMobile && <div style={{ display:'flex',flexDirection:'column',gap:'2px',marginLeft:'4px' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'4px' }}>
                <div style={{ width:'7px',height:'7px',borderRadius:'50%',background:dotColor,boxShadow:`0 0 5px ${dotColor}` }} />
                <span style={{ color:dotColor,fontSize:'10px',textTransform:'capitalize' }}>{STATE_LABEL[st.state]||'Idle'}</span>
              </div>
              {dur && <span style={{ color:'#556677',fontSize:'9px',fontFamily:"'Courier New',monospace" }}>{dur.label}</span>}
            </div>}
          </div>
        )
      })}
      {!isMobile && <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px',flexShrink:0 }}>
        <button
          onClick={() => setAmbientEnabled && setAmbientEnabled(!ambientEnabled)}
          title={!hasInteracted ? 'Click anywhere first to enable audio' : ambientEnabled ? 'Ambient drone ON — click to disable' : 'Click to enable ambient drone'}
          style={{ background:'rgba(255,255,255,0.06)',border:'1px solid rgba(100,160,255,0.2)',borderRadius:'6px',padding:'3px 8px',cursor:'pointer',fontFamily:"'Courier New',monospace",fontSize:'13px',color:'#88AACC',display:'flex',alignItems:'center',gap:'5px',transition:'all 0.2s ease',opacity: !hasInteracted ? 0.5 : 1 }}
        >
          {ambientEnabled ? '🔊' : '🔇'}
          {!hasInteracted && <span style={{ fontSize:'9px',color:'#557799' }}>(click to enable)</span>}
        </button>
        <button
          onClick={() => setShowDashboard && setShowDashboard(!showDashboard)}
          title="Captain's Bridge (C)"
          style={{ background: showDashboard ? 'rgba(212,160,32,0.2)' : 'rgba(255,255,255,0.06)', border:`1px solid ${showDashboard ? '#D4A020' : 'rgba(212,160,32,0.35)'}`, borderRadius:'6px', padding:'3px 10px', cursor:'pointer', fontFamily:"'Courier New',monospace", fontSize:'12px', color:'#D4A020', display:'flex', alignItems:'center', gap:'5px', transition:'all 0.2s ease', fontWeight:'bold', boxShadow: showDashboard ? '0 0 10px rgba(212,160,32,0.4)' : 'none' }}
        >
          ⚓ BRIDGE
        </button>
        <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'2px',color:'#88AACC',fontSize:'11px' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
            <span style={{ width:'8px',height:'8px',borderRadius:'50%',background:'#44FF88',boxShadow:'0 0 6px #44FF88',display:'inline-block',animation:'pulseDot 1.4s ease-in-out infinite' }} />
            D2.30 · Live
          </div>
          <div style={{ color:'#557799',fontSize:'10px',fontFamily:"'Courier New',monospace",letterSpacing:'0.5px' }}>{clock}</div>
          <div style={{ color:'#334466',fontSize:'9px',letterSpacing:'0.5px' }}>1-7 · R · C · H help</div>
        </div>
      </div>}
    </div>
  )
}
