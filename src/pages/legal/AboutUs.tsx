import { FiInfo } from "react-icons/fi";
import LegalLayout from "../../components/LegalLayout";
import { WEBSITE_NAME } from "../../constant/SharedConstant";
import { SITE_URL } from "../../seo/site";
import { useTranslation } from "../../i18n/useTranslation";

export default function AboutUs() {
  const { legal: t } = useTranslation();
  return (
    <LegalLayout
      title={t.aboutTitle}
      icon={FiInfo}
      description={t.aboutDesc}
      canonical={`${SITE_URL}/about`}
      keywords={[
        "about apply india",
        "apply india online",
        "government jobs website india",
        "sarkari naukri website",
      ]}
    >
      <p>
        <strong>{WEBSITE_NAME}</strong>, also known as <strong>Apply India Online</strong>,{" "}
        {t.aboutP1}
      </p>

      <p>{t.aboutP2}</p>

      <p>{t.aboutP3}</p>
    </LegalLayout>
  );
}
