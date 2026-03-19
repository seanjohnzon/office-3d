import { useState, useEffect, useRef } from 'react';
import { CREW } from './crewConfig';

const POLL_MS = 10000;

async function fetchOne(agent) {
  // Robin and Brook have no machines yet — show as standby (not offline)
  if (!agent.ip) {
    return { name: agent.name, state: 'standby', model: null, outputTokens: 0 };
  }
  // Skip LAN fetches from HTTPS origin (mixed-content block)
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLanIp = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(agent.ip);
  if (isHttps && isLanIp) {
    return { name: agent.name, state: 'offline', model: null, outputTokens: 0 };
  }
  const base = `http://${agent.ip}:${agent.port}`;
  const headers = { Authorization: `Bearer ${agent.token}` };
  try {
    const hr = await fetch(`${base}/health`, { headers, signal: AbortSignal.timeout(4000) });
    if (!hr.ok) return { name: agent.name, state: 'offline', model: null, outputTokens: 0 };
    let state = 'idle', model = null, outputTokens = 0;
    try {
      const sr = await fetch(`${base}/api/sessions/list`, { headers, signal: AbortSignal.timeout(4000) });
      if (sr.ok) {
        const data = await sr.json();
        const sessions = Array.isArray(data) ? data : (data.sessions || []);
        const s = sessions[0];
        if (s) {
          const age = s.age ?? (Date.now() - (s.lastActiveAt || 0));
          model = s.model || null;
          outputTokens = s.outputTokens || 0;
          if (age < 30000 && outputTokens > 0) state = 'working';
          else if (age < 30000) state = 'thinking';
        }
      }
    } catch (_) {}
    return { name: agent.name, state, model, outputTokens };
  } catch (_) {
    return { name: agent.name, state: 'offline', model: null, outputTokens: 0 };
  }
}

export default function useGatewayStatus() {
  const [statuses, setStatuses] = useState(() =>
    CREW.map(a => ({ name: a.name, state: a.ip ? 'idle' : 'standby', model: null, outputTokens: 0 }))
  );
  const timer = useRef(null);

  async function poll() {
    const results = await Promise.all(CREW.map(fetchOne));
    setStatuses(results);
  }

  useEffect(() => {
    poll();
    timer.current = setInterval(poll, POLL_MS);
    return () => clearInterval(timer.current);
  }, []);

  return statuses;
}
