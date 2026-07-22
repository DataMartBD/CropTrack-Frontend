import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { LuChartColumnBig } from "react-icons/lu";

import { formatTaka, pickAmountUnit } from "../../../utils/format";
import { VIZ } from "../palette";
import type { MonthlyFlow } from "../types";
import DashboardCard from "./DashboardCard";
import { axisAmount, axisDecimals, chartChrome, monthLabel } from "./chartBase";

type CashFlowTrendCardProps = {
  months: MonthlyFlow[];
  theme: "light" | "dark";
  className?: string;
};

/**
 * Money in against money out, month by month.
 *
 * Paired columns rather than a stack: the question this chart answers is "which
 * of the two was bigger, and by how much", and that is a comparison of two
 * heights from a shared baseline. Stacked, one of the bars floats and the eye
 * has to measure a segment.
 */
export default function CashFlowTrendCard({
  months,
  theme,
  className,
}: CashFlowTrendCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const viz = VIZ[theme];

  // The API reports deposits credit-side, so they arrive negative — the same
  // convention the Deposit & Expense card already strips. Plotted signed, money
  // in would hang below the axis and the chart would read as a loss every
  // month. Magnitude here, direction from the legend.
  const series = useMemo(
    () => [
      {
        name: t("deposit"),
        data: months.map((row) => Math.abs(row.deposit ?? 0)),
      },
      {
        name: t("expense"),
        data: months.map((row) => Math.abs(row.expense ?? 0)),
      },
    ],
    [months, t],
  );

  const unit = useMemo(() => {
    const peak = Math.max(
      0,
      ...months.map((row) =>
        Math.max(Math.abs(row.deposit ?? 0), Math.abs(row.expense ?? 0)),
      ),
    );
    return { ...pickAmountUnit(peak), peak };
  }, [months]);

  const options = useMemo<ApexOptions>(() => {
    const chrome = chartChrome(
      theme,
      months.map((row) => monthLabel(row.month, row.label, lang)),
      axisAmount(unit.divisor, axisDecimals(unit.peak, unit.divisor), lang),
    );

    return {
      ...chrome,
      chart: { ...chrome.chart, type: "bar", stacked: false },
      // Blue for money in, red for money out. Not green/red: green↔red is the
      // accounting convention and also the pair that collapses under
      // protanopia — see palette.ts.
      colors: [viz.primary, viz.outflow],
      plotOptions: {
        bar: {
          columnWidth: months.length > 8 ? "72%" : "56%",
          borderRadius: 4,
          borderRadiusApplication: "end",
        },
      },
      // A 2px gap in the card's own colour between the paired columns, so they
      // read as two marks rather than one two-tone block.
      stroke: { show: true, width: 2, colors: ["transparent"] },
      tooltip: {
        ...chrome.tooltip,
        y: { formatter: (value: number) => formatTaka(value, lang, 0) },
      },
    };
  }, [months, theme, lang, viz, unit]);

  return (
    <DashboardCard
      title={t("deposit_expense_trend")}
      subtitle={t("deposit_expense_trend_subtitle")}
      tone="purple"
      icon={<LuChartColumnBig />}
      className={className}
      action={
        <span className="shrink-0 rounded-full bg-black/[0.05] px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
          {t(unit.labelKey)}
        </span>
      }
    >
      {months.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("no_chart_data")}
        </p>
      ) : (
        // Apex writes colours into the DOM on mount and only patches some of
        // them on an options change, so a theme or language flip gets a fresh
        // chart rather than a half-repainted one.
        <Chart
          key={`${theme}-${lang}`}
          options={options}
          series={series}
          type="bar"
          height={300}
        />
      )}
    </DashboardCard>
  );
}
