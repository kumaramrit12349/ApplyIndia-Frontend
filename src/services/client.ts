const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

/* ===============================
   PUBLIC API FETCH
================================ */
export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const finalUrl = url.startsWith("/") ? url : `/${url}`;

  const res = await fetch(`${BASE_URL}${finalUrl}`, {
    credentials: "include", // IMPORTANT
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `API Error ${res.status}: ${errorText || res.statusText}`
    );
  }

  return res.json() as Promise<T>;
}

/* ===============================
   PRIVATE / AUTH API FETCH
================================ */
export async function privateFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("NOT_AUTHENTICATED");
  }
  const finalUrl = url.startsWith("/") ? url : `/${url}`;
  const res = await fetch(`${BASE_URL}${finalUrl}`, {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  });
  if (res.status === 401) {
    throw new Error("NOT_AUTHENTICATED");
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`REQUEST_FAILED: ${text}`);
  }
  return res.json() as Promise<T>;
}


