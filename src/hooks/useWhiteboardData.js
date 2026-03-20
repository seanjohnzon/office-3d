import useMCTasks, { isDone, isInProgress, isQueued, isBlocked } from './useMCTasks'

const FALLBACK = {
  header: "THOUSAND SUNNY ⚓ LIVE",
  line1: "Mission Control offline",
  line2: "Awaiting task board...",
  statusColor: "#778ca3"
}

export default function useWhiteboardData() {
  const { tasks, online } = useMCTasks()

  if (!online || tasks.length === 0) return FALLBACK

  const done     = tasks.filter(t => isDone(t.status)).length
  const inProg   = tasks.filter(t => isInProgress(t.status)).length
  const queued   = tasks.filter(t => isQueued(t.status)).length
  const blocked  = tasks.filter(t => isBlocked(t.status)).length

  const line1 = `✅ ${done} done  ⚡ ${inProg} active`
  const line2 = `📦 ${queued} queued  🛑 ${blocked} blocked`
  const statusColor = blocked > 0 ? '#e74c3c' : queued > 0 ? '#f39c12' : '#2ecc71'

  return { header: "MISSION CONTROL ⚓ LIVE", line1, line2, statusColor }
}
