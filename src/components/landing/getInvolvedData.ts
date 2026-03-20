import {INSTAGRAM_URL, LIVING_BOOK_APPLICATION_URL, LUMA_CALENDAR_URL} from '../../utils/site'
import type {EditorialSectionIntroData} from '../editorial/editorialSection'

export type GetInvolvedCard = {
  id: string
  title: string
  descriptionDesktop: string
  descriptionMobile: string
  href: string
  linkLabel: string
  external: boolean
  desktopMinHeight: string
  mobileMinHeight: string
}

export type GetInvolvedConnectCard =
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

export const GET_INVOLVED_SECTION = {
  eyebrow: '04 / GET INVOLVED',
  title: 'Three ways to reach us',
  description: 'Whether you want to share, host, or connect.',
} as const satisfies EditorialSectionIntroData

export const GET_INVOLVED_CARDS: readonly GetInvolvedCard[] = [
  {
    id: '01',
    title: 'Apply to be a Living Book',
    descriptionDesktop:
      'Share your lived experience in a facilitated setting. Keep this as a direct link, like your current flow.',
    descriptionMobile:
      'Share your lived experience in a facilitated setting. Keep the format honest and personal.',
    href: LIVING_BOOK_APPLICATION_URL,
    linkLabel: 'Open application form ↗',
    external: true,
    desktopMinHeight: '300px',
    mobileMinHeight: '276px',
  },
  {
    id: '02',
    title: 'Host an event with us',
    descriptionDesktop: 'Plan a session for your organization, school, or community.',
    descriptionMobile: 'Plan a session for your organization, school, or community.',
    href: '#contact',
    linkLabel: 'Start partner conversation ↗',
    external: false,
    desktopMinHeight: '300px',
    mobileMinHeight: '252px',
  },
] as const

export const GET_INVOLVED_CONNECT = {
  id: '03',
  title: 'Connect',
  cards: [
    {
      id: 'social',
      eyebrow: 'SOCIAL',
      title: 'Instagram',
      description:
        "For collaboration, media, or volunteering, send us a note and we'll reach out quickly.",
      href: INSTAGRAM_URL,
      linkLabel: '@livingstoriesco ↗',
      external: true,
    },
    {
      id: 'calendar',
      eyebrow: 'UPCOMING SESSIONS',
      title: 'Luma calendar',
      description: 'See open sessions and registration links on the live calendar.',
      href: LUMA_CALENDAR_URL,
      actionValue: 'View sessions',
      actionButtonLabel: 'Open ↗',
      external: true,
    },
  ] as const satisfies readonly GetInvolvedConnectCard[],
} as const
