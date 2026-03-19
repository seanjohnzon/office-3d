import React, { useMemo } from 'react'
import * as THREE from 'three'

export default function DynamicSky({ skyState }) {
  const {
    skyTopColor,
    sunAngle,
    sunVisible,
    moonVisible,
    sunColor,
    dirLightIntensity,
  } = skyState

  // Sun position: arc from east (sunrise) overhead (noon) to west (sunset)
  // sunAngle: 0=sunrise, PI/2=noon, PI=sunset
  // x stays 0, y = sin(sunAngle)*55, z = -cos(sunAngle)*55
  const sunPosition = useMemo(() => {
    const angle = sunAngle ?? Math.PI / 2
    return [0, Math.sin(angle) * 55, -Math.cos(angle) * 55]
  }, [sunAngle])

  // Moon is opposite
  const moonPosition = useMemo(() => {
    const angle = sunAngle ?? Math.PI / 2
    return [0, -Math.sin(angle) * 55, Math.cos(angle) * 55]
  }, [sunAngle])

  return (
    <>
      {/* Sky dome sphere — large, BackSide, centered slightly below scene */}
      <mesh position={[0, -15, 0]}>
        <sphereGeometry args={[75, 32, 32]} />
        <meshBasicMaterial color={skyTopColor} side={THREE.BackSide} />
      </mesh>

      {/* Sun */}
      {sunVisible && (
        <>
          <mesh position={sunPosition}>
            <sphereGeometry args={[2.5, 16, 16]} />
            <meshStandardMaterial
              emissive={sunColor}
              emissiveIntensity={2.0}
              color="#000000"
            />
          </mesh>
          <pointLight
            position={sunPosition}
            color={sunColor}
            intensity={dirLightIntensity * 0.5}
            distance={200}
          />
        </>
      )}

      {/* Moon */}
      {moonVisible && (
        <>
          <mesh position={moonPosition}>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshStandardMaterial
              emissive="#AABBCC"
              emissiveIntensity={1.5}
              color="#000000"
            />
          </mesh>
          <pointLight
            position={moonPosition}
            color="#AABBCC"
            intensity={0.3}
            distance={200}
          />
        </>
      )}
    </>
  )
}
