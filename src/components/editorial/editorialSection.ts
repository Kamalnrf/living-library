export type EditorialResponsiveText =
  | string
  | {
      desktop: string
      mobile: string
    }

export type EditorialSectionIntroData = {
  eyebrow: string
  title: string
  description?: EditorialResponsiveText
}

export type EditorialActionLink = {
  href: string
  label: string
  external: boolean
}

export type EditorialActionCard = {
  id: string
  eyebrow?: string
  title: string
  description: EditorialResponsiveText
  action: EditorialActionLink
}

export type EditorialCardGridBlock = {
  kind: 'card-grid'
  cards: readonly EditorialActionCard[]
}

export type EditorialSplitBandPanel = {
  id: string
  eyebrow?: string
  title: string
  description: EditorialResponsiveText
}

export type EditorialSplitBandBlock = {
  kind: 'split-band'
  panels: readonly [EditorialSplitBandPanel, EditorialSplitBandPanel]
}

export type EditorialMediaImage = {
  src: string
  alt: string
  width: number
  height: number
}

export type EditorialStoryRowQuoteCallout = {
  speaker: string
  text: string
  desktopOffset?: string
  desktopTop?: string
  desktopMaxWidth?: string
}

export type EditorialStoryRowMedia =
  | {
      kind: 'single-image'
      frameTone?: 'sage' | 'lavender' | 'sand'
      height: {
        desktop: string
        mobile: string
      }
      image: EditorialMediaImage
    }
  | {
      kind: 'collage'
      stackedImages: readonly [EditorialMediaImage, EditorialMediaImage]
      accentImage: EditorialMediaImage
    }

export type EditorialStoryRowBlock = {
  kind: 'story-row'
  id: string
  stepLabel: string
  title: string
  description: string
  layout: 'media-first' | 'text-first'
  media: EditorialStoryRowMedia
  quote?: EditorialStoryRowQuoteCallout
}

export type EditorialQuoteGridItem = {
  id: string
  label: string
  quote: string
  supportingCopy: string
}

export type EditorialQuoteGridBlock = {
  kind: 'quote-grid'
  quotes: readonly EditorialQuoteGridItem[]
}

export type EditorialSnapshotLegendItem = {
  id: string
  label: string
  color: string
}

export type EditorialSnapshotMetric = {
  id: string
  label: string
  value: string
  fillWidth: string
  fillColor: string
}

export type EditorialSnapshotVoice = {
  eyebrow: string
  title: string
  description: string
  quoteLabel: string
  quote: string
}

export type EditorialSnapshotPerspectiveShift = {
  label: string
  value: string
  ringGradient: string
  legend: readonly EditorialSnapshotLegendItem[]
}

export type EditorialSnapshotTopics = {
  label: string
  body: string
}

export type EditorialSnapshotBlock = {
  kind: 'snapshot'
  voice: EditorialSnapshotVoice
  perspectiveShift: EditorialSnapshotPerspectiveShift
  metrics: readonly EditorialSnapshotMetric[]
  topics: EditorialSnapshotTopics
}

export type EditorialConnectActionCard =
  | {
      id: string
      eyebrow: string
      title: string
      description: string
      href: string
      external: boolean
      linkLabel: string
      actionValue?: never
      actionButtonLabel?: never
    }
  | {
      id: string
      eyebrow: string
      title: string
      description: string
      href: string
      external: boolean
      linkLabel?: never
      actionValue: string
      actionButtonLabel: string
    }

export type EditorialConnectActionsBlock = {
  kind: 'connect-actions'
  id: string
  title: string
  cards: readonly EditorialConnectActionCard[]
}

export type EditorialSectionBlock =
  | EditorialCardGridBlock
  | EditorialSplitBandBlock
  | EditorialStoryRowBlock
  | EditorialQuoteGridBlock
  | EditorialSnapshotBlock
  | EditorialConnectActionsBlock

export type EditorialSection<Block extends EditorialSectionBlock = EditorialSectionBlock> = {
  id: string
  intro: EditorialSectionIntroData
  blocks: readonly Block[]
}

export type EditorialSectionBlockKind = EditorialSectionBlock['kind']
