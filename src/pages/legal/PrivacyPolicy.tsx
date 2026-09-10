import { FiShield } from "react-icons/fi";
import LegalLayout from "../../components/LegalLayout";
import { WEBSITE_NAME } from "../../constant/SharedConstant";

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      icon={FiShield}
      description="How we collect, use, and protect your information on Apply India."
    >
      <p>
        At <strong>{WEBSITE_NAME}</strong>, we respect your privacy and are
        committed to protecting your personal information.
      </p>

      <h5>Information We Collect</h5>
      <ul>
        <li>Basic usage data (pages visited, device type)</li>
        <li>Cookies for analytics and ads</li>
      </ul>

      <h5>How We Use Information</h5>
      <ul>
        <li>Improve website experience</li>
        <li>Display relevant advertisements</li>
        <li>Analyze traffic and performance</li>
      </ul>

      <h5>Cookies & Google AdSense</h5>
      <p>
        We use Google AdSense, which uses cookies (including DoubleClick cookie)
        to serve ads based on your visits to this and other websites.
      </p>
      <p>
        Users may opt out of personalized advertising by visiting:
        <br />
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://adssettings.google.com
        </a>
      </p>

      <h5>Third-Party Links</h5>
      <p>
        Our website may contain links to external websites. We are not
        responsible for their privacy practices.
      </p>

      <h5>Contact Us</h5>
      <p>
        If you have any questions, contact us via the feedback option available
        on our website.
      </p>
    </LegalLayout>
  );
}
