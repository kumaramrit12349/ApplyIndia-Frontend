import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { NOTIFICATION_CATEGORIES, INDIAN_STATES } from "../../constant/SharedConstant";
import { fetchAvailableFilters } from "../../services/public/notiifcationApi";

const Navigation: React.FC = () => {
  const location = useLocation();
  const categoryMatch = location.pathname.match(/\/notification\/category\/([^/]+)/i);
  const activeCategory = categoryMatch ? decodeURIComponent(categoryMatch[1]) : "all";

  const stateMatch = location.pathname.match(/\/notification\/state\/([^/]+)/i);
  const activeState = stateMatch ? decodeURIComponent(stateMatch[1]) : null;

  const [availableStates, setAvailableStates] = useState<string[]>([]);

  useEffect(() => {
    fetchAvailableFilters()
      .then((res: any) => {
        if (res.states) {
          setAvailableStates(res.states.map((s: string) => s.toLowerCase()));
        }
      })
      .catch((err) => console.error("Failed to load available filters", err));
  }, []);

  const visibleStates = INDIAN_STATES.filter(state =>
    availableStates.includes(state.value.toLowerCase())
  );

  const getCategoryNavLink = (item: (typeof NOTIFICATION_CATEGORIES)[number]) =>
    item.value === "all" ? "/" : `/notification/category/${item.value}`;

  const getStateNavLink = (item: (typeof INDIAN_STATES)[number]) =>
    `/notification/state/${item.value}`;

  const isCategoryActive = (item: (typeof NOTIFICATION_CATEGORIES)[number]) => {
    if (item.value === "all" && location.pathname === "/") return true;
    if (activeCategory && !activeState && item.value !== "all" && activeCategory === item.value)
      return true;
    return false;
  };

  const isStateActive = (item: (typeof INDIAN_STATES)[number]) => {
    return activeState === item.value;
  };

  return (
    <nav className="ai-navigation">
      <div className="container">
        {/* Categories Row */}
        <div className="ai-nav-scroll border-bottom">
          <ul className="ai-pill-list">
            {NOTIFICATION_CATEGORIES.map((item) => (
              <li key={`cat-${item.value}`}>
                <Link
                  to={getCategoryNavLink(item)}
                  className={`ai-pill ${isCategoryActive(item) ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* States Row */}
        {visibleStates.length > 0 && (
          <div className="pb-1 pt-1">
            <ul className="ai-pill-list" style={{ flexWrap: "wrap" }}>
              {visibleStates.map((item) => (
                <li key={`state-${item.value}`}>
                  <Link
                    to={getStateNavLink(item)}
                    className={`ai-pill state-pill ${isStateActive(item) ? "active" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
