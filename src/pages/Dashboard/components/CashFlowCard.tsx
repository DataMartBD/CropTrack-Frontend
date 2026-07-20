import {
  LuArrowDownLeft,
  LuArrowRightLeft,
  LuArrowUpRight,
} from "react-icons/lu";
import { useTranslation } from "react-i18next";

import { formatTaka } from "../../../utils/format";
import { VIZ } from "../palette";
import type { DepositExpense, FlowPeriod } from "../types";
import DashboardCard from "./DashboardCard";
import PeriodPanel from "./PeriodPanel";

type CashFlowCardProps = {
  flows: Record<FlowPeriod, DepositExpense>;
  theme: "light" | "dark";
  className?: string;
};

const PERIODS: { key: FlowPeriod; labelKey: string }[] = [
  { key: "daily", labelKey: "period_today" },
  { key: "monthly", labelKey: "period_this_month" },
  { key: "yearly", labelKey: "period_this_year" },
];

/** Deposit and expense for today, this month, and this year to date. */
export default function CashFlowCard({
  flows,
  theme,
  className,
}: CashFlowCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const viz = VIZ[theme];

  return (
    <DashboardCard
      title={t("deposit_and_expense")}
      subtitle={t("deposit_expense_subtitle")}
      tone="purple"
      icon={<LuArrowRightLeft />}
      className={className}
    >
      <div className="flex flex-col gap-2">
        {PERIODS.map(({ key, labelKey }) => {
          // The API reports deposits credit-side, so they arrive negative. The
          // reader wants the magnitude of money in versus money out; the
          // direction is already said by the arrow and the label.
          const deposit = Math.abs(flows?.[key]?.deposit ?? 0);
          const expense = Math.abs(flows?.[key]?.expense ?? 0);
          // What the day/month/year actually did to the balance. It was the
          // subtraction every reader was doing in their head anyway, and it
          // costs no height — it fills the column the panel already had.
          const net = deposit - expense;

          return (
            <PeriodPanel
              key={key}
              label={t(labelKey)}
              tone="purple"
              isEmpty={deposit === 0 && expense === 0}
              emptyLabel={t("no_movement")}
              net={{
                label: t("net_flow"),
                amount: formatTaka(net, lang, 0),
                isPositive: net >= 0,
              }}
              figures={[
                {
                  label: t("deposit"),
                  amount: formatTaka(deposit, lang, 0),
                  color: viz.primary,
                  icon: <LuArrowDownLeft aria-hidden="true" />,
                },
                {
                  label: t("expense"),
                  amount: formatTaka(expense, lang, 0),
                  color: viz.outflow,
                  icon: <LuArrowUpRight aria-hidden="true" />,
                },
              ]}
            />
          );
        })}
      </div>
    </DashboardCard>
  );
}
