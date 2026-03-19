import fs from 'fs'

const src = fs.readFileSync('D:/openclaw-brain/office-3d/src/App.jsx', 'utf8')
const lines = src.split('\n')

// The imports end at line 37 (0-indexed: 36): 'import DynamicSky from ...'
// Line 38 is blank, line 39 is '// ══ Ship Shape Math ══...'
// App() function starts at line 1517 (0-indexed: 1516)
// LuffyAtFigurehead is already in ShipProps.jsx, so we don't need it inline

// New imports to add
const newImports = [
  "import ShipDeck, { shipWidthAtZ, ShipHullShaped, ThousandSunnyHull } from './components/ship/ShipStructure'",
  "import OceanSkyEnvironment, { WoodenDeck, GrassLawn } from './components/ship/ShipEnvironment'",
  "import Mast, { CrowsNest, NavigationWheel, Cannon, LionFigurehead, LuffyAtFigurehead, CaptainsLog } from './components/ship/ShipProps'",
  "import StrategyRoom, { RoomBox, AquariumBar, TangerineGrove, MusicLounge, SickBay, RobinsLibrary, CrowsNestTower, MensQuarters } from './components/ship/ShipRooms'",
  "import SceneErrorBoundary from './components/SceneErrorBoundary'",
]

// Build new file:
// 1. Keep original imports (lines 0-37)
const originalImports = lines.slice(0, 37)

// 2. Add new imports
// 3. Skip blank line + all inline component defs (lines 38-1515)
// 4. Keep App() function (lines 1516 onwards)
const appFunction = lines.slice(1516)

// Also need to remove 'Component' from React import since SceneErrorBoundary is now external
// Line 0: import React, { useRef, useState, useEffect, Component } from 'react'
originalImports[0] = originalImports[0].replace(', Component', '')

const newContent = [
  ...originalImports,
  ...newImports,
  '',
  ...appFunction
].join('\n')

fs.writeFileSync('D:/openclaw-brain/office-3d/src/App.jsx', newContent, 'utf8')
console.log('App.jsx updated')
console.log('New line count:', newContent.split('\n').length)
