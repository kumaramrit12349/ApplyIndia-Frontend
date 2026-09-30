import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchTestForTaking, fetchMyAttemptsForTest, requestMoreAttempts } from "../../services/private/mockTestApi";
import type { IMockTest, IPublicMockTestQuestion, IMyAttemptsForTest } from "../../services/private/mockTestApi";
import BilingualText from "../../components/MockTest/BilingualText";
import LanguageToggle from "../../components/MockTest/LanguageToggle";
import { getStoredMockTestLanguage, storeMockTestLanguage } from "../../utils/mockTestLanguage";
import type { MockTestLanguage } from "../../utils/mockTestLanguage";
import { formatMarkFraction } from "../../utils/formatMarks";
import "./MockTests.css";

const MockTestInstructionsPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<IMockTest | null>(null);
  const [questions, setQuestions] = useState<IPublicMockTestQuestion[]>([]);
  const [attemptInfo, setAttemptInfo] = useState<IMyAttemptsForTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<MockTestLanguage>(getStoredMockTestLanguage());
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!testId) return;
    Promise.all([fetchTestForTaking(testId), fetchMyAttemptsForTest(testId)])
      .then(([testRes, attemptsRes]) => {
        setTest(testRes.data.test);
        setQuestions(testRes.data.questions);
        setAttemptInfo(attemptsRes.data);
      })
      .catch(() => setError("This test could not be found."))
      .finally(() => setLoading(false));
  }, [testId]);

  const handleLangChange = (l: MockTestLanguage) => {
    setLang(l);
    storeMockTestLanguage(l);
  };

  const handleRequestMore = async () => {
    if (!testId) return;
    setRequesting(true);
    try {
      await requestMoreAttempts(testId, reason || undefined);
      setRequestSent(true);
      toast.success("Request sent — an admin will review it.");
    } catch (err) {
      const message = String((err as Error)?.message || "");
      toast.error(message.includes("ATTEMPTS_NOT_YET_EXHAUSTED") ? "You still have attempts remaining for this test." : "Failed to send request. Please try again.");
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" style={{ color: "var(--color-primary-text)" }} />
      </div>
    );
  }

  if (error || !test || !attemptInfo) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">{error || "Test not found."}</p>
        <Link to="/mock-tests">← Back to Mock Tests</Link>
      </div>
    );
  }

  const hasInProgress = attemptInfo.attempts.some((a) => a.status === "in_progress" && !a.is_practice);
  const limitReached = !hasInProgress && attemptInfo.attemptsUsed >= attemptInfo.maxAttempts;
  const submittedAttempts = attemptInfo.attempts.filter((a) => a.status === "submitted" && !a.is_practice);
  const notOpenYet = attemptInfo.scheduleState === "NOT_YET_OPEN";
  const closed = attemptInfo.scheduleState === "CLOSED";

  return (
    <div className="container py-4 mt-page mt-page--narrow">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
        <div className="mt-page-title-row">
          <span className="mt-page-icon-badge">📋</span>
          <BilingualText as="h1" className="mt-page-title" en={test.title_en} hi={test.title_hi} lang={lang} />
        </div>
        <LanguageToggle value={lang} onChange={handleLangChange} />
      </div>

      <div className="mt-instructions-card">
        <h3>Instructions</h3>
        <ul>
          <li>This test has <b>{questions.length} questions</b> and a duration of <b>{test.duration_minutes} minutes</b>.</li>
          <li>Each correct answer gets <b>+{formatMarkFraction(test.marks_per_correct)} mark(s)</b>; each wrong answer deducts <b>-{formatMarkFraction(test.negative_marks_per_wrong)} mark(s)</b>. Unanswered questions score 0.</li>
          <li>The timer starts the moment you click "Start Test" and keeps running even if you close this tab — reopening it resumes the same attempt with the time already elapsed, not a fresh timer.</li>
          <li>Once started, you can't cancel or exit without submitting — the test auto-submits when time runs out.</li>
          <li>You can navigate freely between questions and change your answers until you submit.</li>
          <li>After submitting, you'll see your score, a section-wise breakdown, and your percentile compared to everyone else who has taken this test.</li>
          {test.sections.length > 0 && <li>Sections covered: {test.sections.join(", ")}.</li>}
          {test.section_durations && Object.keys(test.section_durations).length > 0 && (
            <li>
              This test is <b>section-timed</b>: each section has its own countdown (
              {test.sections.map((s, i) => (
                <React.Fragment key={s}>
                  {i > 0 && ", "}
                  <b>{s}: {test.section_durations![s]} min</b>
                </React.Fragment>
              ))}
              , total {test.duration_minutes} min). Once a section's time is up, you're automatically moved to the next one — you can also finish a
              section early, but you <b>cannot go back</b> to a previous section once you've left it.
            </li>
          )}
        </ul>

        <div className="mt-info-banner" style={{ marginTop: 16 }}>
          Attempts used: <b>{attemptInfo.attemptsUsed}</b> / {attemptInfo.maxAttempts}
        </div>

        {notOpenYet && test.available_from && (
          <p className="text-muted mt-3">This test opens on <b>{new Date(test.available_from).toLocaleString("en-IN")}</b>.</p>
        )}
        {closed && test.available_to && (
          <p className="text-muted mt-3">This test closed on <b>{new Date(test.available_to).toLocaleString("en-IN")}</b>.</p>
        )}

        {hasInProgress ? (
          <button className="mt-series-card-btn mt-start-btn" onClick={() => navigate(`/mock-tests/tests/${encodeURIComponent(test.sk!)}/take`)}>
            Resume Test
          </button>
        ) : notOpenYet || closed ? null : limitReached ? (
          requestSent ? (
            <p className="text-muted mt-3">Your request has been sent. You'll be able to start a new attempt once an admin approves it.</p>
          ) : (
            <div className="mt-3">
              <p className="text-muted mb-2">You've used all {attemptInfo.maxAttempts} of your attempts for this test.</p>
              <textarea
                className="mt-question-panel mb-2"
                style={{ width: "100%", padding: 10, borderRadius: 8 }}
                rows={2}
                placeholder="Optional note for the admin (why you need another attempt)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button className="mt-nav-btn" disabled={requesting} onClick={handleRequestMore}>
                {requesting ? "Sending..." : "Request More Attempts"}
              </button>
            </div>
          )
        ) : (
          <button className="mt-series-card-btn mt-start-btn" onClick={() => navigate(`/mock-tests/tests/${encodeURIComponent(test.sk!)}/take`)}>
            Start Test
          </button>
        )}
      </div>

      <div className="mt-instructions-card mt-3">
        <h3>Practice Mode</h3>
        <p className="text-muted mb-2">
          Same timer as the real test, but it doesn't count toward your attempt limit and isn't ranked against other students — just for practice.
        </p>
        <div className="d-flex flex-wrap gap-2">
          <button className="mt-nav-btn" onClick={() => navigate(`/mock-tests/tests/${encodeURIComponent(test.sk!)}/take?practice=true`)}>
            Practice Full Test
          </button>
          {test.sections.map((s) => (
            <button
              key={s}
              className="mt-nav-btn"
              onClick={() => navigate(`/mock-tests/tests/${encodeURIComponent(test.sk!)}/take?practice=true&section=${encodeURIComponent(s)}`)}
            >
              Practice: {s}
            </button>
          ))}
        </div>
      </div>

      {submittedAttempts.length > 0 && (
        <>
          <h3 className="mt-4">Your Previous Attempts</h3>
          <div className="mt-test-list">
            {submittedAttempts.map((a) => (
              <Link key={a.sk} to={`/mock-tests/attempts/${encodeURIComponent(a.sk!)}`} className="mt-test-row mt-attempt-row">
                <div className="mt-test-row-main">
                  <div className="mt-test-row-title">Score: {a.score} / {a.total_marks}</div>
                  <div className="mt-test-row-meta">
                    Percentile: {a.percentile}% &nbsp;·&nbsp; {new Date(a.submitted_at!).toLocaleString("en-IN")}
                  </div>
                </div>
                <span className="mt-attempt-view">View Result →</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MockTestInstructionsPage;
