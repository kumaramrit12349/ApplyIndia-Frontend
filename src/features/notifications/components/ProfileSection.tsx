import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProfileSectionProps {
  isAuthenticated: boolean;
  givenName?: string;
  familyName?: string;
  email?: string;
  isAdmin?: boolean;
  adminRole?: string;
  state?: string;
  category?: string;
  onLogout: () => void;
  onShowAuthPopup: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "linear-gradient(135deg, #667eea, #764ba2)",
  reviewer: "linear-gradient(135deg, #f093fb, #f5576c)",
  creator: "linear-gradient(135deg, #4facfe, #00f2fe)",
};

const ProfileSection: React.FC<ProfileSectionProps> = ({
  isAuthenticated,
  givenName,
  familyName,
  email,
  isAdmin,
  adminRole,
  state,
  category,
  onLogout,
  onShowAuthPopup,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  /* ---------- Close on outside click ---------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstInitial = givenName?.trim()?.[0]?.toUpperCase() || "";
  const lastInitial = familyName?.trim()?.[0]?.toUpperCase() || "";
  const initials = firstInitial + lastInitial || "U";

  const fullName =
    [givenName, familyName].filter(Boolean).join(" ") || "Guest User";

  if (!isAuthenticated) {
    return (
      <div className="ai-auth-buttons">
        <button className="ai-btn-login" onClick={onShowAuthPopup}>
          Log in
        </button>
        <button className="ai-btn-signup" onClick={onShowAuthPopup}>
          Sign up
        </button>
      </div>
    );
  }

  return (
    <div className="position-relative" ref={wrapperRef}>
      {/* ---------- Toggle Button ---------- */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="ai-profile-toggle"
        aria-expanded={open}
      >
        <div className="ai-avatar">{initials}</div>
        <span className="d-none d-md-inline ai-profile-name">{fullName}</span>
        <svg
          className="ai-caret"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
        </svg>
      </button>

      {/* ---------- Dropdown ---------- */}
      {open && (
        <div className="ai-profile-dropdown">
          {/* Header */}
          <div className="ai-dropdown-header">
            <div className="ai-avatar ai-avatar-lg">{initials}</div>
            <div className="user-info">
              <div className="user-name">
                {fullName}
                {adminRole && (
                  <span
                    className="ai-role-badge"
                    style={{ background: ROLE_COLORS[adminRole] || ROLE_COLORS.creator }}
                  >
                    {adminRole.charAt(0).toUpperCase() + adminRole.slice(1)}
                  </span>
                )}
              </div>
              {email && <div className="user-email">{email}</div>}
              {(state || category) && (
                <div className="user-meta">
                  {state && <span>{state} </span>}
                  {category && <span>• {category}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="ai-dropdown-actions">
            {(isAdmin || adminRole) && (
              <button
                className="ai-dropdown-item"
                onClick={() => { setOpen(false); navigate("/admin/dashboard"); }}
              >
                🛡️ Admin Dashboard
              </button>
            )}

            {adminRole === "admin" && (
              <button
                className="ai-dropdown-item"
                onClick={() => { setOpen(false); navigate("/admin/feedback"); }}
              >
                📥 User Feedback
              </button>
            )}

            <button
              className="ai-dropdown-item"
              onClick={() => { setOpen(false); navigate("/dashboard"); }}
            >
              📋 My Dashboard
            </button>

            <button
              className="ai-dropdown-item"
              onClick={() => { setOpen(false); navigate("/profile"); }}
            >
              👤 Profile
            </button>

            <button
              className="ai-dropdown-item danger"
              onClick={() => { setOpen(false); onLogout(); }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
