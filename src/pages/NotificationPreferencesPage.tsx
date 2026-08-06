import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchNotificationPreferences, updateNotificationPreferences } from "../services/authApi";
import { NOTIFICATION_TOPICS } from "../constant/SharedConstant";
import { FiEdit2, FiBell } from "react-icons/fi";

interface NotificationPreferencesPageProps {
    onProfileUpdated?: () => void;
}

const NotificationPreferencesPage: React.FC<NotificationPreferencesPageProps> = ({ onProfileUpdated }) => {
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);
    const [formData, setFormData] = useState({
        email_notifications: true,
        whatsapp_notifications: true,
        subscribed_topics: [] as string[],
    });

    const fetchPrefs = async () => {
        setLoading(true);
        const { isAuthenticated, preferences } = await fetchNotificationPreferences();
        if (isAuthenticated && preferences) {
            const data = {
                email_notifications: preferences.email_notifications !== false,
                whatsapp_notifications: preferences.whatsapp_notifications !== false,
                subscribed_topics: preferences.subscribed_topics || [],
            };
            setFormData(data);
            setInitialData(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPrefs();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleTopicToggle = (topic: string) => {
        setFormData((prev) => ({
            ...prev,
            subscribed_topics: prev.subscribed_topics.includes(topic)
                ? prev.subscribed_topics.filter((t) => t !== topic)
                : [...prev.subscribed_topics, topic],
        }));
    };

    const getChangedFields = () => {
        if (!initialData) return {};
        const changed: any = {};
        Object.keys(formData).forEach((key) => {
            if (key === "subscribed_topics") {
                const current = (formData as any)[key] as string[];
                const original = (initialData[key] as string[]) || [];
                const isSame = current.length === original.length && current.every((t) => original.includes(t));
                if (!isSame) changed[key] = current;
                return;
            }
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
            await updateNotificationPreferences(changedFields);
            toast.success("Notification preferences updated successfully!");
            setIsEditMode(false);
            await fetchPrefs();
            onProfileUpdated?.();
        } catch (error: any) {
            toast.error(error.message || "Failed to update notification preferences");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border" style={{ color: "var(--color-primary)" }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-lg-10 col-xl-9">
                    <div className="ai-list-card overflow-hidden">
                        <div className="position-relative ai-profile-banner">
                            <div className="d-flex justify-content-between align-items-start position-relative z-index-2 w-100 p-4">
                                <h3 className="text-white fw-bold mb-0" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>Notification Preferences</h3>
                                {!isEditMode && (
                                    <button
                                        className="ai-profile-edit-btn"
                                        onClick={() => setIsEditMode(true)}
                                    >
                                        <FiEdit2 size={16} /> Edit Preferences
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="card-body p-4">
                            {!isEditMode ? (
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="ai-profile-data-box">
                                            <div className="icon"><FiBell /></div>
                                            <div className="info">
                                                <label>Email Notifications</label>
                                                <p>{formData.email_notifications ? "Enabled" : "Disabled"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="ai-profile-data-box">
                                            <div className="icon"><FiBell /></div>
                                            <div className="info">
                                                <label>WhatsApp Notifications</label>
                                                <p>{formData.whatsapp_notifications ? "Enabled" : "Disabled"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="ai-profile-data-box">
                                            <div className="icon"><FiBell /></div>
                                            <div className="info">
                                                <label>Subscribed Topics</label>
                                                <p>
                                                    {formData.subscribed_topics.length > 0
                                                        ? formData.subscribed_topics
                                                            .map((t) => NOTIFICATION_TOPICS.find((topic) => topic.value === t)?.label || t)
                                                            .join(", ")
                                                        : "All topics (no filter)"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-4">
                                        <div className="col-12">
                                            <div className="d-flex flex-wrap gap-4">
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="emailNotificationsSwitch"
                                                        name="email_notifications"
                                                        checked={formData.email_notifications}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="form-check-label" htmlFor="emailNotificationsSwitch">
                                                        Email Notifications
                                                    </label>
                                                </div>
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="whatsappNotificationsSwitch"
                                                        name="whatsapp_notifications"
                                                        checked={formData.whatsapp_notifications}
                                                        onChange={handleChange}
                                                    />
                                                    <label className="form-check-label" htmlFor="whatsappNotificationsSwitch">
                                                        WhatsApp Notifications
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-semibold text-secondary small mt-3">
                                                Subscribed Topics
                                            </label>
                                            <div className="form-text text-muted small mb-2 mt-0">
                                                Leave all unchecked to receive notifications on every topic.
                                            </div>
                                            <div className="row g-2">
                                                {NOTIFICATION_TOPICS.map((topic) => (
                                                    <div key={topic.value} className="col-6 col-md-4">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`topic-${topic.value}`}
                                                                checked={formData.subscribed_topics.includes(topic.value)}
                                                                onChange={() => handleTopicToggle(topic.value)}
                                                            />
                                                            <label className="form-check-label small" htmlFor={`topic-${topic.value}`}>
                                                                {topic.label}
                                                            </label>
                                                        </div>
                                                    </div>
                                                ))}
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
                                            className="btn text-white px-5 py-2 fw-bold"
                                            disabled={updating || Object.keys(getChangedFields()).length === 0}
                                            style={{ background: "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)", border: "none", borderRadius: "8px" }}
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

export default NotificationPreferencesPage;
