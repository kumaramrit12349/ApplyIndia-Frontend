import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  name?: string;
  type?: string;
}

export default function SEO({ title, description, name, type }: SEOProps) {
  const fullTitle = `${title} | Apply India`;
  const defaultDescription =
    "Discover the latest government jobs, notifications, and results across India. Stay updated with reliable and timely information.";
  const metaDescription = description || defaultDescription;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />

      {/* Facebook tags */}
      <meta property="og:type" content={type || "website"} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || "Apply India"} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
    </Helmet>
  );
}
