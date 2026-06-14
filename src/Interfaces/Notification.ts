import type { NotificationCategory } from "../types/notification";

// For Fronted
export interface NotificationFormState {
  title: string;
  category: NotificationCategory;
  department: string;
  total_vacancies: string;

  short_description: string;
  long_description: string;

  has_admit_card: boolean;
  has_result: boolean;
  has_answer_key: boolean;

  start_date: string;
  last_date_to_apply: string;
  exam_date: string;
  admit_card_available_date: string;
  result_date: string;

  general_fee: string;
  obc_fee: string;
  sc_fee: string;
  st_fee: string;
  ph_fee: string;
  ews_fee: string;
  female_fee: string;

  min_age: string;
  max_age: string;

  qualification: string;
  specialization: string;
  min_percentage: string;
  additional_details: string;

  youtube_link: string;
  apply_online_url: string;
  notification_pdf_url: string;
  official_website_url: string;
  admit_card_url: string;
  answer_key_url: string;
  result_url: string;
  other_links: string;
}

// For Backend
export interface NotificationForm {
  // Basic details
  title: string;
  category: NotificationCategory;
  department: string;
  total_vacancies: number;

  short_description: string;
  long_description: string;

  has_admit_card: boolean;
  has_result: boolean;
  has_answer_key: boolean;

  // Important dates
  start_date: string;
  last_date_to_apply: string;
  exam_date?: string;
  admit_card_available_date?: string;
  result_date?: string;

  // Fees
  general_fee: number;
  obc_fee: number;
  sc_fee: number;
  st_fee: number;
  ph_fee: number;
  ews_fee: number;
  female_fee: number;

  // Ages
  min_age: number;
  max_age: number;

  // Educational Qualification
  qualification: string;
  specialization: string;
  min_percentage: number;
  additional_details?: string;

  // Links
  youtube_link: string;
  apply_online_url: string;
  notification_pdf_url: string;
  official_website_url: string;
  admit_card_url?: string;
  answer_key_url?: string;
  result_url?: string;
  other_links?: string;
}
