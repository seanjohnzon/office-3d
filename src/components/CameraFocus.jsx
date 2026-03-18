import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const DEFAULT_CAM = new THREE.Vector3(12, 14, 14)
const DEFAULT_TARGET = new THREE.Vector3(0, 1, 0)

function getDeskCamPos(agent) {
  const [px, , pz] = agent.position
  return new THREE.Vector3(px + 4, 5, pz + 6)
}
function getDeskTarget(agent) {
  const [px, , pz] = agent.position
  return new THREE.Vector3(px, 1.2, pz)
}

export default function CameraFocus({ target, orbitRef }) {
  const { camera } = useThree()
  const animating = useRef(false)
  const startCam = useRef(new THREE.Vector3())
  const startTarget = useRef(new THREE.Vector3())
  const endCam = useRef(new THREE.Vector3())
  const endTarget = useRef(new THREE.Vector3())
  const progress = useRef(0)

  useEffect(() => {
    if (!orbitRef?.current) return
    startCam.current.copy(camera.position)
    startTarget.current.copy(orbitRef.current.target)
    if (target) {
      endCam.current.copy(getDeskCamPos(target))
      endTarget.current.copy(getDeskTarget(target))
    } else {
      endCam.current.copy(DEFAULT_CAM)
      endTarget.current.copy(DEFAULT_TARGET)
    }
    progress.current = 0
    animating.current = true
  }, [target])

  useFrame((_, dt) => {
    if (!animating.current || !orbitRef?.current) return
    progress.current = Math.min(1, progress.current + dt * 1.8)
    const t = easeInOut(progress.current)
    camera.position.lerpVectors(startCam.current, endCam.current, t)
    orbitRef.current.target.lerpVectors(startTarget.current, endTarget.current, t)
    orbitRef.current.update()
    if (progress.current >= 1) animating.current = false
  })

  return null
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}
