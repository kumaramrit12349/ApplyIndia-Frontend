import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchProfile, updateProfile } from "../services/authApi";
import { INDIAN_STATES, EDUCATIONAL_QUALIFICATIONS } from "../constant/SharedConstant";

const ProfilePage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);
    const [formData, setFormData] = useState({
        given_name: "",
        family_name: "",
        gender: "",
        dob: "",
        state: "",
        category: "",
        qualification: "",
        specialization: "",
    });

    const fetchUser = async () => {
        setLoading(true);
        const { isAuthenticated, user } = await fetchProfile();
        if (isAuthenticated && user) {
            const data = {
                given_name: user.given_name || "",
                family_name: user.family_name || "",
                gender: user.gender || "",
                dob: user.dob || "",
                state: user.state || "",
                category: user.category || "",
                qualification: user.qualification || "",
                specialization: user.specialization || "",
            };
            setFormData(data);
            setInitialData(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const getChangedFields = () => {
        if (!initialData) return {};
        const changed: any = {};
        Object.keys(formData).forEach((key) => {
            if ((formData as any)[key] !== initialData[key]) {
                changed[key] = (formData as any)[key];
            }
        });
        return changed;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const changedFields = getChangedFields();
        if (Object.keys(changedFields).length === 0) {
            toast.info("No changes to save");
            setIsEditMode(false);
            return;
        }

        setUpdating(true);
        try {
            await updateProfile(changedFields);
            toast.success("Profile updated successfully!");
            setIsEditMode(false);
            await fetchUser();
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    const getStateLabel = (code: string) => {
        const state = INDIAN_STATES.find((s) => s.value === code);
        return state ? state.label : code;
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-9 col-lg-8">
                    <div className="card shadow border-0 overflow-hidden">
                        <div className="card-header bg-primary text-white p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <h2 className="mb-0 fs-4">User Profile</h2>
                                {!isEditMode && (
                                    <button
                                        className="btn btn-light btn-sm fw-bold px-3 py-2"
                                        onClick={() => setIsEditMode(true)}
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="card-body p-4 p-md-5">
                            {!isEditMode ? (
                                <div className="profile-details">
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Full Name</label>
                                            <p className="fs-5 mb-0 fw-semibold">{formData.given_name} {formData.family_name}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Gender</label>
                                            <p className="fs-5 mb-0">{formData.gender || "Not specified"}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Date of Birth</label>
                                            <p className="fs-5 mb-0">{formData.dob || "Not specified"}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small text-uppercase fw-bold mb-1 d-block">State</label>
                                            <p className="fs-5 mb-0">{getStateLabel(formData.state) || "Not specified"}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Category</label>
                                            <p className="fs-5 mb-0">{formData.category || "Not specified"}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Highest Qualification</label>
                                            <p className="fs-5 mb-0">{formData.qualification || "Not specified"}</p>
                                        </div>
                                        <div className="col-md-12">
                                            <label className="text-muted small text-uppercase fw-bold mb-1 d-block">Specialization</label>
                                            <p className="fs-5 mb-0">{formData.specialization || "Not specified"}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">First Name</label>
                                            <input
                                                type="text"
                                                name="given_name"
                                                className="form-control"
                                                value={formData.given_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Last Name</label>
                                            <input
                                                type="text"
                                                name="family_name"
                                                className="form-control"
                                                value={formData.family_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Gender</label>
                                            <select
                                                name="gender"
                                                className="form-select"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                className="form-control"
                                                value={formData.dob}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">State</label>
                                            <select
                                                name="state"
                                                className="form-select"
                                                value={formData.state}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select State</option>
                                                {INDIAN_STATES.map((state) => (
                                                    <option key={state.value} value={state.value}>
                                                        {state.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Category</label>
                                            <select
                                                name="category"
                                                className="form-select"
                                                value={formData.category}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                <option value="General">General</option>
                                                <option value="OBC">OBC</option>
                                                <option value="SC">SC</option>
                                                <option value="ST">ST</option>
                                                <option value="EWS">EWS</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Highest Qualification</label>
                                            <select
                                                name="qualification"
                                                className="form-select"
                                                value={formData.qualification}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Select Qualification</option>
                                                {EDUCATIONAL_QUALIFICATIONS.map((q) => (
                                                    <option key={q.value} value={q.value}>
                                                        {q.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold">Specialization</label>
                                            <input
                                                type="text"
                                                name="specialization"
                                                className="form-control"
                                                value={formData.specialization}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-5 d-flex gap-3">
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-5 py-2 fw-bold"
                                            disabled={updating || Object.keys(getChangedFields()).length === 0}
                                        >
                                            {updating ? "Saving Changes..." : "Save Changes"}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary px-5 py-2 fw-bold"
                                            onClick={() => setIsEditMode(false)}
                                            disabled={updating}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
