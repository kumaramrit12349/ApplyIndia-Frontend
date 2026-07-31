import { privateFetch } from "../client";
import { ELIGIBILITY_API } from "../endpoints";

export interface IEligibilityResult {
    success: boolean;
    eligible: boolean;
    reasons: string[];
    missingProfileFields: string[];
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
