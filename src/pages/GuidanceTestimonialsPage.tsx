import React, { useEffect, useState } from "react";
import { FiStar, FiMessageCircle } from "react-icons/fi";
import { fetchPublicTestimonials } from "../services/public/guidanceFeedbackApi";
import type { IPublicGuidanceFeedback } from "../interface/GuidanceInterface";
import { GUIDANCE_TOPIC_TAGS } from "../constant/GuidanceConstant";
import SEO from "../components/SEO/SEO";
import "./GuidanceTestimonialsPage.css";

const getTagLabel = (value: string) => GUIDANCE_TOPIC_TAGS.find((t) => t.value === value)?.label || value;

const GuidanceTestimonialsPage: React.FC = () => {
  const [items, setItems] = useState<IPublicGuidanceFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicTestimonials()
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5">
      <SEO
        title="Success Stories — Apply India Guidance"
        description="Real feedback from users who got free online application guidance from Apply India."
      />
      <div className="text-center mb-5">
        <div className="gtp-icon">
          <FiMessageCircle />
        </div>
        <h1 className="gtp-title">What Users Say</h1>
        <p className="text-muted">
          Genuine feedback from users who booked a free guidance session while applying.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center text-muted py-5">
          No testimonials published yet — check back soon!
        </div>
      ) : (
        <div className="row g-4">
          {items.map((item) => (
            <div key={item.sk} className="col-12 col-md-6 col-lg-4">
              <div className={`gtp-card ${item.featured ? "gtp-card--featured" : ""}`}>
                <div className="gtp-stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <FiStar key={n} size={16} color={n <= item.rating ? "#f59e0b" : "#d1d5db"} fill={n <= item.rating ? "#f59e0b" : "none"} />
                  ))}
                </div>
                {item.message && <p className="gtp-message">"{item.message}"</p>}
                {item.topic_tags?.length > 0 && (
                  <div className="gtp-tags">
                    {item.topic_tags.map((tag) => (
                      <span key={tag} className="gtp-tag">{getTagLabel(tag)}</span>
                    ))}
                  </div>
                )}
                <div className="gtp-author">— {item.display_name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuidanceTestimonialsPage;
