import React, { useState, useEffect, useRef, useCallback } from "react";
import { getAdminFeedback } from "../../services/private/feedbackApi";
import { toast } from "react-toastify";

interface IAdminFeedback {
    pk: string;
    sk: string;
    name: string;
    email: string;
    message: string;
    created_at?: number;
}
interface AdminFeedbackPageProps {
    isAuthenticated?: boolean;
    givenName?: string;
    familyName?: string;
    email?: string;
    isAdmin?: boolean;
    adminRole?: string;
    onLogout?: () => void;
    onShowAuthPopup?: () => void;
}

const AdminFeedbackPage: React.FC<AdminFeedbackPageProps> = () => {

    const [feedback, setFeedback] = useState<IAdminFeedback[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState<any>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [fetchingMore, setFetchingMore] = useState<boolean>(false);
    const observer = useRef<IntersectionObserver | null>(null);

    // Filters
    const [timeRange, setTimeRange] = useState<string>("all");

    const fetchInitialFeedback = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getAdminFeedback(30, undefined, timeRange);
            if (res.success) {
                setFeedback(res.data.results || []);
                setLastEvaluatedKey(res.data.lastEvaluatedKey);
                setHasMore(!!res.data.lastEvaluatedKey);
            } else {
                setError(res.error || "Failed to fetch feedback.");
                toast.error("Failed to fetch feedback.");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred.");
            toast.error("Error loading feedback.");
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        if (fetchingMore || !hasMore || !lastEvaluatedKey) return;
        try {
            setFetchingMore(true);
            const res = await getAdminFeedback(30, lastEvaluatedKey, timeRange);
            if (res.success) {
                setFeedback((prev) => [...prev, ...(res.data.results || [])]);
                setLastEvaluatedKey(res.data.lastEvaluatedKey);
                setHasMore(!!res.data.lastEvaluatedKey);
            }
        } catch (err) {
            toast.error("Error fetching more feedback.");
        } finally {
            setFetchingMore(false);
        }
    };

    // Intersection observer for infinite scroll
    const lastElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (loading || fetchingMore) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    loadMore();
                }
            });
            if (node) observer.current.observe(node);
        },
        [loading, fetchingMore, hasMore, loadMore]
    );

    useEffect(() => {
        fetchInitialFeedback();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRange]);

    const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeRange(e.target.value);
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "Unknown Date";
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="min-vh-100 bg-light">
            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <h2 className="mb-0 fw-bold">User Feedback</h2>
                    <div className="d-flex align-items-center">
                        <label htmlFor="timeFilter" className="me-2 fw-medium mb-0">
                            Filter:
                        </label>
                        <select
                            id="timeFilter"
                            className="form-select w-auto shadow-sm"
                            value={timeRange}
                            onChange={handleTimeRangeChange}
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="last_week">Last Week</option>
                            <option value="last_month">Last Month</option>
                            <option value="last_3_months">Last 3 Months</option>
                            <option value="last_6_months">Last 6 Months</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : feedback.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded shadow-sm">
                        <h5 className="text-muted">No feedback found for the selected time range.</h5>
                    </div>
                ) : (
                    <div className="row g-3">
                        {feedback.map((item, index) => {
                            const isLastElement = feedback.length === index + 1;
                            return (
                                <div
                                    className="col-12"
                                    key={item.sk}
                                    ref={isLastElement ? lastElementRef : null}
                                >
                                    <div className="card shadow-sm border-0 h-100">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h5 className="card-title fw-semibold mb-1">{item.name}</h5>
                                                    <h6 className="card-subtitle mb-2 text-muted">
                                                        <a href={`mailto:${item.email}`} className="text-decoration-none">
                                                            {item.email}
                                                        </a>
                                                    </h6>
                                                </div>
                                                <span className="badge bg-secondary">
                                                    {formatDate(item.created_at)}
                                                </span>
                                            </div>
                                            <p className="card-text border-top pt-3 mt-3 text-secondary" style={{ whiteSpace: "pre-wrap" }}>
                                                {item.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {fetchingMore && (
                    <div className="d-flex justify-content-center mt-4">
                        <div className="spinner-border text-primary spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading more...</span>
                        </div>
                    </div>
                )}

                {!hasMore && feedback.length > 0 && !loading && (
                    <div className="text-center mt-4 text-muted small">
                        You have reached the end of the feedback list.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFeedbackPage;
