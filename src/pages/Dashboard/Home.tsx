import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import PageMeta from "../../components/common/PageMeta";
import { useUserContext } from "../../context/UserContext";
import { formatBengaliDate } from "../../utils/bengaliDate";

import brandMark from "../../assets/rahbar-icon.png";
import brandLogo from "../../assets/rahbar-logo-horizontal.png";

export default function Home() {
  const { t, i18n } = useTranslation();
  const { currentUser } = useUserContext();

  // Bangla is the default language, so the date has to follow it rather than
  // the browser locale.
  const today = useMemo(
    () =>
      new Date().toLocaleDateString(
        i18n.resolvedLanguage === "bn" ? "bn-BD" : "en-GB",
        { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      ),
    [i18n.resolvedLanguage]
  );

  // The Bengali (বঙ্গাব্দ) date the storage runs its season by, alongside the
  // Gregorian one.
  const todayBengali = useMemo(
    () => formatBengaliDate(new Date(), i18n.resolvedLanguage ?? "bn"),
    [i18n.resolvedLanguage]
  );

  return (
    <>
      <PageMeta title="CropTrack" description="CropTrack Dashboard" />

      {/* Hero — the brand and the date, side by side. The logo sits beside the
          date rather than above it, so it can be large without the card
          getting tall. Stats cards go below. */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-[#E8F3FB] via-white to-[#FDF2DE] shadow-sm dark:border-white/10 dark:from-[#0F3050] dark:via-gray-800 dark:to-[#3A2B10]">
        {/* Two blurred colour blooms — the brand's ice blue and gold — give the
            card its colour without competing with the logo for contrast. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-[#3B93C9]/30 blur-3xl dark:bg-[#3B93C9]/25"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -bottom-28 h-72 w-72 rounded-full bg-[#E0A63C]/30 blur-3xl dark:bg-[#E0A63C]/20"
        />

        {/* The rail runs the brand's full palette top to bottom: navy, ice
            blue, gold. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-[#0C2E4A] via-[#3B93C9] to-[#E0A63C]"
        />

        {/* The seal, oversized and ghosted back, is the only ornament. */}
        <img
          src={brandMark}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -bottom-16 hidden w-64 opacity-25 sm:block lg:w-72 dark:opacity-20"
        />

        <div className="relative flex flex-col gap-6 p-6 pl-8 sm:p-8 sm:pl-10 lg:flex-row lg:items-center lg:justify-between">
          {/* The wordmark is navy on transparency, so it sits straight on the
              light card. On the dark card it would disappear, so it is knocked
              out to a white mono lockup instead of being boxed on a plate. */}
          <img
            src={brandLogo}
            alt={t("rahbar")}
            className="h-24 w-auto sm:h-32 lg:h-44 dark:brightness-0 dark:invert"
          />

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#3B93C9]/40 bg-[#3B93C9]/10 px-4 py-2 text-sm font-semibold text-[#1B5D89] dark:border-[#3B93C9]/40 dark:bg-[#3B93C9]/15 dark:text-[#9DD2F2]">
              {today}
            </span>
            {/* Green, so the two dates read as two facts rather than one
                wrapped line. */}
            <span className="rounded-full border border-[#0F7A5F]/40 bg-[#0F7A5F]/10 px-4 py-2 text-sm font-semibold text-[#0B5343] dark:border-[#12A37D]/40 dark:bg-[#12A37D]/15 dark:text-[#6FD9BC]">
              {todayBengali}
            </span>
            {currentUser?.user_role && (
              <span className="rounded-full bg-gradient-to-r from-[#E0A63C] to-[#C4851C] px-4 py-2 text-sm font-semibold text-[#0C2E4A] shadow-sm">
                {currentUser.user_role}
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
