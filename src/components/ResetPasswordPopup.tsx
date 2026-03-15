import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { resetPassword } from "../services/authApi";

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
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        setError("");

        try {
            await resetPassword(email, code, password);
            onSuccess();
        } catch (err: any) {
            setError(err?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered contentClassName="border-0 shadow-lg rounded-4">
            <Modal.Header closeButton className="border-0 pb-1">
                <Modal.Title className="w-100 fs-2" style={{ fontWeight: 700 }}>
                    Reset Password
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0 px-4 pb-4">
                <p className="text-muted mb-4">
                    Enter the code sent to <strong>{email}</strong> and your new password.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold" htmlFor="reset-code">
                            Verification Code
                        </label>
                        <input
                            id="reset-code"
                            className="form-control bg-body-tertiary"
                            style={{ borderRadius: 10 }}
                            placeholder="Enter code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold" htmlFor="new-password">
                            New Password
                        </label>
                        <div className="position-relative">
                            <input
                                id="new-password"
                                className="form-control bg-body-tertiary"
                                style={{ borderRadius: 10, paddingRight: "40px" }}
                                placeholder="Enter new password"
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
                            Confirm New Password
                        </label>
                        <div className="position-relative">
                            <input
                                id="confirm-password"
                                className="form-control bg-body-tertiary"
                                style={{ borderRadius: 10, paddingRight: "40px" }}
                                placeholder="Confirm new password"
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
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-100 py-2 fw-bold"
                        style={{ borderRadius: "13px", fontSize: "1.1em" }}
                        disabled={loading}
                    >
                        {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>
                {error && (
                    <div className="text-danger mt-3 text-center fs-6">{error}</div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ResetPasswordPopup;
