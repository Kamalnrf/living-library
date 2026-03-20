export type FeedbackQuote = {
  id: string
  label: string
  quote: string
  supportingCopy: string
}

export type FeedbackLegendItem = {
  id: string
  label: string
  color: string
}

export type FeedbackSnapshotMetric = {
  id: string
  label: string
  value: string
  fillWidth: string
  fillColor: string
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

export const FEEDBACK_AGGREGATE = {
  voice: {
    eyebrow: 'PARTICIPANT VOICE',
    title: 'What stayed with people',
    description: 'One reflection appeared repeatedly in participant responses.',
    quoteLabel: 'Participant',
    quote: '"Understanding the trauma and experiences of specially abled children."',
  },
  snapshot: {
    eyebrow: 'SNAPSHOT',
    perspectiveShift: {
      label: 'Perspective shift',
      value: '76%',
      ringGradient:
        'conic-gradient(in oklab from 0deg at 50% 50%, oklab(63.8% -0.070 0.015) 0%, oklab(63.8% -0.070 0.015) 40%, oklab(75.6% -0.001 0.088) 40%, oklab(75.6% -0.001 0.088) 75.7%, oklab(92.1% 0.002 0.015) 75.7%, oklab(92.1% 0.002 0.015) 100%)',
      legend: [
        {
          id: 'significant',
          label: 'significant',
          color: '#5E9A83',
        },
        {
          id: 'somewhat',
          label: 'somewhat',
          color: '#C5AE6D',
        },
      ] as const satisfies readonly FeedbackLegendItem[],
    },
    metrics: [
      {
        id: 'top-score',
        label: 'Top score (5/5)',
        value: '64.3%',
        fillWidth: '64.3%',
        fillColor: '#6FA06E',
      },
      {
        id: 'rated-four-or-five',
        label: 'Rated 4 or 5',
        value: '93.0%',
        fillWidth: '93%',
        fillColor: '#76A977',
      },
      {
        id: 'stereotype-shift',
        label: 'Stereotype shift',
        value: '75.7%',
        fillWidth: '75.7%',
        fillColor: '#6FA06E',
      },
    ] as const satisfies readonly FeedbackSnapshotMetric[],
    topics: {
      label: 'WHAT PEOPLE OPENED UP ABOUT',
      body:
        'Participants reflected on a diverse set of topics such as current issues, addiction, mental health, gender, LGBTQ+, culture, and everyday social prejudice.',
    },
  },
} as const
