import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyAttempts } from "../../services/private/mockTestApi";
import type { IMockTestAttempt } from "../../services/private/mockTestApi";
import "./MockTests.css";

const MyMockTestAttemptsPage: React.FC = () => {
  const [attempts, setAttempts] = useState<IMockTestAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAttempts()
      .then((res) => setAttempts(res.results || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-4 mt-page">
      <div className="mt-page-title-row mb-3">
        <span className="mt-page-icon-badge">📊</span>
        <h1 className="mt-page-title">My Mock Test Attempts</h1>
      </div>
      {loading ? (
        <div className="text-center py-5">
          <span className="spinner-border" style={{ color: "var(--color-primary-text)" }} />
        </div>
      ) : attempts.length === 0 ? (
        <div className="mt-empty">
          <div style={{ fontSize: 40 }}>📝</div>
          <b>You haven't attempted any mock tests yet.</b>
          <Link to="/mock-tests" className="mt-series-card-btn mt-3 d-inline-block">Browse Mock Tests</Link>
        </div>
      ) : (
        <div className="mt-test-list">
          {attempts.map((a) => {
            const isSubmitted = a.status === "submitted";
            const practiceQuery = a.is_practice ? `?practice=true${a.practice_section ? `&section=${encodeURIComponent(a.practice_section)}` : ""}` : "";
            const to = isSubmitted
              ? `/mock-tests/attempts/${encodeURIComponent(a.sk!)}`
              : `/mock-tests/tests/${encodeURIComponent(a.test_id)}/take${practiceQuery}`;
            return (
              <Link key={a.sk} to={to} className="mt-test-row mt-attempt-row">
                <div className="mt-test-row-main">
                  <div className="mt-test-row-title">
                    {a.is_practice && <span className="mt-practice-badge me-2">Practice</span>}
                    {isSubmitted ? `Score: ${a.score} / ${a.total_marks}` : "In Progress"}
                  </div>
                  <div className="mt-test-row-meta">
                    {isSubmitted ? (
                      a.is_practice ? (
                        <>{new Date(a.submitted_at!).toLocaleString("en-IN")}</>
                      ) : (
                        <>Percentile: {a.percentile}% &nbsp;·&nbsp; {new Date(a.submitted_at!).toLocaleString("en-IN")}</>
                      )
                    ) : (
                      <>Started {new Date(a.started_at).toLocaleString("en-IN")}</>
                    )}
                  </div>
                </div>
                <span className="mt-attempt-view">{isSubmitted ? "View Result →" : "Resume →"}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyMockTestAttemptsPage;
