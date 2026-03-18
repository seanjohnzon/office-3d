import { useState, useEffect, useRef } from 'react'

const GITHUB_API = 'https://api.github.com/repos/seanjohnzon/office-3d/commits?per_page=8'
const POLL_INTERVAL = 60_000 // 60 seconds

export default function useGitHubCommits() {
  const [commits, setCommits] = useState([])
  const timerRef = useRef(null)

  async function fetchCommits() {
    try {
      const res = await fetch(GITHUB_API, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      })
      if (!res.ok) return
      const data = await res.json()
      const parsed = data.map(c => ({
        sha: c.sha.slice(0, 7),
        message: c.commit.message.split('\n')[0].slice(0, 60),
        author: c.commit.author.name,
        date: c.commit.author.date,
      }))
      setCommits(parsed)
    } catch (_) {
      // Network error — keep existing commits, return empty on first load
    }
  }

  useEffect(() => {
    fetchCommits()
    timerRef.current = setInterval(fetchCommits, POLL_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [])

  return commits
}
