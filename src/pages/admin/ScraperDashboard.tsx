import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiEye, FiEdit2, FiRefreshCw, FiAlertTriangle, FiArchive, FiKey, FiType, FiGlobe, FiZap } from "react-icons/fi";
import {
  getScraperSources,
  getScraperStatus,
  previewScraperSite,
  triggerScraperRun,
  createScraperSource,
  updateScraperSource,
  deleteScraperSource,
  permanentlyDeleteScraperSource,
  bulkDeleteScraperSources,
  bulkUpdateScraperSourcesStatus,
  unarchiveScraperSource,
} from "../../services/private/scraperApi";
import type {
  ScraperPreviewItem,
  ScraperRunSummary,
  ScraperSource,
} from "../../services/private/scraperApi";
import Toast from "../../components/Toast/Toast";

/* ─── helpers ────────────────────────────────────────────────── */

const CATEGORY_EMOJI: Record<string, string> = {
  job: "💼",
  "entrance-exam": "📝",
  admission: "🎓",
  result: "📊",
  "admit-card": "🪪",
  "answer-key": "🔑",
  syllabus: "📚",
  scholarship: "🏆",
};

const CATEGORY_LABELS: Record<string, string> = {
  job: "Jobs",
  "entrance-exam": "Entrance Exams",
  admission: "Admissions",
  result: "Results",
  "admit-card": "Admit Cards",
  "answer-key": "Answer Keys",
  syllabus: "Syllabus",
  scholarship: "Scholarships",
};

const fmtTime = (epoch: number | null | undefined) => {
  if (!epoch) return "—";
  return new Date(epoch).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const elapsed = (start: number, end: number) => {
  const s = Math.round((end - start) / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

/* ─── sub-components ─────────────────────────────────────────── */

const StatCard: React.FC<{
  label: string;
  value: number | string;
  color: string;
  icon: string;
}> = ({ label, value, color, icon }) => (
  <div
    style={{
      background: "var(--color-surface)",
      borderRadius: 16,
      padding: "1rem 1.25rem",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      borderLeft: `4px solid ${color}`,
      flex: 1,
      minWidth: 0,
      transition: "transform 0.2s ease",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >
    <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
    <div style={{ fontSize: "1.6rem", fontWeight: 700, color, lineHeight: 1 }}>
      {value}
    </div>
    <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: 4 }}>{label}</div>
  </div>
);

const ConfirmDeleteModal: React.FC<{
  source?: ScraperSource;
  count?: number;
  onClose: () => void;
  onConfirm: (key: string, isPermanent: boolean) => Promise<void>;
  onBulkConfirm?: (isPermanent: boolean) => Promise<void>;
}> = ({ source, count = 0, onClose, onConfirm, onBulkConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [loadingPermanent, setLoadingPermanent] = useState(false);
  const isBulk = count > 1;

  const handleConfirm = async (isPermanent = false) => {
    if (isPermanent) {
      setLoadingPermanent(true);
    } else {
      setLoading(true);
    }

    if (isBulk && onBulkConfirm) {
      await onBulkConfirm(isPermanent);
    } else if (source) {
      await onConfirm(source.key, isPermanent);
    }

    setLoading(false);
    setLoadingPermanent(false);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          padding: "2rem",
          borderRadius: 20,
          width: 420,
          maxWidth: "100%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 80,
            height: 80,
            background: "rgba(239, 68, 68, 0.12)",
            color: "#ef4444",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            boxShadow: "0 0 0 8px rgba(239, 68, 68, 0.06)",
          }}
        >
          <FiAlertTriangle size={40} />
        </div>
        <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-heading)", fontWeight: 850, fontSize: "1.5rem", letterSpacing: "-0.025em" }}>
          {isBulk ? `Delete ${count} Sources?` : "Delete Permanently?"}
        </h3>
        <p style={{ color: "var(--color-muted)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          {isBulk ? (
            <>This will permanently remove <strong>{count} selected sources</strong> and all their configurations from the database. This action cannot be undone.</>
          ) : (
            <>This action <strong>cannot be undone</strong>. All data and configuration for <strong>{source?.name}</strong> will be removed from the database forever.</>
          )}
          <br />
          {!isBulk && (
            <span style={{ fontSize: "0.85rem", color: "var(--color-muted)", display: "block", marginTop: 8 }}>
              (To hide this source without deleting it, use the <strong>Archive</strong> button on the dashboard instead.)
            </span>
          )}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => handleConfirm(true)}
            disabled={loading || loadingPermanent}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              fontWeight: 800,
              fontSize: "1rem",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              cursor: (loading || loadingPermanent) ? "not-allowed" : "pointer",
              boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { if(!(loading || loadingPermanent)) e.currentTarget.style.background = "#dc2626"; }}
            onMouseLeave={(e) => { if(!(loading || loadingPermanent)) e.currentTarget.style.background = "#ef4444"; }}
          >
            <FiTrash2 size={20} /> {loadingPermanent ? "Deleting..." : isBulk ? `Confirm Bulk Delete (${count})` : "Confirm Permanent Delete"}
          </button>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              fontWeight: 600,
              fontSize: "0.95rem",
              background: "transparent",
              color: "var(--color-muted)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-muted)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)"; }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const DryRunPreviewModal: React.FC<{
  items: NonNullable<ScraperRunSummary["dryRunItems"]>;
  onClose: () => void;
}> = ({ items, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.siteName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: 24,
          width: 800,
          maxWidth: "100%",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "1.5rem 2rem", background: "linear-gradient(135deg, var(--color-secondary), var(--color-primary))", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1.4rem" }}>Dry Run Preview</h3>
              <p style={{ margin: 0, opacity: 0.85, fontSize: "0.85rem" }}>
                Found {items.length} new notifications (max 100 shown)
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: "rgba(255,255,255,0.2)", border: "none", width: 36, height: 36, borderRadius: "50%", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              ✕
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 12, opacity: 0.7 }}>🔍</span>
            <input
              type="text"
              placeholder="Filter by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 12,
                padding: "10px 15px 10px 40px",
                color: "#fff",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem 2rem" }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
              <p>No matching items found</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "1rem",
                    borderRadius: 16,
                    border: "1.5px solid var(--color-border)",
                    background: "var(--color-bg)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--color-heading)", marginBottom: 4, fontSize: "0.95rem" }}>
                      {item.title}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", background: "rgba(37, 99, 235, 0.1)", color: "var(--color-secondary)", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                        {item.siteName}
                      </span>
                    </div>
                  </div>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: "var(--color-surface)",
                      border: "1.5px solid var(--color-border)",
                      borderRadius: 10,
                      padding: "6px 14px",
                      color: "var(--color-secondary)",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View Source ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "1.25rem 2rem", background: "var(--color-bg)", borderTop: "1.5px solid var(--color-border)", textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              background: "var(--color-primary)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(15,61,145,0.3)",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

