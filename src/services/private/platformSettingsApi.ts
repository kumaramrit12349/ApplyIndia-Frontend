import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";

export interface PlatformSettings {
  /** Master switch — off means nothing sends, regardless of the channel flags below. */
  email_communication_enabled: boolean;
  contact_us_enabled: boolean;
  guidance_enabled: boolean;
  notification_enabled: boolean;
  created_at?: number;
  modified_at?: number;
}

export async function getPlatformSettings(): Promise<{ success: boolean; data: PlatformSettings }> {
  return privateFetch(PRIVATE_API.PLATFORM_SETTINGS.GET);
}

export async function updatePlatformSettings(
  updates: Partial<Omit<PlatformSettings, "created_at" | "modified_at">>
): Promise<{ success: boolean; data: PlatformSettings }> {
  return privateFetch(PRIVATE_API.PLATFORM_SETTINGS.UPDATE, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}
