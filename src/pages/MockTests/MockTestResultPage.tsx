import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchAttemptResult } from "../../services/private/mockTestApi";
import type { IMockTestAttempt } from "../../services/private/mockTestApi";
import "./MockTests.css";

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const MockTestResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<IMockTestAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    fetchAttemptResult(attemptId)
      .then((res) => setAttempt(res.data))
      .catch(() => setError("This result could not be found."))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" style={{ color: "var(--color-primary-text)" }} />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">{error || "Result not found."}</p>
        <Link to="/mock-tests">← Back to Mock Tests</Link>
      </div>
    );
  }

  if (attempt.status !== "submitted") {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">This attempt hasn't been submitted yet.</p>
        <Link to={`/mock-tests/tests/${encodeURIComponent(attempt.test_id)}/take`} className="mt-series-card-btn d-inline-block">
          Resume Test
        </Link>
      </div>
    );
  }

  const score = attempt.score ?? 0;
  const totalMarks = attempt.total_marks ?? 0;
  const percentile = attempt.percentile;
  const sectionBreakdown = attempt.section_breakdown ?? {};
  const scorePct = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  return (
    <div className="container py-4 mt-page mt-page--narrow">
      <div className="mt-result-hero">
        {attempt.is_practice && <div className="mt-practice-badge mb-2 d-inline-block">Practice Attempt</div>}
        <div className="mt-result-score">
          {score} <span className="mt-result-score-total">/ {totalMarks}</span>
        </div>
        <div className="mt-result-pct">{scorePct}% score</div>
        {attempt.is_practice ? (
          <div className="mt-result-percentile">Practice attempts aren't ranked or compared against other students.</div>
        ) : (
          <>
            <div className="mt-result-percentile">
              You scored better than <b>{percentile ?? 0}%</b> of everyone who has taken this test — that puts you in the{" "}
              <b>{ordinal(100 - (percentile ?? 0))}</b> percentile bracket from the top.
            </div>
            {attempt.rank && attempt.total_participants && (
              <div className="mt-result-percentile mt-1">
                Rank <b>{attempt.rank}</b> of <b>{attempt.total_participants}</b>
                {attempt.top_score !== undefined && <> &nbsp;·&nbsp; Topper scored <b>{attempt.top_score}</b></>}
              </div>
            )}
          </>
        )}
      </div>

      <h3 className="mt-3">Section-wise Breakdown</h3>
      <div className="mt-section-breakdown">
        {Object.entries(sectionBreakdown).map(([section, stats]) => (
          <div key={section} className="mt-section-row">
            <div className="mt-section-name">{section}</div>
            <div className="mt-section-stats">
              {stats.correct} / {stats.total} correct &nbsp;·&nbsp; Score: {stats.score}
            </div>
            <div className="mt-section-bar">
              <div className="mt-section-bar-fill" style={{ width: `${stats.total > 0 ? (stats.correct / stats.total) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2 mt-4 flex-wrap">
        <Link to={`/mock-tests/attempts/${encodeURIComponent(attempt.sk!)}/review`} className="mt-series-card-btn">Review Answers</Link>
        <Link to="/mock-tests" className="mt-nav-btn">Browse More Tests</Link>
        <Link to="/mock-tests/my-attempts" className="mt-nav-btn">My Attempts</Link>
      </div>
    </div>
  );
};

export default MockTestResultPage;
