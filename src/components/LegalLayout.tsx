import React from "react";
import SEO from "./SEO/SEO";

interface LegalLayoutProps {
  title: string;
  description?: string;
  canonical?: string;
  keywords?: string[];
  children: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  description,
  canonical,
  keywords,
  children,
}) => {
  return (
    <div className="container my-5">
      <SEO
        title={title}
        description={description || `Read the ${title} for Apply India.`}
        canonical={canonical}
        keywords={keywords}
      />
      <div className="bg-white shadow-sm rounded-4 p-4 p-md-5">
        <h1 className="mb-4 fw-bold">{title}</h1>
        <div className="legal-content">{children}</div>
      </div>
    </div>
  );
};

export default LegalLayout;
