import React from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiArrowRight, FiBriefcase, FiBookOpen, FiAward, FiEdit3, FiCompass } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import "./Hero.css";

const KICKER_ITEMS = [
  { icon: FiBriefcase, label: "Jobs" },
  { icon: FiBookOpen, label: "Admissions" },
  { icon: FiAward, label: "Scholarships" },
  { icon: FiEdit3, label: "Exams" },
];

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, onShowAuthPopup } = useAuth();

  const handleExploreClick = () => {
    if (isAuthenticated) {
      navigate("/dashboard?tab=open");
    } else {
      onShowAuthPopup("/dashboard?tab=open");
    }
  };

  return (
    <section className="ai-hero" aria-label="Apply India">
      <div className="ai-hero-blob ai-hero-blob--blue" aria-hidden="true" />
      <div className="ai-hero-blob ai-hero-blob--orange" aria-hidden="true" />
      <div className="container">
        <div className="ai-hero-inner">
          <div className="ai-hero-kicker">
            {KICKER_ITEMS.map(({ icon: Icon, label }) => (
              <span className="ai-hero-kicker-item" key={label}>
                <Icon aria-hidden="true" size={13} /> {label}
              </span>
            ))}
          </div>
          <h1 className="ai-hero-title">
            Your Gateway to <span className="ai-hero-highlight">Government Opportunities</span>
          </h1>
          <p className="ai-hero-subtitle">
            One place for every verified government opportunity across India — always free.
          </p>
          <div className="ai-hero-cta">
            <a href="#browse-notifications" className="ai-hero-btn ai-hero-btn--primary">
              Browse Notifications <FiArrowRight aria-hidden="true" />
            </a>
            <button type="button" className="ai-hero-btn ai-hero-btn--secondary" onClick={handleExploreClick}>
              <FiCompass aria-hidden="true" /> Explore Open Opportunities
            </button>
          </div>
          <div className="ai-hero-trust">
            <span><FiCheckCircle aria-hidden="true" /> Verified sources</span>
            <span><FiCheckCircle aria-hidden="true" /> Updated daily</span>
            <span><FiCheckCircle aria-hidden="true" /> 100% free</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
