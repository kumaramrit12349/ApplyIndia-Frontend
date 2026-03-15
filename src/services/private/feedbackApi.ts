import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";

export const getAdminFeedback = (
    limit: number = 30,
    startKey?: any,
    timeRange: string = "all"
) => {
    return privateFetch<any>(PRIVATE_API.FEEDBACK.VIEW, {
        method: "POST",
        body: JSON.stringify({ limit, startKey, timeRange }),
    });
};
