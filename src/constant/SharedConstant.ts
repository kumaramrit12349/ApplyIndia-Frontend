export const WEBSITE_NAME = "Apply India";
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";


export const NOTIFICATION_CATEGORIES = [
  { value: "all", label: "Home" },
  { value: "job", label: "Job" }, // is_admit_card, is_syllabus, is_answer_key, is_result
  { value: "entrance-exam", label: "Entrance Exam" }, // is_admit_card, is_syllabus, is_answer_key, is_result
  { value: "admission", label: "Admission" }, 
  { value: "scholarship", label: "Scholarship" }, 
  { value: "sarkari-yojana", label: "Sarkari Yojana" }, 
  { value: "documents", label: "Documents" }, 
] as const;

// *********** Url structure for categories *************
// /jobs/ssc-gd-constable
// /jobs/bihar-police-si

// /entrance-exam/jee-main
// /entrance-exam/bihar-bed-cet

// /admission/bihar-iti
// /admission/patna-university-ug

// /scholarship/bihar-post-matric
// /scholarship/nsp

// /sarkari-yojana/pm-kisan
// /sarkari-yojana/ayushman-bharat

// /documents/aadhaar
// /documents/caste-certificate

export const NOTIFICATION_COLUMNS = {
  SK: "sk", // not required in ui
  TITLE: "title",
  CATEGORY: "category",
  DEPARTMENT: "department",
  TOTAL_VACANCIES: "total_vacancies",

  SHORT_DESCRIPTION: "short_description",
  LONG_DESCRIPTION: "long_description",

  HAS_SYLLABUS: "has_syllabus",
  HAS_ADMIT_CARD: "has_admit_card",
  HAS_RESULT: "has_result",
  HAS_ANSWER_KEY: "has_answer_key",

  START_DATE: "start_date",
  LAST_DATE_TO_APPLY: "last_date_to_apply",
  EXAM_DATE: "exam_date",
  ADMIT_CARD_AVAILABLE_DATE: "admit_card_available_date",
  RESULT_DATE: "result_date",
  IMPORTANT_DATE_DETAILS: "important_date_details",

  GENERAL_FEE: "general_fee",
  OBC_FEE: "obc_fee",
  SC_FEE: "sc_fee",
  ST_FEE: "st_fee",
  PH_FEE: "ph_fee",
  OTHER_FEE_DETAILS: "other_fee_details",

  MIN_AGE: "min_age",
  MAX_AGE: "max_age",
  AGE_RELAXATION_DETAILS: "age_relaxation_details",

  QUALIFICATION: "qualification", // Comma seperated
  SPECIALIZATION: "specialization", // Comman seperated
  MIN_PERCENTAGE: "min_percentage",
  ADDITIONAL_DETAILS: "additional_details",

  YOUTUBE_LINK: "youtube_link",
  APPLY_ONLINE_URL: "apply_online_url",
  NOTIFICATION_PDF_URL: "notification_pdf_url",
  OFFICIAL_WEBSITE_URL: "official_website_url",
  ADMIT_CARD_URL: "admit_card_url",
  ANSWER_KEY_URL: "answer_key_url",
  RESULT_URL: "result_url",
  OTHER_LINKS: "other_links",

  APPROVED_BY: "approved_by",
  APPROVED_AT: "approved_at",
  IS_ARCHIVED: "is_archived",
  CREATED_AT: "created_at",
  UPDATED_AT: "updated_at",
} as const;


// constants/socialLinks.ts
export const APPLYINDIA_SOCIAL_LINKS = [
  {
    name: "Facebook",
    icon: "https://img.icons8.com/color/28/000000/facebook-new.png",
    url: "https://www.facebook.com/profile.php?id=61585944620623",
  },
  {
    name: "Telegram",
    icon: "https://img.icons8.com/color/28/000000/telegram-app.png",
    url: "https://web.telegram.org/k/#@applyindia_online",
  },
  {
    name: "WhatsApp",
    icon: "https://img.icons8.com/color/28/000000/whatsapp.png",
    url: "https://whatsapp.com/channel/0029Vb7u8oNCXC3M57Orxa3I",
  },
  {
    name: "YouTube",
    icon: "https://img.icons8.com/color/28/000000/youtube-play.png",
    url: "https://www.youtube.com/@ApplyIndia-online",
  },
  {
    name: "Instagram",
    icon: "https://img.icons8.com/color/28/000000/instagram-new.png",
    url: "https://www.instagram.com/applyindia.online/",
  },
  {
    name: "X",
    icon: "https://img.icons8.com/ios-filled/28/000000/twitterx--v2.png",
    url: "https://x.com/ApplyIndia_",
  },
  {
    name: "LinkedIn",
    icon: "https://img.icons8.com/color/28/000000/linkedin.png",
    url: "https://www.linkedin.com/company/110909325/admin/dashboard/",
  },
];
