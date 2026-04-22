import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NotificationDetailView from "../../../components/Generic/NotificationDetailView";
import { getNotificationById } from "../../../services/public/notiifcationApi";
import SEO from "../../../components/SEO/SEO";
import { formatStateName } from "../../../utils/utils";
import { buildBreadcrumbSchema, SITE_URL } from "../../../seo/site";

interface UserNotificationDetailPageProps {
  isAuthenticated?: boolean;
  onShowAuthPopup?: () => void;
}

/** Strip HTML tags from a string for use in plain-text meta fields */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/** Build a keyword-rich meta description from notification fields */
function buildDescription(notification: any): string {
  const parts: string[] = [];

  if (notification.details?.short_description) {
    const clean = stripHtml(notification.details.short_description);
    if (clean) parts.push(clean.substring(0, 120));
  }

  if (notification.total_vacancies) {
    parts.push(`${notification.total_vacancies} vacancies.`);
  }

  if (notification.last_date_to_apply) {
    parts.push(`Last date: ${notification.last_date_to_apply}.`);
  }

  if (!parts.length) {
    parts.push(`${notification.title} — Apply online on Apply India.`);
  }

  return parts.join(" ").substring(0, 155);
}

/** Build a JSON-LD JobPosting schema object for Google rich results */
function buildJobPostingSchema(notification: any): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": notification.title,
    "description": notification.details?.short_description
      ? stripHtml(notification.details.short_description)
      : notification.title,
    "datePosted": notification.start_date || notification.created_at
      ? new Date(notification.start_date || notification.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    "employmentType": "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": notification.department || "Government of India",
      "sameAs": notification.links?.official_website_url || SITE_URL,
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN",
        ...(notification.state
          ? { "addressRegion": formatStateName(notification.state) }
          : {}),
      },
    },
  };

  if (notification.last_date_to_apply) {
    schema["validThrough"] = new Date(notification.last_date_to_apply).toISOString().split("T")[0];
  }

  if (notification.total_vacancies) {
    schema["totalJobOpenings"] = notification.total_vacancies;
  }

  if (notification.eligibility?.qualification) {
    schema["qualifications"] = notification.eligibility.qualification;
  }

  if (notification.eligibility?.min_age && notification.eligibility?.max_age) {
    schema["experienceRequirements"] = `Age: ${notification.eligibility.min_age}–${notification.eligibility.max_age} years`;
  }

  if (notification.links?.apply_online_url) {
    schema["url"] = notification.links.apply_online_url;
  }

  // Application fee as baseSalary workaround — include apply link as direct apply URL
  if (notification.fee?.general_fee !== undefined) {
    schema["applicationContact"] = {
      "@type": "ContactPoint",
      "contactType": "Application",
      "url": notification.links?.apply_online_url || SITE_URL,
    };
  }

  return schema;
}

function buildArticleSchema(notification: any, pageUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: notification.title,
    description: buildDescription(notification),
    mainEntityOfPage: pageUrl,
    datePublished:
      notification.created_at
        ? new Date(notification.created_at).toISOString()
        : new Date().toISOString(),
    dateModified:
      notification.updated_at
        ? new Date(notification.updated_at).toISOString()
        : new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "Apply India",
    },
    publisher: {
      "@type": "Organization",
      name: "Apply India",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-20260422.png`,
      },
    },
  };
}

const UserNotificationDetailPage: React.FC<UserNotificationDetailPageProps> = ({
  isAuthenticated = false,
  onShowAuthPopup,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getNotificationById(id)
      .then((data: any) => {
        setNotification(data.notification);
        setLoading(false);
      })
      .catch(() => {
        setNotification(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="container mt-5">
        <SEO title="Notification Not Found" noindex={true} />
        <div className="alert alert-danger">Notification not found</div>
      </div>
    );
  }

  const pageUrl = `${SITE_URL}${window.location.pathname}`;
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: `${SITE_URL}/` },
    ...(notification.category
      ? [{
          name: String(notification.category).replace(/-/g, " "),
          url: `${SITE_URL}/notification/category/${notification.category}`,
        }]
      : []),
    { name: notification.title, url: pageUrl },
  ]);
  const primarySchema =
    notification.category === "job" ? buildJobPostingSchema(notification) : buildArticleSchema(notification, pageUrl);

  return (
    <div className="container mt-4 mb-5">
      <SEO
        title={notification.title}
        description={buildDescription(notification)}
        canonical={pageUrl}
        type="article"
        keywords={[
          "apply india",
          "apply india online",
          notification.title,
          notification.department,
          notification.state ? `${formatStateName(notification.state)} government jobs` : "",
        ].filter(Boolean)}
        schema={[primarySchema, breadcrumbSchema]}
      />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-sm mb-3"
        style={{
          background: "transparent",
          border: "1px solid #dee2e6",
          borderRadius: "20px",
          color: "#6b7280",
          padding: "4px 14px",
          fontWeight: 500,
          fontSize: "0.88rem",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          transition: "all 0.2s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "#f3f4f6";
          e.currentTarget.style.color = "#374151";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#6b7280";
        }}
      >
        ← Back
      </button>

      <NotificationDetailView
        notification={notification}
        isAuthenticated={isAuthenticated}
        onShowAuthPopup={onShowAuthPopup}
      />
    </div>
  );
};

export default UserNotificationDetailPage;
