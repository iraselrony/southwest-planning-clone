import { getPayload } from "payload";
import config from "@payload-config";
import "./dashboard.css";

type CollectionSlug =
	| "pages"
	| "posts"
	| "post-categories"
	| "services"
	| "case-studies"
	| "testimonials"
	| "contact-submissions"
	| "media";

type CountCard = {
	label: string;
	slug: CollectionSlug;
	tone: "ink" | "green" | "amber" | "blue";
	description: string;
};

type LatestItem = {
	id: number | string;
	title: string;
	meta: string;
	slug: CollectionSlug;
};

const countCards: CountCard[] = [
	{
		label: "Pages",
		slug: "pages",
		tone: "ink",
		description: "Core website pages and landing sections",
	},
	{
		label: "Posts",
		slug: "posts",
		tone: "green",
		description: "News, guides, insights, and planning alerts",
	},
	{
		label: "Services",
		slug: "services",
		tone: "blue",
		description: "Consultancy service pages and offers",
	},
	{
		label: "New enquiries",
		slug: "contact-submissions",
		tone: "amber",
		description: "Public contact forms waiting for action",
	},
];

const quickActions = [
	{
		title: "Write a post",
		description:
			"Create news, guide, insight, planning alert, or case note content.",
		href: "/admin/collections/posts/create",
	},
	{
		title: "Add a service",
		description:
			"Keep service pages structured with SEO, FAQ, gallery, and related work.",
		href: "/admin/collections/services/create",
	},
	{
		title: "Review enquiries",
		description:
			"Prioritise new leads and track replies, follow-ups, and outcomes.",
		href: "/admin/collections/contact-submissions",
	},
	{
		title: "Update site settings",
		description:
			"Branding, contact details, footer links, legal, and SEO defaults.",
		href: "/admin/globals/site-settings",
	},
];

const postTypes = [
	"Insight",
	"News",
	"Guide",
	"Planning Alert",
	"Case Note",
	"Announcement",
];

const getTitle = (doc: Record<string, unknown>, fallback: string) => {
	const value =
		doc.title || doc.name || doc.subject || doc.filename || doc.authorName;
	return typeof value === "string" && value.length > 0 ? value : fallback;
};

const formatDate = (value: unknown) => {
	if (typeof value !== "string") return "No date";
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
};

async function safeCount(
	payload: Awaited<ReturnType<typeof getPayload>>,
	slug: CollectionSlug,
) {
	try {
		const result = await payload.count({ collection: slug as never });
		return result.totalDocs;
	} catch {
		return 0;
	}
}

async function safeLatest(
	payload: Awaited<ReturnType<typeof getPayload>>,
	slug: CollectionSlug,
	limit = 4,
): Promise<LatestItem[]> {
	try {
		const result = await payload.find({
			collection: slug as never,
			depth: 0,
			limit,
			sort: "-updatedAt",
		});

		return result.docs.map((doc, index) => {
			const record = doc as Record<string, unknown>;
			const date = record.updatedAt || record.createdAt || record.submittedAt;
			return {
				id: String(record.id || `${slug}-${index}`),
				title: getTitle(record, "Untitled"),
				meta: formatDate(date),
				slug,
			};
		});
	} catch {
		return [];
	}
}

export default async function Dashboard() {
	const payload = await getPayload({ config });
	const [counts, latestPosts, latestEnquiries, latestPages] = await Promise.all(
		[
			Promise.all(
				countCards.map(async (card) => ({
					...card,
					count: await safeCount(payload, card.slug),
				})),
			),
			safeLatest(payload, "posts", 5),
			safeLatest(payload, "contact-submissions", 5),
			safeLatest(payload, "pages", 4),
		],
	);

	return (
		<main className="swa-dashboard">
			<section className="swa-hero">
				<div>
					<p className="swa-kicker">South West Planning CMS</p>
					<h1>Content command centre</h1>
					<p className="swa-hero-copy">
						Manage editorial content, lead flow, services, case studies, and
						site settings from one premium workspace.
					</p>
				</div>
				<div className="swa-hero-panel" aria-label="Editorial workflow">
					<span>Draft</span>
					<span>Review</span>
					<span>Publish</span>
				</div>
			</section>

			<section className="swa-count-grid" aria-label="CMS overview">
				{counts.map((item) => (
					<a
						className={`swa-stat swa-stat-${item.tone}`}
						href={`/admin/collections/${item.slug}`}
						key={item.slug}
					>
						<span>{item.label}</span>
						<strong>{item.count}</strong>
						<small>{item.description}</small>
					</a>
				))}
			</section>

			<section className="swa-layout">
				<div className="swa-panel swa-main-panel">
					<div className="swa-panel-head">
						<div>
							<p className="swa-kicker">Editorial</p>
							<h2>Post types are now structured</h2>
						</div>
						<a href="/admin/collections/posts/create">New post</a>
					</div>
					<div className="swa-type-grid">
						{postTypes.map((type) => (
							<div className="swa-type" key={type}>
								<span>{type}</span>
								<small>
									Title, excerpt, body, media, SEO, workflow, categories,
									relations
								</small>
							</div>
						))}
					</div>
				</div>

				<div className="swa-panel">
					<div className="swa-panel-head compact">
						<div>
							<p className="swa-kicker">Quick actions</p>
							<h2>Next best move</h2>
						</div>
					</div>
					<div className="swa-action-list">
						{quickActions.map((action) => (
							<a href={action.href} key={action.title}>
								<strong>{action.title}</strong>
								<span>{action.description}</span>
							</a>
						))}
					</div>
				</div>
			</section>

			<section className="swa-three-col">
				<LatestPanel
					title="Latest posts"
					href="/admin/collections/posts"
					items={latestPosts}
					empty="No posts yet"
				/>
				<LatestPanel
					title="Recent enquiries"
					href="/admin/collections/contact-submissions"
					items={latestEnquiries}
					empty="No enquiries yet"
				/>
				<LatestPanel
					title="Recently edited pages"
					href="/admin/collections/pages"
					items={latestPages}
					empty="No pages found"
				/>
			</section>
		</main>
	);
}

function LatestPanel({
	title,
	href,
	items,
	empty,
}: {
	title: string;
	href: string;
	items: LatestItem[];
	empty: string;
}) {
	return (
		<div className="swa-panel swa-list-panel">
			<div className="swa-panel-head compact">
				<h2>{title}</h2>
				<a href={href}>View all</a>
			</div>
			{items.length > 0 ? (
				<ul className="swa-latest-list">
					{items.map((item) => (
						<li key={`${item.slug}-${item.id}`}>
							<a href={`/admin/collections/${item.slug}/${item.id}`}>
								<span>{item.title}</span>
								<small>{item.meta}</small>
							</a>
						</li>
					))}
				</ul>
			) : (
				<p className="swa-empty">{empty}</p>
			)}
		</div>
	);
}
