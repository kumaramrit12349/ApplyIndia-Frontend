import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import ListView from "./ListView";
import type { HomePageNotification } from "../../../types/notification";
import { fetchNotificationsByCategory } from "../../../services/public/notiifcationApi";

const PAGE_SIZE = 100;

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const CategoryView: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const decodedCategory = decodeURIComponent(category ?? "");
  const query = useQuery();
  const searchValue = query.get("searchValue") ?? "";

  const [items, setItems] = useState<HomePageNotification[]>([]);
  const [lastKey, setLastKey] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // ✅ prevents race conditions
  const isFetchingRef = useRef(false);

  /* ================= RESET ON CHANGE ================= */

  useEffect(() => {
    setItems([]);
    setLastKey(undefined);
    setHasMore(true);
    setLoading(true);
    isFetchingRef.current = false;
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

      setItems(prev =>
        isFirst ? res.data : [...prev, ...res.data]
      );

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

  return (
    <div className="container py-3 px-2 px-md-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <h2 className="mb-3 text-center text-capitalize">
            {decodedCategory.replace(/-/g, " ")}
            {searchValue && (
              <span className="text-muted ms-2">
                (Search: "{searchValue}")
              </span>
            )}
          </h2>

          {loading && items.length === 0 ? (
            <div className="text-center py-5">
              <span className="spinner-border text-primary" />
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
                  <span className="spinner-border text-primary" />
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
              />
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
