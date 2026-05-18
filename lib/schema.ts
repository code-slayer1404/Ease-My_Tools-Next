interface ListItem {
  name: string;
  item: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EaseMyTools",
  url: "https://easemytools.com",
  logo: "https://easemytools.com/EaseMyTools.svg",
});

export const createWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "EaseMyTools",
  url: "https://easemytools.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://easemytools.com/tools?query={search_term_string}",
    "query-input": "required name=search_term_string",
  },
});

export const createBreadcrumbSchema = (items: ListItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: entry.name,
    item: entry.item,
  })),
});

export const createFAQSchema = (items: FAQItem[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: entry.answer,
    },
  })),
});

export const createWebApplicationSchema = (name: string, url: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name,
  url,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
});
