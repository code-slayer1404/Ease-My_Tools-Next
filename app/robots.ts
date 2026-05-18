import type {
    MetadataRoute,
} from "next";

const BASE_URL =
    "https://easemytools.com";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",

                allow: [
                    "/",
                    "/tools/",
                    "/blog/",
                ],

                disallow: [
                    // API

                    "/api/",

                    // Auth

                    "/login",
                    "/register",
                    "/verify-email",

                    // User / Private

                    "/dashboard/",
                ],
            },
        ],

        sitemap:
            `${BASE_URL}/sitemap.xml`,

        host: BASE_URL,
    };
}