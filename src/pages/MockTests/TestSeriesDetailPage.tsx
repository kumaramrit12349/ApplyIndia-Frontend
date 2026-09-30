import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchSeriesDetail, fetchMyAttemptsForTest } from "../../services/private/mockTestApi";
import type { ITestSeries } from "../../services/private/testSeriesAdminApi";
import type { IMockTest } from "../../services/private/mockTestAdminApi";
import type { IMyAttemptsForTest } from "../../services/private/mockTestApi";
import BilingualText from "../../components/MockTest/BilingualText";
import LanguageToggle from "../../components/MockTest/LanguageToggle";
import { getStoredMockTestLanguage, storeMockTestLanguage } from "../../utils/mockTestLanguage";
import type { MockTestLanguage } from "../../utils/mockTestLanguage";
import { formatMarkFraction } from "../../utils/formatMarks";
import "./MockTests.css";

const TestSeriesDetailPage: React.FC = () => {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();
  const [series, setSeries] = useState<ITestSeries | null>(null);
  const [tests, setTests] = useState<IMockTest[]>([]);
  const [attemptInfoByTest, setAttemptInfoByTest] = useState<Record<string, IMyAttemptsForTest>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<MockTestLanguage>(getStoredMockTestLanguage());

  useEffect(() => {
    if (!seriesId) return;
    fetchSeriesDetail(seriesId)
      .then(async (res) => {
        setSeries(res.data.series);
        setTests(res.data.tests);
        // One call per test — fine at this feature's scale (a handful of tests per series), same tradeoff used elsewhere in this app.
        const entries = await Promise.all(
          res.data.tests.map(async (t) => {
            try {
              const info = await fetchMyAttemptsForTest(t.sk!);
              return [t.sk!, info.data] as const;
            } catch {
              return null;
            }
          })
        );
        const map: Record<string, IMyAttemptsForTest> = {};
        for (const entry of entries) {
          if (entry) map[entry[0]] = entry[1];
        }
        setAttemptInfoByTest(map);
      })
      .catch(() => setError("This test series could not be found."))
      .finally(() => setLoading(false));
  }, [seriesId]);

  const handleLangChange = (l: MockTestLanguage) => {
    setLang(l);
    storeMockTestLanguage(l);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <span className="spinner-border" style={{ color: "var(--color-primary-text)" }} />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted">{error || "Series not found."}</p>
        <Link to="/mock-tests">← Back to Mock Tests</Link>
      </div>
    );
  }

  return (
    <div className="container py-4 mt-page">
      <Link to="/mock-tests" className="mt-back-link">← All Test Series</Link>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mt-3 mb-4">
        <div className="mt-page-title-row">
          <span className="mt-page-icon-badge">📘</span>
          <div>
            <BilingualText as="h1" className="mt-page-title" en={series.title_en} hi={series.title_hi} lang={lang} />
            {(series.description_en || series.description_hi) && (
              <BilingualText en={series.description_en || ""} hi={series.description_hi} lang={lang} as="p" className="text-muted mb-0" />
            )}
          </div>
        </div>
        <LanguageToggle value={lang} onChange={handleLangChange} />
      </div>

      {tests.length === 0 ? (
        <div className="mt-empty">
          <div style={{ fontSize: 40 }}>📭</div>
          <b>No tests published in this series yet.</b>
        </div>
      ) : (
        <div className="mt-test-list">
          {tests.map((t) => {
            const info = attemptInfoByTest[t.sk!];
            const hasInProgress = info?.attempts.some((a) => a.status === "in_progress" && !a.is_practice);
            const limitReached = info && !hasInProgress && info.attemptsUsed >= info.maxAttempts;
            const goToTest = () => navigate(`/mock-tests/tests/${encodeURIComponent(t.sk!)}/instructions`);

            let buttonLabel = "Start Test";
            let buttonClass = "mt-series-card-btn mt-test-row-btn";
            if (hasInProgress) buttonLabel = "Resume Test";
            else if (limitReached) {
              buttonLabel = "Attempts Used";
              buttonClass = "mt-nav-btn mt-test-row-btn";
            }

            return (
              <div key={t.sk} className="mt-test-row">
                <div className="mt-test-row-main">
                  <BilingualText as="h3" className="mt-test-row-title" en={t.title_en} hi={t.title_hi} lang={lang} />
                  <div className="mt-test-row-meta">
                    ⏱ {t.duration_minutes} min &nbsp;·&nbsp; +{formatMarkFraction(t.marks_per_correct)} / -{formatMarkFraction(t.negative_marks_per_wrong)} marking
                    {t.sections.length > 0 && <>&nbsp;·&nbsp; {t.sections.join(", ")}</>}
                    {info && (
                      <>
                        &nbsp;·&nbsp; Attempts: {info.attemptsUsed}/{info.maxAttempts}
                      </>
                    )}
                  </div>
                </div>
                <button className={buttonClass} onClick={goToTest}>
                  {buttonLabel}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TestSeriesDetailPage;
