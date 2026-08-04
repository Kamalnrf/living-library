import type {
  EditorialSection,
  EditorialSectionIntroData,
  EditorialSnapshotBlock,
  EditorialSplitBandBlock,
  EditorialStoryRowBlock,
} from "../editorial/editorialSection";
import { FEEDBACK_AGGREGATE } from "../landing/feedbackData";

export const PARTNER_HERO = {
  eyebrow: "PARTNER WITH US",
  title: "Bring living stories to your people",
  description:
    "LSC creates spaces where people sit across from someone whose life looks nothing like theirs and listen. We work with workplaces, institutions, communities, and independent hosts to create sessions that replace assumptions with understanding.",
  ctaLabel: "Start a conversation",
  ctaHref: "#partner-contact",
} as const;

const PARTNER_WHY_INTRO = {
  eyebrow: "01 / WHY IT WORKS",
  title: "From training to transformation",
} as const satisfies EditorialSectionIntroData;

const PARTNER_WHY_BLOCK = {
  kind: "split-band",
  panels: [
    {
      id: "awareness-alone",
      title: "Awareness alone",
      description:
        "Workshops and training sessions raise awareness, but changing how people feel about each other takes something different. Reading about someone's experience is not the same as hearing it from them.",
    },
    {
      id: "lived-experience",
      title: "Lived experience",
      description:
        "When someone sits across from a refugee, a person living with disability, or someone in recovery and hears their story first-hand, that's when assumptions actually shift. Our sessions create that moment of connection, at scale.",
    },
  ],
} as const satisfies EditorialSplitBandBlock;

export const PARTNER_WHY_SECTION = {
  id: "partner-why",
  intro: PARTNER_WHY_INTRO,
  blocks: [PARTNER_WHY_BLOCK],
} as const satisfies EditorialSection<EditorialSplitBandBlock>;

const PARTNER_EXPERIENCE_INTRO = {
  eyebrow: "03 / THE EXPERIENCE",
  title: "How a session comes together",
  description:
    "We handle everything from curating the Living Stories to facilitating the session. You bring the people; we create the space to listen.",
} as const satisfies EditorialSectionIntroData;

const PARTNER_EXPERIENCE_STEPS = [
  {
    kind: "story-row",
    id: "plan-together",
    stepLabel: "STEP 1",
    title: "We plan together",
    description:
      "Tell us who you hope to bring together, what matters to them, and what you want the conversation to open up. We tailor the session and select Living Stories whose experiences speak to those themes.",
    layout: "media-first",
    media: {
      kind: "single-image",
      frameTone: "sage",
      height: {
        mobile: "196px",
      },
      image: {
        src: "/images/book-catalog.webp",
        alt: "Living Story profiles displayed for listeners to choose from at a Living Stories Collective session.",
        width: 1048,
        height: 762,
      },
    },
  },
  {
    kind: "story-row",
    id: "bring-the-stories",
    stepLabel: "STEP 2",
    title: "We bring the stories",
    description:
      "On the day, the Living Stories share their experiences in small-group conversations. Each one runs 20–30 minutes, and listeners rotate through several stories.",
    layout: "text-first",
    media: {
      kind: "single-image",
      frameTone: "sand",
      height: {
        mobile: "204px",
      },
      image: {
        src: "/images/events/hlf-2026-circle-wide.webp",
        alt: "A Living Story addresses a full circle of listeners at the Hyderabad Literary Festival.",
        width: 1800,
        height: 1350,
      },
    },
  },
  {
    kind: "story-row",
    id: "leave-changed",
    stepLabel: "STEP 3",
    title: "People leave changed",
    description:
      "Listeners walk away with shifted perspectives, deeper empathy, and a shared experience that keeps the conversation going long after the session ends.",
    layout: "media-first",
    media: {
      kind: "single-image",
      frameTone: "lavender",
      height: {
        mobile: "196px",
      },
      image: {
        src: "/images/mcr-hrd-book-13-reading.webp",
        alt: "Participants exchange perspectives around table 13 during a Living Stories session.",
        width: 1170,
        height: 920,
      },
    },
  },
] as const satisfies readonly EditorialStoryRowBlock[];

export const PARTNER_EXPERIENCE_SECTION = {
  id: "partner-experience",
  intro: PARTNER_EXPERIENCE_INTRO,
  blocks: PARTNER_EXPERIENCE_STEPS,
} as const satisfies EditorialSection<EditorialStoryRowBlock>;

const PARTNER_IMPACT_INTRO = {
  eyebrow: "04 / IMPACT",
  title: "What people carry forward",
  description: "Evidence from listener feedback after Living Stories sessions.",
} as const satisfies EditorialSectionIntroData;

