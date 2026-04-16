import { Helmet } from "react-helmet-async";

const SITE_URL = "https://applyindia.online";
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;
const DEFAULT_DESCRIPTION =
  "Find the latest central & state government job notifications, entrance exams, admit cards, results, and scholarships across India. Your trusted sarkari naukri platform.";

interface SEOProps {
  title: string;
  description?: string;
  /** Override the canonical URL. Defaults to current origin + pathname. */
  canonical?: string;
  /** Pass the JSON-LD structured data object to inject as a script tag. */
  schema?: Record<string, unknown>;
  /** Set to true for paginated/search pages to avoid duplicate content. */
  noindex?: boolean;
  /** og:type — defaults to "website", use "article" for detail pages. */
  type?: "website" | "article";
  /** og:image override — defaults to the site logo. */
  image?: string;
}

export default function SEO({
  title,
  description,
  canonical,
  schema,
  noindex = false,
  type = "website",
  image,
}: SEOProps) {
  const fullTitle = `${title} | Apply India`;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const ogImage = image || DEFAULT_OG_IMAGE;

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
      <meta property="og:site_name" content="Apply India" />
      <meta property="og:locale" content="en_IN" />

      {/* ── Twitter ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ApplyIndia_" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* ── JSON-LD Structured Data ── */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
