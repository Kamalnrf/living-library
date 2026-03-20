import type {
  EditorialSection,
  EditorialSectionIntroData,
  EditorialStoryRowBlock,
} from '../editorial/editorialSection'

const HOW_IT_WORKS_INTRO = {
  eyebrow: '02 / AT EVENT',
  title: 'How It Works',
  description: {
    desktop: 'Our simple process creates meaningful connections through personal storytelling.',
    mobile: 'Our process builds connection through personal storytelling.',
  },
} as const satisfies EditorialSectionIntroData

const HOW_IT_WORKS_STEPS = [
  {
    kind: 'story-row',
    id: 'borrow-a-living-book',
    stepLabel: 'STEP 1',
    title: 'Borrow a Living Book',
    description:
      'Choose from real people who volunteer to share their lived experiences - a refugee, a former addict, someone who has experienced homelessness, or a person living with disabilities.',
    layout: 'media-first',
    media: {
      kind: 'single-image',
      frameTone: 'sage',
      height: {
        desktop: '381px',
        mobile: '228px',
      },
      image: {
        src: '/images/book-catalog.png',
        alt: 'Living Book profiles pinned to a blue display board at an event.',
        width: 1048,
        height: 762,
      },
    },
    quote: {
      speaker: 'Participant',
      text: '"People should not be judged beforehand."',
      desktopOffset: '78px',
      desktopTop: '256px',
      desktopMaxWidth: '261px',
    },
  },
  {
    kind: 'story-row',
    id: 'have-a-conversation',
    stepLabel: 'STEP 2',
    title: 'Have a Conversation',
    description:
      'Engage in a 30-minute open dialogue in a safe, respectful environment where questions are encouraged.',
    layout: 'text-first',
    media: {
      kind: 'collage',
      stackedImages: [
        {
          src: '/images/mcr-hrd-book-1-reading.png',
          alt: 'Participants seated around a table during a Living Stories Collective conversation circle.',
          width: 688,
          height: 374,
        },
        {
          src: '/images/mcr-hrd-e-2-book-10-reading.png',
          alt: 'A Living Book conversation underway at a community event.',
          width: 688,
          height: 374,
        },
      ],
      accentImage: {
        src: '/images/hlf-book-1-reading.png',
        alt: 'Two participants engaged in an intimate Living Book conversation.',
        width: 332,
        height: 762,
      },
      accentFrameTone: 'sand',
    },
  },
  {
    kind: 'story-row',
    id: 'return-with-a-changed-perspective',
    stepLabel: 'STEP 3',
    title: 'Return with a Changed Perspective',
    description:
      'Return with new insights, challenged assumptions, and a deeper understanding of diverse experiences.',
    layout: 'media-first',
    media: {
      kind: 'single-image',
      frameTone: 'lavender',
      height: {
        desktop: '382px',
        mobile: '228px',
      },
      image: {
        src: '/images/yulu.png',
        alt: 'A participant riding home at night after a Living Stories Collective session.',
        width: 1048,
        height: 764,
      },
    },
    quote: {
      speaker: 'Participant',
      text: '"Empathy was my biggest takeaway."',
      desktopOffset: '154px',
      desktopTop: '301px',
      desktopMaxWidth: '232px',
    },
  },
] as const satisfies readonly EditorialStoryRowBlock[]

export const HOW_IT_WORKS_SECTION = {
  id: 'how-it-works',
  intro: HOW_IT_WORKS_INTRO,
  blocks: HOW_IT_WORKS_STEPS,
} as const satisfies EditorialSection<EditorialStoryRowBlock>
