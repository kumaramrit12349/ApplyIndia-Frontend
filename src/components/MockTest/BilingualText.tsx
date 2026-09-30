import React from "react";
import type { MockTestLanguage } from "../../utils/mockTestLanguage";

interface Props {
  en: string;
  hi?: string;
  lang: MockTestLanguage;
  as?: React.ElementType;
  className?: string;
}

/** Renders EN/HI/Both per the shared 3-way language toggle, falling back to English when a Hindi value is missing. */
const BilingualText: React.FC<Props> = ({ en, hi, lang, as: Tag = "span", className }) => {
  if (lang === "hi") return <Tag className={className}>{hi || en}</Tag>;
  if (lang === "both") {
    return (
      <Tag className={className}>
        <div>{en}</div>
        {hi && <div className="mt-bilingual-hi">{hi}</div>}
      </Tag>
    );
  }
  return <Tag className={className}>{en}</Tag>;
};

export default BilingualText;
