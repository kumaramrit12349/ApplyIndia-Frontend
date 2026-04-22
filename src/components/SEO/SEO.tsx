import { Helmet } from "react-helmet-async";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TWITTER_HANDLE,
  SITE_URL,
} from "../../seo/site";

interface SEOProps {
  title: string;
  description?: string;
  /** Override the canonical URL. Defaults to current origin + pathname. */
  canonical?: string;
  /** Pass one or more JSON-LD structured data objects to inject. */
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
  /** Set to true for paginated/search pages to avoid duplicate content. */
  noindex?: boolean;
  /** og:type — defaults to "website", use "article" for detail pages. */
  type?: "website" | "article";
  /** og:image override — defaults to the site logo. */
  image?: string;
  keywords?: string[];
}

export default function SEO({
  title,
  description,
  canonical,
  schema,
  noindex = false,
  type = "website",
  image,
  keywords,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const metaDescription = description || SITE_DESCRIPTION;
  const ogImage = image || SITE_OG_IMAGE;
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  // Build canonical URL — always strip search params to avoid duplicate content
  const canonicalUrl =
    canonical ||
    (typeof window !== "undefined"
      ? `${SITE_URL}${window.location.pathname}`
      : SITE_URL);

  return (
    <Helmet>
      {/* ── Core ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords?.length ? (
        <meta name="keywords" content={keywords.join(", ")} />
      ) : null}
      <meta name="author" content={SITE_NAME} />
      {noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* ── Canonical ── */}
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Open Graph ── */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${SITE_NAME} logo`} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* ── Twitter ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_TWITTER_HANDLE} />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} logo`} />

      {/* ── JSON-LD Structured Data ── */}
      {schemas.map((item, index) => (
        <script key={`${canonicalUrl}-schema-${index}`} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
