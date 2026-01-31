const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

/* ===============================
   PUBLIC API FETCH
================================ */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error ${response.status}: ${errorText || response.statusText}`,
    );
  }
  return response.json() as Promise<T>;
}

/* ===============================
   PRIVATE / AUTH API FETCH
================================ */
export async function privateFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const finalUrl = url.startsWith("/") ? url : `/${url}`;
  const res = await fetch(`${BASE_URL}${finalUrl}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
    // GLOBAL REDIRECT
    window.location.href = "/";
    throw new Error("AUTH_REDIRECT");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`REQUEST_FAILED: ${text}`);
  }
  return res.json();
}
