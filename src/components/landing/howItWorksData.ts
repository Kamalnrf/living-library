import type {
	EditorialSection,
	EditorialSectionIntroData,
	EditorialStoryRowBlock,
} from "../editorial/editorialSection";

const HOW_IT_WORKS_INTRO = {
	eyebrow: "02 / AT EVENT",
	title: "How It Works",
	description: {
		desktop:
			"Our process builds connection and empathy through personal storytelling.",
		mobile: "Our process builds connection and empathy through personal storytelling.",
	},
} as const satisfies EditorialSectionIntroData;

const HOW_IT_WORKS_STEPS = [
	{
		kind: "story-row",
		id: "borrow-a-living-book",
		stepLabel: "STEP 1",
		title: "Borrow a Living Story",
		description:
			"Choose from our collective of real people who volunteer to share their lived experiences - a refugee, a former addict, someone who has experienced homelessness, a person living with disabilities, and more.",
		layout: "media-first",
		media: {
			kind: "single-image",
			frameTone: "sage",
			height: {
				mobile: "228px",
			},
			image: {
				src: "/images/book-catalog.webp",
				alt: "Living Book profiles pinned to a blue display board at an event.",
				width: 1048,
				height: 762,
			},
		},
	},
	{
		kind: "story-row",
		id: "have-a-conversation",
		stepLabel: "STEP 2",
		title: "Have a Conversation",
		description:
			"Engage in a 30-minute open dialogue in a safe, respectful environment where respectful questions are encouraged.",
		layout: "text-first",
		media: {
			kind: "collage",
			stackedImages: [
        {
					src: "/images/mcr-hrd-book-e-2-book-3-reading.webp",
					alt: "Participants seated around a table during a Living Stories Collective conversation circle.",
				},
				{
					src: "/images/mcr-hrd-e-2-book-10-reading.webp",
					alt: "A Living Book conversation underway at a community event.",
				},
			],
			accentImage: {
				src: "/images/hlf-book-1-reading.webp",
				alt: "Two participants engaged in an intimate Living Book conversation.",
			},
			accentFrameTone: "sand",
		},
	},
	{
		kind: "story-row",
		id: "return-with-a-changed-perspective",
		stepLabel: "STEP 3",
		title: "Question Your Perspective",
		description:
			"Return with new insights, changed opinions, and a deeper understanding of experiences different from yours.",
		layout: "media-first",
		media: {
			kind: "single-image",
			frameTone: "lavender",
			height: {
				mobile: "228px",
			},
			image: {
				src: "/images/reflection.webp",
				alt: "A speaker talks with participants seated in a circle during a reflection session.",
				width: 1328,
				height: 1312,
			},
		}
	},
] as const satisfies readonly EditorialStoryRowBlock[];

export const HOW_IT_WORKS_SECTION = {
	id: "how-it-works",
	intro: HOW_IT_WORKS_INTRO,
	blocks: HOW_IT_WORKS_STEPS,
} as const satisfies EditorialSection<EditorialStoryRowBlock>;
