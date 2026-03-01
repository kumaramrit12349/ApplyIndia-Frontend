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

  // Note: we purposely do NOT include ?searchValue= here, to ensure search is cleared on category navigation
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
    <nav
      className="bg-light"
      style={{
        position: "sticky",
        top: "56px",
        zIndex: 1040,
        borderBottom: "1px solid #dee2e6",
      }}
    >
      <div className="container">
        {/* Categories Row */}
        <div className="overflow-auto border-bottom mb-1 pb-1">
          <ul className="nav nav-pills py-2 flex-nowrap m-0" style={{ gap: '0.5rem' }}>
            {NOTIFICATION_CATEGORIES.map((item) => (
              <li className="nav-item" key={`cat-${item.value}`}>
                <Link
                  to={getCategoryNavLink(item)}
                  className={`nav-link text-nowrap px-3 py-1 ${isCategoryActive(item)
                    ? "active bg-primary text-white"
                    : "text-dark bg-white border"
                    }`}
                  style={{ borderRadius: "20px", fontSize: "0.9rem", fontWeight: 500 }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* States Row - Wrapping, no scroll */}
        {visibleStates.length > 0 && (
          <div className="pb-2 pt-1">
            <ul className="nav nav-pills d-flex flex-wrap m-0 gap-2">
              {visibleStates.map((item) => (
                <li className="nav-item" key={`state-${item.value}`}>
                  <Link
                    to={getStateNavLink(item)}
                    className={`nav-link px-3 py-1 ${isStateActive(item)
                      ? "active bg-secondary text-white"
                      : "text-muted bg-white border"
                      }`}
                    style={{ borderRadius: "20px", fontSize: "0.85rem" }}
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
