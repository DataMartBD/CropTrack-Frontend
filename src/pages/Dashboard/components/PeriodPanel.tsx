import type { ReactNode } from "react";

import { TONES, type Tone } from "../tones";

export type PeriodFigure = {
  label: string;
  /** Pre-formatted, already localized. */
  amount: string;
  /** Series colour for the chip beside the label. Never used on the number. */
  color: string;
  icon: ReactNode;
};

export type PeriodNet = {
  label: string;
  amount: string;
  isPositive: boolean;
  /**
   * "Profit" / "Loss" — the sign said in words, not only in colour. Optional:
   * cash movement has a net figure but no word for its sign, and inventing one
   * would read as a verdict the books never passed.
   */
  badge?: string;
};

type PeriodPanelProps = {
  /** "Today", "This Month", "This Year". */
  label: string;
  /** The parent card's tone, so the panel reads as part of it. */
  tone: Tone;
  figures: [PeriodFigure, PeriodFigure];
  /** Only the income statement has a bottom line; cash movement doesn't. */
  net?: PeriodNet;
  /** Shown instead of a badge when both figures are zero. */
  emptyLabel?: string;
  isEmpty?: boolean;
};

/**
 * One period, two figures, optionally a bottom line.
 *
 * Deposit/Expense and the Income Statement are the same shape of question —
 * "money in versus money out, over this window" — so they are the same panel.
 * A reader who learns to read one has learned to read both.
 *
 * The panel carries its card's tone rather than a hue of its own — colour on
 * this dashboard answers one question, "which card am I in", and a panel that
 * introduced a fourth hue would start answering a different one.
 *
 * Layout is two lines, not four: the period name and its net share the top line,
 * the two figures split the one below. The net used to sit under a divider on a
 * row of its own, which cost ~44px per period to say a single number — three
 * times over on the cash card. It reads better up top anyway: it is the
 * conclusion of the two figures, so it goes where the eye lands first.
 *
 * Giving the net the top line rather than a third column is also what keeps the
 * figures legible — at a third of a row on a wide screen a card is ~400px, and
 * three columns of taka put "৳৪১২,০০০,০০০" into an ellipsis.
 */
export default function PeriodPanel({
  label,
  tone,
  figures,
  net,
  emptyLabel,
  isEmpty,
}: PeriodPanelProps) {
  const palette = TONES[tone];

  return (
    <div className={`rounded-lg border px-3 py-2.5 ${palette.panel}`}>
      {/* Period name and its status sit on one line with the label, not above
          the figures — the line was half empty either way. */}
      <div className="mb-2 flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`h-3.5 w-1 shrink-0 rounded-full bg-gradient-to-b ${palette.rail}`}
        />
        {/* No uppercase and no letter-spacing: neither does anything for Bangla
            except break the conjuncts apart, and this label is Bangla first. */}
        <p className={`truncate text-sm font-semibold ${palette.icon}`}>
          {label}
        </p>
        <span
          aria-hidden="true"
          className="h-px flex-1 bg-black/10 dark:bg-white/15"
        />
        {isEmpty && emptyLabel && (
          <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
            {emptyLabel}
          </span>
        )}
        {net && (
          <div className="flex min-w-0 shrink items-baseline gap-1.5">
            <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
              {net.label}
            </span>
            <span
              title={net.amount}
              className={`truncate text-base font-semibold tabular-nums ${
                net.isPositive
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}
            >
              {net.amount}
            </span>
          </div>
        )}
        {net?.badge && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              net.isPositive
                ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
            }`}
          >
            {net.badge}
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2">
        {figures.map((figure, index) => (
          <div
            key={figure.label}
            className={`min-w-0 pr-3 ${
              index === 0
                ? ""
                : "border-l border-black/10 pl-3 dark:border-white/10"
            }`}
          >
            <dt className="flex items-center gap-1.5 text-[15px] text-gray-600 dark:text-gray-400">
              <span
                aria-hidden="true"
                className="flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white"
                style={{ backgroundColor: figure.color }}
              >
                {figure.icon}
              </span>
              <span className="truncate">{figure.label}</span>
            </dt>
            {/* Text ink, not the series colour — the chip beside it already
                carries the identity, and these accents sit under the 4.5:1
                floor for text. */}
            <dd
              className="mt-0.5 truncate text-lg leading-tight font-semibold tabular-nums text-gray-800 dark:text-white/90"
              title={figure.amount}
            >
              {figure.amount}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