const SiteCard: React.FC<{
  source: ScraperSource;
  onPreview: (key: string) => void;
  onEdit: (source: ScraperSource) => void;
  onArchive: (source: ScraperSource) => void;
  onDelete: (source: ScraperSource) => void;
  onRestore?: (key: string) => Promise<void>;
  onToggleActive?: (source: ScraperSource) => void;
  previewing: boolean;
  isSelected?: boolean;
  onSelect?: (key: string) => void;
}> = ({ source, onPreview, onEdit, onArchive, onDelete, onRestore, onToggleActive, previewing, isSelected, onSelect }) => {
  const isArchived = !!source.is_archived;

  return (
    <div
      className="site-card-container"
      style={{
        background: isSelected ? "rgba(var(--color-secondary-rgb), 0.1)" : (isArchived ? "var(--color-bg)" : "var(--color-surface)"),
        borderRadius: 12,
        padding: "0.85rem 1.25rem",
        border: isSelected ? "1px solid var(--color-secondary)" : "1px solid var(--color-border)",
        boxShadow: isSelected ? "0 4px 12px rgba(59, 130, 246, 0.08)" : (isArchived ? "none" : "0 1px 2px rgba(0,0,0,0.02)"),
        transition: "all 0.2s ease",
        opacity: isArchived ? 0.8 : 1,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        gap: 16
      }}
    >
      {/* Checkbox Section */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(source.key);
        }}
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `2px solid ${isSelected ? "var(--color-secondary)" : "var(--color-border)"}`,
          background: isSelected ? "var(--color-secondary)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s ease",
          color: "#fff",
        }}
      >
        {isSelected && <span style={{ fontSize: 14, fontWeight: 900 }}>✓</span>}
      </div>

      {/* Left Side: Logo + Info */}
      <div style={{ display: "flex", gap: 16, flex: 1, minWidth: 0, alignItems: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: isArchived ? "rgba(148, 163, 184, 0.2)" : "var(--color-bg)",
            border: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: 24,
          }}
        >
          {CATEGORY_EMOJI[source.defaultCategory] || "🌐"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0, paddingRight: 64 }}>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--color-heading)", lineHeight: 1.2 }}>
            {source.name}
          </div>
          <div className="site-info-row">
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, width: "100%" }}>
              <a
                href={source.listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.85rem",
                  color: "var(--color-muted)",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "200px"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-muted)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)"; }}
              >
                {source.listingUrl.replace(/^https?:\/\//, "")}
              </a>

              <div style={{ display: "flex", gap: 6 }}>
                <span
                  style={{
                    background: "var(--color-bg)",
                    color: "var(--color-muted)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {fmtState(source.defaultState)}
                </span>
                <span
                  style={{
                    background: "var(--color-bg)",
                    color: "var(--color-muted)",
                    borderRadius: 6,
                    padding: "3px 8px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {CATEGORY_LABELS[source.defaultCategory] || source.defaultCategory}
                </span>
              </div>
            </div>

            <div className="site-actions-container">
              {!isArchived ? (
                <>
                  <button
                    onClick={() => onToggleActive?.(source)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: source.isActive ? "#10b981" : "var(--color-muted)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: 0,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = source.isActive ? "#059669" : "var(--color-heading)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = source.isActive ? "#10b981" : "var(--color-muted)"; }}
                    title={source.isActive ? "Deactivate Source" : "Activate Source"}
                  >
                    <FiZap size={14} fill={source.isActive ? "currentColor" : "none"} /> 
                    {source.isActive ? "Deactive" : "Active"}
                  </button>
                  <button
                    onClick={() => onPreview(source.key)}
                    disabled={previewing}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "var(--color-secondary)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: previewing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: 0,
                      opacity: previewing ? 0.7 : 1,
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => { if(!previewing) e.currentTarget.style.color = "#2563eb"; }}
                    onMouseLeave={(e) => { if(!previewing) e.currentTarget.style.color = "var(--color-secondary)"; }}
                  >
                    <FiEye size={15} /> {previewing ? "Previewing..." : "Preview"}
                  </button>
                  <button
                    onClick={() => onEdit(source)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "var(--color-body)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: 0,
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-heading)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-body)"; }}
                  >
                    <FiEdit2 size={15} /> Edit
                  </button>
                  <button
                    onClick={() => onArchive(source)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "var(--color-muted)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: 0,
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-heading)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)"; }}
                    title="Archive Source"
                  >
                    <FiArchive size={15} /> Archive
                  </button>
                  <button
                    onClick={() => onDelete(source)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#ef4444",
                      fontSize: "1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onRestore && onRestore(source.key)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#6366f1",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: 0,
                      transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#4f46e5"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#6366f1"; }}
                  >
                    <FiRefreshCw size={14} /> Restore Active State
                  </button>
                  <button
                    onClick={() => onDelete(source)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#ef4444",
                      fontSize: "1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      transition: "transform 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                    title="Permanently Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Straight Corner Ribbon */}
      <div 
        style={{ 
          position: "absolute", 
          top: 0, 
          right: 0, 
          padding: "6px 16px",
          background: isArchived ? "var(--color-bg)" : (source.isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)"),
          color: isArchived ? "var(--color-muted)" : (source.isActive ? "#10b981" : "#ef4444"),
          fontSize: "0.65rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          borderRadius: "0 8px 0 12px",
          borderLeft: `1px solid ${isArchived ? "rgba(0,0,0,0.05)" : (source.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)")}`,
          borderBottom: `1px solid ${isArchived ? "rgba(0,0,0,0.05)" : (source.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)")}`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
          zIndex: 10
        }}
      >
        {isArchived ? "ARCHIVED" : (source.isActive ? "ACTIVE" : "INACTIVE")}
      </div>
    </div>
  );
};

const PreviewModal: React.FC<{
  siteName: string;
  totalFound: number;
  items: ScraperPreviewItem[];
  onClose: () => void;
}> = ({ siteName, totalFound, items, onClose }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      backdropFilter: "blur(3px)",
      zIndex: 9000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    }}
  >
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: 20,
        padding: "1.5rem",
        maxWidth: 720,
        width: "100%",
        maxHeight: "85vh",
        overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div>
          <h5 style={{ margin: 0, fontWeight: 700 }}>
            <FiEye size={18} style={{ marginRight: 8 }} /> Preview — {siteName}
          </h5>
          <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "0.82rem", marginTop: 2 }}>
            Found {totalFound} listings · Showing top {items.length}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.4rem",
            cursor: "pointer",
            color: "var(--color-muted)",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              padding: "0.75rem 1rem",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: 4 }}>
              {item.title}
            </div>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.72rem", color: "#6c63ff", wordBreak: "break-all" }}
              >
                {item.href}
              </a>
              {item.dateText && (
                <span
                  style={{
                    background: "rgba(255,193,7,0.12)",
                    color: "var(--color-accent)",
                    borderRadius: 6,
                    padding: "1px 8px",
                    fontSize: "0.7rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  📅 {item.dateText}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CustomSelect: React.FC<{
  label?: string;
  value: string;
  options: string[] | { label: string; value: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ value, options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = typeof options[0] === "string" 
    ? value 
    : (options as { label: string; value: string }[]).find(o => o.value === value)?.label || value;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          borderRadius: 10,
          border: "1px solid var(--color-border)",
          padding: "10px 14px",
          fontSize: "0.92rem",
          background: "var(--color-bg)",
          color: value ? "var(--color-heading)" : "var(--color-muted)",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          transition: "all 0.2s ease",
          userSelect: "none",
          minHeight: 42,
          boxSizing: "border-box"
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {displayValue || placeholder}
        </span>
        <span style={{ 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
          transition: "transform 0.2s",
          fontSize: "0.6rem",
          color: "var(--color-muted)",
          marginLeft: 8
        }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          zIndex: 10000,
          maxHeight: 220,
          overflowY: "auto",
          padding: "6px"
        }}>
          {options.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lab = typeof opt === "string" ? opt : opt.label;
            const isSelected = val === value;

            return (
              <div
                key={val}
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 12px",
                  fontSize: "0.9rem",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: isSelected ? "#6366f1" : "transparent",
                  color: isSelected ? "#fff" : "var(--color-body)",
                  fontWeight: isSelected ? 700 : 500,
                  transition: "all 0.2s",
                  marginBottom: 2
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "var(--color-bg)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                {lab}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const INDIAN_STATES = [
  "Central", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const fmtState = (state: string | undefined | null) => {
  if (!state) return "—";
  const s = state.toLowerCase();
  if (s === "all-india" || s === "central") return "Central";
  return state.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const SourceModal: React.FC<{
  source: Partial<ScraperSource>;
  onClose: () => void;
  onSave: (source: Partial<ScraperSource>, isNew: boolean) => Promise<void>;
}> = ({ source, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<ScraperSource>>({
    key: "",
    name: "",
    listingUrl: "",
    defaultCategory: "job",
    defaultState: "Central",
    isActive: true,
    ...source,
  });
  const [isKeyPristine, setIsKeyPristine] = useState(!source.key);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !source.key;

  const urlValid = isValidUrl(formData.listingUrl || "");

  const handleNameChange = (val: string) => {
    const updates: Partial<ScraperSource> = { name: val };
    if (isNew && isKeyPristine) {
      updates.key = slugify(val);
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const hasChanges = isNew ? (
    !!(formData.name?.trim() && formData.key?.trim() && formData.listingUrl?.trim())
  ) : (
    formData.name !== source.name ||
    formData.listingUrl !== source.listingUrl ||
    formData.defaultCategory !== (source.defaultCategory || "job") ||
    formData.defaultState !== (source.defaultState || "Central") ||
    formData.isActive !== source.isActive
  );

  const canSave = hasChanges && !saving && urlValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    
    setError(null);
    setSaving(true);
    try {
      await onSave(formData, isNew);
    } catch (err: any) {
      let msg = err?.message || "An unexpected error occurred while saving.";
      // Parse detailed error if it comes from the API wrapper
      if (msg.includes("REQUEST_FAILED:")) {
        try {
          const jsonPart = msg.split("REQUEST_FAILED:")[1].trim();
          const parsed = JSON.parse(jsonPart);
          msg = parsed.error || parsed.message || msg;
        } catch { /* use original msg */ }
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--color-muted)",
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: 10,
    border: "1px solid var(--color-border)",
    padding: "10px 12px",
    fontSize: "0.92rem",
    outline: "none",
    transition: "all 0.2s ease",
    width: "100%",
    boxSizing: "border-box",
    background: "var(--color-bg)",
    color: "var(--color-heading)",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
      <div style={{ background: "var(--color-surface)", padding: "2.5rem", borderRadius: 24, width: 540, maxWidth: "95%", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)", position: "relative" }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 1.8rem 0", fontWeight: 850, letterSpacing: "-0.03em", color: "var(--color-heading)", fontSize: "1.6rem" }}>{isNew ? "Add New Source" : "Edit Source"}</h3>
        <form 
          onSubmit={handleSubmit} 
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
          onChange={() => setError(null)}
        >
          {error && (
            <div style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", padding: "10px 14px", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, border: "1px solid rgba(239, 68, 68, 0.25)" }}>
              ⚠️ {error}
            </div>
          )}

          <label style={labelStyle}>
            Site Display Name
            <div style={{ position: "relative" }}>
              <FiType style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
              <input 
                required 
                placeholder="e.g. UPSC Official" 
                value={formData.name || ""} 
                onChange={(e) => handleNameChange(e.target.value)} 
                style={{ ...inputStyle, paddingLeft: 40 }} 
              />
            </div>
          </label>

          {isNew && (
            <label style={labelStyle}>
              Unique Site Key
              <div style={{ position: "relative" }}>
                <FiKey style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
                <input 
                  required 
                  placeholder="e.g. upsc-main" 
                  value={formData.key} 
                  onChange={(e) => {
                    setIsKeyPristine(false);
                    setFormData({...formData, key: slugify(e.target.value)});
                  }} 
                  style={{ ...inputStyle, paddingLeft: 40 }} 
                />
              </div>
            </label>
          )}

          <label style={labelStyle}>
            Listing URL
            <div style={{ position: "relative" }}>
              <FiGlobe style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-muted)" }} />
              <input 
                required 
                type="url" 
                placeholder="https://..." 
                value={formData.listingUrl || ""} 
                onChange={(e) => setFormData({...formData, listingUrl: e.target.value.trim()})} 
                style={{ 
                  ...inputStyle, 
                  paddingLeft: 40,
                  borderColor: formData.listingUrl && !urlValid ? "#ef4444" : "var(--color-border)"
                }} 
              />
              {formData.listingUrl && (
                <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem" }}>
                  {urlValid ? "✅" : "❌"}
                </div>
              )}
            </div>
          </label>

          <div className="source-modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <label style={{ ...labelStyle, minWidth: 0 }}>
              Default Category
              <CustomSelect
                value={formData.defaultCategory || "job"}
                options={Object.keys(CATEGORY_EMOJI).map(c => ({ 
                  label: `${CATEGORY_EMOJI[c]} ${CATEGORY_LABELS[c] || c}`, 
                  value: c 
                }))}
                onChange={(val) => setFormData({ ...formData, defaultCategory: val })}
              />
            </label>

            <label style={{ ...labelStyle, minWidth: 0 }}>
              Target State
              <CustomSelect
                value={formData.defaultState || "Central"}
                options={INDIAN_STATES.map(s => ({ 
                  label: s, 
                  value: s === "Central" ? "Central" : s.toLowerCase().replace(/ /g, "-") 
                }))}
                onChange={(val) => setFormData({ ...formData, defaultState: val })}
              />
            </label>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", userSelect: "none", marginTop: 6, width: "fit-content" }}>
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} style={{ width: 20, height: 20, cursor: "pointer", accentColor: "var(--color-primary)" }} />
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-heading)" }}>Active and Enabled for Tracking</span>
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, marginTop: 12, alignItems: "center" }}>
            <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-muted)", fontWeight: 700, cursor: "pointer", padding: "10px 16px", fontSize: "0.95rem", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-muted)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-muted)"}>Cancel</button>
            <button 
              type="submit" 
              disabled={!canSave} 
              style={{ 
                borderRadius: 12, 
                padding: "12px 28px", 
                background: canSave ? "linear-gradient(135deg, var(--color-secondary), var(--color-primary))" : "var(--color-border)",
                color: canSave ? "#fff" : "var(--color-muted)",
                fontWeight: 800,
                border: "none",
                boxShadow: canSave ? "0 10px 15px -3px rgba(15, 61, 145, 0.3)" : "none",
                cursor: canSave ? "pointer" : "not-allowed", 
                fontSize: "0.95rem", 
                transition: "all 0.2s",
                opacity: canSave ? 1 : 0.7
              }} 
              onMouseEnter={(e) => { if(canSave) e.currentTarget.style.transform = "scale(1.02)"; }} 
              onMouseLeave={(e) => { if(canSave) e.currentTarget.style.transform = "scale(1)"; }}
            >
              {saving ? "Saving..." : "Save Config"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── main component ─────────────────────────────────────────── */

const ScraperDashboard: React.FC = () => {
  /* ─── Responsive Styles ─── */
  const responsiveStyles = (
    <style>{`
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      .site-card-container {
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }
      .site-info-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 2px;
      }
      .site-actions-container {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-left: auto;
      }
      .header-container {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .controls-container {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .source-modal-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      @media (max-width: 900px) {
        .stat-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .site-card-container {
          padding: 1rem !important;
        }
        .site-actions-container {
          gap: 12px;
        }
      }

      @media (max-width: 768px) {
        .source-modal-grid {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .header-container {
          flex-direction: column;
          align-items: flex-start;
          padding: 1.25rem 1.5rem !important;
        }
        .controls-container {
          flex-direction: column;
          align-items: stretch;
          padding: 1.25rem !important;
        }
        .controls-container > div {
          min-width: 0 !important;
          margin-bottom: 8px;
        }
      }

      @media (max-width: 600px) {
        .stat-grid {
          grid-template-columns: 1fr;
        }
        .site-card-container {
          flex-direction: column;
          gap: 12px;
          padding-right: 1.5rem !important; /* Safety for ribbon */
        }
        .site-info-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
        .site-actions-container {
          margin-left: 0;
          width: 100%;
          flex-wrap: wrap;
          justify-content: flex-start;
          gap: 10px 16px;
          padding-top: 12px;
          border-top: 1px solid var(--color-border);
        }
        .ribbon-container, .ribbon-banner {
          display: none !important; /* Managed purely via inline styles now for straight look */
        }
      }
    `}</style>
  );


  const [status, setStatus] = useState<{
    isRunning: boolean;
    lastRun: ScraperRunSummary | null;
  }>({ isRunning: false, lastRun: null });

  const [sources, setSources] = useState<ScraperSource[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingSources, setLoadingSources] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [previewingSite, setPreviewingSite] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    siteName: string;
    totalFound: number;
    items: ScraperPreviewItem[];
  } | null>(null);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ show: false, message: "", type: "success" });

  const [editingSource, setEditingSource] = useState<Partial<ScraperSource> | null>(null);
  const [deletingSource, setDeletingSource] = useState<ScraperSource | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkUpdatingStatus, setIsBulkUpdatingStatus] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleSelect = (key: string) => {
    setSelectedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = (isAll: boolean) => {
    if (isAll) {
      setSelectedKeys(sources.map(s => s.key));
    } else {
      setSelectedKeys([]);
    }
  };

  const performBulkDelete = async (_isPermanent = true) => {
    if (selectedKeys.length === 0) return;
    try {
      await bulkDeleteScraperSources(selectedKeys);
      showToast(`${selectedKeys.length} sources deleted permanently`, "success");
      setSelectedKeys([]);
      getScraperSources(viewMode === "archived").then((res) => setSources(res.sources || []));
    } catch (err: any) {
      showToast(err?.message || "Bulk delete failed", "error");
    }
  };

  const performBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedKeys.length === 0) return;
    setIsBulkUpdatingStatus(true);
    try {
      await bulkUpdateScraperSourcesStatus(selectedKeys, isActive);
      showToast(`${selectedKeys.length} sources ${isActive ? "activated" : "deactivated"}`, "success");
      setSelectedKeys([]);
      getScraperSources(viewMode === "archived").then((res) => setSources(res.sources || []));
    } catch (err: any) {
      showToast(err?.message || "Bulk status update failed", "error");
    } finally {
      setIsBulkUpdatingStatus(false);
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => setToast({ show: true, message, type });

  /* ── fetch status ── */
  const refreshStatus = useCallback(async () => {
    try {
      const res = await getScraperStatus();
      setStatus({ isRunning: res.isRunning, lastRun: res.lastRun });
      setLoadingStatus(false);
    } catch {
      setLoadingStatus(false);
    }
  }, []);

  /* ── auto-poll while running ── */
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    setLoadingSources(true);
    getScraperSources(viewMode === "archived")
      .then((res) => setSources(res.sources || []))
      .catch(() => {})
      .finally(() => setLoadingSources(false));
  }, [viewMode]);

  useEffect(() => {
    if (status.isRunning) {
      pollRef.current = setInterval(refreshStatus, 5000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status.isRunning, refreshStatus]);

  /* ── trigger run ── */
  const handleRun = async (dryRun = false) => {
    setTriggering(true);
    try {
      await triggerScraperRun(dryRun);
      showToast(
        dryRun
          ? "Dry-run started. Results will appear in status shortly."
          : "Scraper started! Notifications will appear in the admin dashboard for review.",
        "success"
      );
      setStatus((s) => ({ ...s, isRunning: true }));
      // Start polling
      setTimeout(refreshStatus, 3000);
    } catch (err: any) {
      showToast(err?.message || "Failed to trigger scraper", "error");
    } finally {
      setTriggering(false);
    }
  };

  /* ── preview site ── */
  const handlePreview = async (siteKey: string) => {
    setPreviewingSite(siteKey);
    try {
      const res = await previewScraperSite(siteKey);
      setPreviewData({
        siteName: res.siteName,
        totalFound: res.totalFound,
        items: res.preview,
      });
    } catch (err: any) {
      showToast(err?.message || "Preview failed", "error");
    } finally {
      setPreviewingSite(null);
    }
  };

  const handleSaveSource = async (data: Partial<ScraperSource>, isNew: boolean) => {
    try {
      // ── Sanitization ──
      const cleanData = {
        ...data,
        name: data.name?.trim(),
        key: data.key?.trim().toLowerCase(),
        listingUrl: data.listingUrl?.trim().replace(/\/$/, ""), // Remove trailing slash
      };

      if (isNew) {
        await createScraperSource(cleanData as any);
        showToast("New source added successfully", "success");
      } else {
        await updateScraperSource(data.key!, cleanData);
        showToast("Configuration updated successfully", "success");
      }
      setEditingSource(null);
      getScraperSources(viewMode === "archived").then((res) => setSources(res.sources || []));
    } catch (err: any) {
      let msg = err?.message || "Failed to save source";
      
      // Attempt to extract cleaner error message from fetch wrapper strings
      if (msg.includes("REQUEST_FAILED:")) {
        try {
          const jsonPart = msg.split("REQUEST_FAILED:")[1].trim();
          const parsed = JSON.parse(jsonPart);
          msg = parsed.error || parsed.message || msg;
        } catch { /* use original msg */ }
      }

      showToast(msg, "error");
      throw new Error(msg); // Allow modal to handle state with the clean message
    }
  };

  const performDeleteSource = async (key: string, isPermanent: boolean) => {
    try {
      if (isPermanent) {
        await permanentlyDeleteScraperSource(key);
        showToast("Source permanently deleted", "success");
      } else {
        await deleteScraperSource(key);
        showToast("Source archived successfully", "success");
      }
      getScraperSources(viewMode === "archived").then((res) => setSources(res.sources || []));
    } catch (err: any) {
      showToast(err?.message || "Failed to remove source", "error");
    }
  };

  const handleRestoreSource = async (key: string) => {
    try {
      await unarchiveScraperSource(key);
      showToast("Source restored successfully", "success");
      getScraperSources(viewMode === "archived").then((res) => setSources(res.sources || []));
    } catch (err: any) {
      showToast(err?.message || "Failed to restore source", "error");
    }
  };

  const handleToggleActive = async (source: ScraperSource) => {
    try {
      const newStatus = !source.isActive;
      await updateScraperSource(source.key, { isActive: newStatus });
      showToast(
        `Source ${newStatus ? "activated" : "deactivated"} successfully`,
        "success"
      );
      getScraperSources(viewMode === "archived").then((res) => setSources(res.sources || []));
    } catch (err: any) {
      showToast(err?.message || "Failed to update status", "error");
    }
  };

  const lastRun = status.lastRun;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        padding: "1rem",
      }}
    >
      {responsiveStyles}
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ─── Header ── */}
        <div
          className="header-container"
          style={{
            background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))",
            borderRadius: 20,
            padding: "1.5rem 2rem",
            color: "#fff",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>🕷️</span>
              <div>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: "1.5rem" }}>
                  Notification Scraper
                </h2>
                <p style={{ margin: 0, opacity: 0.85, fontSize: "0.85rem" }}>
                  Auto-discovers Govt Jobs, Admissions &amp; Entrance Exams
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link
              to="/admin/dashboard"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                borderRadius: 10,
                padding: "7px 16px",
                fontSize: "0.85rem",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* ─── Status Banner ── */}
        {status.isRunning && (
          <div
            style={{
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid #ffc107",
              borderRadius: 14,
              padding: "0.85rem 1.25rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              className="spinner-border spinner-border-sm text-warning"
              role="status"
            />
            <div>
              <strong>Scraper is running…</strong>
              <span style={{ color: "var(--color-muted)", fontSize: "0.82rem", marginLeft: 8 }}>
                Auto-refreshing every 5 seconds
              </span>
            </div>
          </div>
        )}

        {/* ─── Action Buttons ── */}
        <div
          className="controls-container"
          style={{
            background: "var(--color-surface)",
            borderRadius: 16,
            padding: "1.25rem 1.5rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <h6 style={{ margin: 0, fontWeight: 700 }}>Manual Controls</h6>
            <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "0.8rem", marginTop: 2 }}>
              Trigger a scrape run immediately or test with dry-run mode
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              id="scraper-dryrun-btn"
              onClick={() => handleRun(true)}
              disabled={triggering || status.isRunning}
              style={{
                border: "1.5px solid var(--color-primary)",
                borderRadius: 10,
                padding: "8px 18px",
                background: "rgba(15,61,145,0.07)",
                color: "var(--color-primary)",
                fontWeight: 600,
                fontSize: "0.85rem",
                cursor:
                  triggering || status.isRunning ? "not-allowed" : "pointer",
                opacity: triggering || status.isRunning ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              🧪 Dry Run (No Insert)
            </button>
            <button
              id="scraper-run-btn"
              onClick={() => handleRun(false)}
              disabled={triggering || status.isRunning}
              style={{
                border: "none",
                borderRadius: 10,
                padding: "8px 22px",
                background:
                  triggering || status.isRunning
                    ? "var(--color-border)"
                    : "linear-gradient(135deg, var(--color-secondary), var(--color-primary))",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor:
                  triggering || status.isRunning ? "not-allowed" : "pointer",
                boxShadow:
                  triggering || status.isRunning
                    ? "none"
                    : "0 4px 14px rgba(15,61,145,0.35)",
                transition: "all 0.2s",
              }}
            >
              {triggering ? "⏳ Starting…" : "▶ Run Scraper Now"}
            </button>
          </div>
        </div>

        {/* ─── Last Run Summary ── */}
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: 16,
            padding: "1.25rem 1.5rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            marginBottom: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h6 style={{ margin: 0, fontWeight: 700 }}>Last Run Summary</h6>
              {status.lastRun?.dryRunItems && status.lastRun.dryRunItems.length > 0 && (
                <button
                  onClick={() => setShowPreview(true)}
                  style={{
                    background: "rgba(15,61,145,0.1)",
                    border: "1px solid var(--color-primary)",
                    color: "var(--color-primary)",
                    borderRadius: 8,
                    padding: "4px 12px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  👁️ View Preview
                </button>
              )}
            </div>
            <button
              onClick={refreshStatus}
              disabled={loadingStatus}
              style={{
                background: "none",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "4px 12px",
                fontSize: "0.8rem",
                cursor: loadingStatus ? "not-allowed" : "pointer",
                color: "var(--color-muted)",
              }}
            >
              {loadingStatus ? "⏳" : "🔄"} Refresh
            </button>
          </div>

          {loadingStatus ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm" style={{ color: "var(--color-primary)" }} role="status" />
            </div>
          ) : !lastRun ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--color-muted)",
                fontSize: "0.9rem",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 8 }}>🕸️</div>
              No scraper runs yet. Click "Run Scraper Now" to begin.
            </div>
          ) : (
            <>
              {/* Meta */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: "1rem",
                  fontSize: "0.8rem",
                  color: "var(--color-muted)",
                }}
              >
                <span>🕐 Started: {fmtTime(lastRun.startedAt)}</span>
                <span
                  style={{
                    background: "var(--color-bg)",
                    borderRadius: 6,
                    padding: "0 8px",
                  }}
                >
                  ⏱ {elapsed(lastRun.startedAt, lastRun.completedAt)}
                </span>
                <span>
                  🌐 {lastRun.totalSitesProcessed} site
                  {lastRun.totalSitesProcessed !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Stat cards */}
              <div className="stat-grid" style={{ marginBottom: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
                <StatCard label="Found" value={lastRun.totalFound} color="var(--color-secondary)" icon="🔍" />
                <StatCard label="New Notifications" value={lastRun.totalInserted} color="#28a745" icon="✅" />
                <StatCard label="Portal Updates" value={lastRun.totalVirtual ?? 0} color="#17a2b8" icon="🔔" />
                <StatCard label="Already in DB" value={lastRun.totalSkipped} color="#ffc107" icon="⏭️" />
                <StatCard label="Date-Filtered" value={lastRun.totalDateFiltered ?? 0} color="#6c757d" icon="📅" />
                <StatCard label="Failed" value={lastRun.totalFailed} color="#dc3545" icon="❌" />
              </div>

              {/* Per-site breakdown */}
              {lastRun.perSite.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "var(--color-muted)",
                      marginBottom: 8,
                    }}
                  >
                    Per-site breakdown
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {lastRun.perSite.map((s: any) => (
                      <div
                        key={s.siteKey}
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          alignItems: "center",
                          background: "var(--color-bg)",
                          borderRadius: 8,
                          padding: "6px 12px",
                          fontSize: "0.8rem",
                        }}
                      >
                        <span style={{ fontWeight: 600, flex: 1, minWidth: 140 }}>
                          {s.siteKey}
                        </span>
                        <span style={{ color: "var(--color-secondary)" }}>🔍 {s.found}</span>
                        <span style={{ color: "#28a745" }}>✅ {s.inserted}</span>
                        {(s.virtual ?? 0) > 0 && (
                          <span style={{ color: "#17a2b8" }}>🔔 {s.virtual}</span>
                        )}
                        <span style={{ color: "#ffc107" }}>⏭️ {s.skipped}</span>
                        {(s.dateFiltered ?? 0) > 0 && (
                          <span style={{ color: "#6c757d" }}>📅 {s.dateFiltered}</span>
                        )}
                        {s.failed > 0 && (
                          <span style={{ color: "#dc3545" }}>❌ {s.failed}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {lastRun.errors.length > 0 && (
                <details style={{ marginTop: "1rem" }}>
                  <summary
                    style={{
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      color: "#dc3545",
                      fontWeight: 600,
                    }}
                  >
                    ⚠️ {lastRun.errors.length} error
                    {lastRun.errors.length !== 1 ? "s" : ""}
                  </summary>
                  <div
                    style={{
                      marginTop: 8,
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                      borderRadius: 8,
                      padding: "0.75rem",
                      maxHeight: 200,
                      overflowY: "auto",
                    }}
                  >
                    {lastRun.errors.map((err: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-danger)",
                          fontFamily: "monospace",
                          marginBottom: 4,
                        }}
                      >
                        {err}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Link to review */}
              {lastRun.totalInserted > 0 && (
                <div
                  style={{
                    marginTop: "1rem",
                    background: "linear-gradient(135deg, rgba(40,167,69,0.08), rgba(32,201,151,0.08))",
                    border: "1px solid rgba(40,167,69,0.2)",
                    borderRadius: 10,
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "var(--color-success)" }}>
                    🎉 <strong>{lastRun.totalInserted}</strong> new notification
                    {lastRun.totalInserted !== 1 ? "s" : ""} added — pending review
                  </span>
                  <Link
                    to="/admin/dashboard"
                    style={{
                      background: "#28a745",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "5px 14px",
                      fontSize: "0.8rem",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Review Now →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── Source Sites ── */}
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: 16,
            padding: "1.25rem 1.5rem",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h6 style={{ margin: 0, fontWeight: 800, color: "var(--color-heading)", fontSize: "1rem" }}>
                🌐 Configured Sources
              </h6>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4, background: "var(--color-bg)", padding: 4, borderRadius: 10, width: "fit-content" }}>
                  <button
                    onClick={() => { setViewMode("active"); setSelectedKeys([]); }}
                    style={{
                      border: "none",
                      borderRadius: 8,
                      padding: "4px 12px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: viewMode === "active" ? "var(--color-surface)" : "transparent",
                      color: viewMode === "active" ? "var(--color-secondary)" : "var(--color-muted)",
                      boxShadow: viewMode === "active" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => { setViewMode("archived"); setSelectedKeys([]); }}
                    style={{
                      border: "none",
                      borderRadius: 8,
                      padding: "4px 12px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background: viewMode === "archived" ? "var(--color-surface)" : "transparent",
                      color: viewMode === "archived" ? "var(--color-secondary)" : "var(--color-muted)",
                      boxShadow: viewMode === "archived" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Archived
                  </button>
                </div>

                {sources.length > 0 && (
                   <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                    <div 
                      onClick={() => handleSelectAll(selectedKeys.length < sources.length)}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: `2px solid ${selectedKeys.length === sources.length ? "#6366f1" : "var(--color-border)"}`,
                        background: selectedKeys.length === sources.length ? "#6366f1" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#fff",
                      }}
                    >
                      {selectedKeys.length === sources.length && <span style={{ fontSize: 10, fontWeight: 900 }}>✓</span>}
                      {selectedKeys.length > 0 && selectedKeys.length < sources.length && <div style={{ width: 8, height: 2, background: "#6366f1", borderRadius: 1 }} />}
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-muted)" }}>
                      {selectedKeys.length === sources.length ? "Deselect All" : "Select All"}
                    </span>
                  </label>
                )}
              </div>
            </div>
            <button 
              onClick={() => setEditingSource({})}
              className="btn btn-sm"
              style={{
                borderRadius: 10,
                padding: "8px 16px",
                background: "linear-gradient(135deg, var(--color-secondary), var(--color-primary))",
                color: "#fff",
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(15, 61, 145, 0.25)",
                border: "none"
              }}
            >
              + Add Source
            </button>
          </div>

          {loadingSources ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm" style={{ color: "var(--color-primary)" }} role="status" />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {sources.map((source: any) => (
                  <SiteCard
                    key={source.key}
                    source={source}
                    onPreview={handlePreview}
                    onEdit={(s) => setEditingSource(s)}
                    onArchive={(s) => performDeleteSource(s.key, false)}
                    onDelete={(s) => setDeletingSource(s)}
                    onRestore={handleRestoreSource}
                    onToggleActive={handleToggleActive}
                    previewing={previewingSite === source.key}
                    isSelected={selectedKeys.includes(source.key)}
                    onSelect={toggleSelect}
                  />
              ))}
            </div>
          )}
          
          {!loadingSources && sources.length === 0 && (
            <div style={{ padding: "3rem 1rem", textAlign: "center", background: "var(--color-bg)", borderRadius: 12, border: "2px dashed var(--color-border)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{viewMode === "active" ? "🏜️" : "📁"}</div>
              <div style={{ fontWeight: 700, color: "var(--color-body)" }}>
                {viewMode === "active" ? "No Sources Configured" : "No Archived Sources"}
              </div>
              <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", marginTop: 4 }}>
                {viewMode === "active" 
                  ? "Tracking list is empty. Add a government site to get started."
                  : "Items you delete will appear here for restoration."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Preview Modal ── */}
      {previewData && (
        <PreviewModal
          siteName={previewData.siteName}
          totalFound={previewData.totalFound}
          items={previewData.items}
          onClose={() => setPreviewData(null)}
        />
      )}

      {/* ─── Source Edit Modal ── */}
      {editingSource && (
        <SourceModal
          source={editingSource}
          onClose={() => setEditingSource(null)}
          onSave={handleSaveSource}
        />
      )}

      {deletingSource && (
        <ConfirmDeleteModal
          source={deletingSource}
          onClose={() => setDeletingSource(null)}
          onConfirm={performDeleteSource}
        />
      )}

      {/* ─── Bulk Action Bar ── */}
      {selectedKeys.length > 0 && (
        <div 
          style={{ 
            position: "fixed", 
            bottom: 30, 
            left: "50%", 
            transform: "translateX(-50%)", 
            background: "#1e293b", 
            padding: "12px 24px", 
            borderRadius: 20, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: 20,
            zIndex: 5000,
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)"
          }}
        >
          <div style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 700 }}>
            <span style={{ background: "var(--color-secondary)", color: "#fff", padding: "2px 8px", borderRadius: 6, marginRight: 8 }}>{selectedKeys.length}</span>
            Sources Selected
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)" }} />
          <div style={{ display: "flex", gap: 12 }}>
            <button 
              onClick={() => setSelectedKeys([])}
              style={{ background: "transparent", border: "none", color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={() => performBulkStatusUpdate(true)}
              disabled={isBulkUpdatingStatus}
              style={{ background: "#10b981", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: "0.85rem", cursor: isBulkUpdatingStatus ? "not-allowed" : "pointer", opacity: isBulkUpdatingStatus ? 0.7 : 1, boxShadow: "0 4px 12px rgba(16,185,129,0.3)", display: "flex", alignItems: "center", gap: 6 }}
            >
              <FiZap size={14} /> Activate
            </button>
            <button
              onClick={() => performBulkStatusUpdate(false)}
              disabled={isBulkUpdatingStatus}
              style={{ background: "#64748b", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: "0.85rem", cursor: isBulkUpdatingStatus ? "not-allowed" : "pointer", opacity: isBulkUpdatingStatus ? 0.7 : 1, boxShadow: "0 4px 12px rgba(100,116,139,0.3)", display: "flex", alignItems: "center", gap: 6 }}
            >
              <FiZap size={14} /> Deactivate
            </button>
            <button
              onClick={() => setIsBulkDeleting(true)}
              style={{ background: "#ef4444", border: "none", color: "#fff", padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(239,68,68,0.3)" }}
            >
              Delete Permanently
            </button>
          </div>
        </div>
      )}

      {/* ─── Toast ── */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t: any) => ({ ...t, show: false }))}
      />

      {/* ─── Bulk Confirmation Modal ── */}
      {isBulkDeleting && (
        <ConfirmDeleteModal
          count={selectedKeys.length}
          onClose={() => setIsBulkDeleting(false)}
          onConfirm={async () => {}} // Not used globally
          onBulkConfirm={performBulkDelete}
        />
      )}

      {showPreview && status.lastRun?.dryRunItems && (
        <DryRunPreviewModal 
          items={status.lastRun.dryRunItems} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </div>
  );
};

export default ScraperDashboard;
