import { useTranslation } from "react-i18next";
import { SegmentedSwitch, type SegmentedOption } from "./SegmentedSwitch";

type LanguageCode = "bn" | "en";

const LANGUAGES: SegmentedOption<LanguageCode>[] = [
  {
    value: "bn",
    label: "বাংলা",
    content: "বাং",
    // Warm gold for Bangla, the default language of the app.
    activeClassName: "bg-amber-300 text-[#0B4436]",
  },
  {
    value: "en",
    label: "English",
    content: "EN",
    // Was white-on-green for the header bar; on the panel's light track that
    // read as an unselected segment, so it takes the brand green instead.
    activeClassName: "bg-[#0F5645] text-white",
  },
];

export const LanguageSwitch: React.FC = () => {
  const { i18n } = useTranslation();

  // resolvedLanguage guards against region tags ("en-US") reaching the compare.
  const current: LanguageCode = (
    i18n.resolvedLanguage ?? i18n.language ?? "bn"
  ).startsWith("en")
    ? "en"
    : "bn";

  return (
    <SegmentedSwitch
      ariaLabel="Language / ভাষা"
      value={current}
      options={LANGUAGES}
      onChange={(code) => {
        if (code !== current) i18n.changeLanguage(code);
      }}
    />
  );
};
