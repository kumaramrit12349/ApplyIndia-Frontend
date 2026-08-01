import React, { useEffect, useRef, useState } from "react";
import ListView from "../../features/notifications/components/ListView";
import { useLocation } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import type { HomePageNotification } from "../../types/notification";
import { fetchHomePageNotifications, fetchNotificationsByCategory } from "../../services/public/notiifcationApi";
import { getUserActivities } from "../../services/private/userActivityApi";
import { useAuth } from "../../context/AuthContext";
import SEO from "../../components/SEO/SEO";
import WhyChoose from "../../components/WhyChoose/WhyChoose";
import FAQ from "../../components/FAQ/FAQ";
import {
  buildBreadcrumbSchema,
  ORGANIZATION_SCHEMA,
  SITE_DESCRIPTION,
  SITE_URL,
  WEBSITE_SCHEMA,
} from "../../seo/site";
import { INDIAN_STATES } from "../../constant/SharedConstant";

interface GroupedNotifications {
  [category: string]: HomePageNotification[];
}

interface HomePageProps {
  userState?: string;
}

const PAGE_SIZE = 100;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const HomePage: React.FC<HomePageProps> = ({ userState }) => {
  const query = useQuery();
  const searchValue = query.get("searchValue") ?? "";
  const { isAuthenticated } = useAuth();

  /* ================= STATE PERSONALIZATION ================= */
  const hasState = !!userState && userState.toUpperCase() !== "CT";
  const [stateView, setStateView] = useState<"personalized" | "all">("personalized");
  // Effective filter sent to the API: "all" disables filtering; a state code
  // scopes to Central + that state; undefined falls back to Central only.
  const effectiveStateFilter = stateView === "all" ? "all" : userState;

  /* ================= ACTIVITY STATUS (fetched once, shared across all sections) ================= */
  // Avoids each ListView section re-checking wishlist status per card — a
  // notification can appear in several sections at once (e.g. its primary
  // category plus "Admit Card"/"Result" virtual categories).
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

  /* ================= SEARCH MODE ================= */

  const [searchResults, setSearchResults] = useState<HomePageNotification[]>([]);
  const [searchLastKey, setSearchLastKey] =
    useState<string | undefined>(undefined);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // ✅ prevents duplicate calls
  const isFetchingSearchRef = useRef(false);

  /* ================= GROUPED MODE ================= */

  const [grouped, setGrouped] = useState<GroupedNotifications>({});
  const [groupedLoading, setGroupedLoading] = useState(false);

  /* ================= GROUPED HOME ================= */

  useEffect(() => {
    if (searchValue) return;

    setGroupedLoading(true);

    fetchHomePageNotifications(effectiveStateFilter)
      .then(res => setGrouped(res.data))
      .catch(err => {
        console.error("Failed to fetch homepage notifications", err);
        setGrouped({});
      })
      .finally(() => setGroupedLoading(false));
  }, [searchValue, effectiveStateFilter]);

  /* ================= RESET SEARCH ================= */

  useEffect(() => {
    if (!searchValue) return;

    setSearchResults([]);
    setSearchLastKey(undefined);
    setSearchHasMore(true);
    setSearchLoading(true);
    isFetchingSearchRef.current = false;

    loadMoreSearch(true);
    // eslint-disable-next-line
  }, [searchValue]);

  /* ================= SEARCH PAGINATION ================= */

  const loadMoreSearch = async (isFirst = false) => {
    if (isFetchingSearchRef.current) return;
    if (!searchHasMore && !isFirst) return;

    isFetchingSearchRef.current = true;

    try {
      const res = await fetchNotificationsByCategory(
        "all",
        PAGE_SIZE,
        isFirst ? undefined : searchLastKey,
        searchValue
      );

      setSearchResults(prev =>
        isFirst ? res.data : [...prev, ...res.data]
      );

      setSearchLastKey(res.lastEvaluatedKey);
      setSearchHasMore(Boolean(res.lastEvaluatedKey));
    } catch (error) {
      console.error("Search pagination failed", error);
      setSearchHasMore(false);
    } finally {
      setSearchLoading(false);
      isFetchingSearchRef.current = false;
    }
  };

  /* ================= SEARCH UI ================= */

  if (searchValue) {
    return (
      <div className="container py-3 px-2 px-md-4">
        <SEO 
          title={`Search results for "${searchValue}" — Government Jobs & Notifications`} 
          description={`Find government job notifications and results related to "${searchValue}" across India.`} 
          noindex={true}
        />
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <h2 className="mb-3 text-center">
              Search Results
              <span className="text-muted ms-2">
                (Search: "{searchValue}")
              </span>
            </h2>

            {searchLoading && searchResults.length === 0 ? (
              <div className="text-center py-5">
                <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <b>No matching notifications.</b>
              </div>
            ) : (
              <InfiniteScroll
                dataLength={searchResults.length}
                next={() => loadMoreSearch(false)}
                hasMore={searchHasMore}
                loader={
                  <div className="text-center py-4">
                    <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
                  </div>
                }
                endMessage={
                  !searchHasMore && (
                    <p className="text-center text-muted py-4 mb-0">
                      <b>No more results.</b>
                    </p>
                  )
                }
              >
                <ListView
                  category="Search Results"
                  items={searchResults}
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
  }

  /* ================= DEFAULT GROUPED UI ================= */

  const currentYear = new Date().getFullYear();
  const stateLabel = hasState
    ? INDIAN_STATES.find((s) => s.value === userState!.toUpperCase())?.label || userState
    : undefined;

  return (
    <div className="page">
      <SEO 
        title={`Apply India Online - Government Jobs, Sarkari Naukri & Exam Results ${currentYear}`}
        description={SITE_DESCRIPTION}
        canonical={`${SITE_URL}/`}
        keywords={[
          "apply india",
          "apply india online",
          "government jobs india",
          "sarkari naukri",
          "sarkari result",
          "government job notifications",
          "admit card",
          "scholarship india",
        ]}
        schema={[
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `Apply India Online - Government Jobs, Sarkari Naukri & Exam Results ${currentYear}`,
            url: `${SITE_URL}/`,
            description: SITE_DESCRIPTION,
            isPartOf: {
              "@type": "WebSite",
              name: "Apply India",
              url: SITE_URL,
            },
            breadcrumb: {
              "@id": `${SITE_URL}/#breadcrumb`,
            },
          },
          {
            ...buildBreadcrumbSchema([
              { name: "Home", url: `${SITE_URL}/` },
            ]),
            "@id": `${SITE_URL}/#breadcrumb`,
          },
        ]}
      />
      <div className="container pt-4">
        <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mb-3">
          <div className="ai-elig-toggle">
            <button
              type="button"
              className={`ai-elig-toggle-btn ${stateView === "personalized" ? "active" : ""}`}
              onClick={() => setStateView("personalized")}
            >
              📍 {hasState ? `${stateLabel} + Central` : "Central Only"}
            </button>
            <button
              type="button"
              className={`ai-elig-toggle-btn ${stateView === "all" ? "active" : ""}`}
              onClick={() => setStateView("all")}
            >
              🌐 All States
            </button>
          </div>
        </div>

        {stateView === "personalized" && !hasState && (
          <div className="ai-state-banner">
            {isAuthenticated ? (
              <>
                <span>📍 Set your state to see notifications relevant to you, alongside Central Government notifications.</span>
                <a href="/profile" className="ai-state-banner-cta">Set Your State</a>
              </>
            ) : (
              <>
                <span>📍 Sign in and set your state to personalize your feed with notifications relevant to you.</span>
                <button
                  type="button"
                  className="ai-state-banner-cta ai-state-banner-cta--btn"
                  onClick={() => window.dispatchEvent(new Event("openAuthPopup"))}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div className="container py-4">
        <div className="row g-4">
          {groupedLoading ? (
            <div className="text-center m-auto py-5">
              <div className="spinner-border" style={{ color: "var(--color-primary)" }} />
            </div>
          ) : (
            (() => {
              const categoryOrder = [
                "job",
                "admit-card",
                "result",
                "entrance-exam",
                "answer-key",
                "syllabus",
                "admission",
                "scholarship",
                "sarkari-yojana",
                "documents",
              ];

              return Object.entries(grouped)
                .sort((a, b) => {
                  const idxA = categoryOrder.indexOf(a[0].toLowerCase());
                  const idxB = categoryOrder.indexOf(b[0].toLowerCase());
                  const sortA = idxA === -1 ? 999 : idxA;
                  const sortB = idxB === -1 ? 999 : idxB;
                  return sortA - sortB;
                })
                .map(([category, notifications]) => (
                  <div key={category} className="col-12 col-md-6 col-lg-4">
                    <div className="h-100">
                      <ListView
                        category={category}
                        items={notifications}
                        loading={groupedLoading}
                        activityMap={activityMap}
                      />
                    </div>
                  </div>
                ));
            })()
          )}
        </div>
      </div>
      <WhyChoose />
      <FAQ />
    </div>
  );
};

export default HomePage;
