import React, { useEffect, useState } from "react";
import { fetchLatestNotifications } from "../../services/public/notiifcationApi";
import { makeSlug } from "../../utils/utils";
import type { HomePageNotification } from "../../types/notification";
import "./JobBanner.css";

const JobBanner: React.FC = () => {
    const [latestItems, setLatestItems] = useState<HomePageNotification[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading || latestItems.length === 0) {
        return null;
    }

    // Duplicate items multiple times to ensure they stretch across wide screens,
    // especially when there are only 1 or 2 items in the database.
    // Repetition factor
    const repeats = 15;
    const repeated = Array(repeats).fill(latestItems).flat();
    const seamlessItems = [...repeated, ...repeated];

    // Calculate a dynamic speed based on number of uniquely displayed items:
    // Approximately 3.5 seconds per single item width.
    const dynamicDuration = `${repeats * latestItems.length * 3.5}s`;

    return (
        <div className="job-banner-container">
            <div className="job-banner-label">Latest Updates</div>
            <div className="job-banner-marquee">
                <div className="job-banner-content" style={{ animationDuration: dynamicDuration }}>
                    {seamlessItems.map((item, index) => (
                        <React.Fragment key={(item.sk || index) + "-" + index}>
                            <a
                                href={`/notification/${makeSlug(item.title, item.sk)}`}
                                className="job-banner-item"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {item.title}
                                {item.last_date_to_apply && (
                                    <span style={{ color: "#facc15", marginTop: "2px", fontWeight: "600", fontSize: "0.8rem", letterSpacing: "0.2px" }}>
                                        Last Date: {(() => {
                                            const d = new Date(item.last_date_to_apply as string);
                                            return isNaN(d.getTime()) ? item.last_date_to_apply : d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
                                        })()}
                                    </span>
                                )}
                            </a>
                            <span className="job-banner-separator">•</span>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default JobBanner;
