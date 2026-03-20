/**
 * useMCTasks — shared singleton hook for Mission Control task board
 *
 * Eliminates duplicate fetches: SprintHUD, useWhiteboardData, and
 * CaptainsDashboard all need the same /api/tasks data. This hook
 * maintains a single shared polling interval and broadcasts updates
 * to all subscribers via a React-friendly singleton pattern.
 *
 * Returns: { tasks: Task[], online: boolean, loading: boolean }
 */

import { useState, useEffect, useRef } from 'react'

const MC_URL = 'http://10.0.0.152:18800/api/tasks'
const POLL_INTERVAL_MS = 30_000

// ── Module-level singleton state ─────────────────────────────────────────────

let _tasks = []
let _online = false
let _loading = true
let _listeners = new Set()
let _timer = null
let _fetchInFlight = false

function notify() {
  _listeners.forEach(fn => fn({ tasks: _tasks, online: _online, loading: _loading }))
}

function isHttpsOrigin() {
  return typeof window !== 'undefined' && window.location.protocol === 'https:'
}

async function doFetch() {
  if (_fetchInFlight) return
  if (isHttpsOrigin()) {
    // Live GitHub Pages can't reach LAN — skip silently
    _tasks = []
    _online = false
    _loading = false
    notify()
    return
  }
  _fetchInFlight = true
  try {
    const res = await fetch(MC_URL, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error('non-ok')
    const data = await res.json()
    _tasks = Array.isArray(data) ? data : (data.tasks || [])
    _online = true
    _loading = false
    notify()
  } catch {
    _online = false
    _loading = false
    // Keep stale task data if we had it — don't zero out on transient failure
    notify()
  } finally {
    _fetchInFlight = false
  }
}

function subscribe(fn) {
  _listeners.add(fn)
  // Start polling when first subscriber attaches
  if (_listeners.size === 1) {
    doFetch()
    _timer = setInterval(doFetch, POLL_INTERVAL_MS)
  }
  // Immediately deliver current state to new subscriber
  fn({ tasks: _tasks, online: _online, loading: _loading })
  return () => {
    _listeners.delete(fn)
    // Stop polling when last subscriber leaves
    if (_listeners.size === 0 && _timer) {
      clearInterval(_timer)
      _timer = null
    }
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export default function useMCTasks() {
  const [state, setState] = useState({ tasks: _tasks, online: _online, loading: _loading })
  const stateRef = useRef(state)

  useEffect(() => {
    const unsub = subscribe(next => {
      // Only trigger re-render if something actually changed
      if (
        next.online !== stateRef.current.online ||
        next.loading !== stateRef.current.loading ||
        next.tasks !== stateRef.current.tasks
      ) {
        stateRef.current = next
        setState(next)
      }
    })
    return unsub
  }, [])

  return state
}

// ── Helpers (shared across consumers) ────────────────────────────────────────

export function isDone(status) {
  return status === 'done' || status === 'complete' || status === 'completed' || status === 'closed'
}

export function isInProgress(status) {
  return status === 'in-progress'
}

export function isQueued(status) {
  return status === 'queued' || status === 'open'
}

export function isBlocked(status) {
  return status === 'blocked'
}

export function summarizeStatuses(tasks) {
  const counts = {}
  for (const t of tasks) {
    counts[t.status] = (counts[t.status] || 0) + 1
  }
  return counts
}
