import LegalLayout from "../../components/LegalLayout";
import { WEBSITE_NAME } from "../../constant/SharedConstant";
import { SITE_URL } from "../../seo/site";

export default function AboutUs() {
  return (
    <LegalLayout
      title="About Apply India"
      description="Learn about Apply India Online, a platform for government jobs, sarkari naukri updates, exam notifications, results, admissions, and scholarships across India."
      canonical={`${SITE_URL}/about`}
      keywords={[
        "about apply india",
        "apply india online",
        "government jobs website india",
        "sarkari naukri website",
      ]}
    >
      <p>
        <strong>{WEBSITE_NAME}</strong>, also known as <strong>Apply India Online</strong>,
        is a platform dedicated to publishing verified government job notifications,
        exam updates, admit cards, results, admissions, and educational opportunities
        across India.
      </p>

      <p>
        Our goal is to simplify access to authentic information and help users
        stay informed without visiting multiple websites or missing important official deadlines.
      </p>

      <p>
        We do not charge users for accessing information and always encourage
        verification from official sources before applying for any job, exam, scholarship, or admission update.
      </p>
    </LegalLayout>
  );
}
