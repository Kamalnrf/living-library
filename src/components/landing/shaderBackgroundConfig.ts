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
    contrast: 0.22,
    roughness: 0.24,
    fiber: 0.18,
    fiberSize: 0.2,
    crumples: 0.14,
    crumpleSize: 0.35,
    folds: 0.45,
    foldCount: 5,
    fade: 0.18,
    drops: 0.08,
    seed: 5.8,
    minPixelRatio: 1,
    maxPixelCount: 1474560,
  },
  simplexNoise: {
    speed: 1,
    fit: 'cover',
    scale: 2.15,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    colors: ['#FFFDF7', '#F1C7B1', '#CFDEAF', '#C6E4E8'],
    stepsPerColor: 1,
    softness: 0.82,
    minPixelRatio: 1,
    maxPixelCount: 1474560,
  },
} satisfies LandingShaderBackgroundConfig
