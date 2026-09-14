export const GUIDANCE_TOPIC_TAGS: { value: string; label: string }[] = [
  { value: "registration", label: "Registration" },
  { value: "form_filling", label: "Filling Application" },
  { value: "photo_signature", label: "Photo / Signature" },
  { value: "document_upload", label: "Document Upload" },
  { value: "payment", label: "Payment" },
  { value: "technical_issue", label: "Technical Issue" },
  { value: "field_understanding", label: "Understanding a Field" },
  { value: "other", label: "Other" },
];

export const GUIDANCE_PROBLEM_SOLVED_OPTIONS: { value: string; label: string }[] = [
  { value: "yes", label: "Yes, completely" },
  { value: "partially", label: "Partially" },
  { value: "no", label: "No" },
];

export const MAX_GUIDANCE_BOOKINGS_PER_NOTIFICATION = 3;
export const GUIDANCE_SESSION_DURATION_MINUTES = 15;
export const GUIDANCE_CANCEL_CUTOFF_MINUTES = 60;
