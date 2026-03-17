import React, { useEffect, useState } from "react";
import "./CongratulationsPopup.css";

interface CongratulationsPopupProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const CONFETTI_COLORS = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A",
    "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
    "#F8C471", "#82E0AA", "#F1948A", "#AED6F1",
    "#D7BDE2", "#A3E4D7", "#FAD7A0", "#A9CCE3",
];

const CongratulationsPopup: React.FC<CongratulationsPopupProps> = ({
    show,
    onClose,
    title = "🎉 Congratulations!",
    message = "You've taken the first step towards your dream!",
    actionLabel = "Continue",
    onAction,
}) => {
    const [confettiPieces, setConfettiPieces] = useState<
        { id: number; left: number; color: string; delay: number; size: number; type: string }[]
    >([]);

    useEffect(() => {
        if (show) {
            const pieces = Array.from({ length: 60 }, (_, i) => ({
                id: i,
                left: Math.random() * 100,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                delay: Math.random() * 2,
                size: 6 + Math.random() * 8,
                type: ["square", "circle", "ribbon"][Math.floor(Math.random() * 3)],
            }));
            setConfettiPieces(pieces);
        } else {
            setConfettiPieces([]);
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="congrats-overlay" onClick={onClose}>
            <div className="congrats-confetti-container">
                {confettiPieces.map((p) => (
                    <div
                        key={p.id}
                        className={`congrats-confetti congrats-confetti--${p.type}`}
                        style={{
                            left: `${p.left}%`,
                            backgroundColor: p.color,
                            animationDelay: `${p.delay}s`,
                            width: p.type === "ribbon" ? `${p.size * 0.4}px` : `${p.size}px`,
                            height: p.type === "ribbon" ? `${p.size * 2.5}px` : `${p.size}px`,
                            borderRadius: p.type === "circle" ? "50%" : p.type === "ribbon" ? "2px" : "2px",
                        }}
                    />
                ))}
            </div>

            <div className="congrats-modal" onClick={(e) => e.stopPropagation()}>
                <div className="congrats-emoji">🏆</div>
                <h2 className="congrats-title">{title}</h2>
                <p className="congrats-message">{message}</p>
                <button className="congrats-button" onClick={onAction || onClose}>
                    {actionLabel}
                </button>
            </div>
        </div>
    );
};

export default CongratulationsPopup;
