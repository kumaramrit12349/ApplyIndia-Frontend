import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { forgotPassword } from "../services/authApi";
import { useTranslation } from "../i18n/useTranslation";

interface ForgotPasswordPopupProps {
    show: boolean;
    onClose: () => void;
    onCodeSent: (email: string) => void;
}

const ForgotPasswordPopup: React.FC<ForgotPasswordPopupProps> = ({
    show,
    onClose,
    onCodeSent,
}) => {
    const { authFlow: t } = useTranslation();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await forgotPassword(email);
            onCodeSent(email);
        } catch (err: any) {
            setError(err?.message || t.resetCodeFailed);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered contentClassName="border-0 shadow-lg rounded-4">
            <Modal.Header closeButton className="border-0 pb-1">
                <Modal.Title className="w-100 fs-2" style={{ fontWeight: 700, color: "var(--color-heading)" }}>
                    {t.forgotPasswordTitle}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0 px-4 pb-4">
                <p className="text-muted mb-4">{t.forgotPasswordDesc}</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold" htmlFor="reset-email">
                            {t.emailAddress}
                        </label>
                        <input
                            id="reset-email"
                            className="form-control bg-body-tertiary"
                            style={{ borderRadius: 10, fontSize: "1.08em" }}
                            placeholder="name@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn w-100 py-2 fw-bold text-white border-0"
                        style={{
                            borderRadius: "13px",
                            fontSize: "1.1em",
                            background: "linear-gradient(135deg, var(--color-secondary), var(--color-primary))",
                        }}
                        disabled={loading}
                    >
                        {loading ? t.sending : t.sendResetCode}
                    </button>
                </form>
                {error && (
                    <div className="text-danger mt-3 text-center fs-6">{error}</div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ForgotPasswordPopup;
