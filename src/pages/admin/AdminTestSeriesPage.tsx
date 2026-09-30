import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiX, FiEdit2, FiTrash2, FiUpload, FiPlus, FiEye, FiLayers, FiInbox, FiCheck } from "react-icons/fi";
import BackToDashboard from "../../components/BackToDashboard/BackToDashboard";
import LanguageToggle from "../../components/MockTest/LanguageToggle";
import BilingualText from "../../components/MockTest/BilingualText";
import { getStoredMockTestLanguage } from "../../utils/mockTestLanguage";
import type { MockTestLanguage } from "../../utils/mockTestLanguage";
import { groupBySection } from "../../utils/mockTestSections";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import {
  fetchAllTestSeries,
  createTestSeries,
  updateTestSeries,
  publishTestSeries,
  deleteTestSeries,
} from "../../services/private/testSeriesAdminApi";
import type { ITestSeries } from "../../services/private/testSeriesAdminApi";
import {
  fetchMockTestsForSeries,
  createMockTest,
  updateMockTest,
  publishMockTest,
  deleteMockTest,
  fetchQuestionsForTest,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  parseQuestionDocument,
  bulkAddQuestions,
  fetchTestPreview,
  bulkAssignSections,
  fetchAttemptRequests,
  approveAttemptRequest,
  rejectAttemptRequest,
} from "../../services/private/mockTestAdminApi";
import type {
  IMockTest,
  IMockTestQuestion,
  IParsedMockTestQuestion,
  IPreviewMockTestQuestion,
  ISectionRange,
  IMockTestAttemptRequest,
} from "../../services/private/mockTestAdminApi";
import "./AdminTestSeriesPage.css";
import "../MockTests/MockTests.css";
import { formatMarkFraction } from "../../utils/formatMarks";

const SAMPLE_DOCX_URL_WITH_SECTIONS = "/mock-test-sample-with-sections.docx";
const SAMPLE_DOCX_URL_WITHOUT_SECTIONS = "/mock-test-sample-without-sections.docx";
const SAMPLE_DOCX_URL_WITH_SECTIONS_BILINGUAL = "/mock-test-sample-with-sections-bilingual.docx";
const SAMPLE_DOCX_URL_WITHOUT_SECTIONS_BILINGUAL = "/mock-test-sample-without-sections-bilingual.docx";
const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

const NEGATIVE_MARKING_PRESETS: { key: string; label: string; fraction: number | null }[] = [
  { key: "none", label: "No negative marking", fraction: 0 },
  { key: "1/4", label: "− 1/4 of correct marks", fraction: 1 / 4 },
  { key: "1/3", label: "− 1/3 of correct marks", fraction: 1 / 3 },
  { key: "1/2", label: "− 1/2 of correct marks", fraction: 1 / 2 },
  { key: "1x", label: "− Same as correct marks", fraction: 1 },
  { key: "custom", label: "Custom value", fraction: null },
];

/** Reverse-maps a saved (marksCorrect, marksWrong) pair back to a preset key, so editing an existing test shows the right preset instead of always falling back to "Custom". */
function inferNegativeMarkingMode(marksCorrect: number, marksWrong: number): string {
  if (!marksCorrect) return marksWrong === 0 ? "none" : "custom";
  const ratio = marksWrong / marksCorrect;
  const preset = NEGATIVE_MARKING_PRESETS.find((p) => p.fraction !== null && Math.abs(p.fraction - ratio) < 0.001);
  return preset ? preset.key : "custom";
}

