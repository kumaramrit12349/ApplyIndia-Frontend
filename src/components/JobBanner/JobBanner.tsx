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

    // To create a seamless loop, we duplicate the items array.
    // The CSS animation will translate the container by -50% (exactly half its width, 
    // which is exactly one set of items) and then instantly jump back to 0.
    const seamlessItems = [...latestItems, ...latestItems];

    return (
        <div className="job-banner-container">
            <div className="job-banner-label">Latest Updates</div>
            <div className="job-banner-marquee">
                <div className="job-banner-content">
                    {seamlessItems.map((item, index) => (
                        <React.Fragment key={(item.sk || index) + "-" + index}>
                            <a
                                href={`/notification/${makeSlug(item.title, item.sk)}`}
                                className="job-banner-item"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {item.title}
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
