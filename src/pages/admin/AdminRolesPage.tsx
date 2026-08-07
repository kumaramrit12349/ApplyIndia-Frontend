import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiTrash2,
  FiEdit,
  FiPlus,
  FiShield,
  FiLayers,
  FiMapPin,
  FiCalendar,
  FiSearch,
  FiX,
  FiInfo,
} from "react-icons/fi";
import {
  listAdminUsers,
  assignAdminRole,
  removeAdminRole,
} from "../../services/adminRoleApi";
import type {
  AdminUser,
  AdminPermissions,
} from "../../services/adminRoleApi";
import {
  NOTIFICATION_CATEGORIES,
  INDIAN_STATES,
} from "../../constant/SharedConstant";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

// Exclude the 'all' option from selectable categories list
const SELECTABLE_CATEGORIES = NOTIFICATION_CATEGORIES.filter(
  (c) => c.value !== "all"
);

// Map window keys to readable labels
const WINDOW_LABELS: Record<string, string> = {
  all: "All Time",
  last_1_month: "Last 1 Month",
  last_2_months: "Last 2 Months",
  last_3_months: "Last 3 Months",
  last_6_months: "Last 6 Months",
  last_1_year: "Last 1 Year",
};

const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  admin: { bg: "rgba(15, 61, 145, 0.12)", text: "var(--color-primary)", label: "Admin" },
  senior_reviewer: { bg: "rgba(124, 58, 237, 0.14)", text: "#7c3aed", label: "Senior Reviewer" },
  reviewer: { bg: "rgba(245, 158, 11, 0.15)", text: "#d97706", label: "Reviewer" },
  creator: { bg: "rgba(37, 99, 235, 0.12)", text: "var(--color-secondary)", label: "Creator" },
};

const AdminRolesPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<"creator" | "reviewer" | "senior_reviewer" | "admin">("creator");
  const [allCategories, setAllCategories] = useState<boolean>(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allStates, setAllStates] = useState<boolean>(true);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [dataWindow, setDataWindow] = useState<string>("all");

  const [stateSearch, setStateSearch] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Delete Confirm Modal State
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listAdminUsers();
      if (res.success) {
        setUsers(res.users);
      } else {
        setError("Failed to fetch admin users");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: AdminUser) => {
    setIsEditing(true);
    setEmail(user.email);
    setRole(user.admin_role as "creator" | "reviewer" | "senior_reviewer" | "admin");

    const perms = user.admin_permissions;
    if (perms) {
      // Categories
      if (perms.categories.includes("all") || perms.categories.length === 0) {
        setAllCategories(true);
        setSelectedCategories([]);
      } else {
        setAllCategories(false);
        setSelectedCategories(perms.categories);
      }

      // States
      if (perms.states.includes("all") || perms.states.length === 0) {
        setAllStates(true);
        setSelectedStates([]);
      } else {
        setAllStates(false);
        setSelectedStates(perms.states);
      }

      // Time lookback window
      setDataWindow(perms.data_window || "all");
    } else {
      // Fallback defaults
      setAllCategories(true);
      setSelectedCategories([]);
      setAllStates(true);
      setSelectedStates([]);
      setDataWindow("all");
    }
  };

  const handleClearForm = () => {
    setIsEditing(false);
    setEmail("");
    setRole("creator");
    setAllCategories(true);
    setSelectedCategories([]);
    setAllStates(true);
    setSelectedStates([]);
    setDataWindow("all");
    setStateSearch("");
  };

  const handleCategoryCheckboxChange = (catVal: string) => {
    if (selectedCategories.includes(catVal)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catVal));
    } else {
      setSelectedCategories([...selectedCategories, catVal]);
    }
  };

  const handleStateCheckboxChange = (stateVal: string) => {
    if (selectedStates.includes(stateVal)) {
      setSelectedStates(selectedStates.filter((s) => s !== stateVal));
    } else {
      setSelectedStates([...selectedStates, stateVal]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const categories = allCategories ? ["all"] : selectedCategories;
      const states = allStates ? ["all"] : selectedStates;

      if (!allCategories && categories.length === 0) {
        toast.error("Please select at least one category or select 'All Categories'.");
        setSubmitting(false);
        return;
      }
      if (!allStates && states.length === 0) {
        toast.error("Please select at least one state or select 'All States'.");
        setSubmitting(false);
        return;
      }

      const permissions: AdminPermissions = {
        categories,
        states,
        data_window: dataWindow,
      };

      const res = await assignAdminRole(email, role, permissions);
      if (res.success) {
        toast.success(res.message || "Permissions saved successfully!");
        handleClearForm();
        fetchUsers();
      } else {
        toast.error("Failed to save permissions.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to assign role.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (user: AdminUser) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete || !userToDelete.sub) return;

    try {
      const res = await removeAdminRole(userToDelete.sub);
      if (res.success) {
        toast.success(res.message || "Admin role removed successfully.");
        fetchUsers();
      } else {
        toast.error("Failed to remove admin role.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to remove role.");
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Filter states by search input
  const filteredStates = INDIAN_STATES.filter(
    (s) =>
      s.label.toLowerCase().includes(stateSearch.toLowerCase()) ||
      s.value.toLowerCase().includes(stateSearch.toLowerCase())
  );

  return (
    <div className="min-vh-100 py-5" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        {/* Header Section */}
        <div className="card shadow-sm border-0 mb-4 rounded-3" style={{ background: "var(--color-surface)" }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-3 mb-2">
              <div
                className="rounded-circle p-3 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "rgba(15, 61, 145, 0.12)", color: "var(--color-primary)" }}
              >
                <FiShield size={28} />
              </div>
              <div>
                <h2 className="h4 mb-1 fw-bold" style={{ color: "var(--color-heading)" }}>
                  Admin Roles & Permissions
                </h2>
                <p className="text-muted mb-0 small">
                  Configure role-based access control and restrict notification actions by categories, states, and chronological lookback limits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger shadow-sm mb-4 d-flex align-items-center gap-2">
            <FiInfo className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <div className="row g-4">
          {/* Left Column: Admin Users List */}
          <div className="col-lg-7">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header py-3 border-0" style={{ background: "var(--color-surface)" }}>
                <h5 className="mb-0 fw-bold" style={{ color: "var(--color-heading)" }}>Active Administrators</h5>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border" style={{ color: "var(--color-primary)" }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <FiInfo size={36} className="mb-2 text-secondary" />
                    <p className="mb-0">No custom administrative roles set up yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ background: "var(--color-bg)" }}>
                        <tr>
                          <th className="px-4">User</th>
                          <th>Role</th>
                          <th>Permissions</th>
                          <th className="text-end px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => {
                          const roleStyle =
                            ROLE_STYLES[u.admin_role || "creator"] ||
                            ROLE_STYLES.creator;
                          const perms = u.admin_permissions;

                          const catsText =
                            !perms ||
                            perms.categories.includes("all") ||
                            perms.categories.length === 0
                              ? "All Categories"
                              : perms.categories
                                  .map(
                                    (val) =>
                                      SELECTABLE_CATEGORIES.find(
                                        (c) => c.value === val
                                      )?.label || val
                                  )
                                  .join(", ");

                          const statesText =
                            !perms ||
                            perms.states.includes("all") ||
                            perms.states.length === 0
                              ? "All States"
                              : perms.states.join(", ");

                          const windowText = perms?.data_window
                            ? WINDOW_LABELS[perms.data_window] || perms.data_window
                            : "All Time";

                          return (
                            <tr key={u.sub || u.email}>
                              <td className="px-4">
                                <div className="fw-semibold" style={{ color: "var(--color-heading)" }}>
                                  {u.given_name
                                    ? `${u.given_name} ${u.family_name || ""}`
                                    : "Registered User"}
                                </div>
                                <div className="text-muted small">{u.email}</div>
                              </td>
                              <td>
                                <span
                                  className="badge px-2 py-1.5 rounded-pill font-monospace"
                                  style={{
                                    backgroundColor: roleStyle.bg,
                                    color: roleStyle.text,
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  {roleStyle.label}
                                </span>
                              </td>
                              <td style={{ maxWidth: "260px" }}>
                                <div className="d-flex flex-column gap-1 small text-muted">
                                  <div className="d-flex align-items-start gap-1">
                                    <FiLayers
                                      size={12}
                                      className="mt-1 flex-shrink-0"
                                    />
                                    <span className="text-truncate" title={catsText}>
                                      {catsText}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-start gap-1">
                                    <FiMapPin
                                      size={12}
                                      className="mt-1 flex-shrink-0"
                                    />
                                    <span className="text-truncate" title={statesText}>
                                      {statesText}
                                    </span>
                                  </div>
                                  <div className="d-flex align-items-start gap-1">
                                    <FiCalendar
                                      size={12}
                                      className="mt-1 flex-shrink-0"
                                    />
                                    <span>{windowText}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="text-end px-4">
                                <div className="d-flex gap-2 justify-content-end">
                                  <button
                                    onClick={() => handleEditClick(u)}
                                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 shadow-sm px-2.5"
                                    title="Edit permissions"
                                  >
                                    <FiEdit size={14} />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(u)}
                                    className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center shadow-sm p-2"
                                    title="Remove Role"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Add / Edit Form */}
          <div className="col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-header py-3 border-0 d-flex justify-content-between align-items-center" style={{ background: "var(--color-surface)" }}>
                <h5 className="mb-0 fw-bold" style={{ color: "var(--color-heading)" }}>
                  {isEditing ? "Update Administrator" : "Assign Admin Role"}
                </h5>
                {isEditing && (
                  <button
                    onClick={handleClearForm}
                    className="btn btn-sm btn-link text-muted p-0 d-flex align-items-center gap-1 text-decoration-none"
                  >
                    <FiX size={14} />
                    Cancel Edit
                  </button>
                )}
              </div>
              <div className="card-body">
                <form onSubmit={handleFormSubmit}>
                  {/* Email Input */}
                  <div className="mb-3">
                    <label htmlFor="userEmail" className="form-label fw-semibold text-secondary small">
                      User Email Address
                    </label>
                    <input
                      id="userEmail"
                      type="email"
                      placeholder="e.g. name@applyindia.in"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isEditing}
                      required
                    />
                    {!isEditing && (
                      <div className="form-text text-muted small mt-1">
                        User must already have an account in the system.
                      </div>
                    )}
                  </div>

                  {/* Role Dropdown */}
                  <div className="mb-3">
                    <label htmlFor="adminRoleSelect" className="form-label fw-semibold text-secondary small">
                      Administrative Role
                    </label>
                    <select
                      id="adminRoleSelect"
                      className="form-select"
                      value={role}
                      onChange={(e) =>
                        setRole(e.target.value as "creator" | "reviewer" | "senior_reviewer" | "admin")
                      }
                    >
                      <option value="creator">Creator (Add/Edit notifications)</option>
                      <option value="reviewer">Reviewer (Approve notifications)</option>
                      <option value="senior_reviewer">Senior Reviewer (Create, edit, approve & archive)</option>
                      <option value="admin">Admin (All actions, full control)</option>
                    </select>
                  </div>

                  <hr className="my-3 text-muted opacity-25" />

                  {/* Category Permissions */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold text-secondary small">Category Access Scope</span>
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="allCategoriesSwitch"
                          checked={allCategories}
                          onChange={(e) => setAllCategories(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="allCategoriesSwitch">
                          All Categories
                        </label>
                      </div>
                    </div>

                    {!allCategories && (
                      <div className="p-3 border rounded" style={{ background: "var(--color-bg)" }}>
                        <div className="row g-2">
                          {SELECTABLE_CATEGORIES.map((cat) => (
                            <div key={cat.value} className="col-6">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  value={cat.value}
                                  id={`cat-${cat.value}`}
                                  checked={selectedCategories.includes(cat.value)}
                                  onChange={() =>
                                    handleCategoryCheckboxChange(cat.value)
                                  }
                                />
                                <label
                                  className="form-check-label small text-truncate d-block"
                                  htmlFor={`cat-${cat.value}`}
                                  title={cat.label}
                                >
                                  {cat.label}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* State Permissions */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold text-secondary small">State Access Scope</span>
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="allStatesSwitch"
                          checked={allStates}
                          onChange={(e) => setAllStates(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="allStatesSwitch">
                          All States
                        </label>
                      </div>
                    </div>

                    {!allStates && (
                      <div className="p-3 border rounded" style={{ background: "var(--color-bg)" }}>
                        {/* Search states */}
                        <div className="input-group input-group-sm mb-2 shadow-xs">
                          <span className="input-group-text border-end-0" style={{ background: "var(--color-surface)" }}>
                            <FiSearch size={12} className="text-secondary" />
                          </span>
                          <input
                            type="text"
                            placeholder="Filter states..."
                            className="form-control border-start-0 ps-0 text-xs"
                            value={stateSearch}
                            onChange={(e) => setStateSearch(e.target.value)}
                          />
                        </div>

                        {/* Scrollable list */}
                        <div
                          className="overflow-y-auto"
                          style={{ maxHeight: "150px" }}
                        >
                          <div className="row g-1">
                            {filteredStates.length === 0 ? (
                              <div className="col-12 py-2 text-center text-muted small">
                                No states match query.
                              </div>
                            ) : (
                              filteredStates.map((s) => (
                                <div key={s.value} className="col-6">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      value={s.value}
                                      id={`state-${s.value}`}
                                      checked={selectedStates.includes(s.value)}
                                      onChange={() =>
                                        handleStateCheckboxChange(s.value)
                                      }
                                    />
                                    <label
                                      className="form-check-label small text-truncate d-block"
                                      htmlFor={`state-${s.value}`}
                                      title={s.label}
                                    >
                                      {s.label}
                                    </label>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Data Window Filter */}
                  <div className="mb-4">
                    <label htmlFor="dataWindowSelect" className="form-label fw-semibold text-secondary small">
                      Chronological Data Window Limit
                    </label>
                    <select
                      id="dataWindowSelect"
                      className="form-select"
                      value={dataWindow}
                      onChange={(e) => setDataWindow(e.target.value)}
                    >
                      <option value="all">Unrestricted (All Time)</option>
                      <option value="last_1_month">Last 1 Month</option>
                      <option value="last_2_months">Last 2 Months</option>
                      <option value="last_3_months">Last 3 Months</option>
                      <option value="last_6_months">Last 6 Months</option>
                      <option value="last_1_year">Last 1 Year</option>
                    </select>
                    <div className="form-text text-muted small mt-1">
                      Restricts the historical range of notifications this user can view or modify.
                    </div>
                  </div>

                  {(role === "creator" || role === "reviewer") && (
                    <div className="mb-4 p-3 border rounded d-flex align-items-start gap-2" style={{ background: "var(--color-bg)" }}>
                      <FiInfo className="flex-shrink-0 mt-1 text-muted" size={14} />
                      <div className="form-text text-muted small mb-0">
                        {role === "reviewer" ? "Reviewers" : "Creators"} can only edit notifications that haven't been approved yet, and can't archive notifications. Assign the "Senior Reviewer" role for full edit/archive access.
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <button
                    type="submit"
                    className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold text-white border-0"
                    style={{ background: "var(--color-primary)" }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    ) : isEditing ? (
                      "Save Permissions"
                    ) : (
                      <>
                        <FiPlus />
                        <span>Assign Administrator</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="Remove Admin Permissions"
        message={`Are you sure you want to remove all administrative roles and permissions for ${userToDelete?.email}? They will immediately lose access to creator and reviewer dashboards.`}
        confirmText="Remove Role"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
      />
    </div>
  );
};

export default AdminRolesPage;