/** `datetime-local` inputs work in the browser's local timezone string, not epoch ms — these convert at the form boundary only. */
function epochToDatetimeLocal(epoch?: number): string {
  if (!epoch) return "";
  const d = new Date(epoch);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToEpoch(value: string): number | undefined {
  if (!value) return undefined;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : undefined;
}
const EMPTY_OPTIONS: [string, string, string, string] = ["", "", "", ""];

interface Props {
  adminRole?: string;
}

type View = "series" | "tests" | "questions";

const AdminTestSeriesPage: React.FC<Props> = ({ adminRole }) => {
  const [view, setView] = useState<View>("series");
  const [loading, setLoading] = useState(false);

  const [allSeries, setAllSeries] = useState<ITestSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<ITestSeries | null>(null);
  const [testsInSeries, setTestsInSeries] = useState<IMockTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<IMockTest | null>(null);
  const [questions, setQuestions] = useState<IMockTestQuestion[]>([]);

  const [seriesModal, setSeriesModal] = useState<{ open: boolean; editing?: ITestSeries }>({ open: false });
  const [testModal, setTestModal] = useState<{ open: boolean; editing?: IMockTest }>({ open: false });
  const [questionModal, setQuestionModal] = useState<{ open: boolean; editing?: IMockTestQuestion }>({ open: false });
  const [importModal, setImportModal] = useState(false);
  const [sectionsModal, setSectionsModal] = useState(false);
  const [previewTestId, setPreviewTestId] = useState<string | null>(null);
  const [attemptRequestsTest, setAttemptRequestsTest] = useState<IMockTest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "series" | "test" | "question"; id: string; label: string } | null>(null);

  const loadSeries = () => {
    setLoading(true);
    fetchAllTestSeries()
      .then((res) => setAllSeries(res.results || []))
      .catch(() => toast.error("Failed to load test series"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSeries(); }, []);

  if (adminRole !== undefined && adminRole !== "admin" && adminRole !== "test_series_manager") return <Navigate to="/dashboard" replace />;

  const openSeries = (series: ITestSeries) => {
    setSelectedSeries(series);
    setSelectedTest(null); // leaving any specific test behind — otherwise its name lingers in the breadcrumb
    setView("tests");
    setLoading(true);
    fetchMockTestsForSeries(series.sk!)
      .then((res) => setTestsInSeries(res.results || []))
      .catch(() => toast.error("Failed to load tests"))
      .finally(() => setLoading(false));
  };

  const openTest = (test: IMockTest) => {
    setSelectedTest(test);
    setView("questions");
    setLoading(true);
    fetchQuestionsForTest(test.sk!)
      .then((res) => setQuestions(res.results || []))
      .catch(() => toast.error("Failed to load questions"))
      .finally(() => setLoading(false));
  };

  const reloadTests = () => selectedSeries && openSeries(selectedSeries);
  const reloadQuestions = () => selectedTest && openTest(selectedTest);

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "series") {
        await deleteTestSeries(deleteTarget.id);
        toast.success("Test series deleted");
        loadSeries();
      } else if (deleteTarget.type === "test") {
        await deleteMockTest(deleteTarget.id);
        toast.success("Test deleted");
        reloadTests();
      } else {
        await deleteQuestion(deleteTarget.id);
        toast.success("Question deleted");
        reloadQuestions();
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="ats-page">
      <div className="ats-header">
        <div className="ats-title-row">
          <span className="ats-title-icon-badge">📝</span>
          <div>
            <h1 className="ats-title">Mock Test Series</h1>
            <p className="ats-subtitle">Manage test series, tests, and questions for the Mock Tests feature.</p>
          </div>
        </div>
        <BackToDashboard />
      </div>

      <div className="ats-breadcrumb">
        <button
          className={`ats-crumb ${view === "series" ? "ats-crumb--active" : ""}`}
          onClick={() => { setSelectedSeries(null); setSelectedTest(null); setView("series"); }}
        >
          Test Series
        </button>
        {selectedSeries && (
          <>
            <span className="ats-crumb-sep">›</span>
            <button className={`ats-crumb ${view === "tests" ? "ats-crumb--active" : ""}`} onClick={() => openSeries(selectedSeries)}>
              {selectedSeries.title_en}
            </button>
          </>
        )}
        {selectedTest && (
          <>
            <span className="ats-crumb-sep">›</span>
            <button className={`ats-crumb ${view === "questions" ? "ats-crumb--active" : ""}`} onClick={() => openTest(selectedTest)}>
              {selectedTest.title_en}
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <span className="spinner-border" style={{ color: "var(--color-primary-text)" }} />
        </div>
      ) : view === "series" ? (
        <SeriesListView
          allSeries={allSeries}
          onOpen={openSeries}
          onEdit={(s) => setSeriesModal({ open: true, editing: s })}
          onNew={() => setSeriesModal({ open: true })}
          onPublishToggle={async (s) => { await publishTestSeries(s.sk!, !s.is_published); loadSeries(); }}
          onDelete={(s) => setDeleteTarget({ type: "series", id: s.sk!, label: s.title_en })}
        />
      ) : view === "tests" && selectedSeries ? (
        <TestsListView
          tests={testsInSeries}
          onOpen={openTest}
          onEdit={(t) => setTestModal({ open: true, editing: t })}
          onNew={() => setTestModal({ open: true })}
          onPublishToggle={async (t) => { await publishMockTest(t.sk!, !t.is_published); reloadTests(); }}
          onDelete={(t) => setDeleteTarget({ type: "test", id: t.sk!, label: t.title_en })}
          onPreview={(t) => setPreviewTestId(t.sk!)}
          onAttemptRequests={(t) => setAttemptRequestsTest(t)}
        />
      ) : view === "questions" && selectedTest ? (
        <QuestionsListView
          test={selectedTest}
          questions={questions}
          onEdit={(q) => setQuestionModal({ open: true, editing: q })}
          onNew={() => setQuestionModal({ open: true })}
          onImport={() => setImportModal(true)}
          onDivideIntoSections={() => setSectionsModal(true)}
          onDelete={(q) => setDeleteTarget({ type: "question", id: q.sk!, label: q.question_en.slice(0, 40) })}
          onPreview={() => setPreviewTestId(selectedTest.sk!)}
        />
      ) : null}

      {seriesModal.open && (
        <SeriesFormModal
          editing={seriesModal.editing}
          onClose={() => setSeriesModal({ open: false })}
          onSaved={() => { setSeriesModal({ open: false }); loadSeries(); }}
        />
      )}

      {testModal.open && selectedSeries && (
        <TestFormModal
          seriesId={selectedSeries.sk!}
          editing={testModal.editing}
          onClose={() => setTestModal({ open: false })}
          onSaved={() => { setTestModal({ open: false }); reloadTests(); }}
        />
      )}

      {questionModal.open && selectedTest && (
        <QuestionFormModal
          test={selectedTest}
          editing={questionModal.editing}
          onClose={() => setQuestionModal({ open: false })}
          onSaved={() => { setQuestionModal({ open: false }); reloadQuestions(); }}
        />
      )}

      {importModal && selectedTest && (
        <ImportDocumentModal
          test={selectedTest}
          existingCount={questions.length}
          onClose={() => setImportModal(false)}
          onSaved={() => { setImportModal(false); reloadQuestions(); }}
        />
      )}

      {sectionsModal && selectedTest && (
        <SectionRangesModal
          test={selectedTest}
          questions={questions}
          questionCount={questions.length}
          onClose={() => setSectionsModal(false)}
          onSaved={() => { setSectionsModal(false); reloadQuestions(); }}
        />
      )}

      {previewTestId && <TestPreviewModal testId={previewTestId} onClose={() => setPreviewTestId(null)} />}

      {attemptRequestsTest && <AttemptRequestsModal test={attemptRequestsTest} onClose={() => setAttemptRequestsTest(null)} />}

      <ConfirmModal
        show={!!deleteTarget}
        title="Confirm Delete"
        message={`Are you sure you want to permanently delete "${deleteTarget?.label}"? This cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

/* ============================== Series list ============================== */

const SeriesListView: React.FC<{
  allSeries: ITestSeries[];
  onOpen: (s: ITestSeries) => void;
  onEdit: (s: ITestSeries) => void;
  onNew: () => void;
  onPublishToggle: (s: ITestSeries) => void;
  onDelete: (s: ITestSeries) => void;
}> = ({ allSeries, onOpen, onEdit, onNew, onPublishToggle, onDelete }) => (
  <div className="ats-card">
    <div className="ats-card-head">
      <h2 className="ats-card-title">All Test Series</h2>
      <button className="ats-btn ats-btn-primary" onClick={onNew}><FiPlus /> New Series</button>
    </div>
    {allSeries.length === 0 ? (
      <div className="ats-empty">No test series yet. Create your first one to get started.</div>
    ) : (
      <table className="ats-table table-stack">
        <thead><tr><th>Title</th><th>Exam Tag</th><th>Published</th><th>Actions</th></tr></thead>
        <tbody>
          {allSeries.map((s) => (
            <tr key={s.sk}>
              <td data-label="Title">
                <button className="ats-link" onClick={() => onOpen(s)}>{s.title_en}</button>
                {s.title_hi && <div className="ats-subtext">{s.title_hi}</div>}
              </td>
              <td data-label="Exam Tag">{s.exam_tag}</td>
              <td data-label="Published">
                <label className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={s.is_published} onChange={() => onPublishToggle(s)} />
                </label>
              </td>
              <td data-label="Actions" className="ats-actions">
                <button className="ats-icon-btn ats-icon-btn--edit" onClick={() => onEdit(s)}><FiEdit2 /></button>
                <button className="ats-icon-btn ats-icon-btn--danger" onClick={() => onDelete(s)}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

/* ============================== Tests list ============================== */

const TestsListView: React.FC<{
  tests: IMockTest[];
  onOpen: (t: IMockTest) => void;
  onEdit: (t: IMockTest) => void;
  onNew: () => void;
  onPublishToggle: (t: IMockTest) => void;
  onDelete: (t: IMockTest) => void;
  onPreview: (t: IMockTest) => void;
  onAttemptRequests: (t: IMockTest) => void;
}> = ({ tests, onOpen, onEdit, onNew, onPublishToggle, onDelete, onPreview, onAttemptRequests }) => (
  <div className="ats-card">
    <div className="ats-card-head">
      <h2 className="ats-card-title">Tests in this Series</h2>
      <button className="ats-btn ats-btn-primary" onClick={onNew}><FiPlus /> New Test</button>
    </div>
    {tests.length === 0 ? (
      <div className="ats-empty">No tests yet. Create the first test in this series.</div>
    ) : (
      <table className="ats-table table-stack">
        <thead><tr><th>Title</th><th>Duration</th><th>Marking</th><th>Max Attempts</th><th>Published</th><th>Actions</th></tr></thead>
        <tbody>
          {tests.map((t) => (
            <tr key={t.sk}>
              <td data-label="Title">
                <button className="ats-link" onClick={() => onOpen(t)}>{t.title_en}</button>
                {t.title_hi && <div className="ats-subtext">{t.title_hi}</div>}
              </td>
              <td data-label="Duration">{t.duration_minutes} min</td>
              <td data-label="Marking">+{formatMarkFraction(t.marks_per_correct)} / -{formatMarkFraction(t.negative_marks_per_wrong)}</td>
              <td data-label="Max Attempts">{t.max_attempts}</td>
              <td data-label="Published">
                <label className="form-check form-switch mb-0">
                  <input className="form-check-input" type="checkbox" checked={t.is_published} onChange={() => onPublishToggle(t)} />
                </label>
              </td>
              <td data-label="Actions" className="ats-actions">
                <button className="ats-icon-btn" onClick={() => onPreview(t)} title="Preview as an aspirant would see it"><FiEye /></button>
                <button className="ats-icon-btn" onClick={() => onAttemptRequests(t)} title="Review attempt increase requests"><FiInbox /></button>
                <button className="ats-icon-btn ats-icon-btn--edit" onClick={() => onEdit(t)}><FiEdit2 /></button>
                <button className="ats-icon-btn ats-icon-btn--danger" onClick={() => onDelete(t)}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

/* ============================== Questions list ============================== */

const QuestionsListView: React.FC<{
  test: IMockTest;
  questions: IMockTestQuestion[];
  onEdit: (q: IMockTestQuestion) => void;
  onNew: () => void;
  onImport: () => void;
  onPreview: () => void;
  onDivideIntoSections: () => void;
  onDelete: (q: IMockTestQuestion) => void;
}> = ({ questions, onEdit, onNew, onImport, onDelete, onPreview, onDivideIntoSections }) => (
  <div className="ats-card">
    <div className="ats-card-head">
      <h2 className="ats-card-title">Questions ({questions.length})</h2>
      <div className="d-flex flex-wrap gap-2">
        <button className="ats-btn" onClick={onPreview} disabled={questions.length === 0}><FiEye /> Preview Test</button>
        <button className="ats-btn" onClick={onDivideIntoSections} disabled={questions.length === 0}><FiLayers /> Divide into Sections</button>
        <button className="ats-btn" onClick={onImport}><FiUpload /> Upload PDF/DOC</button>
        <button className="ats-btn ats-btn-primary" onClick={onNew}><FiPlus /> Add Question</button>
      </div>
    </div>
    {questions.length === 0 ? (
      <div className="ats-empty">No questions yet. Add one at a time, or upload a PDF/DOC following the format rules.</div>
    ) : (
      <table className="ats-table table-stack">
        <thead><tr><th>#</th><th>Question</th><th>Section</th><th>Answer</th><th>Actions</th></tr></thead>
        <tbody>
          {questions.map((q, i) => (
            <tr key={q.sk}>
              <td data-label="#">{i + 1}</td>
              <td data-label="Question">
                {q.question_en}
                {q.question_hi && <div className="ats-subtext">{q.question_hi}</div>}
              </td>
              <td data-label="Section">{q.section}</td>
              <td data-label="Answer">{OPTION_LETTERS[q.correct_option_index]}</td>
              <td data-label="Actions" className="ats-actions">
                <button className="ats-icon-btn ats-icon-btn--edit" onClick={() => onEdit(q)}><FiEdit2 /></button>
                <button className="ats-icon-btn ats-icon-btn--danger" onClick={() => onDelete(q)}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

/* ============================== Series form modal ============================== */

const SeriesFormModal: React.FC<{ editing?: ITestSeries; onClose: () => void; onSaved: () => void }> = ({ editing, onClose, onSaved }) => {
  const [examTag, setExamTag] = useState(editing?.exam_tag || "");
  const [titleEn, setTitleEn] = useState(editing?.title_en || "");
  const [titleHi, setTitleHi] = useState(editing?.title_hi || "");
  const [descEn, setDescEn] = useState(editing?.description_en || "");
  const [descHi, setDescHi] = useState(editing?.description_hi || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { exam_tag: examTag, title_en: titleEn, title_hi: titleHi, description_en: descEn, description_hi: descHi };
      if (editing) await updateTestSeries(editing.sk!, payload);
      else await createTestSeries(payload);
      toast.success(editing ? "Series updated" : "Series created");
      onSaved();
    } catch {
      toast.error("Failed to save series");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={editing ? "Edit Test Series" : "New Test Series"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="ats-label">Exam Tag (slug)</label>
          <input className="ats-input" value={examTag} onChange={(e) => setExamTag(e.target.value)} placeholder="e.g. bpsc-tre-4" required />
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="ats-label">Title (English)</label>
            <input className="ats-input" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="ats-label">Title (Hindi) — optional</label>
            <input className="ats-input" value={titleHi} onChange={(e) => setTitleHi(e.target.value)} />
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="ats-label">Description (English) — optional</label>
            <textarea className="ats-input" rows={3} value={descEn} onChange={(e) => setDescEn(e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="ats-label">Description (Hindi) — optional</label>
            <textarea className="ats-input" rows={3} value={descHi} onChange={(e) => setDescHi(e.target.value)} />
          </div>
        </div>
        <div className="ats-modal-footer">
          <button type="button" className="ats-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="ats-btn ats-btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </ModalShell>
  );
};

/* ============================== Test form modal ============================== */

const TestFormModal: React.FC<{ seriesId: string; editing?: IMockTest; onClose: () => void; onSaved: () => void }> = ({
  seriesId,
  editing,
  onClose,
  onSaved,
}) => {
  const [titleEn, setTitleEn] = useState(editing?.title_en || "");
  const [titleHi, setTitleHi] = useState(editing?.title_hi || "");
  const [duration, setDuration] = useState(editing?.duration_minutes || 60);
  const [marksCorrect, setMarksCorrect] = useState(editing?.marks_per_correct ?? 1);
  const [marksWrong, setMarksWrong] = useState(editing?.negative_marks_per_wrong ?? 0);
  const [negMode, setNegMode] = useState(() => inferNegativeMarkingMode(editing?.marks_per_correct ?? 1, editing?.negative_marks_per_wrong ?? 0));
  const [sections, setSections] = useState((editing?.sections || []).join(", "));
  const [sectionTimingEnabled, setSectionTimingEnabled] = useState(!!editing?.section_durations && Object.keys(editing.section_durations).length > 0);
  const [sectionDurations, setSectionDurations] = useState<Record<string, number>>(editing?.section_durations || {});
  const [maxAttempts, setMaxAttempts] = useState(editing?.max_attempts ?? 1);
  const [availableFrom, setAvailableFrom] = useState(epochToDatetimeLocal(editing?.available_from));
  const [availableTo, setAvailableTo] = useState(epochToDatetimeLocal(editing?.available_to));
  const [saving, setSaving] = useState(false);

  const sectionNames = sections.split(",").map((s) => s.trim()).filter(Boolean);

  useEffect(() => {
    const preset = NEGATIVE_MARKING_PRESETS.find((p) => p.key === negMode);
    if (preset && preset.fraction !== null) {
      setMarksWrong(Math.round(marksCorrect * preset.fraction * 10000) / 10000);
    }
  }, [negMode, marksCorrect]);

  // While section-wise timing is on, the overall duration is always the sum of the section durations — one source of truth, not two numbers that could silently disagree.
  useEffect(() => {
    if (!sectionTimingEnabled) return;
    const sum = sectionNames.reduce((total, name) => total + (sectionDurations[name] || 0), 0);
    if (sum > 0) setDuration(sum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionTimingEnabled, sectionDurations, sections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sectionTimingEnabled && (sectionNames.length === 0 || !sectionNames.every((name) => (sectionDurations[name] || 0) > 0))) {
      toast.error("Enter a time (in minutes) for every section, or turn off section-wise timing.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title_en: titleEn,
        title_hi: titleHi,
        duration_minutes: Number(duration),
        marks_per_correct: Number(marksCorrect),
        negative_marks_per_wrong: Number(marksWrong),
        sections: sectionNames,
        max_attempts: Number(maxAttempts),
        available_from: datetimeLocalToEpoch(availableFrom),
        available_to: datetimeLocalToEpoch(availableTo),
        section_durations:
          sectionTimingEnabled && sectionNames.length > 0 && sectionNames.every((name) => (sectionDurations[name] || 0) > 0)
            ? Object.fromEntries(sectionNames.map((name) => [name, sectionDurations[name]]))
            : undefined,
      };
      if (editing) await updateMockTest(editing.sk!, payload);
      else await createMockTest(seriesId, payload);
      toast.success(editing ? "Test updated" : "Test created");
      onSaved();
    } catch {
      toast.error("Failed to save test");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={editing ? "Edit Test" : "New Test"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="ats-label">Title (English)</label>
            <input className="ats-input" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} required />
          </div>
          <div className="col-md-6">
            <label className="ats-label">Title (Hindi) — optional</label>
            <input className="ats-input" value={titleHi} onChange={(e) => setTitleHi(e.target.value)} />
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="ats-label">Duration (minutes){sectionTimingEnabled && " — computed"}</label>
            <input
              type="number"
              min={1}
              className="ats-input"
              value={duration}
              disabled={sectionTimingEnabled}
              onChange={(e) => setDuration(Number(e.target.value))}
              required
            />
            {sectionTimingEnabled && <div className="ats-help">Sum of the section times below.</div>}
          </div>
          <div className="col-md-6">
            <label className="ats-label">Marks per correct</label>
            <input type="number" step="0.5" className="ats-input" value={marksCorrect} onChange={(e) => setMarksCorrect(Number(e.target.value))} required />
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="ats-label">Negative marking</label>
            <select className="ats-input" value={negMode} onChange={(e) => setNegMode(e.target.value)}>
              {NEGATIVE_MARKING_PRESETS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="ats-label">Negative marks per wrong</label>
            <input
              type="number"
              step="0.0001"
              min={0}
              className="ats-input"
              value={marksWrong}
              disabled={negMode !== "custom"}
              onChange={(e) => setMarksWrong(Number(e.target.value))}
            />
            {negMode !== "custom" && (
              <div className="ats-help">
                Computed as {marksCorrect} × {NEGATIVE_MARKING_PRESETS.find((p) => p.key === negMode)?.label.replace("−", "").trim().toLowerCase()} = {marksWrong}
              </div>
            )}
          </div>
        </div>
        <div className="mb-3">
          <label className="ats-label">Sections (comma-separated)</label>
          <input className="ats-input" value={sections} onChange={(e) => setSections(e.target.value)} placeholder="e.g. Teaching Aptitude, Child Development & Pedagogy" />
          <div className="ats-help">Drives the section-wise score breakdown, and optionally section-wise timing below.</div>
        </div>

        {sectionNames.length > 0 && (
          <div className="mb-3">
            <label className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={sectionTimingEnabled}
                onChange={(e) => setSectionTimingEnabled(e.target.checked)}
              />
              <span className="ms-2 ats-label" style={{ display: "inline", marginBottom: 0 }}>Enable section-wise timing (optional)</span>
            </label>
            {sectionTimingEnabled && (
              <>
                <div className="ats-help mb-2">
                  Each section gets its own countdown. Once a section's time runs out, students auto-advance to the next one and can't go back —
                  they can also finish a section early voluntarily.
                </div>
                <div className="row g-2">
                  {sectionNames.map((name) => (
                    <div className="col-md-4" key={name}>
                      <label className="ats-label">{name} (min)</label>
                      <input
                        type="number"
                        min={1}
                        className="ats-input"
                        value={sectionDurations[name] || ""}
                        onChange={(e) => setSectionDurations((prev) => ({ ...prev, [name]: Number(e.target.value) }))}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="mb-3">
          <label className="ats-label">Max attempts per student</label>
          <input type="number" min={1} className="ats-input" style={{ maxWidth: 160 }} value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} required />
          <div className="ats-help">A student can request more once they hit this — you can grant an increase to that student only, from the Attempt Requests screen.</div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="ats-label">Opens at — optional</label>
            <input type="datetime-local" className="ats-input" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
          </div>
          <div className="col-md-6">
            <label className="ats-label">Closes at — optional</label>
            <input type="datetime-local" className="ats-input" value={availableTo} onChange={(e) => setAvailableTo(e.target.value)} />
          </div>
          <div className="ats-help">Leave both blank for "always open once published." A student can't start (or start a new attempt) outside this window, but an already-started attempt can still be finished.</div>
        </div>
        <div className="ats-modal-footer">
          <button type="button" className="ats-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="ats-btn ats-btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </ModalShell>
  );
};

/* ============================== Divide into sections (bulk, by question range) ============================== */

/** Splits `total` questions into `count` roughly-even contiguous ranges, e.g. 150/3 -> 1-50, 51-100, 101-150 — a starting point the admin then fine-tunes (e.g. to 1-30, 31-70, 71-150). */
function makeEvenRanges(total: number, count: number, existingLabels: string[]): ISectionRange[] {
  const ranges: ISectionRange[] = [];
  const base = Math.floor(total / count);
  let from = 1;
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const to = isLast ? total : from + base - 1;
    ranges.push({ from, to, section: existingLabels[i] || `Section ${i + 1}` });
    from = to + 1;
  }
  return ranges;
}

/* ============================== Attempt increase requests ============================== */

const AttemptRequestsModal: React.FC<{ test: IMockTest; onClose: () => void }> = ({ test, onClose }) => {
  const [requests, setRequests] = useState<IMockTestAttemptRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantValues, setGrantValues] = useState<Record<string, number>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchAttemptRequests(test.sk!)
      .then((res) => setRequests(res.results || []))
      .catch(() => toast.error("Failed to load attempt requests"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (r: IMockTestAttemptRequest) => {
    const granted = grantValues[r.sk!] ?? test.max_attempts + 1;
    setBusyId(r.sk!);
    try {
      await approveAttemptRequest(r.sk!, granted);
      toast.success(`Granted ${granted} attempts to ${r.user_name || r.user_email || "this student"}`);
      load();
    } catch {
      toast.error("Failed to approve request");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (r: IMockTestAttemptRequest) => {
    setBusyId(r.sk!);
    try {
      await rejectAttemptRequest(r.sk!);
      toast.success("Request rejected");
      load();
    } catch {
      toast.error("Failed to reject request");
    } finally {
      setBusyId(null);
    }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <ModalShell title={`Attempt Requests: ${test.title_en}`} onClose={onClose} large>
      <div className="ats-help mb-3">
        Every student is capped at <b>{test.max_attempts}</b> attempt(s) by default. Approving a request here raises the
        limit for that student only — everyone else stays at {test.max_attempts}.
      </div>

      {loading ? (
        <div className="text-center py-4">
          <span className="spinner-border" style={{ color: "var(--color-primary-text)" }} />
        </div>
      ) : requests.length === 0 ? (
        <div className="ats-empty">No attempt requests for this test yet.</div>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <h6>Pending ({pending.length})</h6>
              <div className="ats-import-list mb-3">
                {pending.map((r) => (
                  <div key={r.sk} className="ats-import-row">
                    <div className="d-flex justify-content-between flex-wrap gap-2">
                      <div>
                        <b>{r.user_name || "Unnamed student"}</b> <span className="ats-subtext">{r.user_email}</span>
                        {r.reason && <div className="ats-subtext">"{r.reason}"</div>}
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="number"
                          min={test.max_attempts + 1}
                          className="ats-input"
                          style={{ width: 90 }}
                          value={grantValues[r.sk!] ?? test.max_attempts + 1}
                          onChange={(e) => setGrantValues((prev) => ({ ...prev, [r.sk!]: Number(e.target.value) }))}
                        />
                        <button className="ats-btn ats-btn-primary" disabled={busyId === r.sk} onClick={() => handleApprove(r)}>
                          <FiCheck /> Approve
                        </button>
                        <button className="ats-btn" disabled={busyId === r.sk} onClick={() => handleReject(r)}>
                          <FiX /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {resolved.length > 0 && (
            <>
              <h6>Resolved</h6>
              <table className="ats-table table-stack">
                <thead><tr><th>Student</th><th>Status</th><th>Granted</th></tr></thead>
                <tbody>
                  {resolved.map((r) => (
                    <tr key={r.sk}>
                      <td data-label="Student">{r.user_name || r.user_email || "Unnamed student"}</td>
                      <td data-label="Status" style={{ textTransform: "capitalize" }}>{r.status}</td>
                      <td data-label="Granted">{r.granted_max_attempts ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}

      <div className="ats-modal-footer">
        <button type="button" className="ats-btn" onClick={onClose}>Close</button>
      </div>
    </ModalShell>
  );
};

const SectionRangesModal: React.FC<{ test: IMockTest; questions: IMockTestQuestion[]; questionCount: number; onClose: () => void; onSaved: () => void }> = ({
  test,
  questions,
  questionCount,
  onClose,
  onSaved,
}) => {
  // Seed from each question's CURRENT section, not a blind even split — so
  // an admin revisiting this modal sees the sections as they actually are
  // today (e.g. after import, or a previous pass here) rather than losing
  // that layout to a fresh guess every time the modal opens.
  const [ranges, setRanges] = useState<ISectionRange[]>(() => {
    if (questions.length > 0) {
      return groupBySection(questions).map((g) => ({ from: g.start + 1, to: g.end + 1, section: g.section }));
    }
    return test.sections.length > 0
      ? makeEvenRanges(questionCount, test.sections.length, test.sections)
      : [{ from: 1, to: questionCount, section: "" }];
  });
  const [saving, setSaving] = useState(false);

  const applyPreset = (count: number) => setRanges(makeEvenRanges(questionCount, count, ranges.map((r) => r.section)));

  const updateRange = (i: number, updates: Partial<ISectionRange>) => setRanges((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...updates } : r)));

  const removeRange = (i: number) => setRanges((prev) => prev.filter((_, idx) => idx !== i));

  const addRange = () => {
    const lastTo = ranges.length > 0 ? ranges[ranges.length - 1].to : 0;
    setRanges((prev) => [...prev, { from: Math.min(lastTo + 1, questionCount), to: questionCount, section: `Section ${prev.length + 1}` }]);
  };

  const covered = new Set<number>();
  ranges.forEach((r) => { for (let n = r.from; n <= r.to && n <= questionCount; n++) covered.add(n); });
  const uncoveredCount = questionCount - covered.size;

  const isValid = ranges.every((r) => r.section.trim() && r.from >= 1 && r.to >= r.from && r.to <= questionCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("Check every range has a section name and a valid from/to.");
      return;
    }
    setSaving(true);
    try {
      await bulkAssignSections(test.sk!, ranges);
      toast.success(`Sections applied across ${covered.size} question(s)`);
      onSaved();
    } catch {
      toast.error("Failed to apply sections");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Divide into Sections" onClose={onClose} large>
      <div className="ats-help mb-3">
        This test has {questionCount} questions. Split them into 2, 3, 4 — or any number of — sections by question range (e.g. 1–30, 31–70,
        71–150), instead of tagging each question one at a time.
      </div>

      <div className="d-flex gap-2 mb-4">
        {[2, 3, 4].map((count) => (
          <button
            key={count}
            type="button"
            className={`ats-preset-pill ${ranges.length === count ? "ats-preset-pill--active" : ""}`}
            onClick={() => applyPreset(count)}
          >
            {count} Sections
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="ats-section-range-header d-none d-md-grid">
          <span>#</span>
          <span>From Q#</span>
          <span>To Q#</span>
          <span>Section name</span>
          <span />
        </div>
        <div className="ats-section-ranges mb-3">
          {ranges.map((r, i) => (
            <div className="ats-section-range-row" key={i}>
              <span className="ats-section-range-badge">{i + 1}</span>
              <input
                type="number"
                min={1}
                max={questionCount}
                className="ats-input"
                aria-label="From question number"
                value={r.from}
                onChange={(e) => updateRange(i, { from: Number(e.target.value) })}
              />
              <input
                type="number"
                min={1}
                max={questionCount}
                className="ats-input"
                aria-label="To question number"
                value={r.to}
                onChange={(e) => updateRange(i, { to: Number(e.target.value) })}
              />
              <input
                className="ats-input"
                aria-label="Section name"
                value={r.section}
                onChange={(e) => updateRange(i, { section: e.target.value })}
                placeholder="e.g. Hindi"
                required
              />
              <button
                type="button"
                className="ats-icon-btn ats-icon-btn--danger"
                disabled={ranges.length === 1}
                title="Remove range"
                onClick={() => removeRange(i)}
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="ats-link mb-3" onClick={addRange}>+ Add another range</button>

        {uncoveredCount > 0 && (
          <div className="ats-import-warning mb-3">⚠️ {uncoveredCount} question(s) are not covered by any range above and will keep their current section.</div>
        )}

        <div className="ats-modal-footer">
          <button type="button" className="ats-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="ats-btn ats-btn-primary" disabled={saving || !isValid}>{saving ? "Applying..." : "Apply Sections"}</button>
        </div>
      </form>
    </ModalShell>
  );
};

/* ============================== Question form modal (one at a time) ============================== */

const QuestionFormModal: React.FC<{ test: IMockTest; editing?: IMockTestQuestion; onClose: () => void; onSaved: () => void }> = ({
  test,
  editing,
  onClose,
  onSaved,
}) => {
  const [tab, setTab] = useState<"en" | "hi">("en");
  const [questionEn, setQuestionEn] = useState(editing?.question_en || "");
  const [questionHi, setQuestionHi] = useState(editing?.question_hi || "");
  const [optionsEn, setOptionsEn] = useState<[string, string, string, string]>(editing?.options_en || [...EMPTY_OPTIONS]);
  const [optionsHi, setOptionsHi] = useState<[string, string, string, string]>(editing?.options_hi || [...EMPTY_OPTIONS]);
  const [correctIndex, setCorrectIndex] = useState<0 | 1 | 2 | 3>(editing?.correct_option_index ?? 0);
  const [section, setSection] = useState(editing?.section || test.sections[0] || "");
  const [explanationEn, setExplanationEn] = useState(editing?.explanation_en || "");
  const [explanationHi, setExplanationHi] = useState(editing?.explanation_hi || "");
  const [saving, setSaving] = useState(false);

  const setOptionEn = (i: number, val: string) => setOptionsEn((prev) => { const next = [...prev] as typeof prev; next[i] = val; return next; });
  const setOptionHi = (i: number, val: string) => setOptionsHi((prev) => { const next = [...prev] as typeof prev; next[i] = val; return next; });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        question_en: questionEn,
        question_hi: questionHi || undefined,
        options_en: optionsEn,
        options_hi: optionsHi.some(Boolean) ? optionsHi : undefined,
        correct_option_index: correctIndex,
        section,
        order: editing?.order ?? Date.now(),
        explanation_en: explanationEn || undefined,
        explanation_hi: explanationHi || undefined,
      };
      if (editing) await updateQuestion(editing.sk!, payload);
      else await addQuestion(test.sk!, payload);
      toast.success(editing ? "Question updated" : "Question added");
      onSaved();
    } catch {
      toast.error("Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={editing ? "Edit Question" : "Add Question"} onClose={onClose} large>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="ats-label">Section</label>
          {test.sections.length > 0 ? (
            <select className="ats-input" value={section} onChange={(e) => setSection(e.target.value)} required>
              <option value="" disabled>Select a section</option>
              {test.sections.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <input className="ats-input" value={section} onChange={(e) => setSection(e.target.value)} required />
          )}
        </div>

        <div className="ats-lang-tabs">
          <button type="button" className={`ats-lang-tab ${tab === "en" ? "ats-lang-tab--active" : ""}`} onClick={() => setTab("en")}>English (required)</button>
          <button type="button" className={`ats-lang-tab ${tab === "hi" ? "ats-lang-tab--active" : ""}`} onClick={() => setTab("hi")}>Hindi (optional)</button>
        </div>

        {tab === "en" ? (
          <>
            <div className="mb-3">
              <label className="ats-label">Question</label>
              <textarea className="ats-input" rows={2} value={questionEn} onChange={(e) => setQuestionEn(e.target.value)} required />
            </div>
            {OPTION_LETTERS.map((letter, i) => (
              <div className="mb-2 d-flex align-items-center gap-2" key={letter}>
                <input type="radio" name="correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i as 0 | 1 | 2 | 3)} />
                <span className="ats-option-letter">{letter}</span>
                <input className="ats-input" value={optionsEn[i]} onChange={(e) => setOptionEn(i, e.target.value)} required placeholder={`Option ${letter}`} />
              </div>
            ))}
            <div className="ats-help mb-3">Select the radio button next to the correct option.</div>
            <label className="ats-label">Explanation (English) — optional, shown to students after they submit</label>
            <textarea className="ats-input" rows={2} value={explanationEn} onChange={(e) => setExplanationEn(e.target.value)} placeholder="Why this is the correct answer" />
          </>
        ) : (
          <>
            <div className="mb-3">
              <label className="ats-label">Question (Hindi)</label>
              <textarea className="ats-input" rows={2} value={questionHi} onChange={(e) => setQuestionHi(e.target.value)} placeholder="Leave blank to fall back to English" />
            </div>
            {OPTION_LETTERS.map((letter, i) => (
              <div className="mb-2 d-flex align-items-center gap-2" key={letter}>
                <span className="ats-option-letter">{letter}</span>
                <input className="ats-input" value={optionsHi[i]} onChange={(e) => setOptionHi(i, e.target.value)} placeholder={`Option ${letter} (Hindi)`} />
              </div>
            ))}
            <label className="ats-label mt-2">Explanation (Hindi) — optional</label>
            <textarea className="ats-input" rows={2} value={explanationHi} onChange={(e) => setExplanationHi(e.target.value)} placeholder="Leave blank to fall back to English" />
          </>
        )}

        <div className="ats-modal-footer">
          <button type="button" className="ats-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="ats-btn ats-btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </ModalShell>
  );
};

/* ============================== Import PDF/DOC modal ============================== */

const ImportDocumentModal: React.FC<{ test: IMockTest; existingCount: number; onClose: () => void; onSaved: () => void }> = ({
  test,
  onClose,
  onSaved,
}) => {
  const [parsed, setParsed] = useState<IParsedMockTestQuestion[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRules, setShowRules] = useState(true);
  const [reviewLang, setReviewLang] = useState<MockTestLanguage>("both");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const res = await parseQuestionDocument(file);
      setParsed(res.data);
      if (res.data.length === 0) toast.warning("No questions could be extracted — check the file follows the format rules.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to parse document");
    } finally {
      setParsing(false);
    }
  };

  const updateParsed = (index: number, updates: Partial<IParsedMockTestQuestion>) => {
    setParsed((prev) => prev!.map((q, i) => (i === index ? { ...q, ...updates } : q)));
  };

  const removeParsed = (index: number) => {
    setParsed((prev) => prev!.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (!parsed || parsed.length === 0) return;
    setSaving(true);
    try {
      await bulkAddQuestions(test.sk!, parsed);
      toast.success(`${parsed.length} question(s) added`);
      onSaved();
    } catch {
      toast.error("Failed to save imported questions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Upload PDF/DOC to Generate Questions" onClose={onClose} large>
      <div className="ats-import-panel">
        <button type="button" className="ats-link" onClick={() => setShowRules((v) => !v)}>
          {showRules ? "Hide" : "Show"} format rules
        </button>
        {showRules && (
          <div className="ats-rules-box">
            <ol>
              <li>Plain text, single column — no tables/text-boxes/multi-column layout/equations-as-images.</li>
              <li><code>Q1.</code> starts a question, English text on the same line.</li>
              <li>A line starting with <code>[HI]</code> is the Hindi translation of the line above it — optional.</li>
              <li>Four option lines: <code>(A)</code> <code>(B)</code> <code>(C)</code> <code>(D)</code>, each with an optional <code>[HI]</code> line after.</li>
              <li>Every question ends with <code>[ANSWER: X]</code>.</li>
              <li>An optional <code>[EXPLANATION: text]</code> line right after the answer (with its own optional <code>[HI]</code> line) is shown to students after they submit.</li>
              <li><code>[SECTION: Name]</code> applies to every question after it until the next one.</li>
              <li>If exporting via "Print to PDF" from Word/Google Docs, turn off headers/footers (page URL, date, page numbers) — that text can bleed into the last line on each page and get merged into a question.</li>
            </ol>
          </div>
        )}
        <div className="mb-1 ats-help">English-only samples:</div>
        <div className="d-flex flex-wrap gap-3 mb-3">
          <a href={SAMPLE_DOCX_URL_WITH_SECTIONS} target="_blank" rel="noopener noreferrer" className="ats-link">📄 With Sections</a>
          <a href={SAMPLE_DOCX_URL_WITHOUT_SECTIONS} target="_blank" rel="noopener noreferrer" className="ats-link">📄 Without Sections</a>
        </div>
        <div className="mb-1 ats-help">Bilingual samples, English + Hindi:</div>
        <div className="d-flex flex-wrap gap-3 mb-3">
          <a href={SAMPLE_DOCX_URL_WITH_SECTIONS_BILINGUAL} target="_blank" rel="noopener noreferrer" className="ats-link">📄 With Sections</a>
          <a href={SAMPLE_DOCX_URL_WITHOUT_SECTIONS_BILINGUAL} target="_blank" rel="noopener noreferrer" className="ats-link">📄 Without Sections</a>
        </div>

        {!parsed && (
          <div className="mb-3">
            <input type="file" accept=".pdf,.doc,.docx" className="ats-input" onChange={handleFile} disabled={parsing} />
            {parsing && <div className="ats-help">Extracting questions...</div>}
          </div>
        )}

        {parsed && (
          <>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
              <div className="ats-help mb-0">
                Review each question below before confirming — nothing is saved yet. Extraction is best-effort; fix anything that looks wrong.
              </div>
              <LanguageToggle value={reviewLang} onChange={setReviewLang} />
            </div>
            <div className="ats-import-list">
              {parsed.map((q, i) => (
                <div key={i} className="ats-import-row">
                  {q.warning && <div className="ats-import-warning">⚠️ {q.warning}</div>}
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <input
                      className="ats-input ats-import-section"
                      value={q.section}
                      onChange={(e) => updateParsed(i, { section: e.target.value })}
                      placeholder="Section"
                    />
                    <button type="button" className="ats-icon-btn ats-icon-btn--danger" onClick={() => removeParsed(i)}><FiX /></button>
                  </div>
                  {reviewLang !== "hi" && (
                    <textarea
                      className="ats-input mb-1"
                      rows={2}
                      value={q.question_en}
                      onChange={(e) => updateParsed(i, { question_en: e.target.value })}
                      placeholder="Question (English)"
                    />
                  )}
                  {reviewLang !== "en" && (
                    <textarea
                      className="ats-input mb-2 ats-import-hi"
                      rows={2}
                      value={q.question_hi || ""}
                      onChange={(e) => updateParsed(i, { question_hi: e.target.value || undefined })}
                      placeholder="Question (Hindi) — leave blank to fall back to English"
                    />
                  )}
                  {OPTION_LETTERS.map((letter, oi) => (
                    <div className="mb-2 d-flex align-items-start gap-2" key={letter}>
                      <input
                        type="radio"
                        name={`correct-${i}`}
                        className="mt-2"
                        checked={q.correct_option_index === oi}
                        onChange={() => updateParsed(i, { correct_option_index: oi as 0 | 1 | 2 | 3 })}
                      />
                      <span className="ats-option-letter mt-2">{letter}</span>
                      <div className="flex-grow-1">
                        {reviewLang !== "hi" && (
                          <input
                            className="ats-input mb-1"
                            value={q.options_en[oi]}
                            placeholder={`Option ${letter} (English)`}
                            onChange={(e) => {
                              const next = [...q.options_en] as [string, string, string, string];
                              next[oi] = e.target.value;
                              updateParsed(i, { options_en: next });
                            }}
                          />
                        )}
                        {reviewLang !== "en" && (
                          <input
                            className="ats-input ats-import-hi"
                            value={q.options_hi?.[oi] || ""}
                            placeholder={`Option ${letter} (Hindi) — optional`}
                            onChange={(e) => {
                              const next = [...(q.options_hi || EMPTY_OPTIONS)] as [string, string, string, string];
                              next[oi] = e.target.value;
                              updateParsed(i, { options_hi: next.some(Boolean) ? next : undefined });
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {reviewLang !== "hi" && (
                    <textarea
                      className="ats-input mt-1"
                      rows={2}
                      value={q.explanation_en || ""}
                      onChange={(e) => updateParsed(i, { explanation_en: e.target.value || undefined })}
                      placeholder="Explanation (English) — optional"
                    />
                  )}
                  {reviewLang !== "en" && (
                    <textarea
                      className="ats-input ats-import-hi mt-1"
                      rows={2}
                      value={q.explanation_hi || ""}
                      onChange={(e) => updateParsed(i, { explanation_hi: e.target.value || undefined })}
                      placeholder="Explanation (Hindi) — optional"
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="ats-modal-footer">
        <button type="button" className="ats-btn" onClick={onClose}>Cancel</button>
        {parsed && (
          <button type="button" className="ats-btn ats-btn-primary" disabled={saving || parsed.length === 0} onClick={handleConfirm}>
            {saving ? "Saving..." : `Confirm & Add ${parsed.length} Question(s)`}
          </button>
        )}
      </div>
    </ModalShell>
  );
};

/* ============================== Preview (how aspirants will see it) ============================== */

const TestPreviewModal: React.FC<{ testId: string; onClose: () => void }> = ({ testId, onClose }) => {
  const [test, setTest] = useState<IMockTest | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<IPreviewMockTestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [lang, setLang] = useState<MockTestLanguage>(getStoredMockTestLanguage());

  useEffect(() => {
    fetchTestPreview(testId)
      .then((res) => {
        setTest(res.data.test);
        setPreviewQuestions(res.data.questions);
      })
      .catch(() => toast.error("Failed to load preview"))
      .finally(() => setLoading(false));
  }, [testId]);

  const question = previewQuestions[currentIndex];
  const sectionGroups = groupBySection(previewQuestions);

  return (
    <ModalShell title={test ? `Preview: ${test.title_en}` : "Preview"} onClose={onClose} xl>
      {loading ? (
        <div className="text-center py-5">
          <span className="spinner-border" style={{ color: "var(--color-primary-text)" }} />
        </div>
      ) : !test ? (
        <div className="ats-empty">This test could not be loaded.</div>
      ) : (
        <div className="mt-page">
          <div className="ats-preview-banner">
            👁 This is exactly what an aspirant will see{!test.is_published && " once this test is published"} — selections here are just for preview and are not saved.
          </div>
          <div className="mt-taking-header">
            <span className="mt-taking-title">
              ⏱ {test.duration_minutes} min &nbsp;·&nbsp; +{formatMarkFraction(test.marks_per_correct)} / -{formatMarkFraction(test.negative_marks_per_wrong)} marking &nbsp;·&nbsp; {previewQuestions.length} questions
            </span>
            <LanguageToggle value={lang} onChange={setLang} />
          </div>

          {test.section_durations && Object.keys(test.section_durations).length > 0 && (
            <div className="ats-help mb-3">
              🔒 Section-wise timing:{" "}
              {test.sections.map((s, i) => (
                <React.Fragment key={s}>
                  {i > 0 && " · "}
                  <b>{s}: {test.section_durations![s]} min</b>
                </React.Fragment>
              ))}
              {" "}— each section auto-advances to the next when its time is up; students can't go back once they leave a section.
            </div>
          )}

          {previewQuestions.length === 0 ? (
            <div className="ats-empty">No questions yet — add some to preview the test.</div>
          ) : (
            <div className="mt-taking-body">
              <div className="mt-question-panel">
                {sectionGroups.length > 1 && (
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
                )}
                <div className="mt-question-progress">
                  Question {currentIndex + 1} of {previewQuestions.length} &nbsp;·&nbsp; {question.section}
                </div>
                <BilingualText en={question.question_en} hi={question.question_hi} lang={lang} as="h3" className="mt-question-text" />
                <div className="mt-options">
                  {OPTION_LETTERS.map((letter, i) => {
                    const isSelected = selected[question.sk!] === i;
                    return (
                      <button
                        key={letter}
                        type="button"
                        className={`mt-option ${isSelected ? "mt-option--selected" : ""}`}
                        onClick={() => setSelected((prev) => ({ ...prev, [question.sk!]: i }))}
                      >
                        <span className="mt-option-letter">{letter}</span>
                        <BilingualText en={question.options_en[i]} hi={question.options_hi?.[i]} lang={lang} />
                      </button>
                    );
                  })}
                </div>
                <div className="mt-question-nav">
                  <button className="mt-nav-btn" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}>
                    ← Previous
                  </button>
                  <button
                    className="mt-nav-btn mt-nav-btn--primary"
                    disabled={currentIndex === previewQuestions.length - 1}
                    onClick={() => setCurrentIndex((i) => Math.min(previewQuestions.length - 1, i + 1))}
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div className="mt-palette-panel">
                <div className="mt-palette-summary">
                  <b>{Object.keys(selected).length}</b> / {previewQuestions.length} answered
                </div>
                {sectionGroups.map((g) => (
                  <div key={g.start} className="mb-2">
                    {sectionGroups.length > 1 && <div className="mt-palette-section-label">{g.section}</div>}
                    <div className="mt-palette-grid">
                      {previewQuestions.slice(g.start, g.end + 1).map((q, offset) => {
                        const i = g.start + offset;
                        return (
                          <button
                            key={q.sk}
                            className={`mt-palette-cell ${i === currentIndex ? "mt-palette-cell--current" : ""} ${
                              selected[q.sk!] !== undefined ? "mt-palette-cell--answered" : ""
                            }`}
                            onClick={() => setCurrentIndex(i)}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ats-modal-footer">
            <button type="button" className="ats-btn" onClick={onClose}>Exit Preview</button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};

/* ============================== Shared modal shell ============================== */

const ModalShell: React.FC<{ title: string; onClose: () => void; large?: boolean; xl?: boolean; children: React.ReactNode }> = ({
  title,
  onClose,
  large,
  xl,
  children,
}) => (
  <>
    <div className="modal-backdrop fade show" onClick={onClose}></div>
    <div className="modal fade show d-block" tabIndex={-1} role="dialog">
      <div className={`modal-dialog modal-dialog-centered ${xl ? "modal-xl" : large ? "modal-lg" : ""}`}>
        <div className="modal-content ats-modal-content">
          <div className="ats-modal-header">
            <h5 className="ats-modal-title">{title}</h5>
            <button type="button" onClick={onClose} className="ats-btn-link" aria-label="Close"><FiX size={14} /> Close</button>
          </div>
          <div className="modal-body ats-modal-body">{children}</div>
        </div>
      </div>
    </div>
  </>
);

export default AdminTestSeriesPage;
