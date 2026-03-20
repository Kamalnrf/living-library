import type {PaperTextureProps, SimplexNoiseProps} from '@paper-design/shaders-react'

interface LandingShaderBackgroundConfig {
  paperTexture: Omit<PaperTextureProps, 'className' | 'width' | 'height'>
  simplexNoise: Omit<SimplexNoiseProps, 'className' | 'width' | 'height'>
}

export const landingShaderBackgroundConfig = {
  paperTexture: {
    speed: 0,
    frame: 0,
    fit: 'cover',
    scale: 0.78,
    rotation: -6,
    offsetX: -0.04,
    offsetY: -0.02,
    colorFront: '#c7a88b',
    colorBack: '#f6ecde',
    contrast: 0.26,
    roughness: 0.62,
    fiber: 0.27,
    fiberSize: 0.24,
    crumples: 0.4,
    crumpleSize: 0.28,
    folds: 0.24,
    foldCount: 6,
    fade: 0.12,
    drops: 0.18,
    seed: 6.4,
    minPixelRatio: 1,
    maxPixelCount: 1474560,
  },
  simplexNoise: {
    speed: 0.16,
    fit: 'cover',
    scale: 1.55,
    rotation: 14,
    offsetX: 0.12,
    offsetY: -0.08,
    colors: ['#f6dcc0', '#f9e9cd', '#ebb595', '#d78a63', '#fff7e1'],
    stepsPerColor: 3,
    softness: 0.92,
    minPixelRatio: 1,
    maxPixelCount: 1474560,
  },
} satisfies LandingShaderBackgroundConfig
