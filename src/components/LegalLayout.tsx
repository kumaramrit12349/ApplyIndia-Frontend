import React from "react";
import SEO from "./SEO/SEO";

const LegalLayout: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <div className="container my-5">
      <SEO title={title} description={`Read the ${title} for Apply India.`} />
      <div className="bg-white shadow-sm rounded-4 p-4 p-md-5">
        <h1 className="mb-4 fw-bold">{title}</h1>
        <div className="legal-content">{children}</div>
      </div>
    </div>
  );
};

export default LegalLayout;
