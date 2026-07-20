import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  LuBanknote,
  LuCalendarDays,
  LuCircleAlert,
  LuLandmark,
  LuLeaf,
  LuRefreshCw,
  LuShieldCheck,
  LuWallet,
} from "react-icons/lu";

import PageMeta from "../../components/common/PageMeta";
import { useTheme } from "../../context/ThemeContext";
import { useUserContext } from "../../context/UserContext";
import { formatBengaliDate } from "../../utils/bengaliDate";
import { formatTaka, localizeDigits } from "../../utils/format";
import BankAccountsCard from "./components/BankAccountsCard";
import CashFlowCard from "./components/CashFlowCard";
import DashboardSkeleton from "./components/DashboardSkeleton";
import IncomeStatementCard from "./components/IncomeStatementCard";
import StatTile from "./components/StatTile";
import { useDashboardData } from "./useDashboardData";

import brandMark from "../../assets/rahbar-icon.png";

export default function Home() {
  const { t, i18n } = useTranslation();
  const { currentUser } = useUserContext();
  const { theme } = useTheme();
  const lang = i18n.resolvedLanguage;

  const { data, isLoading, isRefreshing, error, lastUpdated, refresh } =
    useDashboardData();

  // Bangla is the default language, so the date has to follow it rather than
  // the browser locale.
  const today = useMemo(
    () =>
      new Date().toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [lang],
  );

  // The Bengali (বঙ্গাব্দ) date the storage runs its season by, alongside the
  // Gregorian one.
  const todayBengali = useMemo(
    () => formatBengaliDate(new Date(), lang ?? "bn"),
    [lang],
  );

  const totalCash = data?.cash?.total_cash ?? 0;
  const bankTotal = data?.banks?.bank_total ?? 0;
  const accounts = data?.banks?.accounts ?? [];
  // Prefer the server's own total — if it ever disagrees with cash + banks,
  // the books are the authority, not our arithmetic.
  const grandTotal = data?.cash_and_bank_total ?? totalCash + bankTotal;

  return (
    <>
      <PageMeta title="CropTrack" description="CropTrack Dashboard" />

      {/* The banner and the page toolbar are one card. They were two stacked
          blocks, each opening with its own three-colour brand rail — the same
          motif twice inside 140px, with a seam between them that carried
          nothing. Merged, it's one rail instead of two, and the card reads as
          the page's masthead rather than as two things that happen to be
          adjacent. */}
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        {/* The same 6px rail every card below carries, in the brand's own three
            colours: navy, ice blue, gold. */}
        <span
          aria-hidden="true"
          className="block h-1.5 w-full bg-gradient-to-r from-[#0C2E4A] via-[#3B93C9] to-[#E0A63C]"
        />

        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3 bg-gradient-to-r from-[#E8F3FB] via-white to-[#FDF2DE] px-4 py-3 dark:from-[#0F3050] dark:via-gray-800 dark:to-[#3A2B10]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-8 h-40 w-40 rounded-full bg-[#E0A63C]/25 blur-3xl dark:bg-[#E0A63C]/20"
          />

          {/* The horizontal wordmark image is a three-line lockup — at bar
              height its legal line renders about 5px tall and turns to mush. So
              the mark is the seal, and the name is real text: legible at any
              size, and it follows the language instead of being baked in. */}
          <div className="relative flex min-w-0 items-center gap-3">
            {/* The seal sits in a chip like every other icon on the page,
                instead of floating loose on the gradient. */}
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-[#0C2E4A]/10 dark:bg-white/10 dark:ring-white/15"
            >
              <img src={brandMark} alt="" className="h-9 w-9" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xl leading-tight font-semibold text-[#0C2E4A] sm:text-2xl dark:text-white/90">
                {t("rahbar_legal")}
              </p>
              {/* The roman legal name is a second reading of the same words, so
                  it only earns its line in Bangla. In English it would just be
                  the title again. Latin script, so the letter-spacing is doing
                  real work here — unlike on the Bangla labels. */}
              {lang === "bn" && (
                <p className="truncate text-xs tracking-[0.14em] text-[#1B5D89] uppercase dark:text-[#9DD2F2]">
                  Rahbar Cold Storage (Pvt.) Ltd.
                </p>
              )}
            </div>
          </div>

          {/* No shrink-0 here: it would hold the group at max-content width, so
              the group's own flex-wrap never fires and the last pill gets
              clipped by the card's overflow-hidden on a phone.

              An icon each, because three same-shaped pills in a row read as one
              stripe — the glyph is what says "date", "season", "who you are"
              before the text is read. */}
          <div className="relative flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3B93C9]/40 bg-[#3B93C9]/10 px-2.5 py-1 text-[13px] font-medium text-[#1B5D89] dark:border-[#3B93C9]/40 dark:bg-[#3B93C9]/15 dark:text-[#9DD2F2]">
              <LuCalendarDays aria-hidden="true" className="shrink-0" />
              {today}
            </span>
            {/* Green, so the two dates read as two facts rather than one
                wrapped line. */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0F7A5F]/40 bg-[#0F7A5F]/10 px-2.5 py-1 text-[13px] font-medium text-[#0B5343] dark:border-[#12A37D]/40 dark:bg-[#12A37D]/15 dark:text-[#6FD9BC]">
              <LuLeaf aria-hidden="true" className="shrink-0" />
              {todayBengali}
            </span>
            {currentUser?.user_role && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E0A63C] to-[#C4851C] px-2.5 py-1 text-[13px] font-semibold text-[#0C2E4A] shadow-sm">
                <LuShieldCheck aria-hidden="true" className="shrink-0" />
                {currentUser.user_role}
              </span>
            )}
          </div>
        </div>

        {/* Toolbar: what this screen is, when it was last true, and how to make
            it true again. The title and the timestamp share a baseline rather
            than stacking — the line had the room. */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-gray-200 px-4 py-2.5 dark:border-white/10">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {t("financial_overview")}
            </h1>
            {lastUpdated && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("last_updated")}:{" "}
                {localizeDigits(
                  lastUpdated.toLocaleTimeString(
                    lang === "bn" ? "bn-BD" : "en-GB",
                    { hour: "2-digit", minute: "2-digit" },
                  ),
                  lang,
                )}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-[#0F7A5F]/30 bg-[#0F7A5F]/[0.07] px-3.5 py-1.5 text-sm font-medium text-[#0B5343] transition-colors hover:bg-[#0F7A5F]/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#12A37D]/30 dark:bg-[#12A37D]/10 dark:text-[#6FD9BC] dark:hover:bg-[#12A37D]/20"
          >
            <LuRefreshCw
              aria-hidden="true"
              className={isRefreshing ? "animate-spin" : undefined}
            />
            {t("refresh")}
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          <LuCircleAlert aria-hidden="true" className="size-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-red-300 px-3 py-1.5 font-medium transition-colors hover:bg-red-100 dark:border-red-500/40 dark:hover:bg-red-500/20"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="mt-4">
          <DashboardSkeleton />
        </div>
      ) : data ? (
        // A refresh dims the live cards rather than replacing them with a
        // skeleton — no flash, no layout jump.
        <div
          className={`mt-4 transition-opacity duration-200 ${
            isRefreshing ? "opacity-60" : "opacity-100"
          }`}
        >
          {/* Three balances, in the order they're held: cash on hand, money in
              the banks, and the two added up. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile
              tone="gold"
              icon={<LuBanknote />}
              label={t("cash_in_hand")}
              value={formatTaka(totalCash, lang, 0)}
              title={formatTaka(totalCash, lang)}
            />
            <StatTile
              tone="blue"
              icon={<LuLandmark />}
              label={t("bank_balance")}
              value={formatTaka(bankTotal, lang, 0)}
              title={formatTaka(bankTotal, lang)}
            />
            <StatTile
              tone="navy"
              icon={<LuWallet />}
              label={t("cash_and_bank_total")}
              value={formatTaka(grandTotal, lang, 0)}
              title={formatTaka(grandTotal, lang)}
            />
          </div>

          {/* One concern per card, one colour per concern. Sixths rather than
              halves and thirds, because the three cards don't want the same
              split at every width: at xl they're even thirds, and at lg the
              income statement takes the whole second row instead of leaving a
              column-tall hole under the shorter of the two above it.

              items-start, not the default stretch: the bank list runs much
              taller than the other two, and stretching them to match just pools
              blank space inside the cards. */}
          <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-6">
            <BankAccountsCard
              className="lg:col-span-3 xl:col-span-2"
              bankTotal={bankTotal}
              accounts={accounts}
              theme={theme}
            />
            <CashFlowCard
              className="lg:col-span-3 xl:col-span-2"
              flows={data.deposit_expense}
              theme={theme}
            />
            <IncomeStatementCard
              className="lg:col-span-6 xl:col-span-2"
              statement={data.income_statement}
              theme={theme}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
