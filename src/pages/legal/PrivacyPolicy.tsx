import { FiShield } from "react-icons/fi";
import LegalLayout from "../../components/LegalLayout";
import { WEBSITE_NAME } from "../../constant/SharedConstant";
import { useTranslation } from "../../i18n/useTranslation";

export default function PrivacyPolicy() {
  const { legal: t } = useTranslation();
  return (
    <LegalLayout
      title={t.privacyTitle}
      icon={FiShield}
      description={t.privacyDesc}
    >
      <p>
        At <strong>{WEBSITE_NAME}</strong>, {t.privacyIntro}
      </p>

      <h5>{t.infoWeCollect}</h5>
      <ul>
        <li>{t.infoWeCollectItem1}</li>
        <li>{t.infoWeCollectItem2}</li>
      </ul>

      <h5>{t.howWeUseInfo}</h5>
      <ul>
        <li>{t.howWeUseInfoItem1}</li>
        <li>{t.howWeUseInfoItem2}</li>
        <li>{t.howWeUseInfoItem3}</li>
      </ul>

      <h5>{t.cookiesAdsense}</h5>
      <p>{t.cookiesAdsenseDesc}</p>
      <p>
        {t.optOutPrompt}
        <br />
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://adssettings.google.com
        </a>
      </p>

      <h5>{t.thirdPartyLinks}</h5>
      <p>{t.thirdPartyLinksDesc}</p>

      <h5>{t.contactUs}</h5>
      <p>{t.contactUsDesc}</p>
    </LegalLayout>
  );
}
