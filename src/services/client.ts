const BASE_URL = import.meta.env.REACT_APP_API_URL;

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error ${response.status}: ${errorText || response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}
export async function privateFetch<T>(
  url: string,
  options: RequestInit = {}
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



