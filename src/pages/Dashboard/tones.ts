/**
 * The dashboard's decorative colour set — the rails, chips and washes that tell
 * one panel from another at a glance.
 *
 * This is chrome, NOT encoding. Nothing here carries a value: the rail on a card
 * says "this is the cash panel", it does not say "cash is blue". The marks that
 * do carry meaning — bars, swatches, the sign of a number — take their colours
 * from `palette.ts`, which is validated for contrast and colour-blindness.
 * Keeping the two apart is what lets the chrome be generous with colour without
 * ever competing with the data.
 *
 * Every wash is at or under 10% opacity so the ink on top keeps its contrast.
 */

export type Tone =
  | "navy"
  | "blue"
  | "gold"
  | "green"
  | "red"
  | "indigo"
  | "purple"
  | "teal";

export type ToneStyles = {
  /** 3px gradient rail across the top of a card or tile. */
  rail: string;
  /** Background for the icon chip. */
  chip: string;
  /** Icon ink inside the chip. */
  icon: string;
  /** Blurred bloom, for tiles with room for one. */
  glow: string;
  /** Top-down tint over a stat tile's surface. */
  wash: string;
  /** Tinted band behind a card's header. */
  header: string;
  /** Hairline border for the card and its header rule. */
  border: string;
  /** Border + fill for a panel nested inside a card of this tone. */
  panel: string;
};

