import React from "react";
import { Modal, Button } from "react-bootstrap";

interface ConfirmationModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary" | "warning";
    loading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    show,
    onHide,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    loading = false,
}) => {
    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="light" onClick={onHide} disabled={loading}>
                    {cancelText}
                </Button>
                <Button variant={variant} onClick={onConfirm} disabled={loading}>
                    {loading ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : (
                        confirmText
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmationModal;
