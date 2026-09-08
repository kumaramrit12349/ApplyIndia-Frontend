import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import { Dropdown, Form } from "react-bootstrap";
import { fetchOpenNotifications } from "../../../services/private/openNotificationsApi";
import type { OpenNotificationItem } from "../../../services/private/openNotificationsApi";
import { fetchAvailableFilters } from "../../../services/public/notiifcationApi";
import { NOTIFICATION_CATEGORIES, INDIAN_STATES } from "../../../constant/SharedConstant";
import { makeSlug } from "../../../utils/utils";
import "./OpenNotificationsBrowser.css";

const PAGE_SIZE = 12;

const getStateLabel = (code: string) => {
  const match = INDIAN_STATES.find((s) => s.value.toLowerCase() === code.toLowerCase());
  return match ? match.label : code.replace(/-/g, " ");
};

const getCategoryLabel = (value: string) => {
  const match = NOTIFICATION_CATEGORIES.find((c) => c.value === value);
  return match ? match.label : value.replace(/-/g, " ");
};

const formatDate = (epoch?: number) => {
  if (!epoch) return "—";
  return new Date(epoch).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const formatFee = (fee?: number) => {
  if (!fee) return "Free";
  return `₹${fee.toLocaleString("en-IN")}`;
};

const CLOSING_SOON_WINDOW_DAYS = 3;
const CLOSING_LATER_WINDOW_DAYS = 10;

/** Urgency tier for the deadline chip, based on days left to apply. */
const getDateUrgency = (epoch?: number): "urgent" | "soon" | "normal" => {
  if (!epoch) return "normal";
  const daysLeft = (epoch - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysLeft <= CLOSING_SOON_WINDOW_DAYS) return "urgent";
  if (daysLeft <= CLOSING_LATER_WINDOW_DAYS) return "soon";
  return "normal";
};

const OpenNotificationsBrowser: React.FC = () => {
  const [items, setItems] = useState<OpenNotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [stateSearch, setStateSearch] = useState("");

  const isFetchingRef = useRef(false);
  const generationRef = useRef(0);

  useEffect(() => {
    fetchAvailableFilters()
      .then((res) => {
        setAvailableStates(res.states || []);
      })
      .catch(() => {});
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 300);
  };

  const loadMore = async (isFirst = false) => {
    if (isFetchingRef.current) return;
    if (!hasMore && !isFirst) return;

    isFetchingRef.current = true;
    const generation = generationRef.current;

    try {
      const res = await fetchOpenNotifications({
        category: categoryFilter,
        state: stateFilter,
        search: search || undefined,
        sortBy: "last_date_to_apply",
        sortOrder: "asc",
        limit: PAGE_SIZE,
        offset: isFirst ? 0 : items.length,
      });

      if (generation !== generationRef.current) return;

      setItems((prev) => (isFirst ? res.data : [...prev, ...res.data]));
      setTotal(res.total);
      setHasMore(res.hasMore);
    } catch (error) {
      if (generation !== generationRef.current) return;
      console.error("Failed to load open notifications", error);
      setHasMore(false);
    } finally {
      if (generation === generationRef.current) {
        setLoading(false);
        isFetchingRef.current = false;
      }
    }
  };

  useEffect(() => {
    generationRef.current += 1;
    setItems([]);
    setHasMore(true);
    setLoading(true);
    isFetchingRef.current = false;
    loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, stateFilter, search]);

  return (
    <div>
      <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
        {total} notification{total === 1 ? "" : "s"} currently accepting applications.
      </p>

      {/* Filter Bar */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          className="onb-filter-input flex-grow-1"
          placeholder="Search by title..."
          value={searchInput}
          onChange={handleSearchChange}
          style={{ minWidth: 200, paddingLeft: 14 }}
        />

        <Dropdown>
          <Dropdown.Toggle as="div" role="button" className="onb-filter-btn">
            📁 {categoryFilter === "all" ? "All Categories" : getCategoryLabel(categoryFilter)}
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ maxHeight: 320, overflowY: "auto" }}>
            <Dropdown.Item active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")}>All Categories</Dropdown.Item>
            {NOTIFICATION_CATEGORIES.filter((c) => c.value !== "all").map((c) => (
              <Dropdown.Item key={c.value} active={categoryFilter === c.value} onClick={() => setCategoryFilter(c.value)}>
                {c.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown>
          <Dropdown.Toggle as="div" role="button" className="onb-filter-btn">
            📍 {stateFilter === "all" ? "All" : getStateLabel(stateFilter)}
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ maxHeight: 320, overflowY: "auto", minWidth: 220 }}>
            <div className="px-2 py-1">
              <Form.Control size="sm" placeholder="Search state..." value={stateSearch} onChange={(e) => setStateSearch(e.target.value)} />
            </div>
            <Dropdown.Item active={stateFilter === "all"} onClick={() => setStateFilter("all")}>All</Dropdown.Item>
            {availableStates
              .filter((s) => getStateLabel(s).toLowerCase().includes(stateSearch.toLowerCase()))
              .map((s) => (
                <Dropdown.Item key={s} active={stateFilter === s} onClick={() => setStateFilter(s)}>
                  {getStateLabel(s)}
                </Dropdown.Item>
              ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {loading && items.length === 0 ? (
        <div className="text-center py-5">
          <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 40 }}>📭</div>
          <b>No open notifications match these filters.</b>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={items.length}
          next={() => loadMore(false)}
          hasMore={hasMore}
          style={{ overflow: "visible" }}
          loader={
            <div className="text-center py-4">
              <span className="spinner-border" style={{ color: "var(--color-primary)" }} />
            </div>
          }
          endMessage={
            !hasMore && (
              <p className="text-center text-muted py-4 mb-0">
                <b>No more notifications.</b>
              </p>
            )
          }
        >
          <div className="row g-3">
            {items.map((item) => {
              const detailUrl = `/notification/${makeSlug(item.title, item.sk)}`;
              const isFree = !item.general_fee;
              const urgency = getDateUrgency(item.last_date_to_apply);
              return (
                <div key={item.sk} className="col-12 col-sm-6 col-lg-4">
                  <div className="onb-card">
                    <div className="onb-card-body">
                      <Link to={detailUrl} className="onb-card-title">
                        {item.title}
                      </Link>

                      <div className="onb-badge-row">
                        <span className="onb-badge" style={{ background: "rgba(37, 99, 235, 0.1)", color: "var(--color-secondary)" }}>
                          {getCategoryLabel(item.category)}
                        </span>
                        <span className="onb-badge" style={{ background: "rgba(2, 132, 199, 0.1)", color: "var(--color-info)" }}>
                          📍 {getStateLabel(item.state)}
                        </span>
                      </div>

                      <div className="onb-stats-row">
                        <div className="onb-stat onb-stat--vacancy">
                          <span className="onb-stat-icon">👥</span>
                          <span className="onb-stat-text">
                            <span className="onb-stat-label">Vacancies</span>
                            <span className="onb-stat-value">{item.total_vacancies ?? "—"}</span>
                          </span>
                        </div>
                        <div className={`onb-stat ${isFree ? "onb-stat--fee-free" : "onb-stat--fee-paid"}`}>
                          <span className="onb-stat-icon">💰</span>
                          <span className="onb-stat-text">
                            <span className="onb-stat-label">Fee</span>
                            <span className="onb-stat-value">{formatFee(item.general_fee)}</span>
                          </span>
                        </div>
                        <div
                          className={`onb-stat onb-stat--wide ${
                            urgency === "urgent" ? "onb-stat--date-urgent" : urgency === "soon" ? "onb-stat--date-soon" : "onb-stat--date-normal"
                          }`}
                        >
                          <span className="onb-stat-icon">📅</span>
                          <span className="onb-stat-text">
                            <span className="onb-stat-label">Last Date to Apply</span>
                            <span className="onb-stat-value">{formatDate(item.last_date_to_apply)}</span>
                          </span>
                        </div>
                      </div>

                      <Link to={detailUrl} className="onb-view-link" target="_blank" rel="noopener noreferrer">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default OpenNotificationsBrowser;
