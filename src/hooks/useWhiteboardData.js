import { useState, useEffect } from 'react'

const FALLBACK = {
  header: "THOUSAND SUNNY · D2.24",
  line1: "D2.23 ✓ Dynamic WB · D2.24 ✓ Sails",
  line2: "D2.25 → Captain's Dashboard",
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

        const line1 = `✓ ${done} done  ⏳ ${inProgress} active`
        const line2 = `⬜ ${queued} queued  🔴 ${blocked} blocked`
        const statusColor = blocked > 0 ? '#e74c3c' : queued > 0 ? '#f39c12' : '#2ecc71'

        setData({ header: "SPRINT 2 · LIVE", line1, line2, statusColor })
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
