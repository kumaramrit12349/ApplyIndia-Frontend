import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  startMockTestAttempt,
  startPracticeAttempt,
  advanceToNextSection,
  saveMockTestProgress,
  submitMockTestAttempt,
} from "../../services/private/mockTestApi";
import type { IMockTest, IMockTestAttempt, IPublicMockTestQuestion, ISectionTimingInfo } from "../../services/private/mockTestApi";
import LanguageToggle from "../../components/MockTest/LanguageToggle";
import BilingualText from "../../components/MockTest/BilingualText";
import { getStoredMockTestLanguage, storeMockTestLanguage } from "../../utils/mockTestLanguage";
import type { MockTestLanguage } from "../../utils/mockTestLanguage";
import { groupBySection } from "../../utils/mockTestSections";
import "./MockTests.css";

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

function formatTime(totalSeconds: number): string {
  const totalMinutes = Math.floor(totalSeconds / 60);
  const h = Math.floor(totalMinutes / 60);
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

const MockTestTakingPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [searchParams] = useSearchParams();
  const requestedPractice = searchParams.get("practice") === "true";
  const practiceSection = searchParams.get("section") || undefined;
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<IMockTestAttempt | null>(null);
  const [test, setTest] = useState<IMockTest | null>(null);
  const [questions, setQuestions] = useState<IPublicMockTestQuestion[]>([]);
  const [sectionTiming, setSectionTiming] = useState<ISectionTimingInfo | null>(null);
  const [sectionSecondsLeft, setSectionSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 0 | 1 | 2 | 3>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [timePerQuestion, setTimePerQuestion] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [advancingSection, setAdvancingSection] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [lang, setLang] = useState<MockTestLanguage>(getStoredMockTestLanguage());
  const submittedRef = useRef(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentQuestionRef = useRef<{ sk: string; enteredAt: number } | null>(null);
  const warned10Ref = useRef(false);
  const warned5Ref = useRef(false);

  const isPractice = !!attempt?.is_practice;

  /** Fires the "10 minutes left" / "5 minutes left" nudge exactly once each, the moment either threshold is crossed (including immediately on load, if resuming with less time already remaining). Only used for the whole-test timer — section timers are short enough that this isn't wired to them. */
  const maybeWarnThreshold = useCallback((prevSeconds: number, nextSeconds: number) => {
    if (prevSeconds > 600 && nextSeconds <= 600 && !warned10Ref.current) {
      warned10Ref.current = true;
      toast.warning("⏰ Hurry up! Only 10 minutes left.", { autoClose: 6000 });
    }
    if (prevSeconds > 300 && nextSeconds <= 300 && !warned5Ref.current) {
      warned5Ref.current = true;
      toast.warning("⏰ Hurry up! Only 5 minutes left.", { autoClose: 6000 });
    }
  }, []);

  /** Applies a freshly (re)loaded section's data — used both on initial start/resume and after every section advance. */
  const applySectionState = useCallback((a: IMockTestAttempt, qs: IPublicMockTestQuestion[], timing?: ISectionTimingInfo) => {
    setAttempt(a);
    setQuestions(qs);
    setCurrentIndex(0);
    currentQuestionRef.current = null;
    setSectionTiming(timing ?? null);
    if (timing) {
      const elapsed = (Date.now() - timing.sectionStartedAt) / 1000;
      setSectionSecondsLeft(Math.max(0, timing.sectionDurationMinutes * 60 - elapsed));
    }
  }, []);

  useEffect(() => {
    if (!testId) return;
    const starter = requestedPractice ? startPracticeAttempt(testId, practiceSection) : startMockTestAttempt(testId);
    starter
      .then((res) => {
        const { attempt: a, test: t, questions: qs, sectionTiming: timing } = res.data;
        setTest(t);
        setAnswers(a.answers || {});
        setMarkedForReview(new Set(a.marked_for_review || []));
        setTimePerQuestion(a.time_per_question || {});
        applySectionState(a, qs, timing);
        if (!timing) {
          const elapsedSeconds = (Date.now() - a.started_at) / 1000;
          const remaining = Math.max(0, t.duration_minutes * 60 - elapsedSeconds);
          setSecondsLeft(remaining);
          maybeWarnThreshold(Infinity, remaining);
        }
      })
      .catch((err) => {
        const message = String(err?.message || "");
        if (message.includes("ATTEMPT_LIMIT_REACHED")) {
          toast.error("You've used all your attempts for this test.");
          navigate(`/mock-tests/tests/${encodeURIComponent(testId)}/instructions`, { replace: true });
        } else if (message.includes("TEST_NOT_YET_OPEN") || message.includes("TEST_CLOSED")) {
          toast.error("This test isn't open right now.");
          navigate(`/mock-tests/tests/${encodeURIComponent(testId)}/instructions`, { replace: true });
        } else {
          setLoadError("This test could not be started.");
        }
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  // Track visited + time spent per question as the student navigates.
  useEffect(() => {
    const question = questions[currentIndex];
    if (!question?.sk) return;
    setVisited((prev) => (prev.has(question.sk!) ? prev : new Set(prev).add(question.sk!)));
    const now = Date.now();
    if (currentQuestionRef.current) {
      const { sk, enteredAt } = currentQuestionRef.current;
      const delta = (now - enteredAt) / 1000;
      setTimePerQuestion((prev) => ({ ...prev, [sk]: (prev[sk] || 0) + delta }));
    }
    currentQuestionRef.current = { sk: question.sk, enteredAt: now };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, questions.length]);

  /** Folds in the time spent on whichever question is currently open, without waiting for the next navigation to flush it. */
  const flushCurrentQuestionTime = useCallback((): Record<string, number> => {
    if (!currentQuestionRef.current) return timePerQuestion;
    const { sk, enteredAt } = currentQuestionRef.current;
    const delta = (Date.now() - enteredAt) / 1000;
    const updated = { ...timePerQuestion, [sk]: (timePerQuestion[sk] || 0) + delta };
    currentQuestionRef.current = { sk, enteredAt: Date.now() };
    setTimePerQuestion(updated);
    return updated;
  }, [timePerQuestion]);

  // Autosave, debounced — every answer/mark-for-review change persists to the server so a refresh or crash never loses progress.
  useEffect(() => {
    if (!attempt) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      saveMockTestProgress(attempt.sk!, answers, Array.from(markedForReview), timePerQuestion).catch(() => {});
    }, 800);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, markedForReview, attempt?.sk]);

  const doSubmit = useCallback(async () => {
    if (!attempt || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    const finalTimePerQuestion = flushCurrentQuestionTime();
    try {
      const res = await submitMockTestAttempt(attempt.sk!, answers, Array.from(markedForReview), finalTimePerQuestion);
      navigate(`/mock-tests/attempts/${encodeURIComponent(res.data.sk!)}`, { replace: true });
    } catch {
      toast.error("Failed to submit your test. Please try again.");
      submittedRef.current = false;
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, answers, markedForReview, navigate]);

  const goingToNextSectionRef = useRef(false);
  /** Shared by the section timer hitting zero and the manual "Finish Section" button — flushes progress, then moves to the next section with its own fresh timer. */
  const goToNextSection = useCallback(async () => {
    if (!attempt || goingToNextSectionRef.current) return;
    goingToNextSectionRef.current = true;
    setAdvancingSection(true);
    const finalTimePerQuestion = flushCurrentQuestionTime();
    try {
      await saveMockTestProgress(attempt.sk!, answers, Array.from(markedForReview), finalTimePerQuestion);
      const res = await advanceToNextSection(attempt.sk!);
      applySectionState(res.data.attempt, res.data.questions, res.data.sectionTiming);
      toast.info(`Moved to section: ${res.data.sectionTiming.currentSectionName}`, { autoClose: 4000 });
    } catch {
      toast.error("Failed to move to the next section. Please try again.");
    } finally {
      goingToNextSectionRef.current = false;
      setAdvancingSection(false);
    }
  }, [attempt, answers, markedForReview, flushCurrentQuestionTime, applySectionState]);

  // Section-timed tests: a live per-section countdown drives auto-advance (or final auto-submit on the last section).
  useEffect(() => {
    if (loading || !attempt || !sectionTiming) return;
    const interval = setInterval(() => {
      setSectionSecondsLeft((prev) => {
        const next = prev <= 1 ? 0 : prev - 1;
        if (next === 0) {
          clearInterval(interval);
          if (sectionTiming.isLastSection) doSubmit();
          else goToNextSection();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, attempt, sectionTiming, doSubmit, goToNextSection]);

  // Whole-test countdown — only runs when the test ISN'T section-timed (in section mode, each section's own timer above is what actually gates progress; the total is shown as a static reference instead of a second, potentially-contradictory live clock).
  useEffect(() => {
    if (loading || !test || !attempt || sectionTiming) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev <= 1 ? 0 : prev - 1;
        maybeWarnThreshold(prev, next);
        if (next === 0) {
          clearInterval(interval);
          doSubmit(); // time's up — auto-submit, no confirmation needed
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, test, attempt, sectionTiming, doSubmit, maybeWarnThreshold]);

  // No cancel without submitting — this is the only guard a browser lets a page install against
  // being closed/refreshed; combined with the server always resuming the same in-progress attempt
  // (never granting a free new one), there's no way to walk away from a started test for free.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const handleLangChange = (l: MockTestLanguage) => {
    setLang(l);
    storeMockTestLanguage(l);
  };

  const toggleMarkForReview = (sk: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(sk)) next.delete(sk);
      else next.add(sk);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" style={{ color: "var(--color-primary-text)" }} />
      </div>
    );
  }

  if (loadError || !test || !attempt) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">{loadError || "This test could not be loaded."}</p>
      </div>
    );
  }

  const question = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const markedCount = markedForReview.size;
  const isLow = sectionTiming ? sectionSecondsLeft <= 60 : secondsLeft <= 60;
  const sectionGroups = groupBySection(questions);
  const onNonLastSection = !!sectionTiming && !sectionTiming.isLastSection;

  const paletteCellClass = (sk: string, index: number) => {
    const classes = ["mt-palette-cell"];
    if (index === currentIndex) classes.push("mt-palette-cell--current");
    if (markedForReview.has(sk)) classes.push("mt-palette-cell--marked");
    else if (answers[sk] !== undefined) classes.push("mt-palette-cell--answered");
    else if (visited.has(sk)) classes.push("mt-palette-cell--unanswered");
    return classes.join(" ");
  };

  return (
    <div className="container-fluid py-3 mt-page mt-taking-page">
      <div className="mt-taking-header">
        <span className="d-flex align-items-center gap-2">
          <BilingualText en={test.title_en} hi={test.title_hi} lang={lang} as="span" className="mt-taking-title" />
          {isPractice && <span className="mt-practice-badge">Practice {practiceSection ? `· ${practiceSection}` : ""}</span>}
        </span>
        <div className="d-flex flex-wrap align-items-center justify-content-end gap-3">
          <LanguageToggle value={lang} onChange={handleLangChange} />
          {sectionTiming && (
            <div className="mt-timer-total" title="Overall exam duration — each section is timed on its own">
              Total: {test.duration_minutes} min
            </div>
          )}
          <div className={`mt-timer ${isLow ? "mt-timer--low" : ""}`}>
            ⏱ {sectionTiming ? `${sectionTiming.currentSectionName}: ${formatTime(sectionSecondsLeft)}` : formatTime(secondsLeft)}
          </div>
        </div>
      </div>

      <div className="mt-taking-body">
        <div className="mt-question-panel">
          {question ? (
            <>
              {sectionTiming ? (
                <div className="mt-section-lock-banner">
                  🔒 Section {sectionTiming.currentIndex + 1} of {sectionTiming.totalSections}: <b>{sectionTiming.currentSectionName}</b> — you can't
                  go back to a previous section once it's done.
                </div>
              ) : (
                sectionGroups.length > 1 && (
                  <div className="mt-section-jump-bar">
                    {sectionGroups.map((g) => (
                      <button
                        key={g.start}
                        type="button"
                        className={`mt-section-jump-pill ${currentIndex >= g.start && currentIndex <= g.end ? "mt-section-jump-pill--active" : ""}`}
                        onClick={() => setCurrentIndex(g.start)}
                      >
                        {g.section} ({g.start + 1}–{g.end + 1})
                      </button>
                    ))}
                  </div>
                )
              )}
              <div className="mt-question-progress">
                Question {currentIndex + 1} of {questions.length} &nbsp;·&nbsp; {question.section}
              </div>
              <BilingualText en={question.question_en} hi={question.question_hi} lang={lang} as="h3" className="mt-question-text" />
              <div className="mt-options">
                {OPTION_LETTERS.map((letter, i) => {
                  const optEn = question.options_en[i];
                  const optHi = question.options_hi?.[i];
                  const selected = answers[question.sk!] === i;
                  return (
                    <button
                      key={letter}
                      type="button"
                      className={`mt-option ${selected ? "mt-option--selected" : ""}`}
                      onClick={() => setAnswers((prev) => ({ ...prev, [question.sk!]: i as 0 | 1 | 2 | 3 }))}
                    >
                      <span className="mt-option-letter">{letter}</span>
                      <BilingualText en={optEn} hi={optHi} lang={lang} />
                    </button>
                  );
                })}
              </div>
              <div className="mt-question-nav">
                <button
                  className="mt-nav-btn"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                >
                  ← Previous
                </button>
                {answers[question.sk!] !== undefined && (
                  <button
                    className="mt-nav-btn mt-nav-btn--clear"
                    onClick={() => setAnswers((prev) => { const next = { ...prev }; delete next[question.sk!]; return next; })}
                  >
                    Clear Answer
                  </button>
                )}
                <button className="mt-nav-btn mt-nav-btn--mark" onClick={() => toggleMarkForReview(question.sk!)}>
                  {markedForReview.has(question.sk!) ? "Unmark" : "🚩 Mark for Review"}
                </button>
                {currentIndex < questions.length - 1 ? (
                  <button className="mt-nav-btn mt-nav-btn--primary" onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}>
                    Next →
                  </button>
                ) : onNonLastSection ? (
                  <button className="mt-nav-btn mt-nav-btn--primary" disabled={advancingSection} onClick={goToNextSection}>
                    {advancingSection ? "Moving on..." : "Finish Section →"}
                  </button>
                ) : (
                  <button className="mt-nav-btn mt-nav-btn--submit" disabled={submitting} onClick={() => setShowSubmitConfirm(true)}>
                    {submitting ? "Submitting..." : "Submit Test"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted">This test has no questions yet.</p>
          )}
        </div>

        <div className="mt-palette-panel">
          <div className="mt-palette-summary">
            <b>{answeredCount}</b> / {questions.length} answered
            {markedCount > 0 && <> &nbsp;·&nbsp; <b>{markedCount}</b> marked</>}
          </div>
          <div className="mt-palette-legend">
            <span><i className="mt-legend-dot mt-legend-dot--not-visited" />Not visited</span>
            <span><i className="mt-legend-dot mt-legend-dot--unanswered" />Unanswered</span>
            <span><i className="mt-legend-dot mt-legend-dot--answered" />Answered</span>
            <span><i className="mt-legend-dot mt-legend-dot--marked" />Marked</span>
          </div>
          {sectionGroups.map((g) => (
            <div key={g.start} className="mb-2">
              {sectionGroups.length > 1 && <div className="mt-palette-section-label">{g.section}</div>}
              <div className="mt-palette-grid">
                {questions.slice(g.start, g.end + 1).map((q, offset) => {
                  const i = g.start + offset;
                  return (
                    <button key={q.sk} className={paletteCellClass(q.sk!, i)} onClick={() => setCurrentIndex(i)}>
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {onNonLastSection ? (
            <button className="mt-nav-btn mt-nav-btn--primary w-100 mt-3" disabled={advancingSection} onClick={goToNextSection}>
              {advancingSection ? "Moving on..." : "Finish Section & Continue →"}
            </button>
          ) : (
            <button className="mt-nav-btn mt-nav-btn--submit w-100 mt-3" disabled={submitting} onClick={() => setShowSubmitConfirm(true)}>
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          )}
        </div>
      </div>

      {showSubmitConfirm && (
        <div className="mt-submit-modal-backdrop" onClick={() => setShowSubmitConfirm(false)}>
          <div className="mt-submit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mt-submit-modal-icon">📝</div>
            <h3 className="mt-submit-modal-title">Submit Test?</h3>
            <p className="mt-submit-modal-subtitle">Once submitted, you cannot change any answers.</p>
            <div className="mt-submit-stats">
              <div className="mt-submit-stat mt-submit-stat--answered">
                <span className="mt-submit-stat-value">{answeredCount}</span>
                <span className="mt-submit-stat-label">Answered</span>
              </div>
              <div className="mt-submit-stat mt-submit-stat--unanswered">
                <span className="mt-submit-stat-value">{unansweredCount}</span>
                <span className="mt-submit-stat-label">Unanswered</span>
              </div>
              <div className="mt-submit-stat mt-submit-stat--marked">
                <span className="mt-submit-stat-value">{markedCount}</span>
                <span className="mt-submit-stat-label">Marked</span>
              </div>
            </div>
            <div className="mt-submit-modal-actions">
              <button className="mt-nav-btn" onClick={() => setShowSubmitConfirm(false)}>Go Back</button>
              <button className="mt-nav-btn mt-nav-btn--submit" disabled={submitting} onClick={() => { setShowSubmitConfirm(false); doSubmit(); }}>
                {submitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTestTakingPage;
