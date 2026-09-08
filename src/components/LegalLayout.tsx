import React from "react";
import { Link, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiShield, FiFileText, FiAlertTriangle, FiInfo } from "react-icons/fi";
import SEO from "./SEO/SEO";

interface LegalLayoutProps {
  title: string;
  description?: string;
  canonical?: string;
  keywords?: string[];
  icon?: IconType;
  children: React.ReactNode;
}

const RELATED_PAGES: { to: string; label: string; icon: IconType }[] = [
  { to: "/privacy", label: "Privacy Policy", icon: FiShield },
  { to: "/terms", label: "Terms & Conditions", icon: FiFileText },
  { to: "/disclaimer", label: "Disclaimer", icon: FiAlertTriangle },
  { to: "/about", label: "About Us", icon: FiInfo },
];

const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  description,
  canonical,
  keywords,
  icon: Icon = FiFileText,
  children,
}) => {
  const { pathname } = useLocation();
  const otherPages = RELATED_PAGES.filter((page) => page.to !== pathname);

  return (
    <div className="container my-5 legal-page">
      <SEO
        title={title}
        description={description || `Read the ${title} for Apply India.`}
        canonical={canonical}
        keywords={keywords}
      />
      <div className="legal-card">
        <div className="legal-card-header">
          <span className="legal-card-icon" aria-hidden="true">
            <Icon size={22} />
          </span>
          <div>
            <h1 className="legal-card-title">{title}</h1>
            {description && <p className="legal-card-subtitle">{description}</p>}
          </div>
        </div>
        <div className="legal-content">{children}</div>
      </div>

      <nav className="legal-related" aria-label="Other legal pages">
        <span className="legal-related-label">Also see:</span>
        {otherPages.map(({ to, label, icon: PageIcon }) => (
          <Link key={to} to={to} className="legal-related-link">
            <PageIcon size={13} aria-hidden="true" /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default LegalLayout;
