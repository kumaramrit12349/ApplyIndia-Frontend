import React, { useEffect } from "react";
import { BsCheckCircleFill, BsXCircleFill, BsInfoCircleFill, BsExclamationTriangleFill, BsX } from "react-icons/bs";

interface ToastProps {
  show: boolean;
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const config = {
    success: {
      bg: "linear-gradient(135deg, #28a745, #20c997)",
      icon: <BsCheckCircleFill size={22} />
    },
    error: {
      bg: "linear-gradient(135deg, #dc3545, #c82333)",
      icon: <BsXCircleFill size={22} />
    },
    info: {
      bg: "linear-gradient(135deg, #667eea, #764ba2)",
      icon: <BsInfoCircleFill size={22} />
    },
    warning: {
      bg: "linear-gradient(135deg, #ffc107, #ff9800)",
      icon: <BsExclamationTriangleFill size={22} />
    },
  }[type];

  return (
    <div className="position-fixed top-0 end-0 p-4" style={{ zIndex: 9999 }}>
      <div 
        className="shadow-lg overflow-hidden d-flex align-items-stretch" 
        style={{ 
          minWidth: '320px', 
          maxWidth: '400px',
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '16px',
        }}
        role="alert"
      >
        <div className="d-flex align-items-center justify-content-center px-3" style={{ background: config.bg, color: '#fff' }}>
          {config.icon}
        </div>
        <div className="p-3 flex-grow-1">
          <h6 className="mb-1 fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </h6>
          <p className="mb-0 text-secondary" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
            {message}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="btn border-0 text-muted p-3 d-flex align-items-start"
          style={{ background: 'transparent', boxShadow: 'none' }}
        >
          <BsX size={24} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
