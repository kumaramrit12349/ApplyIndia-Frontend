import React from "react";
import { Link } from "react-router-dom";
import {
  APPLYINDIA_SOCIAL_LINKS,
  WEBSITE_NAME,
} from "../../constant/SharedConstant";

const Footer: React.FC = () => {
  return (
    <footer className="ai-footer mt-auto" role="contentinfo">
      <div className="container py-5">
        {/* ================= MAIN CONTENT ================= */}
        <div className="row gy-5 align-items-start text-center text-md-start">
          {/* ---------- About ---------- */}
          <div className="col-12 col-lg-5 col-md-12 pe-md-5">
            <h6 className="ai-footer-title">About {WEBSITE_NAME}</h6>
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
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/disclaimer">Disclaimer</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
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
                className="btn btn-outline-light btn-sm rounded-pill px-4"
                aria-label="Send feedback"
                style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "0.5px" }}
              >
                Send Feedback
              </Link>
            </div>
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <div className="ai-footer-divider"></div>

        {/* ================= BOTTOM ================= */}
        <div className="ai-footer-bottom">
          © {new Date().getFullYear()} {WEBSITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
