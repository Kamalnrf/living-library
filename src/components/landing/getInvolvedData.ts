import {
	INSTAGRAM_URL,
	LIVING_BOOK_APPLICATION_URL,
	LUMA_CALENDAR_URL,
} from "../../utils/site";
import type {
	EditorialActionCard,
	EditorialCardGridBlock,
	EditorialConnectActionsBlock,
	EditorialSection,
	EditorialSectionIntroData,
} from "../editorial/editorialSection";

const GET_INVOLVED_INTRO = {
	eyebrow: "04 / GET INVOLVED",
	title: "Three ways to reach us",
	description: "Whether you want to share, host, or connect.",
} as const satisfies EditorialSectionIntroData;

const GET_INVOLVED_ACTION_CARDS = [
	{
		id: "01",
		title: "Apply to be a Living Book",
		description:
			"Share your unique story and help others understand diverse perspectives and experiences.",
		action: {
			href: LIVING_BOOK_APPLICATION_URL,
			label: "Open application form ↗",
			external: true,
		},
		minHeight: {
			desktop: "300px",
			mobile: "276px",
		},
	},
	{
		id: "02",
		title: "Host an event with us",
		description: "Plan a session for your organization, school, or community.",
		action: {
			href: "mailto:mail@livingstoriescollective.org",
			label: "Start partner conversation ↗",
			external: false,
		},
		minHeight: {
			desktop: "300px",
			mobile: "252px",
		},
	},
] as const satisfies readonly EditorialActionCard[];

const GET_INVOLVED_ACTIONS_BLOCK = {
	kind: "card-grid",
	cards: GET_INVOLVED_ACTION_CARDS,
} as const satisfies EditorialCardGridBlock;

const GET_INVOLVED_CONNECT_BLOCK = {
	kind: "connect-actions",
	anchorId: "contact",
	id: "03",
	title: "Connect",
	cards: [
		{
			id: "social",
			eyebrow: "SOCIAL",
			title: "Instagram",
			description:
				"For collaboration, media, or volunteering, send us a note and we'll reach out quickly.",
			href: INSTAGRAM_URL,
			linkLabel: "@livingstoriesco ↗",
			external: true,
		},
		{
			id: "calendar",
			eyebrow: "UPCOMING SESSIONS",
			title: "Event calendar",
			description:
				"See open sessions and registration links on the live calendar.",
			href: LUMA_CALENDAR_URL,
			actionValue: "View sessions",
			actionButtonLabel: "Open ↗",
			external: true,
		},
	],
} as const satisfies EditorialConnectActionsBlock;

export const GET_INVOLVED_SECTION = {
	id: "get-involved",
	intro: GET_INVOLVED_INTRO,
	blocks: [GET_INVOLVED_ACTIONS_BLOCK, GET_INVOLVED_CONNECT_BLOCK],
} as const satisfies EditorialSection<
	EditorialCardGridBlock | EditorialConnectActionsBlock
>;