const PARTNER_IMPACT_BLOCK = {
  kind: "snapshot",
  eyebrow: "SNAPSHOT METRICS",
  voice: {
    eyebrow: "WHAT STAYED WITH PEOPLE",
    title: "What stayed with people",
    description: "One reflection appeared repeatedly in listener responses.",
    quoteLabel: "LISTENER",
    quote: '"Empathy was my biggest takeaway."',
  },
  perspectiveShift: FEEDBACK_AGGREGATE.snapshot.perspectiveShift,
  metrics: [
    {
      id: "rated-four-or-five",
      label: "Rated 4 or 5",
      value: "93.0%",
      fillWidth: "93%",
      fillColor: "#76A977",
    },
  ],
  topics: {
    label: "WHAT PEOPLE OPENED UP ABOUT",
    body: "Current issues, addiction, mental health, gender, LGBTQ+, culture, and everyday social prejudice.",
  },
} as const satisfies EditorialSnapshotBlock;

export const PARTNER_IMPACT_SECTION = {
  id: "partner-impact",
  intro: PARTNER_IMPACT_INTRO,
  blocks: [PARTNER_IMPACT_BLOCK],
} as const satisfies EditorialSection<EditorialSnapshotBlock>;

export type PartnerPerson = {
  id: string;
  name: string;
  eyebrow: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  bio: readonly string[];
};

export const PARTNER_PEOPLE_INTRO = {
  eyebrow: "05 / THE PEOPLE",
  title: "The people behind the stories",
  description:
    "Living Stories Collective is run by a small team that believes the shortest distance between people is a story.",
} as const satisfies EditorialSectionIntroData;

export const PARTNER_PEOPLE = [
  {
    id: "ritika",
    name: "Ritika",
    eyebrow: "FOUNDER",
    image: {
      src: "/images/people/ritika.webp",
      alt: "Portrait of Ritika Chawla.",
      width: 1600,
      height: 1066,
    },
    bio: [
      "Ritika Chawla is the Founder of Living Stories Collective. She is a seasoned L&D leader with 14+ years of experience in education and sustainability. She has worked with various organisations including the LEAD Group and India School Leadership Institute, working across schools in India. She also has a master's in Education from Azim Premji University.",
      "While Ritika is increasingly focused on sustainability and environment related issues on one hand, LSC is her passion project that she started with her friends to build a more empathetic, kind and inclusive world, by shifting mindsets. She believes that only if we treat those around us better can we take care of larger global issues such as climate change and war.",
    ],
  },
  {
    id: "anu",
    name: "Anu",
    eyebrow: "CORE TEAM",
    image: {
      src: "/images/people/anu-in-conversation.webp",
      alt: "Anu smiling during a Living Stories conversation.",
      width: 1066,
      height: 1599,
    },
    bio: [
      "Anu has been a Living Story since 2018, sharing her experiences with polyamory and queerness to replace assumption with empathy. Now a core member of LSC, she works with the team to calibrate and scale this model for broader impact. This approach is rooted in her branding background, where she specialises in finding the voice that resonates across diverse audiences.",
      "An advocate of inclusivity, Anu continuously analyses the relationship between media representation and socio-cultural evolution of marginalised voices. She carries this commitment into her home by maintaining a safe and comfortable space for anyone in need of a conversation...or silence. This space is celebrated for its fully-stocked snack cupboard and a selection of beverages, ensuring there is something for everyone.",
    ],
  },
  {
    id: "taha",
    name: "Taha",
    eyebrow: "CORE TEAM",
    image: {
      src: "/images/people/taha.webp",
      alt: "Portrait of Taha.",
      width: 1204,
      height: 1600,
    },
    bio: [
      "Taha has been part of Living Stories Collective since its inception, when he joined as a student in Hyderabad. Since then, he's remained part of the team that quietly makes the events happen. As Head of Operations at theprintspace, a bespoke fine art printing business with international production hubs, he brings the same instinct here: building the unglamorous systems that let more conversations happen, in more places.",
      "Eight years in, Taha is convinced the real work of these conversations isn't the answers - it's the questions people allow themselves to ask. He's spent enough time in the chair across from a stranger as a living book, to know that being asked the right thing can shift something in you faster than being told anything ever could. He brings that into how he listens now: with the suspicion that the most important thing in any room is usually the question no one's risked yet.",
    ],
  },
  {
    id: "kamal",
    name: "Kamal",
    eyebrow: "CORE TEAM",
    image: {
      src: "/images/people/kamal.webp",
      alt: "Portrait of Kamal.",
      width: 600,
      height: 600,
    },
    bio: [
      "Kamal has been part of LSC since 2018, when he was still in college looking for a way to contribute and learn from others experiences. He's a Software Engineer with experience at Coinbase and Swiggy.",
      "LSC is a passion project. One of the few spaces he's found where people genuinely learn from each other and aren't afraid of a difficult conversation. Over the years, this community has quietly shaped how he sees the world. He even turned vegan after listening to a living story here.",
      "As part of the core team, he's contributed towards coordination, design, and tools that power our events, and helps on the event day as well.",
    ],
  },
] as const satisfies readonly PartnerPerson[];

export const PARTNER_CONTACT_INTRO = {
  eyebrow: "06 / GET IN TOUCH",
  title: "Let's plan your session",
  description:
    "Tell us who you'd like to bring together and what you're looking for. We'll get back to you in a few days.",
} as const satisfies EditorialSectionIntroData;
