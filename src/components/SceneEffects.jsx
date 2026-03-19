import { useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Component, Suspense } from 'react'

class PostFXBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(e) { console.warn('[PostFX] effects disabled:', e.message) }
  render() { return this.state.failed ? null : this.props.children }
}

function PostFXInner() {
  // Only mount if WebGL2 is available (postprocessing requires it)
  const gl = useThree(s => s.gl)
  if (!gl || !gl.capabilities || !gl.capabilities.isWebGL2) return null
  return (
    <EffectComposer>
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.9}
        radius={0.4}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.4} darkness={0.15} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}

export default function SceneEffects() {
  return (
    <PostFXBoundary>
      <Suspense fallback={null}>
        <PostFXInner />
      </Suspense>
    </PostFXBoundary>
  )
}
