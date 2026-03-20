import type {PaperTextureProps, SimplexNoiseProps} from '@paper-design/shaders-react'

interface LandingShaderBackgroundConfig {
  paperTexture: Omit<PaperTextureProps, 'className' | 'width' | 'height'>
  simplexNoise: Omit<SimplexNoiseProps, 'className' | 'width' | 'height'>
}

export const landingShaderBackgroundConfig = {
  paperTexture: {
    speed: 0,
    frame: 0,
    fit: 'contain',
    scale: 0.6,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    colorFront: '#9FADBC',
    colorBack: '#00000000',
    contrast: 0.3,
    roughness: 0.4,
    fiber: 0.3,
    fiberSize: 0.2,
    crumples: 0.3,
    crumpleSize: 0.35,
    folds: 0.65,
    foldCount: 5,
    fade: 0,
    drops: 0.2,
    seed: 5.8,
    minPixelRatio: 1,
    maxPixelCount: 1474560,
  },
  simplexNoise: {
    speed: 1,
    fit: 'cover',
    scale: 1.6,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    colors: ['#FFFFFF', '#FA8B44', '#9BD538', '#00C8E9'],
    stepsPerColor: 1,
    softness: 1,
    minPixelRatio: 1,
    maxPixelCount: 1474560,
  },
} satisfies LandingShaderBackgroundConfig
