import React from 'react'
import { CREW } from '../data/crewConfig'
import { STATE_COLOR, STATE_LABEL, AVATAR_MAP } from './VoxelCharacter'

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

export default function RosterBar({ statuses }) {
  const clock = useLiveClock()
  return (
    <div style={{ position:'fixed',top:0,left:0,right:0,height:'60px',background:'linear-gradient(135deg,#0D2137 0%,#1A2F4A 100%)',borderBottom:'1px solid rgba(100,160,255,0.25)',display:'flex',alignItems:'center',padding:'0 20px',gap:'16px',zIndex:200,fontFamily:"'Courier New',monospace",boxShadow:'0 2px 16px rgba(0,0,0,0.6)' }}>
      <div style={{ display:'flex',alignItems:'center',gap:'8px',marginRight:'10px' }}>
        <span style={{ fontSize:'22px' }}>⛵</span>
        <div>
          <div style={{ color:'#FFD700',fontWeight:'bold',fontSize:'13px',lineHeight:1.1 }}>STRAW HAT HQ</div>
          <div style={{ color:'#557799',fontSize:'10px' }}>Mission Control · Live</div>
        </div>
      </div>
      <div style={{ width:'1px',height:'36px',background:'rgba(100,160,255,0.2)' }} />
      {CREW.map(agent=>{
        const st=statuses.find(s=>s.name===agent.name)||{state:'idle'}
        const dotColor=STATE_COLOR[st.state]||'#555'
        const av=AVATAR_MAP[agent.name]
        return(
          <div key={agent.name} style={{ display:'flex',alignItems:'center',gap:'10px',background:'rgba(255,255,255,0.04)',border:`1px solid ${agent.color}33`,borderRadius:'10px',padding:'5px 14px 5px 6px' }}>
            <div style={{ position:'relative',width:'36px',height:'36px',flexShrink:0 }}>
              <div style={{ position:'absolute',inset:'-3px',borderRadius:'50%',border:`2.5px solid ${dotColor}`,boxShadow:`0 0 8px ${dotColor}88`,zIndex:1 }} />
              {av?<img src={av} alt={agent.name} style={{ width:'36px',height:'36px',borderRadius:'50%',objectFit:'cover',display:'block' }}/>:
                <div style={{ width:'36px',height:'36px',borderRadius:'50%',background:agent.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',fontWeight:'bold',color:'#000' }}>{agent.name[0]}</div>}
            </div>
            <div>
              <div style={{ color:'#EEE',fontSize:'12px',fontWeight:'bold',lineHeight:1.15 }}>{agent.name}</div>
              <div style={{ color:'#889',fontSize:'10px',lineHeight:1.1 }}>{agent.role}</div>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'4px',marginLeft:'4px' }}>
              <div style={{ width:'7px',height:'7px',borderRadius:'50%',background:dotColor,boxShadow:`0 0 5px ${dotColor}` }} />
              <span style={{ color:dotColor,fontSize:'10px',textTransform:'capitalize' }}>{STATE_LABEL[st.state]||'Idle'}</span>
            </div>
          </div>
        )
      })}
      <div style={{ marginLeft:'auto',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'2px',color:'#88AACC',fontSize:'11px' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'6px' }}>
          <span style={{ width:'8px',height:'8px',borderRadius:'50%',background:'#44FF88',boxShadow:'0 0 6px #44FF88',display:'inline-block',animation:'pulseDot 1.4s ease-in-out infinite' }} />
          D2.7 · Live
        </div>
        <div style={{ color:'#557799',fontSize:'10px',fontFamily:"'Courier New',monospace",letterSpacing:'0.5px' }}>{clock}</div>
      </div>
    </div>
  )
}
