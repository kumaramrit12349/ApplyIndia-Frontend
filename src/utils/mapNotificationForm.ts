import type {
  NotificationForm,
  NotificationFormState,
} from "../Interfaces/Notification";

export const mapFormToPayload = (
  form: NotificationFormState
): NotificationForm => ({
  title: form.title,
  category: form.category,
  department: form.department,
  total_vacancies: Number(form.total_vacancies),

  short_description: form.short_description,
  long_description: form.long_description,

  has_admit_card: form.has_admit_card,
  has_result: form.has_result,
  has_answer_key: form.has_answer_key,

  start_date: form.start_date,
  last_date_to_apply: form.last_date_to_apply,
  exam_date: form.exam_date || undefined,
  admit_card_available_date: form.admit_card_available_date || undefined,
  result_date: form.result_date || undefined,

  general_fee: Number(form.general_fee),
  obc_fee: Number(form.obc_fee),
  sc_fee: Number(form.sc_fee),
  st_fee: Number(form.st_fee),
  ph_fee: Number(form.ph_fee),

  min_age: Number(form.min_age),
  max_age: Number(form.max_age),

  qualification: form.qualification,
  specialization: form.specialization,
  min_percentage: Number(form.min_percentage),
  additional_details: form.additional_details || undefined,

  youtube_link: form.youtube_link,
  apply_online_url: form.apply_online_url,
  notification_pdf_url: form.notification_pdf_url,
  official_website_url: form.official_website_url,
  admit_card_url: form.admit_card_url || undefined,
  answer_key_url: form.answer_key_url || undefined,
  result_url: form.result_url || undefined,
  other_links: form.other_links || undefined,
});
