import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProfileSectionProps {
  isAuthenticated: boolean;
  givenName?: string;
  familyName?: string;
  email?: string;
  isAdmin?: boolean;
  state?: string;
  category?: string;
  onLogout: () => void;
  onShowAuthPopup: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  isAuthenticated,
  givenName,
  familyName,
  email,
  isAdmin,
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
      <div className="d-flex gap-2">
        <button
          className="btn btn-outline-light btn-sm"
          onClick={onShowAuthPopup}
        >
          Log in
        </button>
        <button className="btn btn-primary btn-sm" onClick={onShowAuthPopup}>
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
        className="btn btn-link d-flex align-items-center text-white text-decoration-none p-0"
        style={{ border: "none", background: "none" }}
      >
        {/* Avatar */}
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "#0d6efd",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>

        {/* Name hidden on small screens */}
        <span className="d-none d-md-inline ms-2 me-1">{fullName}</span>

        {/* Caret */}
        <svg
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
        <div
          className="bg-white shadow rounded-3"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            minWidth: 260,
            zIndex: 1060,
          }}
        >
          {/* Header */}
          <div className="px-3 py-3 border-bottom">
            <div className="d-flex align-items-center">
              <div
                className="me-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  backgroundColor: "#0d6efd",
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                {initials}
              </div>

              <div>
                <div className="fw-semibold">{fullName}</div>
                {email && <div className="text-muted small">{email}</div>}
                {(state || category) && (
                  <div className="text-muted extra-small mt-1" style={{ fontSize: '0.75rem' }}>
                    {state && <span>{state} </span>}
                    {category && <span>• {category}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="d-grid gap-2 m-2">
            {/* Dashboard – only for admin & moderator */}
            {(isAdmin) && (
              <button
                className="btn btn-outline-primary text-start px-3 py-2"
                onClick={() => {
                  setOpen(false);
                  navigate("/admin/dashboard");
                }}
              >
                Dashboard
              </button>
            )}

            {/* Profile */}
            <button
              className="btn btn-outline-primary text-start px-3 py-2"
              onClick={() => {
                setOpen(false);
                navigate("/profile");
              }}
            >
              Profile
            </button>

            {/* Logout */}
            <button
              className="btn btn-outline-danger text-start px-3 py-2"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
