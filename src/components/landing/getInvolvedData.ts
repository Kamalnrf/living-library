import {LIVING_BOOK_APPLICATION_URL} from '../../utils/site'

export const GET_INVOLVED_SECTION = {
  eyebrow: '04 / GET INVOLVED',
  title: 'Three ways to reach us',
  description: 'Whether you want to share, host, or connect.',
} as const

export const GET_INVOLVED_CARDS = [
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
