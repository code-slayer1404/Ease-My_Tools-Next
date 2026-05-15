// app/sitemap.ts

import fs from "fs";
import path from "path";
import { MetadataRoute } from "next";

const BASE_URL = "https://easemytools.com";

/**
 * Use a stable date instead of new Date()
 * so search engines do not think every
 * page changes on every request.
 */
const LAST_MODIFIED = new Date("2026-05-15");

/**
 * Folders/routes to exclude
 */
const EXCLUDED_FOLDERS = new Set([
    "api",
]);

function getRoutes(
    dir = "app",
    baseRoute = ""
): string[] {
    const fullPath = path.join(process.cwd(), dir);

    const entries = fs.readdirSync(fullPath, {
        withFileTypes: true,
    });

    const routes: string[] = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const name = entry.name;

        /**
         * Skip:
         * - private folders (_folder)
         * - route groups ((group))
         * - dynamic routes ([slug])
         * - excluded folders
         */
        if (
            name.startsWith("_") ||
            name.startsWith("(") ||
            name.startsWith("[") ||
            EXCLUDED_FOLDERS.has(name)
        ) {
            continue;
        }

        const route = `${baseRoute}/${name}`;

        routes.push(route);

        /**
         * Recursively scan nested routes
         */
        routes.push(
            ...getRoutes(
                path.join(dir, name),
                route
            )
        );
    }

    return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = ["", ...getRoutes()];

    return routes.map((route) => ({
        url: `${BASE_URL}${route}`,

        lastModified: LAST_MODIFIED,

        changeFrequency:
            route === ""
                ? "daily"
                : "weekly",

        priority:
            route === ""
                ? 1
                : 0.8,
    }));
}