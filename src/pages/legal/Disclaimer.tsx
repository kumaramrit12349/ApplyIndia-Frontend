import { FiAlertTriangle } from "react-icons/fi";
import LegalLayout from "../../components/LegalLayout";
import { WEBSITE_NAME } from "../../constant/SharedConstant";
import { useTranslation } from "../../i18n/useTranslation";

export default function Disclaimer() {
  const { legal: t } = useTranslation();
  return (
    <LegalLayout
      title={t.disclaimerTitle}
      icon={FiAlertTriangle}
      description={t.disclaimerDesc}
    >
      <p>
        <strong>{WEBSITE_NAME}</strong> {t.disclaimerIntro}
      </p>

      <div className="legal-callout">
        <FiAlertTriangle className="legal-callout-icon" aria-hidden="true" />
        <div>
          <h5>{t.noGovAffiliationTitle}</h5>
          <p>{t.noGovAffiliationDesc}</p>
        </div>
      </div>

      <div className="legal-callout">
        <FiAlertTriangle className="legal-callout-icon" aria-hidden="true" />
        <div>
          <h5>{t.noLegalResponsibilityTitle}</h5>
          <p>{t.noLegalResponsibilityDesc}</p>
        </div>
      </div>
    </LegalLayout>
  );
}
