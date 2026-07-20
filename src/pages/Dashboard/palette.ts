/**
 * Chart colours for the dashboard.
 *
 * These are not eyeballed. Each pair was run through a contrast/CVD validator
 * against the surface it actually renders on — white for light mode, the
 * gray-900 card (#171f2e after the white/[0.03] wash) for dark — and checked for
 * the lightness band, a chroma floor, colour-blind separation (protan / deutan /
 * tritan), the normal-vision floor, and 3:1 contrast against the surface.
 *
 * Two things fell out of that and are worth not re-litigating:
 *
 *  - Money-in is BLUE, not green. Green-vs-red is the accounting convention but
 *    it is also the single worst pair under protanopia (ΔE 5.1 — the two bars
 *    become the same bar for ~1 in 12 men). Blue↔red is the validated diverging
 *    pair and survives every simulation.
 *  - The gold is #c98500 in both modes, not the brand's #e0a63c. The brand gold
 *    is too light for the dark band and only reaches 2.17:1 on white.
 *
 * Signed *numbers* still use the app's green/red ink (see `amountClass`) — that
 * is text, always sits beside a written label and an arrow, and never has to be
 * told apart from a neighbouring swatch.
 */

export type VizPalette = {
  /** Bank balances, deposits, income — the primary series. */
  primary: string;
  /** Cash in hand — the second identity in the liquidity split. */
  gold: string;
  /** Expense, expenditure — the opposite pole of the diverging pair. */
  outflow: string;
  /** Hairline grid, one shade off the surface. */
  grid: string;
  /** Axis and tick ink. */
  axis: string;
  /** The surface the marks sit on, for 2px separator gaps. */
  surface: string;
};

export const VIZ: Record<"light" | "dark", VizPalette> = {
  light: {
    primary: "#2a78d6",
    gold: "#c98500",
    outflow: "#d64545",
    grid: "#e4e7ec",
    axis: "#667085",
    surface: "#ffffff",
  },
  dark: {
    primary: "#3987e5",
    gold: "#c98500",
    outflow: "#e66767",
    grid: "#2c3444",
    axis: "#98a2b3",
    surface: "#171f2e",
  },
};

/** ApexCharts needs the Bangla fallback or Bangla axis labels render as boxes. */
export const CHART_FONT = "Outfit, 'Noto Sans Bengali', sans-serif";
