import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAttemptReview } from "../../services/private/mockTestApi";
import type { IAttemptReviewQuestion } from "../../services/private/mockTestApi";
import BilingualText from "../../components/MockTest/BilingualText";
import LanguageToggle from "../../components/MockTest/LanguageToggle";
import { getStoredMockTestLanguage, storeMockTestLanguage } from "../../utils/mockTestLanguage";
import type { MockTestLanguage } from "../../utils/mockTestLanguage";
import { groupBySection } from "../../utils/mockTestSections";
import "./MockTests.css";

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

const MockTestReviewPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [questions, setQuestions] = useState<IAttemptReviewQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<MockTestLanguage>(getStoredMockTestLanguage());

  useEffect(() => {
    if (!attemptId) return;
    fetchAttemptReview(attemptId)
      .then((res) => setQuestions(res.results))
      .catch((err) => setError(String(err?.message || "").includes("ATTEMPT_NOT_SUBMITTED") ? "This attempt hasn't been submitted yet." : "This review could not be loaded."));
  }, [attemptId]);

  const handleLangChange = (l: MockTestLanguage) => {
    setLang(l);
    storeMockTestLanguage(l);
  };

  if (error) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">{error}</p>
        <Link to="/mock-tests/my-attempts">← Back to My Attempts</Link>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" style={{ color: "var(--color-primary-text)" }} />
      </div>
    );
  }

  const sectionGroups = groupBySection(questions);
  const correctCount = questions.filter((q) => q.is_correct).length;
  const unansweredCount = questions.filter((q) => q.given_answer_index === undefined).length;

  return (
    <div className="container py-4 mt-page mt-page--narrow">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
        <div className="mt-page-title-row">
          <span className="mt-page-icon-badge">🔍</span>
          <h1 className="mt-page-title">Answer Review</h1>
        </div>
        <LanguageToggle value={lang} onChange={handleLangChange} />
      </div>

      <div className="mt-info-banner mb-4">
        <b>{correctCount}</b> correct &nbsp;·&nbsp; <b>{questions.length - correctCount - unansweredCount}</b> incorrect &nbsp;·&nbsp;{" "}
        <b>{unansweredCount}</b> unanswered
      </div>

      {sectionGroups.length > 1 && (
        <div className="mt-section-jump-bar mb-3">
          {sectionGroups.map((g) => (
            <a key={g.start} href={`#review-q-${g.start}`} className="mt-section-jump-pill">
              {g.section} ({g.start + 1}–{g.end + 1})
            </a>
          ))}
        </div>
      )}

      <div className="mt-review-list">
        {questions.map((q, i) => (
          <div key={q.sk} id={`review-q-${i}`} className={`mt-review-card ${q.given_answer_index === undefined ? "mt-review-card--unanswered" : q.is_correct ? "mt-review-card--correct" : "mt-review-card--incorrect"}`}>
            <div className="mt-review-card-head">
              <span>Question {i + 1} &nbsp;·&nbsp; {q.section}</span>
              <span className="mt-review-status">
                {q.given_answer_index === undefined ? "Not Answered" : q.is_correct ? "✓ Correct" : "✗ Incorrect"}
                {q.time_spent_seconds > 0 && <> &nbsp;·&nbsp; {Math.round(q.time_spent_seconds)}s</>}
              </span>
            </div>
            <BilingualText en={q.question_en} hi={q.question_hi} lang={lang} as="h3" className="mt-question-text" />
            <div className="mt-options">
              {OPTION_LETTERS.map((letter, oi) => {
                const isCorrectOption = oi === q.correct_answer_index;
                const isGivenOption = oi === q.given_answer_index;
                const cls = isCorrectOption ? "mt-option--correct" : isGivenOption ? "mt-option--wrong" : "";
                return (
                  <div key={letter} className={`mt-option mt-option--static ${cls}`}>
                    <span className="mt-option-letter">{letter}</span>
                    <BilingualText en={q.options_en[oi]} hi={q.options_hi?.[oi]} lang={lang} />
                    {isCorrectOption && <span className="ms-auto">✓</span>}
                    {isGivenOption && !isCorrectOption && <span className="ms-auto">✗</span>}
                  </div>
                );
              })}
            </div>
            {(q.explanation_en || q.explanation_hi) && (
              <div className="mt-review-explanation">
                <b>Explanation:</b> <BilingualText en={q.explanation_en || ""} hi={q.explanation_hi} lang={lang} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="d-flex gap-2 mt-4">
        <Link to="/mock-tests" className="mt-series-card-btn">Browse More Tests</Link>
        <Link to="/mock-tests/my-attempts" className="mt-nav-btn">My Attempts</Link>
      </div>
    </div>
  );
};

export default MockTestReviewPage;
