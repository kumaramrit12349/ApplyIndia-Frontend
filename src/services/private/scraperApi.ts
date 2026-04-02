import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";

export interface ScraperSource {
  key: string;
  name: string;
  listingUrl: string;
  defaultCategory: string;
  defaultState: string;
  isActive: boolean;
  is_archived?: boolean;
}

export interface ScraperRunSummary {
  startedAt: number;
  completedAt: number;
  totalSitesProcessed: number;
  totalFound: number;
  totalInserted: number;
  totalSkipped: number;
  totalVirtual: number;
  totalDateFiltered: number; // items older than 2 days
  totalFailed: number;
  errors: string[];
  dryRunItems?: {
    title: string;
    href: string;
    siteName: string;
    category?: string;
    state?: string;
  }[];
  perSite: {
    siteKey: string;
    found: number;
    inserted: number;
    skipped: number;
    virtual: number;
    dateFiltered: number;
    failed: number;
  }[];
}

export interface ScraperStatusResponse {
  success: boolean;
  isRunning: boolean;
  lastRun: ScraperRunSummary | null;
}

export interface ScraperPreviewItem {
  title: string;
  href: string;
  dateText: string | null;
}

export async function triggerScraperRun(dryRun = false): Promise<{
  success: boolean;
  message: string;
  startedAt: number;
  dryRun: boolean;
}> {
  return privateFetch(PRIVATE_API.SCRAPER.RUN, {
    method: "POST",
    body: JSON.stringify({ dryRun }),
  });
}

export async function getScraperStatus(): Promise<ScraperStatusResponse> {
  return privateFetch(PRIVATE_API.SCRAPER.STATUS);
}

export async function getScraperSources(includeArchived = false): Promise<{
  success: boolean;
  sources: ScraperSource[];
}> {
  const url = includeArchived 
    ? `${PRIVATE_API.SCRAPER.SOURCES}?archived=true` 
    : PRIVATE_API.SCRAPER.SOURCES;
  return privateFetch(url);
}

export async function createScraperSource(data: Omit<ScraperSource, "key"> & { key?: string }): Promise<{
  success: boolean;
  message: string;
}> {
  return privateFetch(PRIVATE_API.SCRAPER.SOURCES, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateScraperSource(key: string, data: Partial<ScraperSource>): Promise<{
  success: boolean;
  message: string;
}> {
  return privateFetch(PRIVATE_API.SCRAPER.SOURCE_BY_KEY(key), {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteScraperSource(key: string): Promise<{
  success: boolean;
  message: string;
}> {
  return privateFetch(PRIVATE_API.SCRAPER.SOURCE_BY_KEY(key), {
    method: "DELETE",
  });
}

export async function permanentlyDeleteScraperSource(key: string): Promise<{
  success: boolean;
  message: string;
}> {
  return privateFetch(`${PRIVATE_API.SCRAPER.SOURCE_BY_KEY(key)}/permanent`, {
    method: "DELETE",
  });
}

export async function bulkDeleteScraperSources(keys: string[]): Promise<{
  success: boolean;
  message: string;
}> {
  return privateFetch(`${PRIVATE_API.SCRAPER.SOURCES}/bulk`, {
    method: "DELETE",
    body: JSON.stringify({ keys }),
  });
}

export async function unarchiveScraperSource(key: string): Promise<{
  success: boolean;
  message: string;
}> {
  return privateFetch(`${PRIVATE_API.SCRAPER.SOURCE_BY_KEY(key)}/unarchive`, {
    method: "POST",
  });
}

export async function previewScraperSite(siteKey: string): Promise<{
  success: boolean;
  siteKey: string;
  siteName: string;
  totalFound: number;
  preview: ScraperPreviewItem[];
}> {
  return privateFetch(PRIVATE_API.SCRAPER.PREVIEW(siteKey), {
    method: "POST",
  });
}
