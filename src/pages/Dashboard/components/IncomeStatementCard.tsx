import { LuArrowDownLeft, LuArrowUpRight, LuScale } from "react-icons/lu";
import { useTranslation } from "react-i18next";

import { formatTaka } from "../../../utils/format";
import { VIZ } from "../palette";
import type { IncomeStatementPeriod, StatementPeriod } from "../types";
import DashboardCard from "./DashboardCard";
import PeriodPanel from "./PeriodPanel";

type IncomeStatementCardProps = {
  statement: Record<StatementPeriod, IncomeStatementPeriod>;
  theme: "light" | "dark";
  className?: string;
};

const EMPTY: IncomeStatementPeriod = {
  total_income: 0,
  total_expenditure: 0,
  total_pl: 0,
};

/**
 * Income, expenditure and the bottom line — the same panel as Deposit &
 * Expense, minus today, since the books close monthly rather than daily.
 */
const PERIODS: { key: StatementPeriod; labelKey: string }[] = [
  { key: "monthly", labelKey: "period_this_month" },
  { key: "yearly", labelKey: "period_this_year" },
];

export default function IncomeStatementCard({
  statement,
  theme,
  className,
}: IncomeStatementCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const viz = VIZ[theme];

  return (
    <DashboardCard
      title={t("income_statement")}
      subtitle={t("income_statement_subtitle")}
      tone="teal"
      icon={<LuScale />}
      className={className}
    >
      {/* Side by side once the card is wide enough to hold two panels — which
          is exactly when it's the full-width card on the second row, and would
          otherwise be two thin bands over a lot of nothing. */}
      <div className="grid gap-2 @2xl:grid-cols-2">
        {PERIODS.map(({ key, labelKey }) => {
          const row = statement?.[key] ?? EMPTY;
          const isProfit = row.total_pl >= 0;

          return (
            <PeriodPanel
              key={key}
              label={t(labelKey)}
              tone="teal"
              figures={[
                {
                  label: t("total_income"),
                  amount: formatTaka(row.total_income, lang, 0),
                  color: viz.primary,
                  icon: <LuArrowDownLeft aria-hidden="true" />,
                },
                {
                  label: t("total_expenditure"),
                  amount: formatTaka(row.total_expenditure, lang, 0),
                  color: viz.outflow,
                  icon: <LuArrowUpRight aria-hidden="true" />,
                },
              ]}
              net={{
                // "Net", not "Net Profit / Loss" — the badge on the same line
                // already says which of the two it was.
                label: t("net_flow"),
                amount: formatTaka(row.total_pl, lang, 0),
                isPositive: isProfit,
                badge: isProfit ? t("profit") : t("loss"),
              }}
            />
          );
        })}
      </div>
    </DashboardCard>
  );
}
