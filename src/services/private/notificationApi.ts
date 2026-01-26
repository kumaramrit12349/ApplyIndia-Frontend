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

// Fetch all notifications (admin)
export const fetchNotifications = () => {
  return privateFetch<any>(PRIVATE_API.NOTIFICATION.LIST);
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

// Unarchive notification
export const unarchiveNotification = (id: string) => {
  return privateFetch(PRIVATE_API.NOTIFICATION.UNARCHIVE(id), {
    method: "PATCH",
  });
};
