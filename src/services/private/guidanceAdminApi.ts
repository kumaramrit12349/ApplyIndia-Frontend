import type { IGuidanceBooking, IGuidanceFeedback, IGuidanceSlot, IGuidanceStats } from "../../interface/GuidanceInterface";
import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";

export const createGuidanceSlot = (data: { notification_id: string; start_time: number; meet_link: string; notes?: string }) => {
  return privateFetch<{ success: boolean; data: IGuidanceSlot }>(PRIVATE_API.GUIDANCE_ADMIN.SLOTS_ADD, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const listAdminGuidanceSlots = (filters: {
  notificationId?: string;
  status?: string;
  limit?: number;
  startKey?: { pk: string; sk: string };
}) => {
  return privateFetch<{ success: boolean; results: IGuidanceSlot[]; lastEvaluatedKey?: { pk: string; sk: string } }>(
    PRIVATE_API.GUIDANCE_ADMIN.SLOTS_LIST,
    { method: "POST", body: JSON.stringify(filters) },
  );
};

export const setGuidanceSlotAvailability = (slotSk: string, available: boolean) => {
  return privateFetch<{ success: boolean; data: IGuidanceSlot }>(PRIVATE_API.GUIDANCE_ADMIN.SLOT_AVAILABILITY(slotSk), {
    method: "PATCH",
    body: JSON.stringify({ available }),
  });
};

export const cancelGuidanceSlot = (slotSk: string, reason?: string) => {
  return privateFetch<{ success: boolean; data: { slot: IGuidanceSlot; cancelledBooking?: IGuidanceBooking } }>(
    PRIVATE_API.GUIDANCE_ADMIN.SLOT_CANCEL(slotSk),
    { method: "POST", body: JSON.stringify({ reason }) },
  );
};

export const listAdminGuidanceBookings = (filters: {
  notificationId?: string;
  status?: string;
  limit?: number;
  startKey?: { pk: string; sk: string };
}) => {
  return privateFetch<{ success: boolean; results: IGuidanceBooking[]; lastEvaluatedKey?: { pk: string; sk: string } }>(
    PRIVATE_API.GUIDANCE_ADMIN.BOOKINGS_LIST,
    { method: "POST", body: JSON.stringify(filters) },
  );
};

export const markGuidanceBookingOutcome = (bookingSk: string, outcome: "completed" | "no_show", adminNotes?: string) => {
  return privateFetch<{ success: boolean; data: IGuidanceBooking }>(PRIVATE_API.GUIDANCE_ADMIN.BOOKING_OUTCOME(bookingSk), {
    method: "POST",
    body: JSON.stringify({ outcome, adminNotes }),
  });
};

export const listGuidanceFeedbackForModeration = (filters: { status?: string; limit?: number; startKey?: { pk: string; sk: string } }) => {
  return privateFetch<{ success: boolean; results: IGuidanceFeedback[]; lastEvaluatedKey?: { pk: string; sk: string } }>(
    PRIVATE_API.GUIDANCE_ADMIN.FEEDBACK_LIST,
    { method: "POST", body: JSON.stringify(filters) },
  );
};

export const moderateGuidanceFeedback = (
  feedbackSk: string,
  action: "publish" | "hide" | "feature" | "unfeature",
  displayNameOverride?: string,
) => {
  return privateFetch<{ success: boolean; data: IGuidanceFeedback }>(PRIVATE_API.GUIDANCE_ADMIN.FEEDBACK_MODERATE(feedbackSk), {
    method: "POST",
    body: JSON.stringify({ action, displayNameOverride }),
  });
};

export const fetchGuidanceStats = () => {
  return privateFetch<{ success: boolean; data: IGuidanceStats }>(PRIVATE_API.GUIDANCE_ADMIN.STATS);
};
