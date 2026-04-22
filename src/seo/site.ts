import { APPLYINDIA_SOCIAL_LINKS } from "../constant/SharedConstant";

export const SITE_NAME = "Apply India";
export const SITE_URL = "https://applyindia.online";
export const SITE_OG_IMAGE = `${SITE_URL}/logo.png`;
export const SITE_TWITTER_HANDLE = "@ApplyIndia_";
export const SITE_DESCRIPTION =
  "Apply India Online helps you discover the latest government jobs, sarkari naukri updates, admit cards, results, entrance exams, scholarships, and admissions across India.";

export const SOCIAL_PROFILE_URLS = APPLYINDIA_SOCIAL_LINKS.map(
  (item) => item.url,
);

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: ["Apply India Online", "ApplyIndia", "Apply India"],
  url: SITE_URL,
  logo: SITE_OG_IMAGE,
  sameAs: SOCIAL_PROFILE_URLS,
};

export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  alternateName: "Apply India Online",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?searchValue={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
