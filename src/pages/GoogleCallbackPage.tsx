import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { checkAuthStatus } from "../services/authApi";

/**
 * GoogleCallbackPage
 *
 * Handles the redirect after Google sign-in.
 * - On error: hard-redirects to / with auth_error so App.tsx shows the popup.
 * - On success: reloads to / so App.tsx picks up the new session cookies.
 */
const GoogleCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authError = searchParams.get("auth_error");

  useEffect(() => {
    if (authError) {
      const displayMsg = authError.includes("Email already registered")
        ? authError
        : "Google sign-in failed. Please try again.";

      // Hard redirect so App.tsx re-mounts and picks up the auth_error
      window.location.href = `/?auth_error=${encodeURIComponent(displayMsg)}`;
      return;
    }

    // Poll auth status (the httpOnly cookies have just been set by the backend)
    checkAuthStatus().then(({ isAuthenticated }) => {
      if (isAuthenticated) {
        window.location.href = "/";
      } else {
        navigate("/", { replace: true });
      }
    });
  }, [authError, navigate]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 gap-3">
      <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Signing you in...</span>
      </div>
      <p className="text-muted fw-semibold">Completing Google sign-in…</p>
    </div>
  );
};

export default GoogleCallbackPage;
