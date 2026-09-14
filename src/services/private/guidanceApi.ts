import type {
  IGuidanceBooking,
  IGuidanceBookingAllowance,
  IGuidanceFeedback,
  IGuidanceSlot,
} from "../../interface/GuidanceInterface";
import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";

export const fetchAvailableSlots = (notificationId: string) => {
  const params = new URLSearchParams({ notificationId });
  return privateFetch<{ success: boolean; data: IGuidanceSlot[] }>(
    `${PRIVATE_API.GUIDANCE.SLOTS}?${params.toString()}`,
  );
};

export const fetchBookingAllowance = (notificationId: string) => {
  return privateFetch<{ success: boolean; data: IGuidanceBookingAllowance }>(
    PRIVATE_API.GUIDANCE.ALLOWANCE(notificationId),
  );
};

export const createGuidanceBooking = (data: { notification_id: string; slot_sk: string; issue_note?: string }) => {
  return privateFetch<{ success: boolean; data: IGuidanceBooking }>(PRIVATE_API.GUIDANCE.BOOKINGS, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const fetchMyGuidanceBookings = (limit = 30, startKey?: { pk: string; sk: string }) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (startKey) params.set("startKey", JSON.stringify(startKey));
  return privateFetch<{ success: boolean; results: IGuidanceBooking[]; lastEvaluatedKey?: { pk: string; sk: string } }>(
    `${PRIVATE_API.GUIDANCE.BOOKINGS_MINE}?${params.toString()}`,
  );
};

export const cancelGuidanceBooking = (bookingSk: string) => {
  return privateFetch<{ success: boolean; data: IGuidanceBooking }>(PRIVATE_API.GUIDANCE.CANCEL_BOOKING(bookingSk), {
    method: "POST",
  });
};

export const submitGuidanceFeedback = (
  bookingSk: string,
  data: {
    rating: number;
    problem_solved: string;
    topic_tags: string[];
    message?: string;
    consent_public: boolean;
  },
) => {
  return privateFetch<{ success: boolean; data: IGuidanceFeedback }>(PRIVATE_API.GUIDANCE.SUBMIT_FEEDBACK(bookingSk), {
    method: "POST",
    body: JSON.stringify(data),
  });
};
