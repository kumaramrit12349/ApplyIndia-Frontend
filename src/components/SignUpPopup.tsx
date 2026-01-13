import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { loginUser, signUpUser } from "../services/authApi";

const API_BASE_URL = "http://localhost:3000";

// const SSO_PROVIDERS = [
//   {
//     name: "Google",
//     icon: "https://img.icons8.com/color/28/000000/google-logo.png",
//     url: "https://accounts.google.com/signin",
//   },
//   {
//     name: "Facebook",
//     icon: "https://img.icons8.com/color/28/000000/facebook-new.png",
//     url: "https://www.facebook.com/",
//   },
//   {
//     name: "Telegram",
//     icon: "https://img.icons8.com/color/28/000000/telegram-app.png",
//     url: "https://t.me/",
//   },
//   {
//     name: "WhatsApp",
//     icon: "https://img.icons8.com/color/28/000000/whatsapp.png",
//     url: "https://wa.me/",
//   },
//   {
//     name: "YouTube",
//     icon: "https://img.icons8.com/color/28/000000/youtube-play.png",
//     url: "https://youtube.com/",
//   },
//   {
//     name: "Instagram",
//     icon: "https://img.icons8.com/color/28/000000/instagram-new.png",
//     url: "https://instagram.com/",
//   },
//   {
//     name: "X",
//     icon: "https://img.icons8.com/ios-filled/28/000000/twitterx--v2.png",
//     url: "https://x.com/",
//   },
//   {
//     name: "LinkedIn",
//     icon: "https://img.icons8.com/color/28/000000/linkedin.png",
//     url: "https://www.linkedin.com/",
//   },
// ];

type AuthTab = "login" | "register";

interface AuthPopupProps {
  show: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  onRequireVerification?: (email: string) => void;
}

const AuthPopup: React.FC<AuthPopupProps> = ({
  show,
  onClose,
  onAuthSuccess,
  onRequireVerification,
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

  // const handleSSO = (providerUrl: string) => {
  //   window.open(providerUrl, "_blank", "noopener");
  // };

  const handleForgotPassword = () => {
    window.open(`${API_BASE_URL}/forgot-password`, "_blank");
  };

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

        {/* SSO Main Button */}
        {/* ----------------------------will implement it letter------------------------------- */}
        {/* <Button
          variant="light"
          className="w-100 py-2 my-2 mb-1 d-flex align-items-center justify-content-center border"
          style={{
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "1.08em",
            borderColor: "#eee",
          }}
          onClick={() => handleSSO(SSO_PROVIDERS[0].url)}
        >
          <img
            src={SSO_PROVIDERS[0].icon}
            alt="Google"
            className="me-2"
            style={{ height: 28, width: 28 }}
          />
          Continue with Google
        </Button> */}

        {/* SSO options row */}
        {/* <div className="d-flex justify-content-center my-2" style={{ gap: 20 }}>
          {SSO_PROVIDERS.slice(1).map((p) => (
            <Button
              key={p.name}
              variant="light"
              className="rounded-circle border"
              style={{
                width: 48,
                height: 48,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
              }}
              onClick={() => handleSSO(p.url)}
              title={p.name}
            >
              <img
                src={p.icon}
                alt={p.name}
                style={{ height: 28, width: 28 }}
              />
            </Button>
          ))}
        </div> */}
        <hr className="my-3" />

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
            <input
              id="password"
              className="form-control bg-body-tertiary"
              style={{ borderRadius: 10, fontSize: "1.08em" }}
              placeholder="Enter Password"
              name="password"
              value={form.password}
              onChange={handleInput}
              type="password"
              required
              autoComplete={
                tab === "login" ? "current-password" : "new-password"
              }
            />
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
          <div className="d-flex align-items-center justify-content-between mb-3">
            {tab === "login" && (
              <a
                className="link-primary fw-semibold"
                style={{ fontSize: "0.98em", cursor: "pointer" }}
                onClick={handleForgotPassword}
              >
                Forgot Password
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
