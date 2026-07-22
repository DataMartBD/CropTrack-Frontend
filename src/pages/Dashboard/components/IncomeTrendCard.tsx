import { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { useTranslation } from "react-i18next";
import { LuChartNoAxesCombined } from "react-icons/lu";

import { formatTaka, pickAmountUnit } from "../../../utils/format";
import { VIZ } from "../palette";
import type { MonthlyStatement } from "../types";
import DashboardCard from "./DashboardCard";
import { axisAmount, axisDecimals, chartChrome, monthLabel } from "./chartBase";

type IncomeTrendCardProps = {
  months: MonthlyStatement[];
  theme: "light" | "dark";
  className?: string;
};

/**
 * Income and expenditure as columns, the bottom line as a line over them.
 *
 * Three columns per month would make the reader find the third bar and compare
 * it to a baseline that moves; a line has its own shape, crosses zero visibly,
 * and stays legible where the two columns are nearly equal. It is also the one
 * series here that is a *result* rather than an input, and giving it a different
 * kind of mark says so without a caption.
 *
 * Everything is plotted signed. A month where income came out negative — a
 * reversal, a correction — is a real event in these books, and flipping it above
 * the axis would hide it.
 */
export default function IncomeTrendCard({
  months,
  theme,
  className,
}: IncomeTrendCardProps) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage;
  const viz = VIZ[theme];

  const series = useMemo(
    () => [
      {
        name: t("total_income"),
        type: "column",
        data: months.map((row) => row.total_income ?? 0),
      },
      {
        name: t("total_expenditure"),
        type: "column",
        data: months.map((row) => row.total_expenditure ?? 0),
      },
      {
        name: t("net_profit_loss"),
        type: "line",
        data: months.map((row) => row.total_pl ?? 0),
      },
    ],
    [months, t],
  );

  const unit = useMemo(() => {
    const peak = Math.max(
      0,
      ...months.map((row) =>
        Math.max(
          Math.abs(row.total_income ?? 0),
          Math.abs(row.total_expenditure ?? 0),
          Math.abs(row.total_pl ?? 0),
        ),
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
      // Mixed charts declare "line" and let each series say what it is.
      chart: { ...chrome.chart, type: "line", stacked: false },
      colors: [viz.primary, viz.outflow, viz.gold],
      plotOptions: {
        bar: {
          columnWidth: months.length > 8 ? "68%" : "52%",
          borderRadius: 4,
          // "end" alone rounds the wrong edge on a negative column; "around"
          // rounds whichever end is the tip, above the axis or below it.
          borderRadiusApplication: "around",
        },
      },
      // Per series: the two columns take a transparent hairline as a separator,
      // the net line takes an actual 3px stroke.
      stroke: {
        show: true,
        width: [2, 2, 3],
        colors: ["transparent", "transparent", viz.gold],
        curve: "smooth",
      },
      markers: {
        size: [0, 0, 4],
        strokeWidth: 2,
        strokeColors: viz.surface,
        hover: { size: 6 },
      },
      // Zero is the whole point of this chart — profit above it, loss below —
      // so it gets a solid rule instead of being one dashed gridline among many.
      annotations: {
        yaxis: [{ y: 0, borderColor: viz.axis, strokeDashArray: 0, opacity: 0.6 }],
      },
      tooltip: {
        ...chrome.tooltip,
        y: { formatter: (value: number) => formatTaka(value, lang, 0) },
      },
    };
  }, [months, theme, lang, viz, unit]);

  return (
    <DashboardCard
      title={t("income_statement_trend")}
      subtitle={t("income_statement_trend_subtitle")}
      tone="teal"
      icon={<LuChartNoAxesCombined />}
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
        <Chart
          key={`${theme}-${lang}`}
          options={options}
          series={series}
          type="line"
          height={300}
        />
      )}
    </DashboardCard>
  );
}
