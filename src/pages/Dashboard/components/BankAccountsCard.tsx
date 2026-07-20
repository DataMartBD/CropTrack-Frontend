import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LuLandmark } from "react-icons/lu";

import {
  formatPercent,
  formatTaka,
  localizeDigits,
  percentOf,
} from "../../../utils/format";
import { VIZ } from "../palette";
import { TONES } from "../tones";
import type { BankAccount } from "../types";
import DashboardCard from "./DashboardCard";

type BankAccountsCardProps = {
  bankTotal: number;
  accounts: BankAccount[];
  theme: "light" | "dark";
  className?: string;
};

export default function BankAccountsCard({
  bankTotal,
  accounts,
  theme,
  className,
}: BankAccountsCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const viz = VIZ[theme];

  // Largest first: the two or three accounts that hold the money are the ones
  // worth reading. Safe to re-sort because every bar is the same hue — no
  // reader has learned "this bank is blue" that a re-order could break.
  const ranked = useMemo(
    () => [...accounts].sort((a, b) => b.xbalance - a.xbalance),
    [accounts],
  );

  // Bars are scaled against the biggest account, not the total: against the
  // total, seven of eight accounts would be a hairline. The share percentage
  // beside each row carries the honest part-to-whole reading.
  const largest = ranked.length ? Math.max(...ranked.map((a) => a.xbalance)) : 0;

  return (
    <DashboardCard
      title={t("bank_accounts")}
      subtitle={`${localizeDigits(String(ranked.length), lang)} ${t("accounts_count")}`}
      tone="indigo"
      icon={<LuLandmark />}
      className={className}
      action={
        <p className="ml-auto shrink-0 text-2xl font-semibold tabular-nums text-gray-800 dark:text-white/90">
          {formatTaka(bankTotal, lang, 0)}
        </p>
      }
    >
      {ranked.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("no_bank_accounts")}
        </p>
      ) : (
        // One tinted panel around the whole list, so this card has the same
        // anatomy as the other two: coloured header band, tinted body panel.
        // px-3, not p-4: the longest account name needs every pixel of the
        // column, and the extra inset tipped it into truncation.
        <ul
          className={`flex flex-col gap-2.5 rounded-lg border px-3 py-2.5 ${TONES.indigo.panel}`}
        >
          {ranked.map((account) => (
            <li key={account.xacc}>
              <div className="flex items-baseline justify-between gap-3">
                <p
                  title={account.xdesc}
                  className="truncate text-[15px] text-gray-700 dark:text-gray-200"
                >
                  {account.xdesc}
                </p>
                <p className="shrink-0 text-[15px] font-medium tabular-nums text-gray-800 dark:text-white/90">
                  {formatTaka(account.xbalance, lang, 0)}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/10">
                  {/* Every bar is the same fill, so a re-sort can never break a
                      "this bank is the purple one" the reader had learned. The
                      gradient runs along the bar's own length — it rides the
                      value, it doesn't encode a second one. */}
                  <span
                    className="block h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${largest > 0 ? Math.max((account.xbalance / largest) * 100, 0) : 0}%`,
                      backgroundImage: `linear-gradient(90deg, ${viz.primary}, #6366f1)`,
                    }}
                  />
                </div>
                <span className="w-11 shrink-0 text-right text-xs tabular-nums text-gray-600 dark:text-gray-400">
                  {formatPercent(percentOf(account.xbalance, bankTotal), lang)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
}
