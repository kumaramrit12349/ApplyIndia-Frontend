export type GuidanceSlotStatus = "available" | "unavailable" | "booked" | "cancelled" | "completed";

export interface IGuidanceSlot {
  pk?: string;
  sk: string;
  notification_id: string;
  start_time: number;
  end_time: number;
  meet_link: string;
  status: GuidanceSlotStatus;
  notes?: string;
  cancel_reason?: string;
  cancelled_at?: number;
  booking_sk?: string | null;
  created_by: string;
  created_at: number;
  modified_at: number;
}

export type GuidanceBookingStatus =
  | "upcoming"
  | "completed"
  | "no_show"
  | "cancelled_by_user"
  | "cancelled_by_admin";

export interface IGuidanceBooking {
  pk?: string;
  sk: string;
  notification_id: string;
  notification_title: string;
  slot_sk: string;
  slot_start_time: number;
  slot_end_time: number;
  meet_link: string;
  user_sub: string;
  user_name?: string;
  user_email: string;
  status: GuidanceBookingStatus;
  issue_note?: string;
  admin_notes?: string;
  cancel_reason?: string;
  booked_at: number;
  cancelled_at?: number;
  completed_at?: number;
}

export type GuidanceProblemSolved = "yes" | "no" | "partially";
export type GuidanceModerationStatus = "pending" | "published" | "hidden";

export interface IGuidanceFeedback {
  pk?: string;
  sk: string;
  booking_sk: string;
  notification_id: string;
  user_sub: string;
  rating: number;
  problem_solved: GuidanceProblemSolved;
  topic_tags: string[];
  message?: string;
  consent_public: boolean;
  display_name?: string;
  moderation_status: GuidanceModerationStatus;
  featured: boolean;
  moderated_by?: string;
  moderated_at?: number;
  created_at: number;
}

export interface IPublicGuidanceFeedback {
  sk: string;
  rating: number;
  problem_solved: string;
  topic_tags: string[];
  message?: string;
  display_name?: string;
  featured: boolean;
  created_at: number;
}

export interface IGuidanceBookingAllowance {
  used: number;
  max: number;
  hasActiveUpcoming: boolean;
}

export interface IGuidanceStats {
  totalSlots: number;
  upcomingBookings: number;
  completedSessions: number;
  noShowRate: number;
  publishedFeedback: number;
}
