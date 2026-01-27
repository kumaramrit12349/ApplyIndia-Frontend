import { AUTH_API } from "./endpoints";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface AuthStatus {
  isAuthenticated: boolean;
  user?: {
    given_name?: string;
    family_name?: string;
    email?: string;
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
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to login");
  }
  const data = await response.json();
  // THIS IS WHERE YOU SET IT
  if (data.accessToken) {
    localStorage.setItem("access_token", data.accessToken);
  }
  if (data.idToken) {
    localStorage.setItem("id_token", data.idToken);
  }
  return data;
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