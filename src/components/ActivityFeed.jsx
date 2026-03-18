import React from 'react'
import { CREW } from '../data/crewConfig'
import { STATE_COLOR, STATE_LABEL } from './VoxelCharacter'
import useIsMobile from '../hooks/useIsMobile'

function useActivityFeed(statuses) {
  const prevRef = React.useRef({})
  const [events, setEvents] = React.useState([])
  React.useEffect(() => {
    if (!statuses || statuses.length === 0) return
    const newEvents = []
    statuses.forEach(s => {
      const prev = prevRef.current[s.name]
      if (prev !== undefined && prev !== s.state) {
        const d = new Date()
        const ts = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        const agentInfo = CREW.find(c => c.name === s.name)
        newEvents.push({ id: Date.now() + Math.random(), ts, agentName: s.name, agentColor: agentInfo?.color || '#888', fromState: prev, toState: s.state })
      }
      prevRef.current[s.name] = s.state
    })
    if (newEvents.length > 0) {
      setEvents(prev => [...newEvents, ...prev].slice(0, 50))
    }
  }, [statuses])
  return events.slice(0, 12)
}

export default function ActivityFeed({ statuses }) {
  const events = useActivityFeed(statuses)
  const { isMobile } = useIsMobile()

  // Hide entirely on mobile
  if (isMobile) return null

  return (
    <div style={{ position:'fixed',right:0,top:'60px',width:'220px',height:'320px',background:'rgba(8,18,32,0.92)',backdropFilter:'blur(8px)',borderLeft:'1px solid rgba(100,160,255,0.15)',zIndex:190,fontFamily:"'Courier New',monospace",display:'flex',flexDirection:'column',overflow:'hidden' }}>
      <div style={{ padding:'8px 12px 6px',borderBottom:'1px solid rgba(100,160,255,0.12)',color:'#88AACC',fontSize:'10px',letterSpacing:'1.2px',textTransform:'uppercase',display:'flex',alignItems:'center',gap:'6px' }}>
        <span style={{ fontSize:'13px' }}>📡</span> Activity Log
      </div>
      <div style={{ flex:1,overflowY:'hidden',padding:'4px 0',display:'flex',flexDirection:'column',gap:'1px' }}>
        {events.length === 0 ? (
          <div style={{ color:'#334455',fontSize:'10px',padding:'12px',textAlign:'center',marginTop:'16px' }}>Awaiting crew activity...</div>
        ) : events.map(ev => (
          <div key={ev.id} style={{ padding:'3px 10px',display:'flex',alignItems:'center',gap:'6px',borderBottom:'1px solid rgba(255,255,255,0.03)',animation:'fadeInRow 0.4s ease' }}>
            <div style={{ width:'6px',height:'6px',borderRadius:'50%',background:ev.agentColor,flexShrink:0,boxShadow:`0 0 4px ${ev.agentColor}` }} />
            <div style={{ flex:1,minWidth:0 }}>
              <span style={{ color:'#556677',fontSize:'9px' }}>{ev.ts} </span>
              <span style={{ color:ev.agentColor,fontSize:'10px',fontWeight:'bold' }}>{ev.agentName}</span>
              <span style={{ color:'#445566',fontSize:'9px' }}> → </span>
              <span style={{ color:STATE_COLOR[ev.toState]||'#888',fontSize:'10px' }}>{STATE_LABEL[ev.toState]||ev.toState}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
