import {
    createBreadcrumbSchema,
    createFAQSchema,
    createWebApplicationSchema,
} from "@/lib/schema";

import {
    categoryTitles,
    getToolCategoryBySlug,
} from "@/data/toolsData";

// ======================================================
// Breadcrumb UI
// ======================================================

export function buildBreadcrumbItems(
    slug: string,
    toolName: string
) {
    const category =
        getToolCategoryBySlug(slug);

    const categoryTitle =
        category
            ? categoryTitles[
            category as keyof typeof categoryTitles
            ]
            : "Tools";

    return [
        {
            name: "Home",
            href: "/",
        },

        {
            name: "Tools",
            href: "/tools",
        },

        ...(category
            ? [
                {
                    name: categoryTitle,
                    href: `/tools/${category}`,
                },
            ]
            : []),

        {
            name: toolName,
        },
    ];
}

// ======================================================
// Breadcrumb Schema
// ======================================================

export function buildBreadcrumbSchema(
    slug: string,
    toolName: string
) {
    const category =
        getToolCategoryBySlug(slug);

    const categoryTitle =
        category
            ? categoryTitles[
            category as keyof typeof categoryTitles
            ]
            : "Tools";

    return createBreadcrumbSchema([
        {
            name: "Home",
            item: "https://easemytools.com",
        },

        {
            name: "Tools",
            item: "https://easemytools.com/tools",
        },

        ...(category
            ? [
                {
                    name: categoryTitle,
                    item:
                        `https://easemytools.com/tools/${category}`,
                },
            ]
            : []),

        {
            name: toolName,
            item:
                `https://easemytools.com/tools/${slug}`,
        },
    ]);
}

// ======================================================
// Tool Schema
// ======================================================

export function buildToolSchema(
    tool: any
) {
    return createWebApplicationSchema(
        tool.name,

        `https://easemytools.com/tools/${tool.slug}`,

        tool.seo.description
    );
}

// ======================================================
// FAQ Schema
// ======================================================

export function buildFaqSchema(
    tool: any
) {
    const faqs =
        tool.seoContent?.faqs;

    if (
        !faqs ||
        faqs.length === 0
    ) {
        return null;
    }

    return createFAQSchema(
        faqs
    );
}