// App.tsx (only AppLayout shown; rest unchanged)
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  matchPath,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import DashboardPage from "./pages/admin/DashboardPage";
import AddNotificationPage from "./pages/admin/AddNotificationPage";
import EditNotificationPage from "./pages/admin/EditNotificationPage";
import ReviewNotificationPage from "./pages/admin/ReviewNotificationPage";
import AdminFeedbackPage from "./pages/admin/AdminFeedbackPage";
import ScraperDashboard from "./pages/admin/ScraperDashboard";

import Navbar from "./components/Navbar/Navbar";
import Navigation from "./components/Navigation/Navigation";
import SearchBar from "./components/SearchBar/SearchBar";
import Footer from "./components/Footer/Footer";
import SignUpPopup from "./components/SignUpPopup";
import VerifyAccountPopup from "./components/VerifyAccount";
import ProtectedRoute from "./routes/ProtectedRoute";
import CategoryView from "./features/notifications/components/CategoryView";
import StateView from "./features/notifications/components/StateView";
import UserNotificationDetailPage from "./features/notifications/components/UserNotificationDetailPage";
import JobBanner from "./components/JobBanner/JobBanner";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsAndConditions from "./pages/legal/TermsAndConditions";
import Disclaimer from "./pages/legal/Disclaimer";
import AboutUs from "./pages/legal/AboutUs";
import FeedbackPage from "./pages/feedback/FeedbackPage";
import ForgotPasswordPopup from "./components/ForgotPasswordPopup";
import ResetPasswordPopup from "./components/ResetPasswordPopup";
import ProfilePage from "./pages/ProfilePage";
import MyDashboard from "./pages/MyDashboard";
import GoogleCallbackPage from "./pages/GoogleCallbackPage";
import { ToastContainer, toast } from "react-toastify";
import { checkAuthStatus, logoutUser } from "./services/authApi";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";



