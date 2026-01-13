import type { INotification } from "../interface/NotificationInterface";

export const formatCategoryTitle = (category: string): string => {
  return (
    category?.replace(/-/g, " ")?.replace(/\b\w/g, (l) => l.toUpperCase()) || ""
  );
};

export const getId = (id: string): string => {
  return id.split("#")[1];
};

export function makeSlug(title: string, sk: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-") // replace spaces with hyphen
    .replace(/-+/g, "-"); // remove multiple hyphens

  return `${baseSlug}/${sk}`;
}

export const emptyNotificationForm: INotification = {
  sk: "",
  title: "",
  category: "",
  department: "",
  total_vacancies: 0,

  has_admit_card: false,
  has_result: false,
  has_answer_key: false,
  has_syllabus: false,

  start_date: "",
  last_date_to_apply: "",
  exam_date: "",
  admit_card_date: "",
  result_date: "",

  details: {
    short_description: "",
    long_description: "",
    important_date_details: "",
  },

  fee: {
    general_fee: 0,
    obc_fee: 0,
    sc_fee: 0,
    st_fee: 0,
    ph_fee: 0,
    other_fee_details: "",
  },

  eligibility: {
    min_age: 0,
    max_age: 0,
    qualification: "",
    specialization: "",
    min_percentage: 0,
    age_relaxation_details: "",
  },

  links: {
    youtube_link: "",
    apply_online_url: "",
    notification_pdf_url: "",
    official_website_url: "",
    admit_card_url: "",
    answer_key_url: "",
    result_url: "",
    other_links: "",
  },
};

export function epochToDateInput(epoch?: number): string {
  if (!epoch) return "";

  const d = new Date(epoch);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function toEpoch(dateStr: string): number {
  if (!dateStr) {
    throw new Error("Date string is required");
  }

  // Expecting yyyy-MM-dd from <input type="date">
  const [year, month, day] = dateStr.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid date format: ${dateStr}`);
  }

  // Create date at UTC midnight
  return Date.UTC(year, month - 1, day);
}
