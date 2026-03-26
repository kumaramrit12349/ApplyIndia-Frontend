import { CONFIG } from "../config";
import { AUTH_API } from "./endpoints";
const BASE_URL = CONFIG.API_BASE_URL;

export interface AuthStatus {
  isAuthenticated: boolean;
  user?: {
    given_name?: string;
    family_name?: string;
    email?: string;
    gender?: string;
    dob?: string;
    category?: string;
    state?: string;
    qualification?: string;
    specialization?: string;
    isAdmin?: boolean;
    adminRole?: 'creator' | 'reviewer' | 'admin' | null;
    sub?: string;
  };
}

export const signUpUser = async (
  given_name: string,
  family_name: string,
  email: string,
  password: string,
  gender: string
) => {
  const response = await fetch(`${BASE_URL}${AUTH_API.SIGN_UP}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // crucial for cookies
    body: JSON.stringify({ given_name, family_name, email, password, gender }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to sign up");
  }
  return await response.json();
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}${AUTH_API.SIGN_IN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // crucial for cookies
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to login");
  }
  return response.json();
};


export const logoutUser = async () => {
  await fetch(`${BASE_URL}${AUTH_API.LOG_OUT}`, {
    method: "POST",
    credentials: "include",
  });
};

export const verifyAccount = async (email: string, code: string) => {
  const res = await fetch(`${BASE_URL}${AUTH_API.VERIFY_ACCOUNT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to verify account");
  }
  return res.json();
};

export const resendVerificationCode = async (email: string) => {
  const res = await fetch(`${BASE_URL}${AUTH_API.RESEND_VERIFICATION_CODE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to resend verification code");
  }
  return res.json();
};

export const checkAuthStatus = async (): Promise<AuthStatus> => {
  try {
    const res = await fetch(`${BASE_URL}${AUTH_API.CHECK_AUTH_STATUS}`, {
      credentials: "include",
    });

    if (!res.ok) return { isAuthenticated: false };

    const data = await res.json();
    return {
      isAuthenticated: true,
      user: data.user,
    };
  } catch {
    return { isAuthenticated: false };
  }
};

export const forgotPassword = async (email: string) => {
  const res = await fetch(`${BASE_URL}${AUTH_API.FORGOT_PASSWORD}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to send reset code");
  }
  return res.json();
};

export const resetPassword = async (
  email: string,
  code: string,
  password: string
) => {
  const res = await fetch(`${BASE_URL}${AUTH_API.RESET_PASSWORD}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, newPassword: password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to reset password");
  }
  return res.json();
};

export const fetchProfile = async (): Promise<AuthStatus> => {
  try {
    const res = await fetch(`${BASE_URL}${AUTH_API.GET_PROFILE}`, {
      credentials: "include",
    });

    if (!res.ok) return { isAuthenticated: false };

    const data = await res.json();
    return {
      isAuthenticated: true,
      user: data.user,
    };
  } catch {
    return { isAuthenticated: false };
  }
};

export const updateProfile = async (data: any) => {
  const res = await fetch(`${BASE_URL}${AUTH_API.UPDATE_PROFILE}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update profile");
  }
  return res.json();
};

/**
 * Returns the backend URL that initiates the Google OAuth redirect.
 * When the user clicks "Continue with Google", redirect the browser to this URL.
 */
export const getGoogleSignInUrl = (): string => `${BASE_URL}/auth/google`;