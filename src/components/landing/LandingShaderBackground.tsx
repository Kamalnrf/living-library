import {PaperTexture, SimplexNoise} from '@paper-design/shaders-react'
import {landingShaderBackgroundConfig} from './shaderBackgroundConfig'

export default function LandingShaderBackground() {
  return (
    <div className="landing-backdrop__shader" aria-hidden="true">
      <SimplexNoise
        {...landingShaderBackgroundConfig.simplexNoise}
        className="landing-backdrop__shader-layer landing-backdrop__shader-layer--simplex-noise"
        width="100%"
        height="100%"
      />

      <PaperTexture
        {...landingShaderBackgroundConfig.paperTexture}
        className="landing-backdrop__shader-layer landing-backdrop__shader-layer--paper-texture"
        width="100%"
        height="100%"
      />
    </div>
  )
}
