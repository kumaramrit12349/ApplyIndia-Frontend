import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";
import { CONFIG } from "../../config";

export interface EmailTemplate {
  key: string;
  subject: string;
  body: string;
  description?: string;
  created_at?: number;
  modified_at?: number;
}

export async function getEmailTemplates(): Promise<{
  success: boolean;
  templates: EmailTemplate[];
}> {
  return privateFetch(PRIVATE_API.EMAIL_TEMPLATES.LIST);
}

export async function getEmailTemplate(key: string): Promise<{
  success: boolean;
  template: EmailTemplate;
}> {
  return privateFetch(PRIVATE_API.EMAIL_TEMPLATES.TEMPLATE_BY_KEY(key));
}

export async function createEmailTemplate(data: EmailTemplate): Promise<{
  success: boolean;
  message: string;
}> {
  return privateFetch(PRIVATE_API.EMAIL_TEMPLATES.LIST, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmailTemplate(
  key: string,
  data: Partial<Omit<EmailTemplate, "key">>
): Promise<{ success: boolean; message: string }> {
  return privateFetch(PRIVATE_API.EMAIL_TEMPLATES.TEMPLATE_BY_KEY(key), {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEmailTemplate(key: string): Promise<{
  success: boolean;
  message: string;
}> {
  return privateFetch(PRIVATE_API.EMAIL_TEMPLATES.TEMPLATE_BY_KEY(key), {
    method: "DELETE",
  });
}

/**
 * Full URL for a template's live preview (header + body + footer, rendered
 * with sample data). Returns raw HTML, not JSON — meant to be opened
 * directly as a page (e.g. window.open), not fetched via privateFetch.
 * Cookies are sent automatically since this is a normal top-level
 * navigation to the same backend privateFetch already talks to.
 */
export function getEmailTemplatePreviewUrl(key: string): string {
  return `${CONFIG.API_BASE_URL}/${PRIVATE_API.EMAIL_TEMPLATES.PREVIEW(key)}`;
}

/**
 * Full URL for the shared header/footer theme, rendered with a sample body
 * and no DynamoDB lookup — lets you check the overall design (logo, colors,
 * social icons) without needing any real template saved first.
 */
export function getEmailSamplePreviewUrl(): string {
  return `${CONFIG.API_BASE_URL}/${PRIVATE_API.EMAIL_TEMPLATES.SAMPLE_PREVIEW}`;
}
