import React from "react";
import { Link } from "react-router-dom";
import { FiShield, FiFileText, FiAlertTriangle, FiInfo, FiArrowUp } from "react-icons/fi";
import {
  APPLYINDIA_SOCIAL_LINKS,
  WEBSITE_NAME,
} from "../../constant/SharedConstant";

const LEGAL_LINKS = [
  { to: "/privacy", label: "Privacy Policy", icon: FiShield },
  { to: "/terms", label: "Terms & Conditions", icon: FiFileText },
  { to: "/disclaimer", label: "Disclaimer", icon: FiAlertTriangle },
  { to: "/about", label: "About Us", icon: FiInfo },
];

const Footer: React.FC = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="ai-footer mt-auto" role="contentinfo">
      <div className="ai-footer-glow" aria-hidden="true" />
      <div className="container py-5">
        {/* ================= MAIN CONTENT ================= */}
        <div className="row gy-5 align-items-start text-center text-md-start">
          {/* ---------- About ---------- */}
          <div className="col-12 col-lg-5 col-md-12 pe-md-5">
            <div className="ai-footer-brand justify-content-center justify-content-md-start">
              <img src="/apple-touch-icon.png" alt="" className="ai-footer-logo" />
              <span className="ai-footer-brand-name">{WEBSITE_NAME}</span>
            </div>
            <p className="ai-footer-text">
              {WEBSITE_NAME} provides verified government job, entrance exam,
              admission, and scholarship notifications across India. We ensure
              timely, authentic updates sourced from official authorities to
              help you stay informed and ahead.
            </p>
          </div>

          {/* ---------- Legal ---------- */}
          <div className="col-12 col-lg-3 col-md-6">
            <h6 className="ai-footer-title">Legal</h6>
            <ul className="ai-footer-links">
              {LEGAL_LINKS.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link to={to}>
                    <Icon size={14} aria-hidden="true" /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- Connect With Us ---------- */}
          <div className="col-12 col-lg-4 col-md-6">
            <h6 className="ai-footer-title">Connect With Us</h6>

            <div
              className="ai-footer-social justify-content-center justify-content-md-start mb-4"
              aria-label="Social media links"
            >
              {APPLYINDIA_SOCIAL_LINKS.map((item) => (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  title={item.name}
                  className="ai-social-icon"
                  style={{ background: item.color }}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    loading="lazy"
                  />
                </a>
              ))}
            </div>

            <div>
              <Link
                to="/feedback"
                className="ai-footer-feedback-btn"
                aria-label="Send feedback"
              >
                Send Feedback
              </Link>
            </div>
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <div className="ai-footer-divider"></div>

        {/* ================= BOTTOM ================= */}
        <div className="ai-footer-bottom-row">
          <span className="ai-footer-bottom">
            © {new Date().getFullYear()} {WEBSITE_NAME}. All rights reserved.
          </span>
          <button type="button" className="ai-footer-top-btn" onClick={scrollToTop}>
            Back to top <FiArrowUp size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
