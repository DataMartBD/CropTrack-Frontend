import type { ApexOptions } from "apexcharts";

import { localizeDigits } from "../../../utils/format";
import { CHART_FONT, VIZ } from "../palette";

/**
 * Everything the two trend charts share: the font, the hairline grid, the axis
 * ink and the tooltip skin. Only the marks and the scale differ between them,
 * so only those are set per chart.
 *
 * The chrome is deliberately quiet — dashed grid one shade off the surface, no
 * axis borders, no toolbar. The dashboard's colour lives in the cards; inside a
 * chart the only things that get to be coloured are the marks.
 */
export function chartChrome(
  theme: "light" | "dark",
  categories: string[],
  /** Tick formatter for the value axis — see `axisAmount`. */
  yFormatter: (value: number) => string,
): ApexOptions {
  const viz = VIZ[theme];
  const tickStyle = {
    colors: viz.axis,
    fontFamily: CHART_FONT,
    fontSize: "12px",
  };

  return {
    chart: {
      fontFamily: CHART_FONT,
      background: "transparent",
      toolbar: { show: false },
      zoom: { enabled: false },
      // The card it sits in already has padding; Apex's own top offset just
      // pushes the plot off-centre.
      parentHeightOffset: 0,
      animations: { enabled: true, speed: 400 },
    },
    // Twelve months of taka would need a marching column of nine-digit numbers
    // to sit on top of the bars. The tooltip carries the exact figure instead.
    dataLabels: { enabled: false },
    grid: {
      borderColor: viz.grid,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 8, bottom: 0, left: 4 },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: tickStyle },
      // The category name is already the tooltip's title.
      tooltip: { enabled: false },
    },
    yaxis: {
      forceNiceScale: true,
      labels: { style: tickStyle, formatter: yFormatter },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: CHART_FONT,
      fontSize: "13px",
      labels: { colors: viz.axis },
      markers: { size: 6, strokeWidth: 0 },
      itemMargin: { horizontal: 10, vertical: 2 },
    },
    tooltip: {
      theme,
      shared: true,
      intersect: false,
      style: { fontFamily: CHART_FONT },
    },
    states: { hover: { filter: { type: "lighten" } } },
  };
}

/**
 * The API ships "Jan", which is only right in one of the two languages this app
 * is read in. The month number is the durable part of the row, so the name is
 * rebuilt from it and the label is kept as the fallback.
 */
export function monthLabel(
  month: number,
  fallback: string,
  language?: string,
): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) return fallback;

  try {
    // Any non-leap year works — only the month is being read off it.
    return new Date(2001, month - 1, 1).toLocaleDateString(
      language === "bn" ? "bn-BD" : "en-GB",
      { month: "short" },
    );
  } catch {
    return fallback;
  }
}

/**
 * Axis ticks in the unit the card's header names — crore, lakh or thousand —
 * so the y axis carries five characters instead of eleven. The decimal count is
 * decided once for the whole axis rather than per tick, or the column of labels
 * comes out ragged (0 next to 12.5).
 */
export function axisAmount(divisor: number, decimals: number, language?: string) {
  return (value: number): string =>
    localizeDigits(
      (value / divisor).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
      language,
    );
}

/**
 * One decimal while the scaled figures are two digits, none once they are
 * three. `pickAmountUnit` guarantees the scaled peak lands in [10, 1000), so
 * either way the axis carries three significant figures — never "0.0" repeated
 * down the column.
 */
export const axisDecimals = (maxAbsolute: number, divisor: number): number =>
  maxAbsolute / divisor >= 100 ? 0 : 1;
