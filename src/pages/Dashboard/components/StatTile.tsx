import type { ReactNode } from "react";

import { TONES, type Tone } from "../tones";

/**
 * Tone is the tile's identity, not its value's sign — "cash is gold, banks are
 * blue" holds whether the number went up or down. A tile whose *value* carries a
 * sign passes `valueClassName` for that, so the two signals stay separable.
 */
type StatTileProps = {
  label: string;
  /** Pre-formatted, already localized. */
  value: string;
  /** The unabbreviated value, for the native tooltip. */
  title?: string;
  icon: ReactNode;
  tone: Tone;
  /** Sign colour for the value, when the value is signed. */
  valueClassName?: string;
  /** A share, a count, a period — one short line under the number. */
  footer?: ReactNode;
};

export default function StatTile({
  label,
  value,
  title,
  icon,
  tone,
  valueClassName,
  footer,
}: StatTileProps) {
  const palette = TONES[tone];

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-white/[0.03] ${palette.border}`}
    >
      {/* Rail, then a wash over the full tile. The wash is strongest at the top
          and thins toward the number, so the tile reads as coloured while the
          figure keeps a near-white background to sit on.

          The rail is 6px and in normal flow: pinned and hairline, the 16px
          corner radius clipped it down to nothing at both ends. */}
      <span
        aria-hidden="true"
        className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${palette.rail}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-1.5 bottom-0 bg-gradient-to-b to-transparent ${palette.wash}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-12 -right-10 h-32 w-32 rounded-full blur-3xl ${palette.glow}`}
      />

      <div className="relative flex flex-1 flex-col p-4">
        {/* The icon sits beside the label rather than on its own row above it —
            same information, one row less, which is most of where the tile's
            height was going. */}
        <div className="flex items-center justify-between gap-3">
          {/* Same ink and weight as a card's <h2> — a tile's label and a card's
              title are the same rank of thing, so they read as one system. */}
          <p className="min-w-0 text-lg leading-tight font-semibold text-gray-800 dark:text-white/90">
            {label}
          </p>
          {/* size-10 to match the card header chips. The placement differs on
              purpose — a tile puts its icon on the trailing edge, a card leads
              with it — but the chips are the same object either way. */}
          <span
            aria-hidden="true"
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-lg ${palette.chip} ${palette.icon}`}
          >
            {icon}
          </span>
        </div>

        <p
          title={title}
          className={`mt-1.5 text-2xl leading-tight font-semibold break-words tabular-nums ${
            valueClassName ?? "text-gray-800 dark:text-white/90"
          }`}
        >
          {value}
        </p>

        {footer && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {footer}
          </div>
        )}
      </div>
    </article>
  );
}
