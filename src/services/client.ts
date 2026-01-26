const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  if (!url) {
    throw new Error("API URL is undefined");
  }
  console.log('url', url);
  console.log('`${BASE_URL}${url}`', `${BASE_URL}${url}`);
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
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
export async function privateFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const finalUrl = url.startsWith("/") ? url : `/${url}`;

  const res = await fetch(finalUrl, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    throw new Error("NOT_AUTHENTICATED");
  }

  if (!res.ok) {
    throw new Error("REQUEST_FAILED");
  }

  return res.json();
}
