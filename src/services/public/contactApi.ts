import { CONFIG } from "../../config";
import { PUBLIC_API } from "../endpoints";

const BASE_URL = CONFIG.API_BASE_URL;

export interface ContactPayload {
  category: string;
  name?: string;
  email?: string;
  message: string;
  page_url?: string;
  official_source_url?: string;
  suggested_correction?: string;
  broken_link_url?: string;
  company_name?: string;
  company_website?: string;
  /** Honeypot — must stay empty; a real visitor never sees or fills this field. */
  website?: string;
}

export interface ContactSubmitResponse {
  success: boolean;
  data?: { reference_id: string };
  error?: string;
}

/**
 * Submits a Contact Us request. Uses `credentials: "include"` directly
 * (rather than the shared `apiFetch`, which sends no cookies, or
 * `privateFetch`, which hard-redirects to "/" on 401/403) so a logged-in
 * visitor's session cookie reaches the backend — letting it auto-fill their
 * name/email — while a guest with no cookie at all still submits normally.
 */
export async function submitContact(payload: ContactPayload): Promise<ContactSubmitResponse> {
  const res = await fetch(`${BASE_URL}${PUBLIC_API.CONTACT.SUBMIT}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Failed to submit your request");
  }
  return data;
}
