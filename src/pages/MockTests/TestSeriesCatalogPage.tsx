import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPublishedSeries } from "../../services/private/mockTestApi";
import type { IPublicTestSeries } from "../../services/private/mockTestApi";
import LanguageToggle from "../../components/MockTest/LanguageToggle";
import BilingualText from "../../components/MockTest/BilingualText";
import { getStoredMockTestLanguage, storeMockTestLanguage } from "../../utils/mockTestLanguage";
import type { MockTestLanguage } from "../../utils/mockTestLanguage";
import "./MockTests.css";

const humanizeExamTag = (tag: string) => tag.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const TestSeriesCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState<IPublicTestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState("all");
  const [lang, setLang] = useState<MockTestLanguage>(getStoredMockTestLanguage());

  useEffect(() => {
    fetchPublishedSeries()
      .then((res) => setSeries(res.results || []))
      .finally(() => setLoading(false));
  }, []);

  const handleLangChange = (l: MockTestLanguage) => {
    setLang(l);
    storeMockTestLanguage(l);
  };

  const examTags = useMemo(() => Array.from(new Set(series.map((s) => s.exam_tag))), [series]);
  const visibleSeries = examFilter === "all" ? series : series.filter((s) => s.exam_tag === examFilter);

  return (
    <div className="container py-4 mt-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        <div className="mt-page-title-row">
          <span className="mt-page-icon-badge">📝</span>
          <div>
            <h1 className="mt-page-title">Mock Tests</h1>
            <p className="text-muted mb-0">Practice with full-length and sectional mock tests, free for everyone.</p>
          </div>
        </div>
        <LanguageToggle value={lang} onChange={handleLangChange} />
      </div>

      {examTags.length > 1 && (
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            className={`mt-exam-pill ${examFilter === "all" ? "mt-exam-pill--active" : ""}`}
            onClick={() => setExamFilter("all")}
          >
            All Exams
          </button>
          {examTags.map((tag) => (
            <button
              key={tag}
              className={`mt-exam-pill ${examFilter === tag ? "mt-exam-pill--active" : ""}`}
              onClick={() => setExamFilter(tag)}
            >
              {humanizeExamTag(tag)}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <span className="spinner-border" style={{ color: "var(--color-primary-text)" }} />
        </div>
      ) : visibleSeries.length === 0 ? (
        <div className="mt-empty">
          <div style={{ fontSize: 40 }}>📭</div>
          <b>No mock test series available yet.</b>
          <p className="text-muted mb-0">Check back soon — new test series are added regularly.</p>
        </div>
      ) : (
        <div className="row g-3">
          {visibleSeries.map((s) => (
            <div key={s.sk} className="col-12 col-sm-6 col-lg-3">
              <div className="mt-series-card">
                <div className="mt-series-card-banner">
                  <span className="mt-series-card-icon">📘</span>
                  <span className="mt-series-card-new-badge">New</span>
                </div>
                <div className="mt-series-card-body">
                  <BilingualText as="h3" className="mt-series-card-title" en={s.title_en} hi={s.title_hi} lang={lang} />
                  <div className="mt-series-card-stat">
                    <b>{s.test_count}</b> Tests <span className="mt-series-card-free">· All Free</span>
                  </div>
                  <div className="mt-series-card-lang">🌐 English, हिंदी</div>
                  {s.test_title_previews.length > 0 && (
                    <ul className="mt-series-card-preview">
                      {s.test_title_previews.map((t, i) => (
                        <li key={i}>
                          <BilingualText en={t.title_en} hi={t.title_hi} lang={lang} />
                        </li>
                      ))}
                      {s.test_count > s.test_title_previews.length && (
                        <li className="mt-series-card-more">+{s.test_count - s.test_title_previews.length} more tests</li>
                      )}
                    </ul>
                  )}
                  <button className="mt-series-card-btn" onClick={() => navigate(`/mock-tests/series/${encodeURIComponent(s.sk!)}`)}>
                    View Test Series
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestSeriesCatalogPage;
