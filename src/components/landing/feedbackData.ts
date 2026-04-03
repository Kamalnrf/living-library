import type {
	EditorialQuoteGridBlock,
	EditorialQuoteGridItem,
	EditorialSection,
	EditorialSectionIntroData,
	EditorialSnapshotBlock,
} from "../editorial/editorialSection";

export type FeedbackLegendItem = {
	id: string;
	label: string;
	color: string;
};

export type FeedbackSnapshotMetric = {
	id: string;
	label: string;
	value: string;
	fillWidth: string;
	fillColor: string;
};

const FEEDBACK_INTRO = {
	eyebrow: "03 / FEEDBACK",
	title: "What People Say",
	description:
		"Short quotes plus aggregate event insights from participant forms.",
} as const satisfies EditorialSectionIntroData;

export const FEEDBACK_QUOTES = [
	{
		id: "cherish-experience",
		label: "QUOTE · LISTENER",
		quote: '"One such experience I will cherish for the rest of my life."',
		supportingCopy:
			"Participants repeatedly described this about their experience.",
	},
	{
		id: "changed-perception",
		label: "QUOTE · LISTENER",
		quote: '"Every story we heard changed our perception of society."',
		supportingCopy: "Empathy toward others became the biggest takeaway.",
	},
] as const satisfies readonly EditorialQuoteGridItem[];

const FEEDBACK_QUOTES_BLOCK = {
	kind: "quote-grid",
	quotes: FEEDBACK_QUOTES,
} as const satisfies EditorialQuoteGridBlock;

export const FEEDBACK_AGGREGATE = {
	voice: {
		eyebrow: "LISTENERS VOICE",
		title: "What stayed with people",
		description: "One reflection appeared repeatedly in participant responses.",
		quoteLabel: "LISTENER",
		quote: '"Empathy was my biggest takeaway."',
	},
	snapshot: {
		perspectiveShift: {
			label: "Perspective shift",
			value: "76%",
			ringGradient:
				"conic-gradient(in oklab from 0deg at 50% 50%, oklab(63.8% -0.070 0.015) 0%, oklab(63.8% -0.070 0.015) 40%, oklab(75.6% -0.001 0.088) 40%, oklab(75.6% -0.001 0.088) 75.7%, oklab(92.1% 0.002 0.015) 75.7%, oklab(92.1% 0.002 0.015) 100%)",
			legend: [
				{
					id: "significant",
					label: "significant",
					color: "#5E9A83",
				},
				{
					id: "somewhat",
					label: "somewhat",
					color: "#C5AE6D",
				},
			] as const satisfies readonly FeedbackLegendItem[],
		},
		metrics: [
			// {
			// 	id: "top-score",
			// 	label: "Top score (5/5)",
			// 	value: "64.3%",
			// 	fillWidth: "64.3%",
			// 	fillColor: "#6FA06E",
			// },
			{
				id: "rated-four-or-five",
				label: "Rated 4 or 5",
				value: "93.0%",
				fillWidth: "93%",
				fillColor: "#76A977",
			},
			// {
			// 	id: "stereotype-shift",
			// 	label: "Stereotype shift",
			// 	value: "75.7%",
			// 	fillWidth: "75.7%",
			// 	fillColor: "#6FA06E",
			// },
		] as const satisfies readonly FeedbackSnapshotMetric[],
		topics: {
			label: "WHAT PEOPLE OPENED UP ABOUT",
			body: "Participants reflected on a diverse set of topics such as current issues, addiction, mental health, gender, LGBTQ+, culture, and everyday social prejudice.",
		},
	},
} as const;

const FEEDBACK_AGGREGATE_BLOCK = {
	kind: "snapshot",
	eyebrow: "",
	voice: FEEDBACK_AGGREGATE.voice,
	perspectiveShift: FEEDBACK_AGGREGATE.snapshot.perspectiveShift,
	metrics: FEEDBACK_AGGREGATE.snapshot.metrics,
	topics: FEEDBACK_AGGREGATE.snapshot.topics,
} as const satisfies EditorialSnapshotBlock;

export const FEEDBACK_SECTION = {
	id: "feedback",
	intro: FEEDBACK_INTRO,
	blocks: [FEEDBACK_QUOTES_BLOCK, FEEDBACK_AGGREGATE_BLOCK],
} as const satisfies EditorialSection<
	EditorialQuoteGridBlock | EditorialSnapshotBlock
>;
