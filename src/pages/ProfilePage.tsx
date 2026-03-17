import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchProfile, updateProfile } from "../services/authApi";
import { INDIAN_STATES, EDUCATIONAL_QUALIFICATIONS } from "../constant/SharedConstant";
import { FiEdit2, FiUser, FiCalendar, FiMapPin, FiBriefcase, FiAward, FiBook } from "react-icons/fi";
import { BsGenderAmbiguous } from "react-icons/bs";

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

    const getUserInitials = () => {
        const first = formData.given_name ? formData.given_name.charAt(0).toUpperCase() : "";
        const last = formData.family_name ? formData.family_name.charAt(0).toUpperCase() : "";
        return `${first}${last}` || "U";
    };

    return (
        <div className="container py-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-lg-10 col-xl-9">
                    {/* Main Profile Card */}
                    <div className="ai-list-card overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.2)" }}>
                        
                        {/* Header Banner & Avatar */}
                        <div className="position-relative ai-profile-banner">
                            <div className="d-flex justify-content-between align-items-start position-relative z-index-2 w-100 p-4">
                                <h3 className="text-white fw-bold mb-0" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>My Profile</h3>
                                {!isEditMode && (
                                    <button
                                        className="ai-profile-edit-btn"
                                        onClick={() => setIsEditMode(true)}
                                    >
                                        <FiEdit2 size={16} /> Edit Profile
                                    </button>
                                )}
                            </div>
                            
                            {/* Avatar pushing up into the banner */}
                            <div className="ai-profile-avatar-container">
                                <div className="ai-profile-avatar">
                                    {getUserInitials()}
                                </div>
                            </div>
                        </div>

                        <div className="card-body p-4 pt-5 mt-4">
                            {!isEditMode ? (
                                <div className="ai-profile-details">
                                    <div className="text-center mb-5">
                                        <h4 className="fw-bold mb-1 fs-3">{formData.given_name} {formData.family_name}</h4>
                                        <p className="text-muted mb-0 d-flex align-items-center justify-content-center gap-2">
                                            <FiMapPin /> {getStateLabel(formData.state) || "Location not specified"}
                                        </p>
                                    </div>

                                    <div className="row g-4">
                                        <div className="col-12">
                                            <h6 className="ai-profile-section-title">Personal Information</h6>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="ai-profile-data-box">
                                                <div className="icon"><FiUser /></div>
                                                <div className="info">
                                                    <label>Full Name</label>
                                                    <p>{formData.given_name} {formData.family_name}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="ai-profile-data-box">
                                                <div className="icon"><BsGenderAmbiguous /></div>
                                                <div className="info">
                                                    <label>Gender</label>
                                                    <p>{formData.gender || "Not specified"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="ai-profile-data-box">
                                                <div className="icon"><FiCalendar /></div>
                                                <div className="info">
                                                    <label>Date of Birth</label>
                                                    <p>{formData.dob || "Not specified"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="ai-profile-data-box">
                                                <div className="icon"><FiBriefcase /></div>
                                                <div className="info">
                                                    <label>Category</label>
                                                    <p>{formData.category || "Not specified"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 mt-5">
                                            <h6 className="ai-profile-section-title">Education & Skills</h6>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="ai-profile-data-box">
                                                <div className="icon"><FiAward /></div>
                                                <div className="info">
                                                    <label>Highest Qualification</label>
                                                    <p>{formData.qualification || "Not specified"}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="ai-profile-data-box">
                                                <div className="icon"><FiBook /></div>
                                                <div className="info">
                                                    <label>Specialization</label>
                                                    <p>{formData.specialization || "Not specified"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="ai-profile-form">
                                    <h5 className="fw-bold mb-4 text-center">Edit Your Profile</h5>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="form-group ai-input-group">
                                                <label className="form-label">First Name</label>
                                                <input type="text" name="given_name" className="form-control" value={formData.given_name} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group ai-input-group">
                                                <label className="form-label">Last Name</label>
                                                <input type="text" name="family_name" className="form-control" value={formData.family_name} onChange={handleChange} required />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group ai-input-group">
                                                <label className="form-label">Gender</label>
                                                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange} required>
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group ai-input-group">
                                                <label className="form-label">Date of Birth</label>
                                                <input type="date" name="dob" className="form-control" value={formData.dob} onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group ai-input-group">
                                                <label className="form-label">State</label>
                                                <select name="state" className="form-select" value={formData.state} onChange={handleChange} required>
                                                    <option value="">Select State</option>
                                                    {INDIAN_STATES.map((state) => <option key={state.value} value={state.value}>{state.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group ai-input-group">
                                                <label className="form-label">Category</label>
                                                <select name="category" className="form-select" value={formData.category} onChange={handleChange} required>
                                                    <option value="">Select Category</option>
                                                    <option value="General">General</option>
                                                    <option value="OBC">OBC</option>
                                                    <option value="SC">SC</option>
                                                    <option value="ST">ST</option>
                                                    <option value="EWS">EWS</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group ai-input-group">
                                                <label className="form-label">Highest Qualification</label>
                                                <select name="qualification" className="form-select" value={formData.qualification} onChange={handleChange} required>
                                                    <option value="">Select Qualification</option>
                                                    {EDUCATIONAL_QUALIFICATIONS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group ai-input-group">
                                                <label className="form-label">Specialization</label>
                                                <input type="text" name="specialization" className="form-control" value={formData.specialization} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-5 d-flex gap-3 justify-content-end border-top pt-4">
                                        <button
                                            type="button"
                                            className="btn btn-light px-4 py-2 fw-bold"
                                            onClick={() => {
                                                setFormData(initialData); // Reset changes on cancel
                                                setIsEditMode(false);
                                            }}
                                            disabled={updating}
                                            style={{ borderRadius: "8px" }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-5 py-2 fw-bold"
                                            disabled={updating || Object.keys(getChangedFields()).length === 0}
                                            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none", borderRadius: "8px" }}
                                        >
                                            {updating ? "Saving..." : "Save Changes"}
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
