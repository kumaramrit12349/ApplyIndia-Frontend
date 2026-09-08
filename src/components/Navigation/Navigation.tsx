import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBriefcase,
  FiEdit3,
  FiBookOpen,
  FiAward,
  FiFlag,
  FiFileText,
  FiMapPin,
} from "react-icons/fi";
import { NOTIFICATION_CATEGORIES, INDIAN_STATES } from "../../constant/SharedConstant";

interface NavigationProps {
  availableStates: string[];
}

// SVG icons (not emoji) so rendering is consistent across every OS/browser —
// emoji glyphs like 🏠 can render with their own baked-in background color
// depending on the platform's emoji font, which looked like a rendering bug.
const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  all: FiHome,
  job: FiBriefcase,
  "entrance-exam": FiEdit3,
  admission: FiBookOpen,
  scholarship: FiAward,
  "sarkari-yojana": FiFlag,
  documents: FiFileText,
};

const Navigation: React.FC<NavigationProps> = ({ availableStates }) => {
  const location = useLocation();
  const categoryMatch = location.pathname.match(/\/notification\/category\/([^/]+)/i);
  const activeCategory = categoryMatch ? decodeURIComponent(categoryMatch[1]) : "all";

  const stateMatch = location.pathname.match(/\/notification\/state\/([^/]+)/i);
  const activeState = stateMatch ? decodeURIComponent(stateMatch[1]) : null;

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
        <div className="ai-nav-row">
          <span className="ai-nav-row-label">Category</span>
          <div className="ai-nav-scroll">
            <ul className="ai-pill-list">
              {NOTIFICATION_CATEGORIES.map((item) => {
                const Icon = CATEGORY_ICONS[item.value] ?? FiFileText;
                return (
                  <li key={`cat-${item.value}`}>
                    <Link
                      to={getCategoryNavLink(item)}
                      className={`ai-pill ${isCategoryActive(item) ? "active" : ""}`}
                    >
                      <Icon size={14} /> {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* States Row */}
        {visibleStates.length > 0 && (
          <div className="ai-nav-row border-top">
            <span className="ai-nav-row-label">By State</span>
            <ul className="ai-pill-list" style={{ flexWrap: "wrap" }}>
              {visibleStates.map((item) => (
                <li key={`state-${item.value}`}>
                  <Link
                    to={getStateNavLink(item)}
                    className={`ai-pill state-pill ${isStateActive(item) ? "active" : ""}`}
                  >
                    <FiMapPin size={12} /> {item.label}
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
