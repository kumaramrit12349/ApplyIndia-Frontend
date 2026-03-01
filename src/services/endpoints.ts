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
    UNARCHIVE: (id: string) =>
      `/api/notification/unarchive/${id}`,
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
};
