import { privateFetch } from "../client";
import { USER_ACTIVITY_API } from "../endpoints";

export type UserActivityStatus = 0 | 1 | 2 | 3 | 4;

export const ACTIVITY_STATUS_MAP: Record<UserActivityStatus, string> = {
    0: "WISHLISTED",
    1: "APPLIED",
    2: "ADMIT_CARD",
    3: "RESULT",
    4: "SELECTED"
};

export interface IUserActivityItem {
    pk: string;
    sk: string;
    notification_title: string;
    notification_category: string;
    status: UserActivityStatus;
    created_at: number;
    modified_at: number;
}

/**
 * Track / update an activity for a notification.
 * Status must follow precedence: APPLIED → ADMIT_CARD → RESULT → SELECTED
 */
export const trackActivity = (
    notificationSk: string,
    title: string,
    category: string,
    status: UserActivityStatus
) => {
    return privateFetch<{ success: boolean; data: IUserActivityItem }>(
        USER_ACTIVITY_API.TRACK,
        {
            method: "POST",
            body: JSON.stringify({ notificationSk, title, category, status }),
            redirectOn401: false,
        }
    );
};

/**
 * Get all tracked activities for the authenticated user (for dashboard).
 */
export const getUserActivities = () => {
    return privateFetch<{ success: boolean; data: IUserActivityItem[] }>(
        USER_ACTIVITY_API.LIST
    );
};

/**
 * Check if user has tracked a specific notification.
 */
export const checkActivityForNotification = (notificationSk: string) => {
    return privateFetch<{
        success: boolean;
        data: IUserActivityItem | null;
        tracked: boolean;
    }>(USER_ACTIVITY_API.CHECK(notificationSk), { redirectOn401: false });
};

/**
 * Remove a tracked activity.
 */
export const removeActivity = (notificationSk: string) => {
    return privateFetch<{ success: boolean }>(
        USER_ACTIVITY_API.REMOVE(notificationSk),
        { method: "DELETE" }
    );
};