const AppLayout: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const showSearchBarBanner =
    location.pathname === "/" ||
    matchPath("/notification/category/:category", location.pathname) !== null ||
    matchPath("/notification/state/:state", location.pathname) !== null;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showSignUpTab, setShowSignUpTab] = useState(false);
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [resetEmail, setResetEmail] = useState<string>("");

  const [givenName, setGivenName] = useState<string | undefined>(undefined);
  const [familyName, setFamilyName] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  const [adminRole, setAdminRole] = useState<string | undefined>(undefined);
  const [userState, setUserState] = useState<string | undefined>(undefined);

  const [authPopupError, setAuthPopupError] = useState<string>("");
  const [userCategory, setUserCategory] = useState<string | undefined>(undefined);

  // Global event listener for forcing auth popup
  useEffect(() => {
    const handleOpenAuthPopup = () => setShowAuthPopup(true);
    window.addEventListener("openAuthPopup", handleOpenAuthPopup);
    return () => window.removeEventListener("openAuthPopup", handleOpenAuthPopup);
  }, []);

  // Check auth status on first load; also handle Google OAuth error redirects
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");
    if (authError) {
      const displayMsg = authError.includes("Email already registered")
        ? authError
        : "This email is already registered. Please sign in with your email and password.";
      setAuthPopupError(displayMsg);
      setShowAuthPopup(true);
      toast.error(displayMsg, { autoClose: 5000 });
      // Clean up the query param without a full reload
      window.history.replaceState({}, "", window.location.pathname);
    }

    const verifyAuth = async () => {
      const { isAuthenticated, user } = await checkAuthStatus();
      setIsAuthenticated(isAuthenticated);
      if (isAuthenticated && user) {
        setGivenName(user.given_name);
        setFamilyName(user.family_name);
        setUserEmail(user.email);
        setIsAdmin(user.isAdmin);
        setAdminRole(user.adminRole || undefined);
        setUserState(user.state);
        setUserCategory(user.category);
      } else {
        setGivenName(undefined);
        setFamilyName(undefined);
        setUserEmail(undefined);
        setIsAdmin(undefined);
        setAdminRole(undefined);
        setUserState(undefined);
        setUserCategory(undefined);
      }
      setCheckingAuth(false);
    };

    verifyAuth();
  }, []);

  const handleAuthSuccess = async () => {
    // immediately fetch user info after login
    const { isAuthenticated, user } = await checkAuthStatus();
    setIsAuthenticated(isAuthenticated);

    if (isAuthenticated && user) {
      setGivenName(user.given_name);
      setFamilyName(user.family_name);
      setUserEmail(user.email);
      setIsAdmin(user.isAdmin);
      setAdminRole(user.adminRole || undefined);
      setUserState(user.state);
      setUserCategory(user.category);
    }

    setShowAuthPopup(false);
    setShowSignUpTab(false);
    setShowVerifyPopup(false);
  };
  const handleRequireVerification = (email: string) => {
    setPendingEmail(email);
    setShowAuthPopup(false);
    setShowVerifyPopup(true);
  };

  const handleLogout = async () => {
    await logoutUser(); // clears cookies on backend
    setIsAuthenticated(false);
    setShowVerifyPopup(false);
    setShowAuthPopup(true);
    setGivenName(undefined);
    setFamilyName(undefined);
    setUserEmail(undefined);
    setIsAdmin(undefined);
    setAdminRole(undefined);
    setUserState(undefined);
    setUserCategory(undefined);
  };

  const handleForgotPassword = () => {
    setShowAuthPopup(false);
    setShowForgotPassword(true);
  };

  const handleCodeSent = (email: string) => {
    setResetEmail(email);
    setShowForgotPassword(false);
    setShowResetPassword(true);
  };

  const handleResetSuccess = () => {
    setShowResetPassword(false);
    setShowAuthPopup(true);
    toast.success("Password reset successful. Please log in with your new password.");
  };

  if (checkingAuth) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider isAuthenticated={isAuthenticated} onShowAuthPopup={() => setShowAuthPopup(true)}>
    <ScrollToTop />
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        isAuthenticated={isAuthenticated}
        givenName={givenName}
        familyName={familyName}
        userEmail={userEmail}
        isAdmin={isAdmin}
        adminRole={adminRole}
        state={userState}
        category={userCategory}
        onLogout={handleLogout}
        onShowAuthPopup={() => setShowAuthPopup(true)}
        onShowSignUpPopup={() => { setShowSignUpTab(true); setShowAuthPopup(true); }}
      />

      {!isAdminRoute && <Navigation />}
      {showSearchBarBanner && <SearchBar />}
      {!isAdminRoute && <JobBanner />}

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* Admin routes – protected */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                checkingAuth={checkingAuth}
              >
                <DashboardPage adminRole={adminRole} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/addNotification"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                checkingAuth={checkingAuth}
              >
                <AddNotificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit/:id"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                checkingAuth={checkingAuth}
              >
                <EditNotificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/review/:id"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                checkingAuth={checkingAuth}
              >
                <ReviewNotificationPage adminRole={adminRole} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                checkingAuth={checkingAuth}
              >
                <AdminFeedbackPage
                  isAuthenticated={isAuthenticated}
                  givenName={givenName}
                  familyName={familyName}
                  email={userEmail}
                  isAdmin={isAdmin}
                  adminRole={adminRole}
                  onLogout={handleLogout}
                  onShowAuthPopup={() => setShowAuthPopup(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/scraper"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                checkingAuth={checkingAuth}
              >
                <ScraperDashboard />
              </ProtectedRoute>
            }
          />

          {/* Public routes */}
          <Route
            path="/notification/category/:category"
            element={<CategoryView />}
          />
          <Route
            path="/notification/state/:state"
            element={<StateView />}
          />
          <Route
            path="/notification/:slug/:id"
            element={
              <UserNotificationDetailPage
                isAuthenticated={isAuthenticated}
                onShowAuthPopup={() => setShowAuthPopup(true)}
              />
            }
          />

          {/* User dashboard – protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                checkingAuth={checkingAuth}
              >
                <MyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Google OAuth callback */}
          <Route path="/login/callback" element={<GoogleCallbackPage />} />

          {/* Legal pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/about" element={<AboutUs />} />

          {/* feedback page */}
          <Route path="/feedback" element={<FeedbackPage />} />

          {/* Profile page – protected */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                checkingAuth={checkingAuth}
              >
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch‑all: wrong URL → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
      />
      <Footer />

      <SignUpPopup
        show={showAuthPopup && !isAuthenticated}
        onClose={() => { setShowAuthPopup(false); setShowSignUpTab(false); }}
        onAuthSuccess={handleAuthSuccess}
        onRequireVerification={handleRequireVerification}
        onForgotPassword={handleForgotPassword}
        initialError={authPopupError}
        initialTab={showSignUpTab ? "register" : "login"}
      />

      <VerifyAccountPopup
        show={showVerifyPopup && !isAuthenticated}
        email={pendingEmail}
        onClose={() => setShowVerifyPopup(false)}
        onVerified={handleAuthSuccess}
      />

      <ForgotPasswordPopup
        show={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onCodeSent={handleCodeSent}
      />

      <ResetPasswordPopup
        show={showResetPassword}
        email={resetEmail}
        onClose={() => setShowResetPassword(false)}
        onSuccess={handleResetSuccess}
      />
    </div>
    </AuthProvider>
  );
};

const App: React.FC = () => (
  <Router>
    <AppLayout />
  </Router>
);

export default App;
