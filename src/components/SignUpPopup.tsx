import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
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
}

const AuthPopup: React.FC<AuthPopupProps> = ({
  show,
  onClose,
  onAuthSuccess,
  onRequireVerification,
  onForgotPassword,
  initialError,
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
    if (initialError && show) {
      setError(initialError);
      setTab("login");
    } else if (!show) {
      setError("");
    }
  }, [initialError, show]);

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
          style={{ fontWeight: 700, textAlign: "left" }}
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
                className="link-primary fw-semibold"
                style={{ cursor: "pointer" }}
                onClick={() => swapTab("register")}
              >
                Register Now
              </a>
            </>
          ) : (
            <>
              <span className="text-muted">Already have an account?</span>
              <a
                className="link-primary fw-semibold"
                style={{ cursor: "pointer" }}
                onClick={() => swapTab("login")}
              >
                Log in
              </a>
            </>
          )}
        </div>

        {/* Google Sign-In Button */}
        <Button
          variant="light"
          className="w-100 py-2 my-2 mb-1 d-flex align-items-center justify-content-center border"
          style={{
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "1.08em",
            borderColor: "#eee",
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
        </Button>

        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="px-3 text-muted" style={{ fontSize: '0.85em' }}>or</span>
          <hr className="flex-grow-1" />
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} autoComplete="on">
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
          <div className="d-flex align-items-center justify-content-end mb-3">
            {tab === "login" && (
              <a
                className="link-primary fw-semibold"
                style={{ fontSize: "0.98em", cursor: "pointer" }}
                onClick={onForgotPassword}
              >
                Forgot Password?
              </a>
            )}
            {tab === "register" && <span />}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-100 py-2 fw-bold"
            style={{
              borderRadius: "13px",
              fontSize: "1.25em",
              letterSpacing: "0.02em",
              marginTop: 2,
            }}
            disabled={loading}
          >
            {loading
              ? tab === "login"
                ? "Signing In..."
                : "Signing Up..."
              : tab === "login"
                ? "Sign In"
                : "Sign Up"}
          </Button>
        </form>

        {error && (
          <div className="text-danger mt-3 text-center fs-6">{error}</div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AuthPopup;
