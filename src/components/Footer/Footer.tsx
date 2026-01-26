import React from "react";
import { Link } from "react-router-dom";
import {
  APPLYINDIA_SOCIAL_LINKS,
  WEBSITE_NAME,
} from "../../constant/SharedConstant";

const Footer: React.FC = () => {
  return (
    <footer className="footer-bg text-light mt-auto" role="contentinfo">
      <div className="container py-5">
        {/* ================= MAIN CONTENT ================= */}
        <div className="row gy-4 align-items-start text-center text-md-start">
          {/* ---------- About ---------- */}
          <div className="col-12 col-md-4">
            <h6 className="footer-title">About {WEBSITE_NAME}</h6>
            <p className="footer-text">
              {WEBSITE_NAME} provides verified government job, entrance exam,
              admission, and scholarship notifications across India. We ensure
              timely, authentic updates sourced from official authorities to
              help you stay informed and ahead.
            </p>
          </div>

          {/* ---------- Legal ---------- */}
          <div className="col-12 col-md-4">
            <h6 className="footer-title">Legal</h6>
            <ul className="list-unstyled footer-links mb-0">
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

          {/* ---------- Social ---------- */}
          <div className="col-12 col-md-4">
            <h6 className="footer-title">Connect With Us</h6>

            <div
              className="social-wrap d-flex gap-3 justify-content-center justify-content-md-start"
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
                  className="social-icon"
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    loading="lazy"
                    width={20}
                    height={20}
                  />
                </a>
              ))}
            </div>

            <div className="mt-3">
              <Link
                to="/feedback"
                className="btn btn-outline-light btn-sm"
                aria-label="Send feedback"
              >
                Send Feedback
              </Link>
            </div>
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <hr className="footer-divider my-4" />

        {/* ================= BOTTOM ================= */}
        <div className="text-center small footer-copyright">
          © {new Date().getFullYear()} Apply India. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
