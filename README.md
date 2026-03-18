# 🏴‍☠️ Straw Hat Crew — 3D Office Dashboard

A real-time 3D office scene built with React Three Fiber, showing the live status of every Straw Hat crew member's gateway.

**Live Preview:** https://seanjohnzon.github.io/office-3d

---

## What It Does

- Renders a low-poly isometric office with 7 crew desks (Nami, Franky, Chopper, Robin, Brook, Sanji, Usopp)
- Polls each crew member's OpenClaw gateway every 10 seconds for live status
- Drives character animations from gateway state (working → sitting at desk, idle → patrol walk, thinking → think pose)
- Task flow particles arc between desks to show cross-crew activity
- Click any character to open their detail panel with full gateway data
- Live clock + status bar across the top

---

## Architecture

```
src/
  App.jsx              — Main scene, all Three.js components and voxel characters
  data/
    crewConfig.js      — Crew member definitions (name, IP, port, token, colors, positions)
    useGatewayStatus.js — React hook: polls all gateways, returns live state array
  assets/
    avatars/           — Portrait PNGs (flat anime), 3D sprite PNGs (Minecraft-style)
```

**Tech stack:**
- React 18 + Vite 5
- Three.js r160
- @react-three/fiber v8
- @react-three/drei v9 (Stars, OrbitControls, Text, RoundedBox, Html)

---

## Local Dev

```bash
npm install
npm run dev
# → http://localhost:5174  (also LAN-accessible)
```

Build for production:
```bash
npm run build
```

The `base: '/office-3d/'` in `vite.config.js` is required for GitHub Pages deployment.

---

## CI / Deploy

Every push to `main` triggers `.github/workflows/deploy.yml` → builds and deploys to GitHub Pages automatically.

---

## Crew Config

To add a new crew member, edit `src/data/crewConfig.js`:

```js
{
  name: 'Zoro',
  ip: '10.0.0.xxx',       // null if not yet online
  port: 18789,
  token: '...',            // OpenClaw gateway token
  role: 'Swordsman',
  color: '#22CC44',
  accentColor: '#44EE66',
  position: [x, 0, z],    // desk position in 3D scene
  deskPosition: [x, 0, z],
}
```

Then add a `CHAR_CFG.Zoro` entry in `App.jsx` with the character's voxel appearance.

---

## Status States

| State    | Meaning                         | Character Pose |
|----------|---------------------------------|----------------|
| idle     | Gateway alive, no active job    | Patrol walk    |
| working  | Active cron/task running        | Sitting at desk|
| thinking | Deep reasoning in progress      | Think pose     |
| offline  | Gateway unreachable             | Still/grayed   |
| standby  | Standby / low-activity mode     | Slow patrol    |

---

## Built by Franky 🔧

*Chief Engineer — Straw Hat Pirates*
*"This is not just a dashboard — this is the THOUSAND SUNNY of dashboards! SUPER!"*
