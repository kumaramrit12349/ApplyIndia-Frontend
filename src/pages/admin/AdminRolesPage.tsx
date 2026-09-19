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
import BackToDashboard from "../../components/BackToDashboard/BackToDashboard";
import "./AdminRolesPage.css";

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
  guidance_partner: { bg: "rgba(13, 148, 136, 0.14)", text: "#0d9488", label: "Guidance Partner" },
};

const AdminRolesPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<"creator" | "reviewer" | "senior_reviewer" | "admin" | "guidance_partner">("creator");
  const [allCategories, setAllCategories] = useState<boolean>(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allStates, setAllStates] = useState<boolean>(true);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [dataWindow, setDataWindow] = useState<string>("all");

  const [stateSearch, setStateSearch] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  // Snapshot of the form's values right after "Edit" is clicked — compared
  // against the live form to decide whether Save Permissions should be
  // enabled (no point re-submitting identical permissions).
  const [editSnapshot, setEditSnapshot] = useState<string | null>(null);

  // Assign/Edit happens in a popup rather than an always-visible side panel.
  const [showFormModal, setShowFormModal] = useState<boolean>(false);

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

  const buildFormSnapshot = (
    r: string,
    allCats: boolean,
    cats: string[],
    allSts: boolean,
    sts: string[],
    window: string
  ) =>
    JSON.stringify({
      role: r,
      allCategories: allCats,
      categories: [...cats].sort(),
      allStates: allSts,
      states: [...sts].sort(),
      dataWindow: window,
    });

  const handleOpenCreate = () => {
    handleClearForm();
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    handleClearForm();
  };

  const handleEditClick = (user: AdminUser) => {
    const newRole = user.admin_role as "creator" | "reviewer" | "senior_reviewer" | "admin" | "guidance_partner";
    let newAllCategories = true;
    let newSelectedCategories: string[] = [];
    let newAllStates = true;
    let newSelectedStates: string[] = [];
    let newDataWindow = "all";

    const perms = user.admin_permissions;
    if (perms) {
      // Categories
      if (perms.categories.includes("all") || perms.categories.length === 0) {
        newAllCategories = true;
        newSelectedCategories = [];
      } else {
        newAllCategories = false;
        newSelectedCategories = perms.categories;
      }

      // States
      if (perms.states.includes("all") || perms.states.length === 0) {
        newAllStates = true;
        newSelectedStates = [];
      } else {
        newAllStates = false;
        newSelectedStates = perms.states;
      }

      // Time lookback window
      newDataWindow = perms.data_window || "all";
    }

    setIsEditing(true);
    setEmail(user.email);
    setRole(newRole);
    setAllCategories(newAllCategories);
    setSelectedCategories(newSelectedCategories);
    setAllStates(newAllStates);
    setSelectedStates(newSelectedStates);
    setDataWindow(newDataWindow);
    setEditSnapshot(
      buildFormSnapshot(newRole, newAllCategories, newSelectedCategories, newAllStates, newSelectedStates, newDataWindow)
    );
    setShowFormModal(true);
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
    setEditSnapshot(null);
  };

  // While editing an existing user, Save Permissions has nothing useful to
  // do until at least one field actually differs from what was loaded.
  const isUnchangedEdit =
    isEditing &&
    editSnapshot !== null &&
    buildFormSnapshot(role, allCategories, selectedCategories, allStates, selectedStates, dataWindow) === editSnapshot;

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
        setShowFormModal(false);
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

  const initials = (u: AdminUser) => {
    const src = u.given_name ? `${u.given_name} ${u.family_name || ""}` : u.email;
    return src
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");
  };

  return (
    <div className="min-vh-100 py-5" style={{ background: "var(--color-bg)" }}>
      <div className="container">
        {/* Header Section */}
        <div className="card shadow-sm border-0 mb-4 rounded-3" style={{ background: "var(--color-surface)" }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-3">
                <div className="rlp-icon-badge">
                  <FiShield size={22} />
                </div>
                <div>
                  <h2 className="rlp-title">Admin Roles &amp; Permissions</h2>
                  <p className="rlp-subtitle mt-1">
                    Configure role-based access control and restrict notification actions by categories, states, and chronological lookback limits.
                  </p>
                </div>
              </div>
              <BackToDashboard />
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger shadow-sm mb-4 d-flex align-items-center gap-2">
            <FiInfo className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Administrators — full width; Assign/Edit happens in the popup below */}
        <div className="card shadow-sm border-0" style={{ background: "var(--color-surface)" }}>
          <div className="rlp-card-header">
            <div className="d-flex align-items-center gap-2">
              <h5 className="rlp-section-title">Active Administrators</h5>
              {users.length > 0 && <span className="rlp-count-badge">{users.length}</span>}
            </div>
            <button type="button" className="rlp-btn-primary" onClick={handleOpenCreate}>
              <FiPlus size={14} /> Assign Role
            </button>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border" style={{ color: "var(--color-primary)" }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="rlp-empty">
                <FiInfo size={32} />
                <p className="mb-0">No custom administrative roles set up yet.</p>
              </div>
            ) : (
              <div className="table-responsive scroll-fade-x">
                <table className="table table-hover align-middle rlp-table table-stack">
                  <thead>
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="py-3">Role</th>
                      <th className="py-3">Permissions</th>
                      <th className="text-end px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const roleStyle = ROLE_STYLES[u.admin_role || "creator"] || ROLE_STYLES.creator;
                      const perms = u.admin_permissions;

                      const allCats = !perms || perms.categories.includes("all") || perms.categories.length === 0;
                      const catLabels = allCats
                        ? ["All Categories"]
                        : perms!.categories.map((val) => SELECTABLE_CATEGORIES.find((c) => c.value === val)?.label || val);
                      const allSts = !perms || perms.states.includes("all") || perms.states.length === 0;
                      const stateLabels = allSts ? ["All States"] : perms!.states;
                      const windowText = perms?.data_window ? WINDOW_LABELS[perms.data_window] || perms.data_window : "All Time";

                      // Show the first couple of scopes, fold the rest into "+N" so rows stay compact.
                      const summarize = (labels: string[], max = 2) =>
                        labels.length <= max ? labels : [...labels.slice(0, max), `+${labels.length - max} more`];

                      return (
                        <tr key={u.sub || u.email}>
                          <td className="px-4 py-3">
                            <div className="rlp-user">
                              <div className="rlp-avatar">{initials(u)}</div>
                              <div style={{ minWidth: 0 }}>
                                <div className="rlp-user-name">{u.given_name ? `${u.given_name} ${u.family_name || ""}` : "Registered User"}</div>
                                <div className="rlp-user-email text-truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3" data-label="Role">
                            <span className="rlp-role-pill" style={{ backgroundColor: roleStyle.bg, color: roleStyle.text }}>
                              {roleStyle.label}
                            </span>
                          </td>
                          <td className="py-3" data-label="Permissions" style={{ maxWidth: 380 }}>
                            <div className="rlp-chips">
                              {summarize(catLabels).map((l) => (
                                <span key={`c-${l}`} className="rlp-chip" title={catLabels.join(", ")}>
                                  <FiLayers size={11} /> {l}
                                </span>
                              ))}
                              {summarize(stateLabels).map((l) => (
                                <span key={`s-${l}`} className="rlp-chip" title={stateLabels.join(", ")}>
                                  <FiMapPin size={11} /> {l}
                                </span>
                              ))}
                              <span className="rlp-chip">
                                <FiCalendar size={11} /> {windowText}
                              </span>
                            </div>
                          </td>
                          <td className="text-end px-4 py-3">
                            <div className="d-flex gap-2 justify-content-end">
                              <button onClick={() => handleEditClick(u)} className="rlp-btn rlp-btn--warn" title="Edit permissions">
                                <FiEdit size={13} />
                                <span>Edit</span>
                              </button>
                              <button onClick={() => handleDeleteClick(u)} className="rlp-btn rlp-btn--danger" title="Remove role">
                                <FiTrash2 size={13} />
                                <span>Remove</span>
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

      {/* Assign / Edit popup */}
      {showFormModal && (
        <>
          <div className="modal-backdrop fade show" onClick={handleCloseFormModal}></div>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="rlp-card-header">
                  <h5 className="rlp-section-title">{isEditing ? "Update Administrator" : "Assign Admin Role"}</h5>
                  <button type="button" onClick={handleCloseFormModal} className="rlp-btn-link" aria-label="Close">
                    <FiX size={14} />
                    Close
                  </button>
                </div>
                <div className="modal-body">
                  <form id="rolesForm" onSubmit={handleFormSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label htmlFor="userEmail" className="rlp-label">
                          User Email Address
                        </label>
                        <input
                          id="userEmail"
                          type="email"
                          placeholder="e.g. name@applyindia.in"
                          className="rlp-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isEditing}
                          required
                        />
                        {!isEditing && <div className="rlp-help">User must already have an account in the system.</div>}
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="adminRoleSelect" className="rlp-label">
                          Administrative Role
                        </label>
                        <select
                          id="adminRoleSelect"
                          className="rlp-input"
                          value={role}
                          onChange={(e) =>
                            setRole(e.target.value as "creator" | "reviewer" | "senior_reviewer" | "admin" | "guidance_partner")
                          }
                        >
                          <option value="creator">Creator (Add/Edit notifications)</option>
                          <option value="reviewer">Reviewer (Approve notifications)</option>
                          <option value="senior_reviewer">Senior Reviewer (Create, edit, approve &amp; archive)</option>
                          <option value="admin">Admin (All actions, full control)</option>
                          <option value="guidance_partner">Guidance Partner (Add slots &amp; run sessions)</option>
                        </select>
                      </div>
                    </div>

                    {/* Category Permissions */}
                    <div className="rlp-scope mb-3">
                      <div className="rlp-scope-head">
                        <span className="rlp-scope-title">Category Access Scope</span>
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
                        <div className="rlp-scope-list">
                          <div className="row g-2">
                            {SELECTABLE_CATEGORIES.map((cat) => (
                              <div key={cat.value} className="col-6 col-md-4">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    value={cat.value}
                                    id={`cat-${cat.value}`}
                                    checked={selectedCategories.includes(cat.value)}
                                    onChange={() => handleCategoryCheckboxChange(cat.value)}
                                  />
                                  <label className="form-check-label small text-truncate d-block" htmlFor={`cat-${cat.value}`} title={cat.label}>
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
                    <div className="rlp-scope mb-3">
                      <div className="rlp-scope-head">
                        <span className="rlp-scope-title">State Access Scope</span>
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
                        <div className="rlp-scope-list">
                          <div className="rlp-search mb-2">
                            <FiSearch size={13} />
                            <input
                              type="text"
                              placeholder="Filter states..."
                              className="rlp-input"
                              value={stateSearch}
                              onChange={(e) => setStateSearch(e.target.value)}
                            />
                          </div>
                          <div>
                            <div className="row g-1">
                              {filteredStates.length === 0 ? (
                                <div className="col-12 py-2 text-center small" style={{ color: "var(--color-muted)" }}>
                                  No states match query.
                                </div>
                              ) : (
                                filteredStates.map((s) => (
                                  <div key={s.value} className="col-6 col-md-3">
                                    <div className="form-check">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        value={s.value}
                                        id={`state-${s.value}`}
                                        checked={selectedStates.includes(s.value)}
                                        onChange={() => handleStateCheckboxChange(s.value)}
                                      />
                                      <label className="form-check-label small text-truncate d-block" htmlFor={`state-${s.value}`} title={s.label}>
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
                    <div className="mb-3">
                      <label htmlFor="dataWindowSelect" className="rlp-label">
                        Chronological Data Window Limit
                      </label>
                      <select id="dataWindowSelect" className="rlp-input" value={dataWindow} onChange={(e) => setDataWindow(e.target.value)}>
                        <option value="all">Unrestricted (All Time)</option>
                        <option value="last_1_month">Last 1 Month</option>
                        <option value="last_2_months">Last 2 Months</option>
                        <option value="last_3_months">Last 3 Months</option>
                        <option value="last_6_months">Last 6 Months</option>
                        <option value="last_1_year">Last 1 Year</option>
                      </select>
                      <div className="rlp-help">Restricts the historical range of notifications this user can view or modify.</div>
                    </div>

                    {(role === "creator" || role === "reviewer") && (
                      <div className="rlp-note mb-3">
                        <FiInfo className="flex-shrink-0 mt-1" size={14} style={{ color: "var(--color-primary)" }} />
                        <div>
                          {role === "reviewer" ? "Reviewers" : "Creators"} can only edit notifications that haven't been approved yet, and can't archive notifications. Assign the "Senior Reviewer" role for full edit/archive access.
                        </div>
                      </div>
                    )}

                    <button type="submit" className="rlp-btn-submit" disabled={submitting || isUnchangedEdit}>
                      {submitting ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      ) : isEditing ? (
                        "Save Permissions"
                      ) : (
                        <>
                          <FiPlus size={16} />
                          <span>Assign Administrator</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