export const TONES: Record<Tone, ToneStyles> = {
  navy: {
    rail: "from-[#0c2e4a] via-[#1f5fa8] to-[#3b93c9]",
    chip: "bg-[#0c2e4a]/12 dark:bg-[#3b93c9]/25",
    icon: "text-[#0c2e4a] dark:text-[#9dd2f2]",
    glow: "bg-[#3b93c9]/20",
    wash: "from-[#3b93c9]/[0.14] via-[#3b93c9]/[0.05]",
    header: "bg-[#3b93c9]/[0.12] dark:bg-[#3b93c9]/[0.14]",
    border: "border-[#3b93c9]/30 dark:border-[#3b93c9]/25",
    panel:
      "border-[#3b93c9]/25 bg-[#3b93c9]/[0.07] dark:border-[#3b93c9]/20 dark:bg-[#3b93c9]/[0.08]",
  },
  blue: {
    rail: "from-[#1f5fa8] via-[#2a78d6] to-[#7ec8f0]",
    chip: "bg-[#2a78d6]/12 dark:bg-[#3987e5]/25",
    icon: "text-[#1f5fa8] dark:text-[#8fc2f5]",
    glow: "bg-[#2a78d6]/20",
    wash: "from-[#2a78d6]/[0.13] via-[#2a78d6]/[0.04]",
    header: "bg-[#2a78d6]/[0.11] dark:bg-[#3987e5]/[0.14]",
    border: "border-[#2a78d6]/30 dark:border-[#3987e5]/25",
    panel:
      "border-[#2a78d6]/25 bg-[#2a78d6]/[0.06] dark:border-[#3987e5]/20 dark:bg-[#3987e5]/[0.08]",
  },
  gold: {
    rail: "from-[#8f5f00] via-[#c98500] to-[#f0c36a]",
    chip: "bg-[#c98500]/15 dark:bg-[#c98500]/30",
    icon: "text-[#8f5f00] dark:text-[#f0c36a]",
    glow: "bg-[#e0a63c]/25",
    wash: "from-[#e0a63c]/[0.20] via-[#e0a63c]/[0.07]",
    header: "bg-[#e0a63c]/[0.16] dark:bg-[#c98500]/[0.16]",
    border: "border-[#c98500]/30 dark:border-[#c98500]/25",
    panel:
      "border-[#c98500]/25 bg-[#e0a63c]/[0.09] dark:border-[#c98500]/20 dark:bg-[#c98500]/[0.09]",
  },
  green: {
    rail: "from-[#0f5645] via-[#12a37d] to-[#6fd9bc]",
    chip: "bg-[#0f7a5f]/12 dark:bg-[#12a37d]/25",
    icon: "text-[#0b5343] dark:text-[#6fd9bc]",
    glow: "bg-[#12a37d]/20",
    wash: "from-[#12a37d]/[0.14] via-[#12a37d]/[0.05]",
    header: "bg-[#12a37d]/[0.12] dark:bg-[#12a37d]/[0.14]",
    border: "border-[#12a37d]/30 dark:border-[#12a37d]/25",
    panel:
      "border-[#12a37d]/25 bg-[#12a37d]/[0.07] dark:border-[#12a37d]/20 dark:bg-[#12a37d]/[0.08]",
  },
  // Indigo, purple and teal exist so the three body cards don't have to reuse
  // the hues the stat tiles already spent. They follow the same rules as the
  // rest: washes at or under 10%, ink at or above 4.5:1 on the card surface.
  indigo: {
    rail: "from-[#312e81] via-[#4f46e5] to-[#818cf8]",
    chip: "bg-[#4f46e5]/12 dark:bg-[#6366f1]/25",
    icon: "text-[#3730a3] dark:text-[#b6bcfb]",
    glow: "bg-[#4f46e5]/20",
    wash: "from-[#4f46e5]/[0.13] via-[#4f46e5]/[0.04]",
    header: "bg-[#4f46e5]/[0.10] dark:bg-[#6366f1]/[0.14]",
    border: "border-[#4f46e5]/30 dark:border-[#6366f1]/25",
    panel:
      "border-[#4f46e5]/25 bg-[#4f46e5]/[0.06] dark:border-[#6366f1]/20 dark:bg-[#6366f1]/[0.08]",
  },
  purple: {
    rail: "from-[#581c87] via-[#7e22ce] to-[#c084fc]",
    chip: "bg-[#7e22ce]/12 dark:bg-[#a855f7]/25",
    icon: "text-[#6b21a8] dark:text-[#dcb6fb]",
    glow: "bg-[#a855f7]/20",
    wash: "from-[#a855f7]/[0.14] via-[#a855f7]/[0.05]",
    header: "bg-[#a855f7]/[0.11] dark:bg-[#a855f7]/[0.14]",
    border: "border-[#a855f7]/30 dark:border-[#a855f7]/25",
    panel:
      "border-[#a855f7]/25 bg-[#a855f7]/[0.06] dark:border-[#a855f7]/20 dark:bg-[#a855f7]/[0.08]",
  },
  teal: {
    rail: "from-[#134e4a] via-[#0d9488] to-[#5eead4]",
    chip: "bg-[#0d9488]/14 dark:bg-[#14b8a6]/25",
    icon: "text-[#115e59] dark:text-[#7fe6d8]",
    glow: "bg-[#14b8a6]/20",
    wash: "from-[#14b8a6]/[0.14] via-[#14b8a6]/[0.05]",
    header: "bg-[#14b8a6]/[0.12] dark:bg-[#14b8a6]/[0.14]",
    border: "border-[#14b8a6]/30 dark:border-[#14b8a6]/25",
    panel:
      "border-[#14b8a6]/25 bg-[#14b8a6]/[0.07] dark:border-[#14b8a6]/20 dark:bg-[#14b8a6]/[0.08]",
  },
  red: {
    rail: "from-[#a32323] to-[#d64545]",
    chip: "bg-[#d64545]/12 dark:bg-[#e66767]/25",
    icon: "text-[#a32323] dark:text-[#f0a0a0]",
    glow: "bg-[#d64545]/20",
    wash: "from-[#d64545]/[0.12] via-[#d64545]/[0.04]",
    header: "bg-[#d64545]/[0.11] dark:bg-[#e66767]/[0.14]",
    border: "border-[#d64545]/30 dark:border-[#e66767]/25",
    panel:
      "border-[#d64545]/25 bg-[#d64545]/[0.06] dark:border-[#e66767]/20 dark:bg-[#e66767]/[0.08]",
  },
};
