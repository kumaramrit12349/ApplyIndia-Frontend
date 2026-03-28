import type { NOTIFICATION_CATEGORIES, INDIAN_STATES } from "../constant/SharedConstant";

export interface HomePageNotification {
  title: string;
  sk: string;
  state?: string;
  last_date_to_apply?: string;
}

// types/notification.ts
export interface BaseInterface {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationForm extends BaseInterface {
  title: string;
  category: string;
  state: string;
  department: string;
  total_vacancies: number;

  short_description: string;
  long_description: string;

  has_admit_card: boolean;
  has_result: boolean;
  has_answer_key: boolean;

  start_date: string;
  last_date_to_apply: string;
  exam_date?: string;
  admit_card_available_date?: string;
  result_date?: string;
  important_date_details?: string;

  general_fee: number;
  obc_fee: number;
  sc_fee: number;
  st_fee: number;
  ph_fee: number;
  other_fee_details: string;

  min_age: number;
  max_age: number;
  age_relaxation_details: string;

  qualification: string;
  specialization: string;
  min_percentage: number;
  additional_details?: string;

  youtube_link: string;
  apply_online_url: string;
  notification_pdf_url: string;
  official_website_url: string;
  admit_card_url?: string;
  answer_key_url?: string;
  result_url?: string;
  other_links?: string;
}

// for create – without id/created_at/updated_at
export type NotificationFormValues = Omit<
  NotificationForm,
  keyof BaseInterface
>;

export type NotificationCategory =
  (typeof NOTIFICATION_CATEGORIES)[number]["value"];

export type NotificationState =
  (typeof INDIAN_STATES)[number]["value"];
