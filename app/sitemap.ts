import type {
    MetadataRoute,
} from "next";

import {
    getAllTools,
    toolsByCategory,
} from "@/data/toolsData";

const BASE_URL =
    "https://easemytools.com";

const LAST_MODIFIED = new Date();

// ======================================================
// Static Routes
// ======================================================

const STATIC_ROUTES = [
    {
        path: "",
        priority: 1,
        changeFrequency:
            "daily" as const,
    },

    {
        path: "/tools",
        priority: 0.95,
        changeFrequency:
            "daily" as const,
    },

    {
        path: "/about",
        priority: 0.6,
        changeFrequency:
            "monthly" as const,
    },

    {
        path: "/contact",
        priority: 0.6,
        changeFrequency:
            "monthly" as const,
    },

    {
        path: "/blog",
        priority: 0.8,
        changeFrequency:
            "weekly" as const,
    },

    {
        path: "/privacy-policy",
        priority: 0.3,
        changeFrequency:
            "yearly" as const,
    },

    {
        path: "/terms-conditions",
        priority: 0.3,
        changeFrequency:
            "yearly" as const,
    },

    {
        path: "/pricing",
        priority: 0.7,
        changeFrequency:
            "monthly" as const,
    },

    {
        path: "/features",
        priority: 0.7,
        changeFrequency:
            "monthly" as const,
    },

    {
        path: "/faq",
        priority: 0.5,
        changeFrequency:
            "monthly" as const,
    },

    {
        path: "/documentation",
        priority: 0.6,
        changeFrequency:
            "monthly" as const,
    },
];

// ======================================================
// Sitemap
// ======================================================

export default function sitemap(): MetadataRoute.Sitemap {
    // ======================================================
    // Static Pages
    // ======================================================

    const staticPages =
        STATIC_ROUTES.map(
            (route) => ({
                url:
                    `${BASE_URL}${route.path}`,

                lastModified:
                    LAST_MODIFIED,

                changeFrequency:
                    route.changeFrequency,

                priority:
                    route.priority,
            })
        );

    // ======================================================
    // Category Pages
    // ======================================================

    const categoryPages =
        Object.keys(
            toolsByCategory
        ).map((category) => ({
            url:
                `${BASE_URL}/tools/${category}`,

            lastModified:
                LAST_MODIFIED,

            changeFrequency:
                "weekly" as const,

            priority: 0.85,
        }));

    // ======================================================
    // Tool Pages
    // ======================================================

    const toolPages =
        getAllTools().map(
            (tool) => ({
                url:
                    `${BASE_URL}/tools/${tool.slug}`,

                lastModified:
                    LAST_MODIFIED,

                changeFrequency:
                    "weekly" as const,

                priority: 0.8,
            })
        );

    // ======================================================
    // Final Sitemap
    // ======================================================

    return [
        ...staticPages,

        ...categoryPages,

        ...toolPages,
    ];
}