import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";
import { CONFIG } from "../../config";

export interface IMockTest {
  pk?: string;
  sk?: string;
  series_id: string;
  title_en: string;
  title_hi?: string;
  duration_minutes: number;
  marks_per_correct: number;
  negative_marks_per_wrong: number;
  sections: string[];
  /** Optional: section name -> minutes. When set, the test runs in section-locked mode — see ISectionTimingInfo in mockTestApi.ts for the runtime shape this drives. */
  section_durations?: Record<string, number>;
  is_published: boolean;
  max_attempts: number;
  /** Epoch ms — optional scheduled availability window layered on top of is_published. */
  available_from?: number;
  available_to?: number;
  created_at?: number;
  modified_at?: number;
}

export interface IMockTestQuestion {
  pk?: string;
  sk?: string;
  question_en: string;
  question_hi?: string;
  options_en: [string, string, string, string];
  options_hi?: [string, string, string, string];
  correct_option_index: 0 | 1 | 2 | 3;
  section: string;
  order: number;
  explanation_en?: string;
  explanation_hi?: string;
}

export type IPreviewMockTestQuestion = Omit<IMockTestQuestion, "correct_option_index" | "explanation_en" | "explanation_hi">;

export interface IParsedMockTestQuestion {
  section: string;
  question_en: string;
  question_hi?: string;
  options_en: [string, string, string, string];
  options_hi?: [string, string, string, string];
  correct_option_index: 0 | 1 | 2 | 3;
  explanation_en?: string;
  explanation_hi?: string;
  warning?: string;
}

export const fetchMockTestsForSeries = (seriesId: string) =>
  privateFetch<{ success: boolean; results: IMockTest[] }>(PRIVATE_API.MOCK_TEST_ADMIN.LIST_TESTS(seriesId));

export const createMockTest = (
  seriesId: string,
  input: Pick<
    IMockTest,
    | "title_en"
    | "title_hi"
    | "duration_minutes"
    | "marks_per_correct"
    | "negative_marks_per_wrong"
    | "sections"
    | "max_attempts"
    | "available_from"
    | "available_to"
    | "section_durations"
  >
) =>
  privateFetch<{ success: boolean; data: IMockTest }>(PRIVATE_API.MOCK_TEST_ADMIN.CREATE_TEST(seriesId), {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateMockTest = (testId: string, updates: Partial<IMockTest>) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.MOCK_TEST_ADMIN.UPDATE_TEST(testId), {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

export const publishMockTest = (testId: string, is_published: boolean) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.MOCK_TEST_ADMIN.PUBLISH_TEST(testId), {
    method: "PATCH",
    body: JSON.stringify({ is_published }),
  });

export const deleteMockTest = (testId: string) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.MOCK_TEST_ADMIN.DELETE_TEST(testId), { method: "DELETE" });

export const fetchTestPreview = (testId: string) =>
  privateFetch<{ success: boolean; data: { test: IMockTest; questions: IPreviewMockTestQuestion[] } }>(
    PRIVATE_API.MOCK_TEST_ADMIN.PREVIEW_TEST(testId)
  );

export const fetchQuestionsForTest = (testId: string) =>
  privateFetch<{ success: boolean; results: IMockTestQuestion[] }>(PRIVATE_API.MOCK_TEST_ADMIN.LIST_QUESTIONS(testId));

export const addQuestion = (
  testId: string,
  input: Pick<
    IMockTestQuestion,
    "question_en" | "question_hi" | "options_en" | "options_hi" | "correct_option_index" | "section" | "order" | "explanation_en" | "explanation_hi"
  >
) =>
  privateFetch<{ success: boolean; data: IMockTestQuestion }>(PRIVATE_API.MOCK_TEST_ADMIN.ADD_QUESTION(testId), {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateQuestion = (questionId: string, updates: Partial<IMockTestQuestion>) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.MOCK_TEST_ADMIN.UPDATE_QUESTION(questionId), {
    method: "PATCH",
    body: JSON.stringify(updates),
  });

export const deleteQuestion = (questionId: string) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.MOCK_TEST_ADMIN.DELETE_QUESTION(questionId), { method: "DELETE" });

/**
 * Multipart upload — deliberately bypasses privateFetch, which hardcodes a
 * JSON Content-Type header that would break the multipart boundary the
 * browser needs to set itself for a FormData body.
 */
export async function parseQuestionDocument(file: File): Promise<{ success: boolean; data: IParsedMockTestQuestion[] }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${CONFIG.API_BASE_URL}/${PRIVATE_API.MOCK_TEST_ADMIN.PARSE_DOCUMENT}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Failed to parse document (${res.status})`);
  }
  return res.json();
}

export const bulkAddQuestions = (testId: string, questions: IParsedMockTestQuestion[]) =>
  privateFetch<{ success: boolean; data: IMockTestQuestion[] }>(PRIVATE_API.MOCK_TEST_ADMIN.BULK_ADD_QUESTIONS(testId), {
    method: "POST",
    body: JSON.stringify({ questions }),
  });

export interface ISectionRange {
  from: number;
  to: number;
  section: string;
}

export const bulkAssignSections = (testId: string, ranges: ISectionRange[]) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.MOCK_TEST_ADMIN.BULK_ASSIGN_SECTIONS(testId), {
    method: "PATCH",
    body: JSON.stringify({ ranges }),
  });

export type AttemptRequestStatus = "pending" | "approved" | "rejected";

export interface IMockTestAttemptRequest {
  pk?: string;
  sk?: string;
  test_id: string;
  user_sub: string;
  user_name?: string;
  user_email?: string;
  status: AttemptRequestStatus;
  reason?: string;
  granted_max_attempts?: number;
  resolved_at?: number;
  created_at?: number;
}

export const fetchAttemptRequests = (testId: string) =>
  privateFetch<{ success: boolean; results: IMockTestAttemptRequest[] }>(PRIVATE_API.MOCK_TEST_ADMIN.ATTEMPT_REQUESTS(testId));

export const approveAttemptRequest = (requestId: string, grantedMaxAttempts: number) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.MOCK_TEST_ADMIN.APPROVE_ATTEMPT_REQUEST(requestId), {
    method: "POST",
    body: JSON.stringify({ granted_max_attempts: grantedMaxAttempts }),
  });

export const rejectAttemptRequest = (requestId: string) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.MOCK_TEST_ADMIN.REJECT_ATTEMPT_REQUEST(requestId), { method: "POST" });
