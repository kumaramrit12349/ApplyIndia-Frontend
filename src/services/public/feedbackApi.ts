import { apiFetch } from "../client";
import { PUBLIC_API } from "../endpoints";

export interface FeedbackPayload {
  name: string;
  email: string;
  message: string;
}

export interface FeedbackResponse {
  success: boolean;
  message?: string;
}


export const submitFeedback = (
  payload: FeedbackPayload
): Promise<FeedbackResponse> => {
  return apiFetch<FeedbackResponse>(PUBLIC_API.FEEDBACK.SUBMIT, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};