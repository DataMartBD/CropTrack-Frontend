/**
 * Bengali (Bangla San / বঙ্গাব্দ) calendar date, following the Bangladesh
 * revision adopted in 1426 BS (2019).
 *
 * Under that revision the calendar is fixed rather than astronomical:
 *   - 1 Boishakh always falls on 14 April.
 *   - Boishakh–Ashwin are 31 days, Kartik–Magh are 30, Falgun is 29 and
 *     Choitro is 30.
 *   - Falgun takes a 30th day in years whose February is a leap February,
 *     which keeps 1 Choitro pinned to 15 March and 1 Boishakh to 14 April.
 *
 * Giving Ashwin its 31st day was the substance of the 2019 change: it is what
 * fixes the national days to constant Bengali dates — Ekushey February is
 * always 8 Falgun, Independence Day always 12 Choitro, Victory Day always
 * 1 Poush. Those three are the regression tests for this file.
 *
 * That is why this is arithmetic rather than a lookup table — no ephemeris is
 * involved and the mapping never drifts.
 */

const MONTHS_BN = [
  "বৈশাখ",
  "জ্যৈষ্ঠ",
  "আষাঢ়",
  "শ্রাবণ",
  "ভাদ্র",
  "আশ্বিন",
  "কার্তিক",
  "অগ্রহায়ণ",
  "পৌষ",
  "মাঘ",
  "ফাল্গুন",
  "চৈত্র",
];

const MONTHS_EN = [
  "Boishakh",
  "Joishtho",
  "Ashar",
  "Srabon",
  "Bhadro",
  "Ashwin",
  "Kartik",
  "Ogrohayon",
  "Poush",
  "Magh",
  "Falgun",
  "Choitro",
];

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

const MS_PER_DAY = 86_400_000;

/** 1 Boishakh is 14 April — month index 3, day 14. */
const NEW_YEAR_MONTH = 3;
const NEW_YEAR_DAY = 14;

/** Bengali year 1 begins in Gregorian 594 CE. */
const ERA_OFFSET = 593;

export const toBengaliDigits = (value: string | number): string =>
  String(value).replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]);

const isGregorianLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/** Local midnight, so the day difference is never skewed by the clock time. */
const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export type BengaliDate = {
  /** Bengali year (বঙ্গাব্দ). */
  year: number;
  /** 0-based month index into the Bengali calendar. */
  monthIndex: number;
  /** 1-based day of the Bengali month. */
  day: number;
};

export function toBengaliDate(date: Date): BengaliDate {
  const gregorianYear = date.getFullYear();
  const newYear = new Date(gregorianYear, NEW_YEAR_MONTH, NEW_YEAR_DAY);

  // Before 14 April we are still inside the Bengali year that opened last April.
  const startYear =
    startOfDay(date) < startOfDay(newYear) ? gregorianYear - 1 : gregorianYear;

  const monthLengths = [
    // Boishakh – Ashwin
    31, 31, 31, 31, 31, 31,
    // Kartik – Magh
    30, 30, 30, 30,
    // Falgun spans 14 Feb – 14 Mar, so it absorbs the leap day of the February
    // that follows the year's opening April.
    isGregorianLeapYear(startYear + 1) ? 30 : 29,
    // Choitro
    30,
  ];

  // Math.round, not floor: a DST transition inside the span would otherwise
  // shave the difference to 364.96 days and lose a day.
  let dayOfYear = Math.round(
    (startOfDay(date) -
      startOfDay(new Date(startYear, NEW_YEAR_MONTH, NEW_YEAR_DAY))) /
      MS_PER_DAY
  );

  let monthIndex = 0;
  while (dayOfYear >= monthLengths[monthIndex]) {
    dayOfYear -= monthLengths[monthIndex];
    monthIndex += 1;
  }

  return { year: startYear - ERA_OFFSET, monthIndex, day: dayOfYear + 1 };
}

/**
 * "৫ শ্রাবণ ১৪৩৩ বঙ্গাব্দ" in Bangla, "5 Srabon 1433 BS" in English — the month
 * names are transliterated rather than translated, since they have no English
 * equivalent.
 */
export function formatBengaliDate(date: Date, language: string): string {
  const { year, monthIndex, day } = toBengaliDate(date);

  if (language === "bn") {
    return `${toBengaliDigits(day)} ${MONTHS_BN[monthIndex]} ${toBengaliDigits(
      year
    )} বঙ্গাব্দ`;
  }

  return `${day} ${MONTHS_EN[monthIndex]} ${year} BS`;
}
