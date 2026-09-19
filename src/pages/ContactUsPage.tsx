import React from "react";
import ContactUsForm from "../components/ContactUsForm";

interface ContactUsPageProps {
  isAuthenticated: boolean;
  givenName?: string;
  familyName?: string;
  userEmail?: string;
}

const ContactUsPage: React.FC<ContactUsPageProps> = ({ isAuthenticated, givenName, familyName, userEmail }) => {
  return (
    <div className="ai-feedback-page">
      <div className="ai-feedback-blob ai-feedback-blob--blue" aria-hidden="true" />
      <div className="ai-feedback-blob ai-feedback-blob--orange" aria-hidden="true" />
      <div className="container px-3 px-md-4 py-5">
        <div className="row justify-content-center w-100">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            <div className="ai-glass-panel ai-feedback-card">
              <div className="p-4 p-md-5">
                <ContactUsForm isAuthenticated={isAuthenticated} givenName={givenName} familyName={familyName} userEmail={userEmail} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
