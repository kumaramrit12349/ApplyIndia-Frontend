import type { IPublicGuidanceFeedback } from "../../interface/GuidanceInterface";
import { apiFetch } from "../client";
import { PUBLIC_API } from "../endpoints";

export const fetchPublicTestimonials = (limit = 30) => {
  const params = new URLSearchParams({ limit: String(limit) });
  return apiFetch<{ success: boolean; data: IPublicGuidanceFeedback[] }>(
    `${PUBLIC_API.GUIDANCE_FEEDBACK.LIST}?${params.toString()}`,
  );
};
