import React, { useEffect, useState } from "react";
import { FiBell, FiFileText } from "react-icons/fi";
import { fetchLatestNotifications } from "../../services/public/notiifcationApi";
import { makeSlug } from "../../utils/utils";
import type { HomePageNotification } from "../../types/notification";
import "./JobBanner.css";

const JobBanner: React.FC = () => {
    const [latestItems, setLatestItems] = useState<HomePageNotification[]>([]);
    const [loading, setLoading] = useState(true);
    // No manual pause control, but still auto-pause for users with the
    // OS-level "reduce motion" preference on — that one doesn't need a
    // visible button since it's derived from a setting they already made.
    const [reduceMotion] = useState(
        () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );

    useEffect(() => {
        fetchLatestNotifications()
            .then((res) => {
                if (res.data && Array.isArray(res.data)) {
                    setLatestItems(res.data);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch latest notifications", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return null;
    }

    if (latestItems.length === 0) {
        return (
            <div className="job-banner-container job-banner-empty">
                <div className="job-banner-label">
                    <span className="job-banner-live-dot" aria-hidden="true" />
                    <FiBell aria-hidden="true" /> Latest Updates
                </div>
                <div className="job-banner-empty-message">No active application notifications available. New government opportunities will appear here soon.</div>
            </div>
        );
    }

    // Duplicate items multiple times to ensure they stretch across wide screens,
    // especially when there are only 1 or 2 items in the database.
    // Repetition factor
    const repeats = 15;
    const repeated = Array(repeats).fill(latestItems).flat();
    const seamlessItems = [...repeated, ...repeated];

    // Calculate a dynamic speed based on number of uniquely displayed items:
    // Approximately 6.0 seconds per single item width.
    const dynamicDuration = `${repeats * latestItems.length * 6.0}s`;

    return (
        <div className="job-banner-container">
            <div className="job-banner-label">
                <span className="job-banner-live-dot" aria-hidden="true" />
                <FiBell aria-hidden="true" /> Latest Updates
            </div>
            {/* The scrolling content below repeats each notification ~30x purely so
                the marquee loops seamlessly — it's a visual effect, not real content.
                The same notifications already exist as real, non-duplicated links in
                the page's main notification list, so this decorative copy is hidden
                from assistive tech (aria-hidden) and removed from the tab order
                (tabIndex={-1} on every link) rather than forcing keyboard/screen-reader
                users through dozens of duplicate links. */}
            <div className="job-banner-marquee" aria-hidden="true">
                <div
                    className="job-banner-content"
                    style={{
                        animationDuration: dynamicDuration,
                        // Only force "paused" inline (an inline style always wins over the
                        // stylesheet's hover-to-pause rule); leaving it unset otherwise lets
                        // that CSS hover convenience still work for mouse users.
                        animationPlayState: reduceMotion ? "paused" : undefined,
                    }}
                >
                    {seamlessItems.map((item, index) => (
                        <a
                            key={(item.sk || index) + "-" + index}
                            href={`/notification/${makeSlug(item.title, item.sk)}`}
                            className={`job-banner-item job-banner-item--c${index % 4}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={-1}
                        >
                            <FiFileText className="job-banner-item-icon" aria-hidden="true" />
                            <span className="job-banner-item-text">
                                <span className="job-banner-item-title">{item.title}</span>
                                {item.last_date_to_apply && (
                                    <span className="job-banner-deadline">
                                        Last Date: {(() => {
                                            const d = new Date(item.last_date_to_apply as string);
                                            return isNaN(d.getTime()) ? item.last_date_to_apply : d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
                                        })()}
                                    </span>
                                )}
                            </span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JobBanner;
