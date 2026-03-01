import type { HomePageNotification } from "../../types/notification";
import { apiFetch } from "../client";
import { PUBLIC_API } from "../endpoints";


// Fetch all notifications
export const fetchHomePageNotifications = () => {
  return apiFetch<any>(PUBLIC_API.HOME.HOME);
};

// Fetch latest notifications
export const fetchLatestNotifications = () => {
  return apiFetch<any>(PUBLIC_API.HOME.LATEST);
};


// fetch notification by Category
export async function fetchNotificationsByCategory(
  category: string,
  limit: number,
  lastEvaluatedKey?: string,
  searchValue?: string
): Promise<{
  data: HomePageNotification[];
  lastEvaluatedKey?: string;
}> {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  if (searchValue?.trim()) {
    params.set("searchValue", searchValue);
  }

  if (lastEvaluatedKey) {
    params.set("lastEvaluatedKey", lastEvaluatedKey);
  }

  return apiFetch(
    `${PUBLIC_API.HOME.CATEGORY(encodeURIComponent(category))}?${params.toString()}`,
    {
      cache: "no-store",
    }
  );
}

// fetch notification by State
export async function fetchNotificationsByState(
  state: string,
  limit: number,
  lastEvaluatedKey?: string,
  searchValue?: string
): Promise<{
  data: HomePageNotification[];
  lastEvaluatedKey?: string;
}> {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  if (searchValue?.trim()) {
    params.set("searchValue", searchValue);
  }

  if (lastEvaluatedKey) {
    params.set("lastEvaluatedKey", lastEvaluatedKey);
  }

  return apiFetch(
    `${PUBLIC_API.HOME.STATE(encodeURIComponent(state))}?${params.toString()}`,
    {
      cache: "no-store",
    }
  );
}

// Get notification by ID
export const getNotificationById = (id: string) => {
  return apiFetch(PUBLIC_API.HOME.BY_ID(id));
};

// get available filters
export const fetchAvailableFilters = () => {
  return apiFetch<{ states: string[] }>(PUBLIC_API.HOME.FILTERS, {
    cache: "no-store",
  });
};

