import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { resendVerificationCode, verifyAccount } from "../services/authApi";

interface VerifyAccountPopupProps {
  show: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => void;
}

const VerifyAccountPopup: React.FC<VerifyAccountPopupProps> = ({
  show,
  email,
  onClose,
  onVerified,
}) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await verifyAccount(email, code); // calls /api/auth/confirm
      setMessage("Account verified. You can now log in.");
      onVerified(); // parent will update auth state / close popup
    } catch (err: any) {
      setMessage(err?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    try {
      await resendVerificationCode(email); // calls /api/auth/resend-code
      setMessage("Verification code resent to your email.");
    } catch (err: any) {
      setMessage(err?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered contentClassName="border-0 shadow-lg rounded-4">
      <Modal.Header closeButton className="border-0 pb-1">
        <Modal.Title className="fs-4" style={{ fontWeight: 800, color: "var(--color-heading)" }}>
          Verify your account
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0 px-4 pb-4">
        <p className="mb-3">
          We have sent a verification code to <strong>{email}</strong>. Enter it
          below to activate your account.
        </p>
        <form onSubmit={handleVerify}>
          <div className="mb-3">
            <label className="form-label fw-semibold" htmlFor="code">
              Verification code
            </label>
            <input
              id="code"
              className="form-control bg-body-tertiary"
              style={{ borderRadius: 10, fontSize: "1.08em" }}
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn w-100 mb-2 fw-bold text-white border-0"
            style={{
              borderRadius: "12px",
              background: "linear-gradient(135deg, var(--color-secondary), var(--color-primary))",
              fontSize: "1.05rem",
            }}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
        <Button
          type="button"
          variant="link"
          className="p-0 mt-2"
          style={{ color: "var(--color-primary)" }}
          onClick={handleResend}
          disabled={loading}
        >
          Resend code
        </Button>
        {message && (
          <div className="mt-3 text-center small text-muted">{message}</div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default VerifyAccountPopup;
