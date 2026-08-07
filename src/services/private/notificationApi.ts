import type { INotification } from "../../interface/NotificationInterface";
import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";

// Add notification
export const addNotification = (data: INotification) => {
  return privateFetch(PRIVATE_API.NOTIFICATION.ADD, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// Fetch all notifications (admin) with optional search + time filter + category filter
export const fetchNotifications = (search?: string, timeRange?: string, category?: string, state?: string) => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.LIST, {
    method: "POST",
    body: JSON.stringify({ search, timeRange, category, state }),
  });
};

// Get notification by slug
export const getNotificationBySlug = (slug: string) => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.BY_SLUG(slug));
};

// Get notification by ID
export const getNotificationById = (id: string) => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.BY_ID(id));
};

// Update notification
export const updateNotification = (id: string, data: Partial<INotification>) => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.UPDATE(id), {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// Approve notification
export const approveNotification = (id: string) => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.APPROVE(id), {
    method: "PATCH",
    body: JSON.stringify({ approved_by: "admin" }),
  });
};

// Archive notification
export const deleteNotification = (id: string) => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.ARCHIVE(id), {
    method: "DELETE",
  });
};

// Permanent delete notification
export const permanentDeleteNotification = (id: string) => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.DELETE_PERMANENT(id), {
    method: "DELETE",
  });
};

// Unarchive notification
export const unarchiveNotification = (id: string) => {
  return privateFetch(PRIVATE_API.NOTIFICATION.UNARCHIVE(id), {
    method: "PATCH",
  });
};

// Add review comment (always requests changes)
export const addReviewComment = (
  id: string,
  commentText: string,
) => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.ADD_COMMENT(id), {
    method: "POST",
    body: JSON.stringify({
      comment_text: commentText,
    }),
  });
};

// Get review comments
export const getReviewComments = (id: string) => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.GET_COMMENTS(id));
};

// Bulk permanent delete notifications
export const bulkPermanentDeleteNotifications = (ids: string[]) => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.DELETE_BULK_PERMANENT, {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
};

// Bulk archive notifications
export const bulkArchiveNotifications = (ids: string[]) => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.ARCHIVE_BULK, {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
};

export type ChannelStatus = "pending" | "sent" | "failed" | "skipped";

export interface IChannelResult {
  status: ChannelStatus;
  sent_count?: number;
  failed_count?: number;
  skipped_count?: number;
  total_count?: number;
  last_attempt_at?: number;
  error?: string;
}

export interface IDistributionLog {
  email?: IChannelResult;
}

// Get delivery status for a notification
export const getDistributionStatus = (id: string) => {
  return privateFetch<{ success: boolean; distribution: IDistributionLog | null }>(
    PRIVATE_API.NOTIFICATION.DISTRIBUTION_STATUS(id)
  );
};

// Retry failed distribution
export const retryDistribution = (id: string) => {
  return privateFetch<{ success: boolean; distribution: IDistributionLog | null }>(
    PRIVATE_API.NOTIFICATION.RETRY_DISTRIBUTION(id),
    { method: "POST" }
  );
};
