import type { MetadataRoute } from "next"

import { getAllTools } from "@/data/registry"
import { CATEGORIES } from "@/data/featuredCategories"

const BASE_URL = "https://easemytools.com"

const LAST_MODIFIED = new Date()

// ======================================================
// Static Routes
// ======================================================

const STATIC_ROUTES = [
    {
        path: "",
        priority: 1,
        changeFrequency: "daily" as const,
    },

    {
        path: "/tools",
        priority: 0.95,
        changeFrequency: "daily" as const,
    },

    // {
    //     path: "/blog",
    //     priority: 0.8,
    //     changeFrequency: "weekly" as const,
    // },

]

// ======================================================
// Sitemap
// ======================================================

export default function sitemap(): MetadataRoute.Sitemap {
    // ======================================================
    // Static Pages
    // ======================================================

    const staticPages = STATIC_ROUTES.map((route) => ({
        // url: `${BASE_URL}${route.path}`,
        url: new URL(route.path || "/", BASE_URL).toString(),

        lastModified: LAST_MODIFIED,

        changeFrequency: route.changeFrequency,

        priority: route.priority,
    }))

    // ======================================================
    // Category Pages
    // ======================================================

    const categoryPages = CATEGORIES.map((category) => ({
        // url: `${BASE_URL}${category.link}`,
        url: new URL(category.link, BASE_URL).toString(),

        lastModified: LAST_MODIFIED,

        changeFrequency: "weekly" as const,

        priority: 0.9,
    }))

    // ======================================================
    // Tool Pages
    // ======================================================

    const toolPages = getAllTools().map((tool) => ({
        // url: `${BASE_URL}/tools/tool/${tool.slug}`,
        url: new URL(`/tools/tool/${tool.slug}`, BASE_URL).toString(),

        lastModified: LAST_MODIFIED,

        changeFrequency: "weekly" as const,

        priority: 0.8,
    }))

    // ======================================================
    // Final Sitemap
    // ======================================================

    return [...staticPages, ...categoryPages, ...toolPages]
}
