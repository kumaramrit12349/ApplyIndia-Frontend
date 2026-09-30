import { privateFetch } from "../client";
import { PRIVATE_API } from "../endpoints";
import type { ITestSeries } from "./testSeriesAdminApi";
import type { IMockTest } from "./mockTestAdminApi";

export type { ITestSeries, IMockTest };

export interface IPublicTestSeries extends ITestSeries {
  test_count: number;
  test_title_previews: { title_en: string; title_hi?: string }[];
}

export interface IPublicMockTestQuestion {
  pk?: string;
  sk?: string;
  question_en: string;
  question_hi?: string;
  options_en: [string, string, string, string];
  options_hi?: [string, string, string, string];
  section: string;
  order: number;
}

export interface IMockTestSectionBreakdown {
  correct: number;
  total: number;
  score: number;
}

export type MockTestAttemptStatus = "in_progress" | "submitted";

export interface IMockTestAttempt {
  pk?: string;
  sk?: string;
  test_id: string;
  series_id: string;
  user_sub: string;
  status: MockTestAttemptStatus;
  answers: Record<string, 0 | 1 | 2 | 3>;
  marked_for_review?: string[];
  time_per_question?: Record<string, number>;
  score?: number;
  total_marks?: number;
  section_breakdown?: Record<string, IMockTestSectionBreakdown>;
  percentile?: number;
  rank?: number;
  total_participants?: number;
  top_score?: number;
  is_practice?: boolean;
  practice_section?: string;
  current_section_index?: number;
  section_started_at?: number;
  started_at: number;
  submitted_at?: number;
}

/** Everything the taking page needs to run a section-locked timer without reconstructing the logic itself. Absent entirely when the test doesn't use section-wise timing. */
export interface ISectionTimingInfo {
  currentIndex: number;
  currentSectionName: string;
  totalSections: number;
  sectionDurationMinutes: number;
  sectionStartedAt: number;
  isLastSection: boolean;
}

export type TestScheduleState = "OPEN" | "NOT_YET_OPEN" | "CLOSED";

export interface IMyAttemptsForTest {
  attempts: IMockTestAttempt[];
  maxAttempts: number;
  attemptsUsed: number;
  scheduleState: TestScheduleState;
}

export interface IAttemptReviewQuestion {
  sk: string;
  section: string;
  question_en: string;
  question_hi?: string;
  options_en: [string, string, string, string];
  options_hi?: [string, string, string, string];
  given_answer_index?: number;
  correct_answer_index: number;
  is_correct: boolean;
  explanation_en?: string;
  explanation_hi?: string;
  time_spent_seconds: number;
}

export const fetchPublishedSeries = () =>
  privateFetch<{ success: boolean; results: IPublicTestSeries[] }>(PRIVATE_API.MOCK_TESTS.SERIES_LIST);

export const fetchSeriesDetail = (seriesId: string) =>
  privateFetch<{ success: boolean; data: { series: ITestSeries; tests: IMockTest[] } }>(
    PRIVATE_API.MOCK_TESTS.SERIES_DETAIL(seriesId)
  );

export const fetchTestForTaking = (testId: string) =>
  privateFetch<{ success: boolean; data: { test: IMockTest; questions: IPublicMockTestQuestion[] } }>(
    PRIVATE_API.MOCK_TESTS.TEST_FOR_TAKING(testId)
  );

export const fetchMyAttemptsForTest = (testId: string) =>
  privateFetch<{ success: boolean; data: IMyAttemptsForTest }>(PRIVATE_API.MOCK_TESTS.MY_ATTEMPTS_FOR_TEST(testId));

export interface IStartAttemptResponse {
  attempt: IMockTestAttempt;
  test: IMockTest;
  questions: IPublicMockTestQuestion[];
  sectionTiming?: ISectionTimingInfo;
}

/** Creates a new timed attempt, or resumes one already in progress (same started_at, same autosaved answers, same shuffle). If the test uses section-wise timing, `questions` is just the current section's — a fresh call after each section advance fetches the next batch. */
export const startMockTestAttempt = (testId: string) =>
  privateFetch<{ success: boolean; data: IStartAttemptResponse }>(PRIVATE_API.MOCK_TESTS.START_ATTEMPT(testId), { method: "POST" });

/** Practice attempt — timed the same as a real one, but never counts toward max_attempts. Optionally scoped to one section. */
export const startPracticeAttempt = (testId: string, section?: string) =>
  privateFetch<{ success: boolean; data: IStartAttemptResponse }>(PRIVATE_API.MOCK_TESTS.START_PRACTICE(testId), {
    method: "POST",
    body: JSON.stringify({ section }),
  });

/** Voluntarily finishes the current section early and advances to the next one (section-timed tests only) — the new section gets its own fresh timer. */
export const advanceToNextSection = (attemptId: string) =>
  privateFetch<{ success: boolean; data: { attempt: IMockTestAttempt; questions: IPublicMockTestQuestion[]; sectionTiming: ISectionTimingInfo } }>(
    PRIVATE_API.MOCK_TESTS.NEXT_SECTION(attemptId),
    { method: "POST" }
  );

/** Fire-and-forget autosave while the test is in progress. */
export const saveMockTestProgress = (
  attemptId: string,
  answers: Record<string, 0 | 1 | 2 | 3>,
  markedForReview?: string[],
  timePerQuestion?: Record<string, number>
) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.MOCK_TESTS.SAVE_PROGRESS(attemptId), {
    method: "PATCH",
    body: JSON.stringify({ answers, marked_for_review: markedForReview, time_per_question: timePerQuestion }),
  });

export const submitMockTestAttempt = (
  attemptId: string,
  answers: Record<string, 0 | 1 | 2 | 3>,
  markedForReview?: string[],
  timePerQuestion?: Record<string, number>
) =>
  privateFetch<{ success: boolean; data: IMockTestAttempt }>(PRIVATE_API.MOCK_TESTS.SUBMIT_ATTEMPT(attemptId), {
    method: "POST",
    body: JSON.stringify({ answers, marked_for_review: markedForReview, time_per_question: timePerQuestion }),
  });

export const requestMoreAttempts = (testId: string, reason?: string) =>
  privateFetch<{ success: boolean }>(PRIVATE_API.MOCK_TESTS.REQUEST_MORE_ATTEMPTS(testId), {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const fetchMyAttempts = () =>
  privateFetch<{ success: boolean; results: IMockTestAttempt[] }>(PRIVATE_API.MOCK_TESTS.MY_ATTEMPTS);

export const fetchAttemptResult = (attemptId: string) =>
  privateFetch<{ success: boolean; data: IMockTestAttempt }>(PRIVATE_API.MOCK_TESTS.ATTEMPT_RESULT(attemptId));

export const fetchAttemptReview = (attemptId: string) =>
  privateFetch<{ success: boolean; results: IAttemptReviewQuestion[] }>(PRIVATE_API.MOCK_TESTS.ATTEMPT_REVIEW(attemptId));
