export const PUBLIC_API = {
  HOME: {
    HOME: "/public/notification/home",
    CATEGORY: (category: string) => `/public/notification/category/${category}`,
    STATE: (state: string) => `/public/notification/state/${state}`,
    BY_ID: (id: string) => `/public/notification/getById/${id}`,
    LATEST: "/public/notification/latest",
    FILTERS: "/public/notification/filters",
  },
  CONTACT: {
    SUBMIT: "/public/contact",
  },
  GUIDANCE_FEEDBACK: {
    LIST: "/public/guidance-feedback",
  },
  FORGOT_PASSWORD: "/public/forgot-password"
};

export const PRIVATE_API = {
  NOTIFICATION: {
    ADD: "api/notification/add",
    LIST: "api/notification/view",
    BY_SLUG: (slugId: string) =>
      `api/notification/getBySlug/${slugId}`,
    BY_ID: (id: string) => `api/notification/getById/${id}`,
    UPDATE: (id: string) => `api/notification/edit/${id}`,
    APPROVE: (id: string) => `api/notification/approve/${id}`,
    ARCHIVE: (id: string) => `api/notification/delete/${id}`,
    DELETE_PERMANENT: (id: string) => `api/notification/delete-permanent/${id}`,
    UNARCHIVE: (id: string) =>
      `/api/notification/unarchive/${id}`,
    ADD_COMMENT: (id: string) => `api/notification/comment/${id}`,
    GET_COMMENTS: (id: string) => `api/notification/comments/${id}`,
    DELETE_BULK_PERMANENT: "api/notification/bulk-permanent-delete",
    ARCHIVE_BULK: "api/notification/bulk-archive",
    DAILY_VIDEO: (id: string) => `api/notification/${id}/daily-video`,
    DAILY_VIDEO_BULK: "api/notification/daily-video/bulk",
    GUIDANCE_AVAILABLE: (id: string) => `api/notification/${id}/guidance`,
    WEEKLY_VIDEO_BULK: "api/notification/weekly-video/bulk",
    DISTRIBUTION_STATUS: (id: string) => `api/notification/${id}/distribution-status`,
    RETRY_DISTRIBUTION: (id: string) => `api/notification/${id}/retry-distribution`,
    SOCIAL_STATUS: (id: string) => `api/notification/${id}/social-status`,
    RETRY_SOCIAL: (id: string, platform: string) => `api/notification/${id}/retry-social/${platform}`,
  },
  CONTACT_ADMIN: {
    LIST: "api/contact/list",
    TRASH_LIST: "api/contact/trash/list",
    STATS: "api/contact/stats",
    GET: (id: string) => `api/contact/${encodeURIComponent(id)}`,
    STATUS: (id: string) => `api/contact/${encodeURIComponent(id)}/status`,
    PRIORITY: (id: string) => `api/contact/${encodeURIComponent(id)}/priority`,
    NOTES: (id: string) => `api/contact/${encodeURIComponent(id)}/notes`,
    REPLIES: (id: string) => `api/contact/${encodeURIComponent(id)}/replies`,
    SPAM: (id: string) => `api/contact/${encodeURIComponent(id)}/spam`,
    DELETE: (id: string) => `api/contact/${encodeURIComponent(id)}/delete`,
    RESTORE: (id: string) => `api/contact/${encodeURIComponent(id)}/restore`,
    DELETE_PERMANENT: (id: string) => `api/contact/${encodeURIComponent(id)}/permanent`,
    DELETE_BULK: "api/contact/bulk-delete",
    DELETE_BULK_PERMANENT: "api/contact/bulk-permanent-delete",
  },
  ADMIN_ROLES: {
    LIST: "api/admin-roles",
    ASSIGN: "api/admin-roles/assign",
    REMOVE: (sub: string) => `api/admin-roles/${sub}`,
  },
  EMAIL_TEMPLATES: {
    LIST: "api/email-templates",
    TEMPLATE_BY_KEY: (key: string) => `api/email-templates/${key}`,
    PREVIEW: (key: string) => `api/email-templates/${key}/preview`,
  },
  PLATFORM_SETTINGS: {
    GET: "api/platform-settings",
    UPDATE: "api/platform-settings",
  },
  OPEN_NOTIFICATIONS: {
    LIST: "api/open-notifications",
  },
  USERS: {
    STATS: "api/users/stats",
  },
  GUIDANCE: {
    SLOTS: "api/guidance/slots",
    ALLOWANCE: (notificationId: string) => `api/guidance/allowance/${encodeURIComponent(notificationId)}`,
    BOOKINGS: "api/guidance/bookings",
    BOOKINGS_MINE: "api/guidance/bookings/mine",
    CANCEL_BOOKING: (bookingSk: string) => `api/guidance/bookings/${encodeURIComponent(bookingSk)}/cancel`,
    SUBMIT_FEEDBACK: (bookingSk: string) => `api/guidance/bookings/${encodeURIComponent(bookingSk)}/feedback`,
  },
  GUIDANCE_ADMIN: {
    SLOTS_ADD: "api/guidance-admin/slots",
    SLOTS_LIST: "api/guidance-admin/slots/list",
    SLOT_AVAILABILITY: (slotSk: string) => `api/guidance-admin/slots/${encodeURIComponent(slotSk)}/availability`,
    SLOT_CANCEL: (slotSk: string) => `api/guidance-admin/slots/${encodeURIComponent(slotSk)}/cancel`,
    SLOTS_BULK_CANCEL_AVAILABLE: "api/guidance-admin/slots/bulk-cancel-available",
    SLOTS_BULK_DELETE: "api/guidance-admin/slots/bulk-delete",
    BOOKINGS_LIST: "api/guidance-admin/bookings/list",
    BOOKING_OUTCOME: (bookingSk: string) => `api/guidance-admin/bookings/${encodeURIComponent(bookingSk)}/outcome`,
    FEEDBACK_LIST: "api/guidance-admin/feedback/list",
    FEEDBACK_MODERATE: (feedbackSk: string) => `api/guidance-admin/feedback/${encodeURIComponent(feedbackSk)}/moderate`,
    STATS: "api/guidance-admin/stats",
  },
};

export const AUTH_API = {
  SIGN_UP: "/auth/signup",
  SIGN_IN: "/auth/signin",
  LOG_OUT: "/auth/logout",
  VERIFY_ACCOUNT: "/auth/confirm",
  RESEND_VERIFICATION_CODE: "/auth/resend",
  CHECK_AUTH_STATUS: "/auth/me",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  UPDATE_PROFILE: "/auth/profile",
  GET_PROFILE: "/auth/profile",
  GET_NOTIFICATION_PREFERENCES: "/auth/notification-preferences",
  UPDATE_NOTIFICATION_PREFERENCES: "/auth/notification-preferences",
};

export const USER_ACTIVITY_API = {
  TRACK: "/api/user-activity/track",
  LIST: "/api/user-activity/list",
  CHECK: (notificationSk: string) =>
    `/api/user-activity/check/${encodeURIComponent(notificationSk)}`,
  REMOVE: (notificationSk: string) =>
    `/api/user-activity/remove/${encodeURIComponent(notificationSk)}`,
};

export const ELIGIBILITY_API = {
  CHECK: (notificationId: string) => `/api/eligibility/check/${notificationId}`,
  ELIGIBLE_NOTIFICATIONS: "/api/eligibility/eligible-notifications",
};
