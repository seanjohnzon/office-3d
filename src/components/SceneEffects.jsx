import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export default function SceneEffects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        radius={0.8}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.3} darkness={0.6} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}
