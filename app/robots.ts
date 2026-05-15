// app/robots.ts

import { MetadataRoute } from "next";

const BASE_URL = "https://easemytools.com";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",

                allow: "/",

                disallow: [
                    "/api/",
                ],
            },
        ],

        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}