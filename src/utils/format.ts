import { toBengaliDigits } from "./bengaliDate";

/**
 * Money formatting for the accounts screens.
 *
 * The grouping locale is pinned to en-US rather than left to the browser, so
 * two people looking at the same report see the same separators. (Switch this
 * one constant to "en-IN" if the client wants lakh/crore grouping — 1,03,83,593
 * instead of 10,383,593.)
 */
const GROUPING_LOCALE = "en-US";

export const formatAmount = (
  value: number | null | undefined,
  decimals = 2,
): string =>
  (value ?? 0).toLocaleString(GROUPING_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** Bangla reads its own numerals; everything else keeps ASCII digits. */
export const localizeDigits = (text: string, language?: string): string =>
  language === "bn" ? toBengaliDigits(text) : text;

/**
 * The full presentation: grouped, localized digits, taka sign. Negatives keep
 * the minus rather than becoming parentheses — the colour and the label already
 * carry the sign, and a minus survives being read aloud.
 *
 * The minus goes *outside* the ৳, not between it and the digits: "৳-38,373,959"
 * reads as a corrupted symbol at a glance, "-৳38,373,959" reads as a loss.
 */
export const formatTaka = (
  value: number | null | undefined,
  language?: string,
  decimals = 2,
): string => {
  const amount = value ?? 0;
  const sign = amount < 0 ? "-" : "";
  return `${sign}৳${localizeDigits(formatAmount(Math.abs(amount), decimals), language)}`;
};

/** A share of a whole, guarded against the empty-storage divide-by-zero. */
export const percentOf = (part: number, whole: number): number =>
  whole === 0 ? 0 : (part / whole) * 100;

export const formatPercent = (
  value: number,
  language?: string,
  decimals = 1,
): string =>
  `${localizeDigits(
    value.toLocaleString(GROUPING_LOCALE, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
    language,
  )}%`;

/**
 * Axis ticks need a unit, and the one to use depends on the size of the
 * figures — crore ticks on a ledger that deals in thousands would all read 0.00.
 *
 * The test is not "does the peak reach this unit" but "does it reach it with
 * digits to spare": scaled by the divisor, the top of the axis has to land in
 * [10, 1000), so every tick keeps two or three significant figures. Each
 * threshold is therefore ten times its own divisor, not one.
 *
 * That distinction is the whole point. An income statement peaking at
 * ৳31,471,987 *is* a crore-sized number, and the naive rule labels it in crore
 * — but then its quiet months (৳420,708) round to 0.0 and half the chart sits
 * flat on the axis. The same figures in lakh run 4 to 315, and every month has
 * a height that can be read.
 */
export type AmountUnit = { divisor: number; labelKey: string };

export const pickAmountUnit = (maxAbsolute: number): AmountUnit =>
  maxAbsolute >= 1e8
    ? { divisor: 1e7, labelKey: "unit_crore" }
    : maxAbsolute >= 1e6
      ? { divisor: 1e5, labelKey: "unit_lakh" }
      : maxAbsolute >= 1e4
        ? { divisor: 1e3, labelKey: "unit_thousand" }
        : { divisor: 1, labelKey: "unit_taka" };

/**
 * The sign colour used across the accounts pages: profit green, loss red,
 * nothing-happened gray. Colour is never the only cue — every caller pairs this
 * with an arrow glyph and a written label.
 */
export const amountClass = (value: number): string =>
  value < 0
    ? "text-red-600 dark:text-red-400"
    : value > 0
      ? "text-green-700 dark:text-green-400"
      : "text-gray-500 dark:text-gray-400";
