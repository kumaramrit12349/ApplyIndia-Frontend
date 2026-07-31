import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import ListView from "./ListView";
import type { HomePageNotification } from "../../../types/notification";
import { fetchNotificationsByCategory } from "../../../services/public/notiifcationApi";
import { getUserActivities } from "../../../services/private/userActivityApi";
import { fetchEligibleNotifications } from "../../../services/private/eligibilityApi";
import { PROFILE_FIELD_LABELS } from "../../../constant/SharedConstant";
import { useAuth } from "../../../context/AuthContext";
import SEO from "../../../components/SEO/SEO";
import { buildBreadcrumbSchema, SITE_URL } from "../../../seo/site";

const PAGE_SIZE = 20;

const currentYear = new Date().getFullYear();

/** Category-specific SEO copy for rich search-engine snippets */
const SEO_MAP: Record<string, { title: string; description: string }> = {
  "job": {
    title: `Government Jobs ${currentYear} — Latest Sarkari Naukri Notifications`,
    description: "Browse the latest central & state government job notifications. Check eligibility, vacancies, last date to apply, and apply online on Apply India.",
  },
  "entrance-exam": {
    title: `Entrance Exam Notifications ${currentYear} — JEE, NEET, CUET & More`,
    description: "Find upcoming entrance exam notifications, admit cards, results, and syllabi across India. Stay updated on JEE, NEET, CUET, and state-level exams.",
  },
  "admission": {
    title: `College & University Admission Notifications ${currentYear}`,
    description: "Latest college and university admission notifications across India. Check deadlines, eligibility, and apply online through Apply India.",
  },
  "scholarship": {
    title: `Scholarship Notifications ${currentYear} — Apply for Government Scholarships`,
    description: "Find central and state government scholarship opportunities for students across India. Check eligibility, last date to apply, and application process.",
  },
  "sarkari-yojana": {
    title: `Sarkari Yojana ${currentYear} — Government Schemes & Welfare Benefits`,
    description: "Discover the latest central and state government yojana and welfare schemes including PM Kisan, Ayushman Bharat, and more. Check eligibility and how to apply.",
  },
  "documents": {
    title: "Government Document Help — Aadhaar, PAN, Caste Certificate & More",
    description: "Step-by-step guidance on applying for important government documents like Aadhaar card, PAN card, caste certificate, domicile, and income certificate.",
  },
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const CategoryView: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const decodedCategory = decodeURIComponent(category ?? "");
  const query = useQuery();
  const searchValue = query.get("searchValue") ?? "";
  const { isAuthenticated, onShowAuthPopup } = useAuth();

  const [items, setItems] = useState<HomePageNotification[]>([]);
  const [lastKey, setLastKey] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // ✅ prevents race conditions
  const isFetchingRef = useRef(false);

  /* ================= ACTIVITY STATUS (fetched once, shared across all cards) ================= */
  const [activityMap, setActivityMap] = useState<Map<string, number> | undefined>(undefined);

  useEffect(() => {
    if (!isAuthenticated) {
      setActivityMap(undefined);
      return;
    }
    getUserActivities({ redirectOn401: false })
      .then((res) => {
        const map = new Map<string, number>();
        (res.data || []).forEach((activity) => map.set(activity.sk, activity.status));
        setActivityMap(map);
      })
      .catch(() => setActivityMap(undefined));
  }, [isAuthenticated]);

  /* ================= ELIGIBLE FILTER STATE ================= */
  const [mode, setMode] = useState<"all" | "eligible">("all");
  const [eligLoading, setEligLoading] = useState(false);
  const [eligItems, setEligItems] = useState<HomePageNotification[]>([]);
  const [eligIncompleteProfile, setEligIncompleteProfile] = useState(false);
  const [eligMissingFields, setEligMissingFields] = useState<string[]>([]);

  const loadEligible = async () => {
    setEligLoading(true);
    setEligIncompleteProfile(false);
    setEligMissingFields([]);
    try {
      const res = await fetchEligibleNotifications({ category: decodedCategory });
      if (res.incompleteProfile) {
        setEligIncompleteProfile(true);
        setEligMissingFields(res.missingProfileFields);
        setEligItems([]);
      } else {
        setEligItems(res.notifications || []);
      }
    } catch (error) {
      console.error("Failed to load eligible notifications", error);
      setEligItems([]);
    } finally {
      setEligLoading(false);
    }
  };

  const handleShowEligible = () => {
    if (!isAuthenticated) {
      onShowAuthPopup();
      return;
    }
    setMode("eligible");
    loadEligible();
  };

  /* ================= RESET ON CHANGE ================= */

  useEffect(() => {
    setItems([]);
    setLastKey(undefined);
    setHasMore(true);
    setLoading(true);
    isFetchingRef.current = false;
    setMode("all");
    loadMore(true);
    // eslint-disable-next-line
  }, [decodedCategory, searchValue]);

  /* ================= LOAD MORE ================= */

  const loadMore = async (isFirst = false) => {
    if (isFetchingRef.current) return;
    if (!hasMore && !isFirst) return;

    isFetchingRef.current = true;

    try {
      const res = await fetchNotificationsByCategory(
        decodedCategory,
        PAGE_SIZE,
        isFirst ? undefined : lastKey,
        searchValue
      );

      setItems(prev => {
        const newData = Array.isArray(res.data) ? res.data : [];
        return isFirst ? newData : [...prev, ...newData]
      });

      setLastKey(res.lastEvaluatedKey);
      setHasMore(Boolean(res.lastEvaluatedKey));
    } catch (error) {
      console.error("Failed to load notifications", error);
      setHasMore(false);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  /* ================= UI ================= */

  const formattedCategory = decodedCategory.replace(/-/g, " ");
  const categoryLabel =
    formattedCategory.replace(/\b\w/g, l => l.toUpperCase());
  const canonicalUrl = `${SITE_URL}/notification/category/${decodedCategory}`;
  const seoData = SEO_MAP[decodedCategory] || {
    title: `${categoryLabel} Notifications ${currentYear}`,
    description: `Find the latest ${formattedCategory} notifications across India. Check eligibility, last date, and apply online on Apply India.`,
  };

  return (
    <div className="container py-3 px-2 px-md-4">
      <SEO
        title={seoData.title}
        description={seoData.description}
        noindex={!!searchValue}
        canonical={canonicalUrl}
        keywords={[
          "apply india",
          "apply india online",
          `${formattedCategory} notifications`,
          `${formattedCategory} updates`,
          `${formattedCategory} apply online`,
        ]}
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${categoryLabel} Notifications`,
            url: canonicalUrl,
            description: seoData.description,
            isPartOf: {
              "@type": "WebSite",
              name: "Apply India",
              url: SITE_URL,
            },
          },
          buildBreadcrumbSchema([
            { name: "Home", url: `${SITE_URL}/` },
            { name: categoryLabel, url: canonicalUrl },
          ]),
        ]}
      />
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="text-center">
            <div className="ai-elig-toggle">
              <button
                type="button"
                className={`ai-elig-toggle-btn ${mode === "all" ? "active" : ""}`}
                onClick={() => setMode("all")}
              >
                All Notifications
              </button>
              <button
                type="button"
                className={`ai-elig-toggle-btn ${mode === "eligible" ? "active" : ""}`}
                onClick={handleShowEligible}
              >
                ✓ Eligible Notifications
              </button>
            </div>
          </div>

          {searchValue && mode === "all" && (
            <p className="text-center text-muted mb-3" style={{ fontSize: "0.92rem" }}>
              Showing results for <strong>"{searchValue}"</strong>
            </p>
          )}

          {mode === "eligible" ? (
            eligLoading ? (
              <div className="text-center py-5">
                <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
              </div>
            ) : eligIncompleteProfile ? (
              <div className="ai-elig-prompt">
                <div className="ai-elig-prompt-icon">⚠️</div>
                <div className="ai-elig-prompt-title">Complete Your Profile</div>
                <p className="ai-elig-prompt-text">
                  We need a bit more information to calculate your eligibility:
                </p>
                <ul className="ai-elig-prompt-fields">
                  {eligMissingFields.map((field) => (
                    <li key={field}>{PROFILE_FIELD_LABELS[field] || field}</li>
                  ))}
                </ul>
                <a href="/profile" className="ai-elig-prompt-cta">
                  Complete Profile
                </a>
              </div>
            ) : eligItems.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <b>No eligible notifications found based on your current profile.</b>
              </div>
            ) : (
              <ListView
                category={decodedCategory}
                items={eligItems}
                showSeeMore={false}
                showAllItems={true}
                activityMap={activityMap}
              />
            )
          ) : loading && items.length === 0 ? (
            <div className="text-center py-5">
              <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <b>No notifications available.</b>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={items.length}
              next={() => loadMore(false)}
              hasMore={hasMore}
              loader={
                <div className="text-center py-4">
                  <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
                </div>
              }
              endMessage={
                !hasMore && (
                  <p className="text-center text-muted py-4 mb-0">
                    <b>No more notifications.</b>
                  </p>
                )
              }
            >
              <ListView
                category={decodedCategory}
                items={items}
                showSeeMore={false}
                showAllItems={true}
                activityMap={activityMap}
              />
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
