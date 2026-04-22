export const WEBSITE_NAME = "Apply India";


export const NOTIFICATION_CATEGORIES = [
  { value: "all", label: "Home" },
  { value: "job", label: "Job" }, // is_admit_card, is_syllabus, is_answer_key, is_result
  { value: "entrance-exam", label: "Entrance Exam" }, // is_admit_card, is_syllabus, is_answer_key, is_result
  { value: "admission", label: "Admission" },
  { value: "scholarship", label: "Scholarship" },
  { value: "sarkari-yojana", label: "Sarkari Yojana" },
  { value: "documents", label: "Documents" },
] as const;

export const INDIAN_STATES = [
  { value: "CT", label: "Central" },
  { value: "AN", label: "Andaman and Nicobar Islands" },
  { value: "AP", label: "Andhra Pradesh" },
  { value: "AR", label: "Arunachal Pradesh" },
  { value: "AS", label: "Assam" },
  { value: "BR", label: "Bihar" },
  { value: "CH", label: "Chandigarh" },
  { value: "CG", label: "Chhattisgarh" },
  { value: "DN", label: "Dadra and Nagar Haveli and Daman and Diu" },
  { value: "DL", label: "Delhi" },
  { value: "GA", label: "Goa" },
  { value: "GJ", label: "Gujarat" },
  { value: "HR", label: "Haryana" },
  { value: "HP", label: "Himachal Pradesh" },
  { value: "JK", label: "Jammu and Kashmir" },
  { value: "JH", label: "Jharkhand" },
  { value: "KA", label: "Karnataka" },
  { value: "KL", label: "Kerala" },
  { value: "LA", label: "Ladakh" },
  { value: "LD", label: "Lakshadweep" },
  { value: "MP", label: "Madhya Pradesh" },
  { value: "MH", label: "Maharashtra" },
  { value: "MN", label: "Manipur" },
  { value: "ML", label: "Meghalaya" },
  { value: "MZ", label: "Mizoram" },
  { value: "NL", label: "Nagaland" },
  { value: "OR", label: "Odisha" },
  { value: "PY", label: "Puducherry" },
  { value: "PB", label: "Punjab" },
  { value: "RJ", label: "Rajasthan" },
  { value: "SK", label: "Sikkim" },
  { value: "TN", label: "Tamil Nadu" },
  { value: "TG", label: "Telangana" },
  { value: "TR", label: "Tripura" },
  { value: "UP", label: "Uttar Pradesh" },
  { value: "UK", label: "Uttarakhand" },
  { value: "WB", label: "West Bengal" },
] as const;

export const EDUCATIONAL_QUALIFICATIONS = [
  { value: "10th", label: "10th (Matriculation)" },
  { value: "12th", label: "12th (Intermediate)" },
  { value: "ITI", label: "ITI" },
  { value: "Diploma", label: "Diploma" },
  { value: "Graduate", label: "Graduate (B.A, B.Sc, B.Com, B.Tech, etc.)" },
  { value: "Post Graduate", label: "Post Graduate (M.A, M.Sc, M.Com, M.Tech, MBA, etc.)" },
  { value: "PhD", label: "PhD / Doctorate" },
  { value: "Other", label: "Other" },
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
  STATE: "state",
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
    name: "YouTube",
    icon: "https://img.icons8.com/ios-filled/24/ffffff/youtube-play.png",
    url: "https://www.youtube.com/@ApplyIndia-online",
    color: "#d9534f", // Similar to the red in the image
  },
  {
    name: "Instagram",
    icon: "https://img.icons8.com/ios-filled/24/ffffff/instagram-new.png",
    url: "https://www.instagram.com/applyindia.online/",
    color: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
  },
  {
    name: "X",
    icon: "https://img.icons8.com/ios-filled/24/ffffff/twitter.png",
    url: "https://x.com/ApplyIndia_",
    color: "#4bd1f9", // Twitter blue from the image
  },
  {
    name: "Facebook",
    icon: "https://img.icons8.com/ios-filled/24/ffffff/facebook-new.png",
    url: "https://www.facebook.com/profile.php?id=61585944620623",
    color: "#3b82f6", // Facebook blue from the image
  },
  {
    name: "Telegram",
    icon: "https://img.icons8.com/ios-filled/24/ffffff/telegram-app.png",
    url: "https://t.me/applyindia_online",
    color: "#0088cc",
  },
  {
    name: "WhatsApp",
    icon: "https://img.icons8.com/ios-filled/24/ffffff/whatsapp.png",
    url: "https://whatsapp.com/channel/0029Vb7u8oNCXC3M57Orxa3I",
    color: "#25D366",
  },
  {
    name: "LinkedIn",
    icon: "https://img.icons8.com/ios-filled/24/ffffff/linkedin.png",
    url: "https://www.linkedin.com/company/110909325/admin/dashboard/",
    color: "#0077b5",
  },
];
