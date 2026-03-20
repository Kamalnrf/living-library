export type FeedbackQuote = {
  id: string
  label: string
  quote: string
  supportingCopy: string
}

export const FEEDBACK_SECTION = {
  eyebrow: '03 / FEEDBACK',
  title: 'What People Say',
  description: 'Short quotes plus aggregate event insights from participant forms.',
} as const

export const FEEDBACK_QUOTES: readonly FeedbackQuote[] = [
  {
    id: 'cherish-experience',
    label: 'QUOTE · PARTICIPANT',
    quote: '"One such experience I will cherish for the rest of my life."',
    supportingCopy: 'Participants repeatedly described this about their experience.',
  },
  {
    id: 'changed-perception',
    label: 'QUOTE · PARTICIPANT',
    quote: '"Every story we heard changed our perception of society."',
    supportingCopy: 'Empathy toward others became the biggest takeaway.',
  },
] as const
