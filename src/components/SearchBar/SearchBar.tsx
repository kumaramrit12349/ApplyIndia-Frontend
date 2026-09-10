import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { FiChevronDown } from "react-icons/fi";
import { NOTIFICATION_CATEGORIES, INDIAN_STATES } from "../../constant/SharedConstant";

interface SearchBarProps {
  onSearch?: (query: string, filter: string) => void;
  placeholder?: string;
  availableStates: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search notifications...",
  availableStates,
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

  useEffect(() => {
    setFilter(currentFilter);
    setQuery(urlSearchValue);
  }, [currentFilter, urlSearchValue]);

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
    // Guard here (not just the Search button's `disabled`) since the Enter-key
    // path in the input's onKeyDown calls handleSearch() directly — a
    // whitespace-only query used to slip through and silently return the
    // entire unfiltered list under a "search results" heading.
    if (!query.trim()) return;
    if (onSearch) onSearch(query, filter);
    const route = getNavigateRoute(filter);
    if (filter !== "all") {
      navigate(`${route}?searchValue=${encodeURIComponent(query)}`);
    } else {
      navigate(`/?searchValue=${encodeURIComponent(query)}`);
    }
  };

  const handleFilterSelect = (val: string | null) => {
    if (!val) return;
    setFilter(val);
    setQuery("");
    navigate(getNavigateRoute(val));
  };

  const currentFilterLabel =
    NOTIFICATION_CATEGORIES.find((c) => c.value === filter)?.label ??
    visibleStates.find((s) => s.value === filter)?.label ??
    "Home";

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
              <Dropdown onSelect={handleFilterSelect}>
                <Dropdown.Toggle as="button" type="button" className="ai-search-select-btn">
                  {currentFilterLabel} <FiChevronDown className="ai-search-select-caret" aria-hidden="true" />
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ maxHeight: 320, overflowY: "auto" }}>
                  <Dropdown.Header>Categories</Dropdown.Header>
                  {NOTIFICATION_CATEGORIES.map((c) => (
                    <Dropdown.Item key={c.value} eventKey={c.value} active={filter === c.value}>
                      {c.label}
                    </Dropdown.Item>
                  ))}
                  {visibleStates.length > 0 && (
                    <>
                      <Dropdown.Header>States / Regions</Dropdown.Header>
                      {visibleStates.map((s) => (
                        <Dropdown.Item key={s.value} eventKey={s.value} active={filter === s.value}>
                          {s.label}
                        </Dropdown.Item>
                      ))}
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
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
