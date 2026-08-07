import { privateFetch } from "../client";
import { ELIGIBILITY_API } from "../endpoints";
import type { HomePageNotification } from "../../types/notification";

export interface IEligibilityResult {
    success: boolean;
    eligible: boolean;
    reasons: string[];
    missingProfileFields: string[];
}

export interface IEligibleNotificationsResult {
    success: boolean;
    incompleteProfile: boolean;
    missingProfileFields: string[];
    notifications: HomePageNotification[];
}

/**
 * Compares the authenticated user's profile against a notification's
 * eligibility criteria (age, qualification, specialization, percentage, domicile).
 */
export const checkEligibility = (notificationId: string) => {
    return privateFetch<IEligibilityResult>(
        ELIGIBILITY_API.CHECK(notificationId),
        { redirectOn401: false }
    );
};

/**
 * Returns only the active notifications (approved, not archived, deadline
 * not passed) the authenticated user is eligible for, within a category or state.
 */
export const fetchEligibleNotifications = (
    filter: { category: string } | { state: string }
) => {
    const params = new URLSearchParams(filter as Record<string, string>);
    return privateFetch<IEligibleNotificationsResult>(
        `${ELIGIBILITY_API.ELIGIBLE_NOTIFICATIONS}?${params.toString()}`,
        { redirectOn401: false }
    );
};
