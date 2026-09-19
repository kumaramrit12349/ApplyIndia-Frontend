import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import "./BackToDashboard.css";

interface BackToDashboardProps {
  to?: string;
  label?: string;
  /** "solid" (gradient) on plain surfaces; "light" (white pill) on top of a coloured banner. */
  variant?: "solid" | "light";
}

const BackToDashboard: React.FC<BackToDashboardProps> = ({ to = "/admin/dashboard", label = "Back to Dashboard", variant = "solid" }) => (
  <Link to={to} className={`btd btd--${variant}`}>
    <span className="btd-icon">
      <FiArrowLeft size={16} />
    </span>
    {label}
  </Link>
);

export default BackToDashboard;
