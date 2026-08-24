import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";

export interface IUserPlatformStats {
  totalUsers: number;
  googleUsers: number;
  manualUsers: number;
  byCategory: Record<string, number>;
  byState: Record<string, number>;
  recentUsers: Array<{
    sub?: string;
    email: string;
    given_name: string;
    family_name: string;
    gender?: string;
    state?: string;
    category?: string;
    auth_provider?: string;
    created_at?: number;
  }>;
}

export const getUserStats = (timeRange: string = "all") => {
  return privateFetch<{ success: boolean; data: IUserPlatformStats }>(
    `${PRIVATE_API.USERS.STATS}?timeRange=${encodeURIComponent(timeRange)}`,
    {
      method: "GET",
    }
  );
};
