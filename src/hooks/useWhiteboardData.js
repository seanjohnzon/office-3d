import { useState, useEffect } from 'react'

const FALLBACK = {
  header: "THOUSAND SUNNY \u2693 D2.26",
  line1: "D2.25 \u2713 Bridge / D2.26 \u2713 Ocean",
  line2: "D2.26 \u2713 Ocean",
  statusColor: "#2ecc71"
}

export default function useWhiteboardData() {
  const [data, setData] = useState(FALLBACK)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('http://10.0.0.152:18800/api/tasks', { signal: AbortSignal.timeout(8000) })
        if (!res.ok) throw new Error('Non-OK response')
        const tasks = await res.json()

        const done = tasks.filter(t => t.status === 'done' || t.status === 'completed').length
        const inProgress = tasks.filter(t => t.status === 'in-progress').length
        const queued = tasks.filter(t => t.status === 'queued' || t.status === 'open').length
        const blocked = tasks.filter(t => t.status === 'blocked').length

        const line1 = `\u2705 ${done} done  \u26a1 ${inProgress} active`
        const line2 = `\ud83d\udce6 ${queued} queued  \ud83d\uded1 ${blocked} blocked`
        const statusColor = blocked > 0 ? '#e74c3c' : queued > 0 ? '#f39c12' : '#2ecc71'

        setData({ header: "SPRINT 2 \u2693 LIVE", line1, line2, statusColor })
      } catch {
        setData(FALLBACK)
      }
    }

    fetchTasks()
    const interval = setInterval(fetchTasks, 60000)
    return () => clearInterval(interval)
  }, [])

  return data
}
