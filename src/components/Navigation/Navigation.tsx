import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NOTIFICATION_CATEGORIES } from "../../constant/SharedConstant";

const Navigation: React.FC = () => {
  const location = useLocation();
  const match = location.pathname.match(/\/notification\/category\/([^/]+)/i);
  const activeCategory = match ? decodeURIComponent(match[1]) : "all";

  // Note: we purposely do NOT include ?searchValue= here, to ensure search is cleared on category navigation
  const getNavLink = (item: (typeof NOTIFICATION_CATEGORIES)[number]) =>
    item.value === "all" ? "/" : `/notification/category/${item.value}`;

  const isActive = (item: (typeof NOTIFICATION_CATEGORIES)[number]) => {
    if (item.value === "all" && location.pathname === "/") return true;
    if (activeCategory && item.value !== "all" && activeCategory === item.value)
      return true;
    return false;
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
        <div className="overflow-auto">
          <ul className="nav nav-pills py-2 flex-nowrap m-0">
            {NOTIFICATION_CATEGORIES.map((item) => (
              <li className="nav-item" key={item.value}>
                <Link
                  to={getNavLink(item)}
                  className={`nav-link text-nowrap ${isActive(item)
                      ? "active bg-primary text-white"
                      : "text-dark"
                    }`}
                  style={{ borderRadius: "8px", fontWeight: 500 }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
