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
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Verify your account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
              className="form-control"
              placeholder="Enter code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="w-100 mb-2"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>
        <Button
          type="button"
          variant="link"
          className="p-0 mt-2"
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
