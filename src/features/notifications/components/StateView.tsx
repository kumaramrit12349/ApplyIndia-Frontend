import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import ListView from "./ListView";
import type { HomePageNotification } from "../../../types/notification";
import { fetchNotificationsByState } from "../../../services/public/notiifcationApi";
import { INDIAN_STATES } from "../../../constant/SharedConstant";
import SEO from "../../../components/SEO/SEO";

const PAGE_SIZE = 20;

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const StateView: React.FC = () => {
    const { state } = useParams<{ state: string }>();
    const decodedState = decodeURIComponent(state ?? "");
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
    }, [decodedState, searchValue]);

    /* ================= LOAD MORE ================= */

    const loadMore = async (isFirst = false) => {
        if (isFetchingRef.current) return;
        if (!hasMore && !isFirst) return;

        isFetchingRef.current = true;

        try {
            const res = await fetchNotificationsByState(
                decodedState,
                PAGE_SIZE,
                isFirst ? undefined : lastKey,
                searchValue
            );

            setItems(prev => {
                const newData = Array.isArray(res.data) ? res.data : [];
                return isFirst ? newData : [...prev, ...newData];
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
    const stateLabel = INDIAN_STATES.find(s => s.value === decodedState)?.label || decodedState;
    const currentYear = new Date().getFullYear();

    return (
        <div className="container py-3 px-2 px-md-4">
            <SEO 
                title={`${stateLabel} Government Jobs & Notifications ${currentYear}`} 
                description={`Find the latest government job notifications, entrance exams, results, and scholarships in ${stateLabel}. Apply online on Apply India.`}
                noindex={!!searchValue}
                canonical={`https://applyindia.online/notification/state/${decodedState}`}
            />
            <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-8">
                    {searchValue && (
                        <p className="text-center text-muted mb-3" style={{ fontSize: "0.92rem" }}>
                            Showing results for <strong>"{searchValue}"</strong>
                        </p>
                    )}

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
                                category={stateLabel} // Show state name in card header
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

export default StateView;
