export type ContactCategory =
  | "report_error"
  | "suggest_update"
  | "report_broken_link"
  | "general_query"
  | "business_enquiry"
  | "feedback"
  | "other";

export type ContactStatus = "new" | "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed";

export type ContactPriority = "high" | "medium" | "low";

export interface IContact {
  pk?: string;
  sk: string;
  reference_id: string;
  category: ContactCategory;
  name: string;
  email?: string;
  user_sub?: string;
  message: string;
  page_url?: string;
  official_source_url?: string;
  suggested_correction?: string;
  broken_link_url?: string;
  company_name?: string;
  company_website?: string;
  status: ContactStatus;
  priority: ContactPriority;
  is_spam?: boolean;
  is_archived?: boolean;
  submitter_ip?: string;
  resolved_at?: number;
  created_at: number;
  modified_at: number;
}

export interface IContactNote {
  sk: string;
  contact_id: string;
  author_sub: string;
  author_name?: string;
  body: string;
  created_at: number;
}

export interface IContactReply {
  sk: string;
  contact_id: string;
  author_sub: string;
  author_name?: string;
  body: string;
  created_at: number;
}

export interface IContactStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  spam: number;
}
