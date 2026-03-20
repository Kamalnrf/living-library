export interface LandingVisualTuningState {
  paperOpacity: number
  simplexOpacity: number
  guideAlpha: number
  rulerAlpha: number
  heroScrimOpacity: number
}

export const defaultLandingVisualTuningState: LandingVisualTuningState = {
  paperOpacity: 0.28,
  simplexOpacity: 0.12,
  guideAlpha: 0.24,
  rulerAlpha: 0.29,
  heroScrimOpacity: 0.74,
}

export const landingVisualDialControls = [
  {
    key: 'paperOpacity',
    label: 'Paper opacity',
    cssVar: '--landing-paper-opacity',
    min: 0,
    max: 0.4,
    step: 0.01,
  },
  {
    key: 'simplexOpacity',
    label: 'Simplex opacity',
    cssVar: '--landing-simplex-opacity',
    min: 0,
    max: 0.25,
    step: 0.01,
  },
  {
    key: 'guideAlpha',
    label: 'Guide alpha',
    cssVar: '--landing-guide-alpha',
    min: 0,
    max: 0.4,
    step: 0.01,
  },
  {
    key: 'rulerAlpha',
    label: 'Ruler alpha',
    cssVar: '--landing-ruler-alpha',
    min: 0,
    max: 0.4,
    step: 0.01,
  },
  {
    key: 'heroScrimOpacity',
    label: 'Hero scrim',
    cssVar: '--landing-hero-scrim-opacity',
    min: 0.2,
    max: 1,
    step: 0.01,
  },
] as const
