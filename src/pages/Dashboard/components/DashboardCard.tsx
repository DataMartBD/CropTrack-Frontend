import type { ReactNode } from "react";

import { TONES, type Tone } from "../tones";

type DashboardCardProps = {
  title: string;
  /** One line of context under the title — the period, the source, the caveat. */
  subtitle?: string;
  /** Decorative identity: rail, icon chip and a faint wash. Never encoding. */
  tone: Tone;
  /** Sits in the tone-coloured chip beside the title. */
  icon: ReactNode;
  /** Segmented switch, badge, legend — anything that scopes the card. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** The panel shell used by every card on the dashboard, matching the app's. */
export default function DashboardCard({
  title,
  subtitle,
  tone,
  icon,
  action,
  className = "",
  children,
}: DashboardCardProps) {
  const palette = TONES[tone];

  return (
    // @container, so the panels inside can lay themselves out against the
    // card's own width rather than the viewport's — this card is a third of a
    // row at xl and a full row at lg, and only it knows which.
    <section
      className={`@container relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-white/[0.03] ${palette.border} ${className}`}
    >
      {/* In flow rather than absolutely placed, and 6px rather than 3: a hairline
          pinned to the top edge gets eaten by the 16px corner radius and only
          survives across the flat middle. At this height the colour still reads
          as a solid band where the corners curve away from it. */}
      <span
        aria-hidden="true"
        className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${palette.rail}`}
      />

      {/* A solid tinted band, not a fade: it gives the card a visible colour
          block while stopping cleanly at a rule, so the numbers below always
          sit on plain white. */}
      <header
        className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-4 py-3 ${palette.header} ${palette.border}`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-lg ${palette.chip} ${palette.icon}`}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg leading-tight font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </header>

      <div className="flex flex-1 flex-col p-3">{children}</div>
    </section>
  );
}
