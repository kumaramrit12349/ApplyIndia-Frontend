import { FiFileText } from "react-icons/fi";
import LegalLayout from "../../components/LegalLayout";
import { WEBSITE_NAME } from "../../constant/SharedConstant";
import { useTranslation } from "../../i18n/useTranslation";

export default function TermsAndConditions() {
  const { legal: t } = useTranslation();
  return (
    <LegalLayout
      title={t.termsTitle}
      icon={FiFileText}
      description={t.termsDesc}
    >
      <p>
        By accessing or using <strong>{WEBSITE_NAME}</strong>, {t.termsIntro}
      </p>

      <h5>{t.contentAccuracy}</h5>
      <p>{t.contentAccuracyDesc}</p>

      <h5>{t.userResponsibility}</h5>
      <ul>
        <li>{t.userResponsibilityItem1}</li>
        <li>{t.userResponsibilityItem2}</li>
      </ul>

      <h5>{t.intellectualProperty}</h5>
      <p>
        {t.intellectualPropertyPrefix} {WEBSITE_NAME} {t.intellectualPropertySuffix}
      </p>

      <h5>{t.changes}</h5>
      <p>{t.changesDesc}</p>
    </LegalLayout>
  );
}
