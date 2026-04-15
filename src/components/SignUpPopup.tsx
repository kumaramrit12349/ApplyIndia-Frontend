import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser, signUpUser, getGoogleSignInUrl } from "../services/authApi";

type AuthTab = "login" | "register";

interface AuthPopupProps {
  show: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  onRequireVerification?: (email: string) => void;
  onForgotPassword?: () => void;
  initialError?: string;
  initialTab?: AuthTab;
}

const AuthPopup: React.FC<AuthPopupProps> = ({
  show,
  onClose,
  onAuthSuccess,
  onRequireVerification,
  onForgotPassword,
  initialError,
  initialTab = "login",
}) => {
  const [tab, setTab] = useState<AuthTab>("login");
  const [form, setForm] = useState({
    given_name: "",
    family_name: "",
    email: "",
    password: "",
    gender: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (!show) {
      setError("");
      return;
    }
    if (initialError) {
      setError(initialError);
      setTab("login");
    } else {
      setTab(initialTab);
    }
  }, [initialError, initialTab, show]);

  const swapTab = (next: AuthTab) => {
    setTab(next);
    setError("");
    // do NOT clear email/password here; let browser autofill work
    if (next === "register") {
      // optional: clear only registration fields
      setForm((f) => ({
        ...f,
        given_name: "",
        family_name: "",
        gender: "",
      }));
    }
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (tab === "login") {
        await loginUser(form.email, form.password); // cookies set
        onAuthSuccess?.();
        onClose();
      } else {
        await signUpUser(
          form.given_name,
          form.family_name,
          form.email,
          form.password,
          form.gender
        );

        if (onRequireVerification) {
          onRequireVerification(form.email);
        }
        onClose();
      }
    } catch (err: any) {
      const msg =
        err?.message ||
        (tab === "login" ? "Login failed" : "Registration failed");

      if (
        tab === "login" &&
        msg.toLowerCase().includes("not confirmed") &&
        onRequireVerification
      ) {
        onRequireVerification(form.email);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSignIn = () => {
    window.location.href = getGoogleSignInUrl();
  };

  // const handleSSO = (providerUrl: string) => {
  //   window.open(providerUrl, "_blank", "noopener");
  // };

  // const handleForgotPassword = () => {
  //   window.open(`${PUBLIC_API.FORGOT_PASSWORD}`, "_blank");
  // };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName="auth-modal"
      contentClassName="border-0 shadow-lg rounded-4"
    >
      <Modal.Header closeButton className="border-0 pb-1">
        <Modal.Title
          className="w-100 fs-2"
          style={{ 
            fontWeight: 800, 
            textAlign: "left",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          {tab === "login" ? "Log in" : "Create Account"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0 px-4 pb-2">
        <div className="d-flex align-items-center fs-6 mb-3" style={{ gap: 8 }}>
          {tab === "login" ? (
            <>
              <span className="text-muted">New user?</span>
              <a
                className="fw-bold text-decoration-none"
                style={{ cursor: "pointer", color: "#764ba2", transition: "color 0.2s" }}
                onClick={() => swapTab("register")}
              >
                Register Now
              </a>
            </>
          ) : (
            <>
              <span className="text-muted">Already have an account?</span>
              <a
                className="fw-bold text-decoration-none"
                style={{ cursor: "pointer", color: "#764ba2", transition: "color 0.2s" }}
                onClick={() => swapTab("login")}
              >
                Log in
              </a>
            </>
          )}
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          className="btn btn-light w-100 py-2 my-2 mb-1 d-flex align-items-center justify-content-center bg-white shadow-sm"
          style={{
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "1.08rem",
            border: "1px solid #e0e0e0",
            transition: "all 0.2s ease"
          }}
          onClick={handleGoogleSignIn}
        >
          <img
            src="https://img.icons8.com/color/28/000000/google-logo.png"
            alt="Google"
            className="me-2"
            style={{ height: 28, width: 28 }}
          />
          Continue with Google
        </button>

        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="px-3 text-muted" style={{ fontSize: '0.85em' }}>or</span>
          <hr className="flex-grow-1" />
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Email and Password always present */}
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="form-control bg-body-tertiary"
              style={{ borderRadius: 10, fontSize: "1.08em" }}
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={handleInput}
              type="email"
              required
              autoComplete={tab === "login" ? "email" : "email"}
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="password">
              Password
            </label>
            <div className="position-relative">
              <input
                id="password"
                className="form-control bg-body-tertiary"
                style={{ borderRadius: 10, fontSize: "1.08em", paddingRight: "40px" }}
                placeholder="Enter Password"
                name="password"
                value={form.password}
                onChange={handleInput}
                type={showPassword ? "text" : "password"}
                required
                autoComplete={
                  tab === "login" ? "current-password" : "new-password"
                }
              />
              <button
                type="button"
                className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                onClick={() => setShowPassword(!showPassword)}
                style={{ zIndex: 10 }}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* First and Last Name (Register only) */}
          {tab === "register" && (
            <div className="row">
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label fw-semibold" htmlFor="given_name">
                  First Name
                </label>
                <input
                  id="given_name"
                  className="form-control bg-body-tertiary"
                  style={{ borderRadius: 10 }}
                  placeholder="First name"
                  name="given_name"
                  value={form.given_name}
                  onChange={handleInput}
                  type="text"
                  required
                  autoComplete="given-name"
                />
              </div>
              <div className="col-12 col-md-6 mb-3">
                <label className="form-label fw-semibold" htmlFor="family_name">
                  Last Name
                </label>
                <input
                  id="family_name"
                  className="form-control bg-body-tertiary"
                  style={{ borderRadius: 10 }}
                  placeholder="Last name"
                  name="family_name"
                  value={form.family_name}
                  onChange={handleInput}
                  type="text"
                  required
                  autoComplete="family-name"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold" htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="form-control bg-body-tertiary"
                  style={{ borderRadius: 10 }}
                  value={form.gender}
                  onChange={handleInput}
                  required
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          )}

          {/* Forgot Password & Submit */}
          <div className="d-flex align-items-center justify-content-end mb-3 mt-1">
            {tab === "login" && (
              <a
                className="fw-bold text-decoration-none"
                style={{ fontSize: "0.95rem", cursor: "pointer", color: "#764ba2", transition: "color 0.2s" }}
                onClick={onForgotPassword}
              >
                Forgot Password?
              </a>
            )}
            {tab === "register" && <span />}
          </div>

          <button
            type="submit"
            className="btn w-100 py-2 fw-bold text-white shadow-sm border-0"
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              fontSize: "1.15rem",
              letterSpacing: "0.5px",
              marginTop: 2,
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
            disabled={loading}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 .125rem .25rem rgba(0,0,0,.075)";
            }}
          >
            {loading
              ? tab === "login"
                ? "Signing In..."
                : "Signing Up..."
              : tab === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {error && (
          <div className="text-danger mt-3 text-center fs-6">{error}</div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AuthPopup;
