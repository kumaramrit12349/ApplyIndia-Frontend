import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { resetPassword } from "../services/authApi";
import { useTranslation } from "../i18n/useTranslation";

interface ResetPasswordPopupProps {
    show: boolean;
    email: string;
    onClose: () => void;
    onSuccess: () => void;
}

const ResetPasswordPopup: React.FC<ResetPasswordPopupProps> = ({
    show,
    email,
    onClose,
    onSuccess,
}) => {
    const { authFlow: t } = useTranslation();
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t.passwordsDontMatch);
            return;
        }
        setLoading(true);
        setError("");

        try {
            await resetPassword(email, code, password);
            onSuccess();
        } catch (err: any) {
            setError(err?.message || t.resetPasswordFailed);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered contentClassName="border-0 shadow-lg rounded-4">
            <Modal.Header closeButton className="border-0 pb-1">
                <Modal.Title className="w-100 fs-2" style={{ fontWeight: 700, color: "var(--color-heading)" }}>
                    {t.resetPasswordTitle}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0 px-4 pb-4">
                <p className="text-muted mb-4">{t.resetPasswordDesc(email)}</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold" htmlFor="reset-code">
                            {t.verificationCode}
                        </label>
                        <input
                            id="reset-code"
                            className="form-control bg-body-tertiary"
                            style={{ borderRadius: 10 }}
                            placeholder={t.enterCode}
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold" htmlFor="new-password">
                            {t.newPassword}
                        </label>
                        <div className="position-relative">
                            <input
                                id="new-password"
                                className="form-control bg-body-tertiary"
                                style={{ borderRadius: 10, paddingRight: "40px" }}
                                placeholder={t.enterNewPassword}
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ zIndex: 10 }}
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold" htmlFor="confirm-password">
                            {t.confirmNewPassword}
                        </label>
                        <div className="position-relative">
                            <input
                                id="confirm-password"
                                className="form-control bg-body-tertiary"
                                style={{ borderRadius: 10, paddingRight: "40px" }}
                                placeholder={t.confirmNewPasswordPlaceholder}
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ zIndex: 10 }}
                            >
                                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
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
                        {loading ? t.resetting : t.resetPasswordBtn}
                    </button>
                </form>
                {error && (
                    <div className="text-danger mt-3 text-center fs-6">{error}</div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ResetPasswordPopup;
