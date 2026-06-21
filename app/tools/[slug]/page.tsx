import type {
	ComponentType,
} from "react";

import type { Metadata } from "next";

import dynamic from "next/dynamic";

import { notFound } from "next/navigation";

import CategoryToolsPage from "@/components/CategoryToolsPage";

import BreadcrumbNav from "@/components/tool-page/BreadcrumbNav";
import ToolHero from "@/components/tool-page/ToolHero";
import ToolContent from "@/components/tool-page/ToolContent";
import ToolFaq from "@/components/tool-page/ToolFaq";
import RelatedTools from "@/components/tool-page/RelatedTools";

import {
	categoryTitles,
	getToolBySlug,
	toolsByCategory,
} from "@/data/toolsData";

import {
	createSEOMetadata,
} from "@/lib/seo";

import {
	buildBreadcrumbItems,
	buildBreadcrumbSchema,
	buildFaqSchema,
	buildToolSchema,
} from "@/lib/schemaHelper";

// ======================================================
// Metadata
// ======================================================

export async function generateMetadata({
	params,
}: {
	params: Promise<{
		slug: string;
	}>;
}): Promise<Metadata> {
	const { slug } =
		await params;

	const tool =
		getToolBySlug(slug);

	// ======================================================
	// Tool Page
	// ======================================================

	if (tool) {
		return createSEOMetadata({
			title: tool.seo.title,

			description:
				tool.seo.description,

			path: `/tools/${slug}`,
		});
	}

	// ======================================================
	// Category Page
	// ======================================================

	if (
		slug &&
		categoryTitles[
		slug as keyof typeof categoryTitles
		]
	) {
		return createSEOMetadata({
			title:
				categoryTitles[
				slug as keyof typeof categoryTitles
				],

			description:
				`Explore ${categoryTitles[
				slug as keyof typeof categoryTitles
				]
				} tools on EaseMyTools.`,

			path: `/tools/${slug}`,
		});
	}

	return {};
}

// ======================================================
// Page
// ======================================================

export default async function Page({
	params,
}: {
	params: Promise<{
		slug: string;
	}>;
}) {
	const { slug } =
		await params;

	const tool =
		getToolBySlug(slug);

	// ======================================================
	// Tool Page
	// ======================================================

	if (tool) {
		const DynamicComponent =
			dynamic(
				() =>
					tool.component() as Promise<{
						default: ComponentType;
					}>
			);

		// ======================================================
		// Schemas
		// ======================================================

		const toolSchema =
			buildToolSchema(tool);

		const breadcrumbSchema =
			buildBreadcrumbSchema(
				tool.slug,
				tool.name
			);

		const faqSchema =
			buildFaqSchema(tool);

		// ======================================================
		// Breadcrumbs
		// ======================================================

		const breadcrumbItems =
			buildBreadcrumbItems(
				tool.slug,
				tool.name
			);

		return (
			<>
				{/* Tool Schema */}

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html:
							JSON.stringify(
								toolSchema
							),
					}}
				/>

				{/* Breadcrumb Schema */}

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html:
							JSON.stringify(
								breadcrumbSchema
							),
					}}
				/>

				{/* FAQ Schema */}

				{faqSchema ? (
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html:
								JSON.stringify(
									faqSchema
								),
						}}
					/>
				) : null}

				{/* Breadcrumb */}

				<BreadcrumbNav
					items={
						breadcrumbItems
					}
				/>

				{/* Hero */}

				<ToolHero tool={tool} />

				{/* Tool */}

				<div className="safe-overflow">
					<DynamicComponent />
				</div>
				{/* SEO Content */}

				<ToolContent tool={tool} />

				{/* FAQ */}

				<ToolFaq tool={tool} />

				{/* Related Tools */}

				<RelatedTools tool={tool} />
			</>
		);
	}

	// ======================================================
	// Category Page
	// ======================================================

	if (
		slug &&
		toolsByCategory[
		slug as keyof typeof toolsByCategory
		]
	) {
		return (
			<CategoryToolsPage
				categoryId={slug}
			/>
		);
	}

	// ======================================================
	// Invalid Route
	// ======================================================

	return notFound();
}