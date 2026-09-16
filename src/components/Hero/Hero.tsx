import React from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiArrowRight, FiBriefcase, FiBookOpen, FiAward, FiEdit3, FiCompass } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/useTranslation";
import "./Hero.css";

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, onShowAuthPopup } = useAuth();
  const { hero: t } = useTranslation();

  const KICKER_ITEMS = [
    { icon: FiBriefcase, label: t.kickerJobs },
    { icon: FiBookOpen, label: t.kickerAdmissions },
    { icon: FiAward, label: t.kickerScholarships },
    { icon: FiEdit3, label: t.kickerExams },
  ];

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
            {t.titlePrefix} <span className="ai-hero-highlight">{t.titleHighlight}</span>
          </h1>
          <p className="ai-hero-subtitle">{t.subtitle}</p>
          <div className="ai-hero-cta">
            <a href="#browse-notifications" className="ai-hero-btn ai-hero-btn--primary">
              {t.browseNotifications} <FiArrowRight aria-hidden="true" />
            </a>
            <button type="button" className="ai-hero-btn ai-hero-btn--secondary" onClick={handleExploreClick}>
              <FiCompass aria-hidden="true" /> {t.exploreOpenOpportunities}
            </button>
          </div>
          <div className="ai-hero-trust">
            <span><FiCheckCircle aria-hidden="true" /> {t.verifiedSources}</span>
            <span><FiCheckCircle aria-hidden="true" /> {t.updatedDaily}</span>
            <span><FiCheckCircle aria-hidden="true" /> {t.free}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
