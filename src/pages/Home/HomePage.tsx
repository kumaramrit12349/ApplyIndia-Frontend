import React, { useEffect, useRef, useState } from "react";
import ListView from "../../features/notifications/components/ListView";
import { useLocation } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import type { HomePageNotification } from "../../types/notification";
import { fetchHomePageNotifications, fetchNotificationsByCategory } from "../../services/public/notiifcationApi";

interface GroupedNotifications {
  [category: string]: HomePageNotification[];
}

const PAGE_SIZE = 100;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const HomePage: React.FC = () => {
  const query = useQuery();
  const searchValue = query.get("searchValue") ?? "";

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

    fetchHomePageNotifications()
      .then(res => setGrouped(res.data))
      .catch(err => {
        console.error("Failed to fetch homepage notifications", err);
        setGrouped({});
      })
      .finally(() => setGroupedLoading(false));
  }, [searchValue]);

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
                <span className="spinner-border text-primary" />
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
                    <span className="spinner-border text-primary" />
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
                />
              </InfiniteScroll>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ================= DEFAULT GROUPED UI ================= */

  return (
    <div className="page">
      <div className="container py-4">
        <div className="row g-4">
          {groupedLoading ? (
            <div className="text-center m-auto py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            Object.entries(grouped).map(([category, notifications]) => (
              <div key={category} className="col-12 col-md-6 col-lg-4">
                <div className="h-100 shadow-sm">
                  <ListView
                    category={category}
                    items={notifications}
                    loading={groupedLoading}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;