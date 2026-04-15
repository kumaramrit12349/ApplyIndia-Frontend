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
  return (
    <nav className="ai-navbar">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        {/* LEFT: Logo */}
        <Link className="navbar-brand" to="/">
          <span className="brand-name">{WEBSITE_NAME}</span>
        </Link>

        {/* RIGHT: Profile */}
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
    </nav>
  );
};

export default Navbar;
