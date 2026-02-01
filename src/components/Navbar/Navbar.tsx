// Navbar.tsx (Fixed Profile Dropdown – Mobile & Desktop)
import React from "react";
import { Link } from "react-router-dom";
import ProfileSection from "../../features/notifications/components/ProfileSection";
import { WEBSITE_NAME } from "../../constant/SharedConstant";

interface NavbarProps {
  isAuthenticated: boolean;
  givenName?: string;
  familyName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  onLogout: () => void;
  onShowAuthPopup: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  givenName,
  familyName,
  userEmail,
  isAdmin,
  onLogout,
  onShowAuthPopup,
}) => {
  return (
    <nav
      className="navbar navbar-dark bg-dark shadow-sm sticky-top"
      style={{ zIndex: 1050 }}
    >
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* LEFT: Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="/logo.png"
            alt="Logo"
            height="34"
            className="me-2"
            style={{ borderRadius: "8px" }}
          />
          <span className="fw-semibold fs-6">{WEBSITE_NAME}</span>
        </Link>

        {/* RIGHT: Profile (ABSOLUTE DROPDOWN) */}
        <div className="position-relative">
          <ProfileSection
            isAuthenticated={isAuthenticated}
            givenName={givenName}
            familyName={familyName}
            email={userEmail}
            isAdmin={isAdmin}
            onLogout={onLogout}
            onShowAuthPopup={onShowAuthPopup}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
