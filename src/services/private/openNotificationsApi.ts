import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";

export interface OpenNotificationItem {
  sk: string;
  title: string;
  category: string;
  state: string;
  department: string;
  total_vacancies?: number;
  last_date_to_apply?: number;
  created_at?: number;
  general_fee?: number;
}

export interface OpenNotificationFilters {
  category?: string;
  state?: string;
  department?: string;
  minVacancies?: number;
  search?: string;
  closingSoon?: boolean;
  sortBy?: "last_date_to_apply" | "created_at";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// Logged-in-only browse of currently-open notifications with filters.
export const fetchOpenNotifications = (filters: OpenNotificationFilters) => {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== "all") params.set("category", filters.category);
  if (filters.state && filters.state !== "all") params.set("state", filters.state);
  if (filters.department) params.set("department", filters.department);
  if (filters.minVacancies) params.set("minVacancies", String(filters.minVacancies));
  if (filters.search) params.set("search", filters.search);
  if (filters.closingSoon) params.set("closingSoon", "true");
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  params.set("limit", String(filters.limit ?? 20));
  params.set("offset", String(filters.offset ?? 0));

  return privateFetch<{ success: boolean; data: OpenNotificationItem[]; total: number; hasMore: boolean }>(
    `${PRIVATE_API.OPEN_NOTIFICATIONS.LIST}?${params.toString()}`,
  );
};
