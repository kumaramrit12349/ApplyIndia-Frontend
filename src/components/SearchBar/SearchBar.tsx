import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NOTIFICATION_CATEGORIES } from "../../constant/SharedConstant";

interface SearchBarProps {
  onSearch?: (query: string, filter: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search notifications...",
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const match = location.pathname.match(/\/notification\/category\/([^/]+)/i);
  const urlCategory = match ? decodeURIComponent(match[1]) : "all";

  const searchParams = new URLSearchParams(location.search);
  const urlSearchValue = searchParams.get("searchValue") || "";

  const [query, setQuery] = useState(urlSearchValue);
  const [filter, setFilter] = useState(urlCategory);

  // Sync state with URL changes (e.g. Navigation clicks, forward/back, reload)
  useEffect(() => {
    setFilter(urlCategory);
    setQuery(urlSearchValue);
  }, [urlCategory, urlSearchValue]);

  const handleSearch = () => {
    if (onSearch) onSearch(query, filter);
    // Route should update, including search query in state
    if (filter !== "all") {
      navigate(
        `/notification/category/${filter}?searchValue=${encodeURIComponent(
          query
        )}`
      );
    } else {
      navigate(`/?searchValue=${encodeURIComponent(query)}`);
    }
  };
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilter(val);
    setQuery(""); // <- This resets the search input immediately on dropdown change
    // Also navigate to category WITHOUT old search param:
    if (val !== "all") {
      navigate(`/notification/category/${val}`);
    } else {
      navigate("/");
    }
  };

  // Handle input change: if cleared, remove searchValue from URL immediately
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value === "") {
      if (filter !== "all") {
        navigate(`/notification/category/${filter}`);
      } else {
        navigate(`/`);
      }
    }
  };

  // Handle (X) button clear
  const handleClearSearch = () => {
    setQuery("");
    if (filter !== "all") {
      navigate(`/notification/category/${filter}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <div className="bg-light py-3 border-bottom">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="input-group shadow-sm">
              <select
                className="form-select"
                style={{ maxWidth: "180px" }}
                value={filter}
                onChange={handleFilterChange}
              >
                {NOTIFICATION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="form-control"
                value={query}
                placeholder={placeholder}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {query && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleClearSearch}
                  tabIndex={-1}
                  style={{ zIndex: 2 }}
                  aria-label="Clear search"
                >
                  &#x2715;
                </button>
              )}
              <button
                className="btn btn-primary px-4"
                onClick={handleSearch}
                type="button"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
