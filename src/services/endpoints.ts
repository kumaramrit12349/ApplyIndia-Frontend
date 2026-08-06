export const PUBLIC_API = {
  HOME: {
    HOME: "/public/notification/home",
    CATEGORY: (category: string) => `/public/notification/category/${category}`,
    STATE: (state: string) => `/public/notification/state/${state}`,
    BY_ID: (id: string) => `/public/notification/getById/${id}`,
    LATEST: "/public/notification/latest",
    FILTERS: "/public/notification/filters",
  },
  FEEDBACK: {
    SUBMIT: "/public/feedback",
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
  },
  SCRAPER: {
    RUN: "api/scraper/run",
    STATUS: "api/scraper/status",
    SOURCES: "api/scraper/sources",
    SOURCE_BY_KEY: (key: string) => `api/scraper/sources/${key}`,
    PREVIEW: (siteKey: string) => `api/scraper/preview/${siteKey}`,
  },
  FEEDBACK: {
    VIEW: "api/feedback/view",
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
