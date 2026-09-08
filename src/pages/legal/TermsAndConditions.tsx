import { FiFileText } from "react-icons/fi";
import LegalLayout from "../../components/LegalLayout";
import { WEBSITE_NAME } from "../../constant/SharedConstant";

export default function TermsAndConditions() {
  return (
    <LegalLayout
      title="Terms & Conditions"
      icon={FiFileText}
      description="The terms that govern your use of Apply India."
    >
      <p>
        By accessing or using <strong>{WEBSITE_NAME}</strong>, you agree to be
        bound by these terms.
      </p>

      <h5>Content Accuracy</h5>
      <p>
        We strive to provide accurate information but do not guarantee
        completeness or correctness.
      </p>

      <h5>User Responsibility</h5>
      <ul>
        <li>Verify details from official sources</li>
        <li>Do not misuse the website</li>
      </ul>

      <h5>Intellectual Property</h5>
      <p>
        All content is the property of {WEBSITE_NAME} unless stated otherwise.
      </p>

      <h5>Changes</h5>
      <p>We may update these terms at any time without prior notice.</p>
    </LegalLayout>
  );
}
