# 🏴‍☠️ Straw Hat Crew — 3D Office Dashboard

A real-time 3D ship scene built with React Three Fiber, showing the live status of every Straw Hat crew member's gateway. The Thousand Sunny rendered in three dimensions — SUPER!

**Live Preview:** https://seanjohnzon.github.io/office-3d

---

## What It Does

- Renders the **Thousand Sunny** as a navigable 3D scene (hull, decks, mast, crow's nest, figurehead, rooms)
- Polls each crew member's OpenClaw gateway every 10 seconds for live status
- Drives character animations from gateway state (working → sitting at desk, idle → patrol walk, thinking → think pose)
- Task flow particles arc between desks to show cross-crew activity
- Click any character to open their detail panel with full gateway data
- Live clock, crew roster bar, commit feed, task board feed, and sprint HUD
- Dynamic day/night sky cycle with bloom + vignette post-processing
- Mobile-responsive layout

---

## Architecture

```
src/
  App.jsx                      — Root: scene assembly, state orchestration, event wiring
  main.jsx                     — React entry point

  components/
    ship/
      ShipStructure.jsx        — Hull, deck, ShipBob bob animation
      ShipEnvironment.jsx      — Ocean plane, sky environment, wooden deck texture
      ShipProps.jsx            — Mast, crow's nest, wheel, cannon, figurehead, captain's log
      ShipRooms.jsx            — Strategy room, aquarium bar, tangerine grove, sick bay, Robin's library, etc.

    AgentDetailPanel.jsx       — Click-selected crew member detail overlay
    ActivityFeed.jsx           — Right-side live state-change log
    AmbientHologram.jsx        — Holographic ambient effects
    AnimatedMast.jsx           — Animated mast component
    CameraFocus.jsx            — Smooth camera transitions on crew click
    CaptainsDashboard.jsx      — GitHub commits, sprint stats, mission control overlay
    CommitFeed.jsx             — Bottom GitHub commit feed
    CrewTicker.jsx             — Horizontal marquee of crew states
    DeskGroup.jsx              — Desk geometry for each crew member
    DynamicSky.jsx             — Day/night gradient sky with stars
    GatewayBanner.jsx          — Top status bar / gateway health indicator
    HelpOverlay.jsx            — Keyboard shortcut reference
    KitchenStation.jsx         — Sanji's kitchen corner
    NetworkLines.jsx           — Network connectivity visualization lines
    RosterBar.jsx              — Crew roster thumbnail bar
    SceneEffects.jsx           — Bloom + vignette post-processing (softened)
    SceneErrorBoundary.jsx     — Three.js error boundary wrapper
    SprintHUD.jsx              — Sprint progress HUD
    StarField.jsx              — Background star field
    TaskFeed.jsx               — Live task board feed (bottom-left)
    TaskFlowParticles.jsx      — Particle arcs between active desks
    VoxelCharacter.jsx         — Voxel crew character renderer + avatar billboards
    WakeFoam.jsx               — Ocean wake foam effect
    WorkshopStation.jsx        — Franky's workshop corner

  data/
    crewConfig.js              — Crew member definitions (name, IP, port, token, colors, positions)
    useGatewayStatus.js        — React hook: polls all gateways every 10s, returns state array
    StatusContext.js           — React context for status prop drilling avoidance

  hooks/
    useDayNightCycle.js        — Time-based sky state transitions
    useDemoMode.js             — Toggle demo/live mode for presentations
    useGitHubCommits.js        — Fetches latest commits from GitHub API
    useIsMobile.js             — Viewport breakpoint hook
    useAgentSounds.js          — Agent state-change audio feedback
    useStateDuration.js        — Tracks how long each agent has been in current state
    useWhiteboardData.js       — Fetches shared whiteboard/bulletin data

  assets/
    avatars/                   — Anime portrait PNGs for each crew member
    sounds/                    — State-change audio clips (optional)
```

**Tech stack:**
- React 18 + Vite 5
- Three.js r160
- @react-three/fiber v8
- @react-three/drei v9 (Stars, OrbitControls, Text, RoundedBox, Html)
- @react-three/postprocessing (Bloom, Vignette)

**Build optimizations:**
- Manual chunk splitting (vendor-three, vendor-r3f, vendor-post, vendor-react) for optimal caching
- Bundle: ~133KB app code + vendor chunks cached separately

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

Crew members with `ip: null` show as `standby` (not offline) — they exist but their machine isn't set up yet.

---

## Status States

| State    | Meaning                         | Character Pose         |
|----------|---------------------------------|------------------------|
| idle     | Gateway alive, no active job    | Patrol walk            |
| working  | Active cron/task running        | Sitting at desk        |
| thinking | Deep reasoning in progress      | Think pose             |
| offline  | Gateway unreachable             | Still / grayed out     |
| standby  | No machine configured yet       | Slow patrol / dim      |

---

## Known Limitations

- **Mixed-content:** When served over HTTPS (GitHub Pages), all `http://10.0.0.x` LAN fetches are blocked by the browser. The dashboard shows static/fallback data in this mode. Task board, gateway status, and sprint stats require LAN access (local dev server).
- The `TaskFeed` and `SprintHUD` only show live data on the local dev server (`http://localhost:5174`).

---

## Built by Franky 🔧

*Chief Engineer — Straw Hat Pirates*  
*"This is not just a dashboard — this is the THOUSAND SUNNY of dashboards! SUPER!"*
