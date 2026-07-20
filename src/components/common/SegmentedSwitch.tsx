import type React from "react";

export type SegmentedOption<T extends string> = {
  value: T;
  /** Rendered inside the segment — a label or an icon. */
  content: React.ReactNode;
  /** Tooltip + accessible name; the visible content is usually abbreviated. */
  label: string;
  /** Tailwind classes for the selected state, so each switch can own its accent. */
  activeClassName: string;
};

type SegmentedSwitchProps<T extends string> = {
  ariaLabel: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
};

/**
 * Two-or-more segment pill for the settings rows in the user menu. Every choice
 * is visible and directly clickable — unlike a blind toggle, you can see what
 * you are switching to before you commit.
 *
 * Styled for a panel surface (white / gray-800). It previously sat on the solid
 * green header bar and used a translucent white track, which is invisible here.
 */
export function SegmentedSwitch<T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
}: SegmentedSwitchProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-gray-100 p-1 ring-1 ring-inset ring-gray-200 dark:bg-white/10 dark:ring-white/10"
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            title={option.label}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={`flex h-7 cursor-pointer items-center justify-center rounded-full px-3 text-sm leading-none font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F5645] dark:focus-visible:ring-white ${
              isActive
                ? `${option.activeClassName} shadow-sm`
                : "text-gray-500 hover:bg-white hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
            }`}
          >
            {option.content}
          </button>
        );
      })}
    </div>
  );
}
