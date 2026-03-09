import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NOTIFICATION_CATEGORIES, INDIAN_STATES } from "../../constant/SharedConstant";
import { fetchAvailableFilters } from "../../services/public/notiifcationApi";

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

  const categoryMatch = location.pathname.match(/\/notification\/category\/([^/]+)/i);
  const stateMatch = location.pathname.match(/\/notification\/state\/([^/]+)/i);

  let currentFilter = "all";
  if (categoryMatch) currentFilter = decodeURIComponent(categoryMatch[1]);
  if (stateMatch) currentFilter = decodeURIComponent(stateMatch[1]);

  const searchParams = new URLSearchParams(location.search);
  const urlSearchValue = searchParams.get("searchValue") || "";

  const [query, setQuery] = useState(urlSearchValue);
  const [filter, setFilter] = useState(currentFilter);
  const [availableStates, setAvailableStates] = useState<string[]>([]);

  useEffect(() => {
    setFilter(currentFilter);
    setQuery(urlSearchValue);
  }, [currentFilter, urlSearchValue]);

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

  const isStateFilter = (val: string) => INDIAN_STATES.some(s => s.value === val);

  const getNavigateRoute = (val: string) => {
    if (val === "all") return "/";
    if (isStateFilter(val)) return `/notification/state/${val}`;
    return `/notification/category/${val}`;
  };

  const handleSearch = () => {
    if (onSearch) onSearch(query, filter);
    const route = getNavigateRoute(filter);
    if (filter !== "all") {
      navigate(`${route}?searchValue=${encodeURIComponent(query)}`);
    } else {
      navigate(`/?searchValue=${encodeURIComponent(query)}`);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilter(val);
    setQuery("");
    navigate(getNavigateRoute(val));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value === "") {
      navigate(getNavigateRoute(filter));
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    navigate(getNavigateRoute(filter));
  };

  return (
    <div className="ai-search-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="ai-search-group">
              <select
                value={filter}
                onChange={handleFilterChange}
              >
                <optgroup label="Categories">
                  {NOTIFICATION_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </optgroup>
                {visibleStates.length > 0 && (
                  <optgroup label="States / Regions">
                    {visibleStates.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <input
                type="text"
                value={query}
                placeholder={placeholder}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {query && (
                <button
                  className="ai-search-clear"
                  type="button"
                  onClick={handleClearSearch}
                  tabIndex={-1}
                  aria-label="Clear search"
                >
                  &#x2715;
                </button>
              )}
              <button
                className="ai-search-btn"
                onClick={handleSearch}
                type="button"
                disabled={!query.trim()}
                style={{
                  opacity: !query.trim() ? 0.6 : 1,
                  cursor: !query.trim() ? 'not-allowed' : 'pointer'
                }}
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
