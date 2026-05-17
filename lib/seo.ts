import type { Metadata } from "next";

export const SITE_CONFIG = {
  name: "EaseMyTools",
  siteUrl: "https://easemytools.com",
  defaultTitle: "EaseMyTools | Free online tools for images, text, files, and productivity",
  titleTemplate: "%s | EaseMyTools",
  defaultDescription:
    "Use practical browser-based tools for image editing, text formatting, converters, and everyday workflows.",
  twitterHandle: "@easemytools",
};

type RobotsConfig = Metadata["robots"];

interface SEOInput {
  title: string;
  description: string;
  path?: string;
  images?: string[];
  noIndex?: boolean;
  robots?: RobotsConfig;
}

export const generateCanonicalUrl = (path = ""): string => {
  if (!path || path === "/") return SITE_CONFIG.siteUrl;
  return `${SITE_CONFIG.siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

export const createSEOMetadata = ({
  title,
  description,
  path = "/",
  images = ["/web-app-manifest-512x512.png"],
  noIndex = false,
  robots,
}: SEOInput): Metadata => {
  const canonicalUrl = generateCanonicalUrl(path);
  const pageTitle = title.includes("EaseMyTools") ? title : `${title} | EaseMyTools`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      title: pageTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images,
      creator: SITE_CONFIG.twitterHandle,
    },
    robots:
      robots ??
      (noIndex
        ? { index: false, follow: false }
        : { index: true, follow: true, googleBot: { index: true, follow: true } }),
  };
};
