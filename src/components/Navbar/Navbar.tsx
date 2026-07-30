import React from "react";
import { Link } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";
import ProfileSection from "../../features/notifications/components/ProfileSection";
import { WEBSITE_NAME } from "../../constant/SharedConstant";
import { useTheme } from "../../context/ThemeContext";

interface NavbarProps {
  isAuthenticated: boolean;
  givenName?: string;
  familyName?: string;
  userEmail?: string;
  isAdmin?: boolean;
  adminRole?: string;
  state?: string;
  category?: string;
  onLogout: () => void;
  onShowAuthPopup: () => void;
  onShowSignUpPopup?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  givenName,
  familyName,
  userEmail,
  isAdmin,
  adminRole,
  state,
  category,
  onLogout,
  onShowAuthPopup,
  onShowSignUpPopup,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="ai-navbar">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* LEFT: Logo */}
        <Link className="navbar-brand" to="/">
          <span className="brand-name">{WEBSITE_NAME}</span>
        </Link>

        {/* RIGHT: Theme toggle + Profile */}
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="ai-theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
          </button>
          <div className="position-relative">
            <ProfileSection
              isAuthenticated={isAuthenticated}
              givenName={givenName}
              familyName={familyName}
              email={userEmail}
              isAdmin={isAdmin}
              adminRole={adminRole}
              state={state}
              category={category}
              onLogout={onLogout}
              onShowAuthPopup={onShowAuthPopup}
              onShowSignUpPopup={onShowSignUpPopup}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
