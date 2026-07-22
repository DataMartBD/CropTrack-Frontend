import { Fragment, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiPrinter } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Spinner } from "../../../components/ui/ut/Spinner";
import { getData } from "../../../services/apiClient";
import { toBengaliDigits } from "../../../utils/bengaliDate";
import { useProjectOptionsWithAll } from "../../../hooks/useProjectOptions";

interface ReportItem {
  description: string;
  amount: number;
}

interface ReportMonth {
  month: string;
  items: ReportItem[];
  subtotal: number;
}

interface ReportAccount {
  sl: number;
  xacc: string;
  xdesc: string;
  total: number;
  months: ReportMonth[];
}

interface MonthlyReportResponse {
  income: ReportAccount[];
  expenditure: ReportAccount[];
  /** Sibling reports title themselves from the payload; this one does too. */
  business_name?: string;
}

const COMPANY_NAME_FALLBACK = "রাহ্‌বার হিমাগার প্রাইভেট লিমিটেড";

/**
 * The abbreviations the paper form uses in its মাস column — "সেপ্টেম্বর ২৬ ইং"
 * spelled out does not fit the column at this width, and "সেপ্টেঃ ২৬ ইং" is what
 * the ledger has always been written with.
 */
const BN_MONTHS_SHORT = [
  "জানুঃ",
  "ফেব্রুঃ",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগষ্ট",
  "সেপ্টেঃ",
  "অক্টোঃ",
  "নভেঃ",
  "ডিসেঃ",
];

/** Spelled out for the period line at the head of the sheet. */
const BN_MONTHS_LONG = [
  "জানুয়ারী",
  "ফেব্রুয়ারী",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগষ্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const EN_SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Every rule on the form is drawn exactly once. Cells own their right and
 * bottom edge only; the table owns the top and the wrapping <td> owns the left
 * and right. Giving cells a border on all four sides instead makes every shared
 * rule — the divider down the middle above all — come out two or three pixels
 * thick, because side-by-side tables do not collapse borders with each other.
 */
const CELL = "border-b border-r border-black px-1 py-[2px]";

/** Last column of a half: its right edge belongs to the wrapping <td>. */
const CELL_LAST = "border-b border-black px-1 py-[2px]";

/**
 * Money cell. `tabular-nums` keeps the columns of figures aligned, and
 * `break-all` is the safety valve: a grouped figure has no spaces to break at,
 * so without it an over-long amount silently overflows into the next column
 * instead of wrapping.
 */
const MONEY_STYLE = "text-right tabular-nums break-all";
const MONEY = `${CELL} ${MONEY_STYLE}`;
const MONEY_LAST = `${CELL_LAST} ${MONEY_STYLE}`;

const formatMoney = (value: number | null | undefined): string => {
  const amount = value ?? 0;
  const hasFraction = Math.round(Math.abs(amount) * 100) % 100 !== 0;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
};

/** "Jan 2026" → "জানুঃ ২৬ ইং". Anything unparseable is passed through. */
const monthLabel = (raw: string): string => {
  const [name, year] = (raw || "").split(" ");
  const index = EN_SHORT_MONTHS.indexOf(name);
  if (index === -1 || !year) return raw;
  return `${BN_MONTHS_SHORT[index]} ${toBengaliDigits(year.slice(-2))} ইং`;
};

const bnLongDate = (date: Date): string =>
  `${toBengaliDigits(String(date.getDate()).padStart(2, "0"))} ${
    BN_MONTHS_LONG[date.getMonth()]
  } ${toBengaliDigits(date.getFullYear())} ইং`;

/**
 * The unit the sheet belongs to, read off the project code: "Rahbar 1" is unit
 * ১, "Rahbar 2" unit ২, and so on. A project that carries no trailing number
 * (Central Account, or the All selection) gets no unit line — the report simply
 * is not scoped to one.
 */
const unitSuffix = (projectCode: string): string => {
  const match = /(\d+)\s*$/.exec(projectCode || "");
  return match ? ` (ইউনিট ${toBengaliDigits(Number(match[1]))})` : "";
};

/** Inclusive month count, the "(১২ মাস)" the form carries beside its period. */
const monthsInRange = (from: Date, to: Date): number =>
  (to.getFullYear() - from.getFullYear()) * 12 +
  (to.getMonth() - from.getMonth()) +
  1;

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const sumTotals = (accounts: ReportAccount[]): number =>
  accounts.reduce((sum, account) => sum + (account.total || 0), 0);

/**
 * Rows an account occupies: its title row, one row per item, and its মোট row.
 * The নং and the outer টাকা column are single tall cells spanning all of them,
 * which is what gives the form its uninterrupted outer columns.
 */
const accountRowSpan = (account: ReportAccount): number =>
  2 + account.months.reduce((rows, month) => rows + month.items.length, 0);

const cleanDescription = (text: string): string => {
  const trimmed = (text || "").trim();
  return trimmed && trimmed !== "." ? trimmed : "";
};

/**
 * One half of the form. Both halves carry the same six columns —
 * নং | মাস | বিবরণ | টাকা (item) | টাকা (month subtotal) | টাকা (head total) —
 * under a three-cell header: আদায় on the left, খরচ on the right.
 */
const ReportSide = ({ accounts }: { accounts: ReportAccount[] }) => (
  <table className="w-full table-fixed border-collapse border-t border-black text-[8px] leading-[1.35]">
    <colgroup>
      <col className="w-[5%]" />
      <col className="w-[15%]" />
      <col className="w-[33%]" />
      <col className="w-[16%]" />
      <col className="w-[16%]" />
      <col className="w-[15%]" />
    </colgroup>

    <thead>
      <tr className="text-center text-[9px] font-semibold">
        <th className={`${CELL} py-1`}>নং</th>
        <th colSpan={4} className={`${CELL} py-1`}>
          বিবরণ
        </th>
        <th className={`${CELL_LAST} py-1`}>টাকা</th>
      </tr>
    </thead>

    {accounts.map((account, accountIndex) => {
      const rowSpan = accountRowSpan(account);

      // Deliberately breakable: a head with dozens of rows that refuses to
      // split gets pushed to the next page whole, leaving the page it came from
      // empty below the header.
      return (
        <tbody
          key={`${account.xacc}-${accountIndex}`}
          className="break-inside-auto"
        >
          <tr>
            <td rowSpan={rowSpan} className={`${CELL} align-top text-center`}>
              {toBengaliDigits(account.sl ?? accountIndex + 1)}
            </td>
            <td
              colSpan={4}
              className={`${CELL} align-top text-center text-[9px] font-bold`}
            >
              {account.xdesc}
            </td>
            {/* One tall cell per head, so the টাকা column runs unbroken down
                the page with the head total resting at its foot. */}
            <td
              rowSpan={rowSpan}
              className={`${MONEY_LAST} align-bottom font-bold`}
            >
              {formatMoney(account.total)}
            </td>
          </tr>

          {account.months.map((month, monthIndex) => (
            <Fragment key={`${month.month}-${monthIndex}`}>
              {month.items.map((item, itemIndex) => (
                <tr key={`${month.month}-${itemIndex}`}>
                  {itemIndex === 0 && (
                    <td
                      rowSpan={month.items.length}
                      className={`${CELL} align-top whitespace-nowrap`}
                    >
                      {monthLabel(month.month)}
                    </td>
                  )}
                  <td className={`${CELL} align-top break-words`}>
                    {cleanDescription(item.description)}
                  </td>
                  <td className={`${MONEY} align-top`}>
                    {formatMoney(item.amount)}
                  </td>
                  {itemIndex === 0 && (
                    <td
                      rowSpan={month.items.length}
                      className={`${MONEY} align-top`}
                    >
                      {month.items.length > 1
                        ? formatMoney(month.subtotal)
                        : ""}
                    </td>
                  )}
                </tr>
              ))}
            </Fragment>
          ))}

          <tr>
            <td colSpan={3} className={`${CELL} align-top text-right font-bold`}>
              মোট
            </td>
            <td className={`${MONEY} align-top font-bold`}>
              {formatMoney(account.total)}
            </td>
          </tr>
        </tbody>
      );
    })}
  </table>
);

const MonthlyReportSheet = ({
  data,
  periodLine,
  printedOn,
  projectLabel,
  unitLabel,
}: {
  data: MonthlyReportResponse;
  periodLine: string;
  printedOn: string;
  projectLabel: string;
  unitLabel: string;
}) => {
  const incomeTotal = sumTotals(data.income);
  const expenditureTotal = sumTotals(data.expenditure);
  const net = incomeTotal - expenditureTotal;
  const companyName = `${data.business_name || COMPANY_NAME_FALLBACK}${unitLabel}`;

  return (
    <div className="mx-auto min-h-[297mm] min-w-[210mm] rounded-xl bg-white p-6 text-black shadow-sm ring-1 ring-gray-200 print:min-h-0 print:w-full print:min-w-0 print:max-w-none print:p-8 print:shadow-none print:ring-0">
      <div className="mb-1 text-right text-[7px] text-gray-500">
        প্রকল্পঃ {projectLabel} • প্রিন্টঃ {printedOn}
      </div>

      <div className="mb-2 text-center leading-snug">
        <h1 className="text-[12px] font-bold">{companyName}</h1>
        <p className="text-[10px]">মাসিক প্রতিবেদন</p>
        <p className="text-[11px] font-bold underline underline-offset-2">
          {periodLine}
        </p>
      </div>

      {/* A table, not a flex row: Chrome will not fragment a flex container
          across printed pages, so the whole two-column block was being carried
          to page 2 and leaving page 1 empty under the header. Table rows split
          across pages, which is also how the paper form is built. */}
      <table className="w-full table-fixed border-collapse break-inside-auto">
        <tbody className="break-inside-auto">
          <tr className="break-inside-auto">
            {/* The wrapping cells own the outer left/right rules and the
                divider, and they stretch to the full row height — which is what
                keeps the আদায় column boxed down the page after it runs out of
                rows. Left and right collapse into one line at the divider. */}
            <td className="w-1/2 border-l border-r border-black p-0 align-top">
              <ReportSide accounts={data.income || []} />
            </td>
            <td className="w-1/2 border-l border-r border-black p-0 align-top">
              <ReportSide accounts={data.expenditure || []} />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex break-inside-avoid border border-t-0 border-black text-[9px] font-bold">
        <div className="flex w-1/2 justify-between border-r border-black px-2 py-1">
          <span>সর্বমোট আয়</span>
          <span className="tabular-nums">{formatMoney(incomeTotal)}</span>
        </div>
        <div className="flex w-1/2 justify-between px-2 py-1">
          <span>সর্বমোট খরচ</span>
          <span className="tabular-nums">{formatMoney(expenditureTotal)}</span>
        </div>
      </div>

      {/* লাভ লোকসান হিসাব — the summary block the form closes with. */}
      <div className="mt-6 flex justify-center break-inside-avoid">
        <div className="w-[70mm] text-[9px]">
          <p className="mb-1 text-center font-bold">লাভ লোকসান হিসাব</p>
          <table className="w-full table-fixed border-collapse border-t border-l border-black">
            <tbody>
              <tr>
                <td className={CELL}>সর্বমোট জমা</td>
                <td className={`${MONEY} font-semibold`}>
                  {formatMoney(incomeTotal)}
                </td>
              </tr>
              <tr>
                <td className={CELL}>সর্বমোট খরচ</td>
                <td className={`${MONEY} font-semibold`}>
                  {formatMoney(expenditureTotal)}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-1 flex justify-between px-1 font-bold">
            <span>নীট লভ্যাংশ</span>
            <span className="tabular-nums">{formatMoney(net)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MonthlyReport() {
  const now = new Date();
  const firstOfYear = new Date(now.getFullYear(), 0, 1);

  const [fromDate, setFromDate] = useState<Date | null>(firstOfYear);
  const [toDate, setToDate] = useState<Date | null>(now);
  const [project, setProject] = useState<string>("All");
  const { projects, loading: loadingProjects } = useProjectOptionsWithAll();

  const [data, setData] = useState<MonthlyReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // The period the sheet is stamped with is the one the data was fetched for,
  // not whatever the pickers happen to show afterwards.
  const [reportRange, setReportRange] = useState<{
    from: Date;
    to: Date;
  } | null>(null);
  const [reportProject, setReportProject] = useState<string>("All");

  const fetchReport = async () => {
    if (!fromDate || !toDate) return;
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        from_date: formatDate(fromDate),
        to_date: formatDate(toDate),
      };
      if (project !== "All") {
        params.xproj = project;
      }

      const result = await getData<MonthlyReportResponse>(
        "/accounts/report/income-statement-monthly/",
        params,
      );

      setData({
        income: result?.income || [],
        expenditure: result?.expenditure || [],
        business_name: result?.business_name,
      });
      setReportRange({ from: fromDate, to: toDate });
      setReportProject(project);
      setHasFetched(true);
    } catch (error) {
      console.error("Error fetching monthly report:", error);
      setData(null);
      setHasFetched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const periodLine = useMemo(() => {
    if (!reportRange) return "";
    const months = monthsInRange(reportRange.from, reportRange.to);
    return `${bnLongDate(reportRange.from)} হতে ${bnLongDate(
      reportRange.to,
    )} পর্যন্ত (${toBengaliDigits(months)} মাস)`;
  }, [reportRange]);

  const printedOn = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  // The sheet is a Bangla document, so it names the unit rather than its code.
  const projectLabel =
    reportProject === "All"
      ? "সকল প্রকল্প"
      : (projects.find((p) => p.code === reportProject)?.label ?? reportProject);
  const unitLabel = reportProject === "All" ? "" : unitSuffix(reportProject);

  const hasRows =
    !!data && (data.income.length > 0 || data.expenditure.length > 0);

  const handlePrint = () => {
    if (!data) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("");
        } catch (e) {
          console.log("Access to stylesheet denied", e);
          return "";
        }
      })
      .join("\n");

    const container = doc.createElement("div");
    doc.body.appendChild(container);

    const styleElement = doc.createElement("style");
    styleElement.textContent = styles;
    doc.head.appendChild(styleElement);

    const fontLink = doc.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    fontLink.rel = "stylesheet";
    doc.head.appendChild(fontLink);

    // The column header repeats on every sheet, so a head that runs over a
    // page break stays readable.
    const printStyle = doc.createElement("style");
    printStyle.textContent = `
      @page { size: auto; margin: 0mm; }
      @media print {
        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        thead { display: table-header-group; }
      }
      body { font-family: 'Inter', sans-serif; background: #fff; }
    `;
    doc.head.appendChild(printStyle);

    const root = createRoot(container);
    root.render(
      <MonthlyReportSheet
        data={data}
        periodLine={periodLine}
        printedOn={printedOn}
        projectLabel={projectLabel}
        unitLabel={unitLabel}
      />,
    );

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  return (
    <div>
      <PageMeta
        title="Monthly Report - CropTrack"
        description="মাসিক প্রতিবেদন - Monthly income and expenditure statement"
      />
      <PageBreadcrumb pageTitle="Monthly Report" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-8 xl:py-9">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-end gap-4 print:hidden">
          <div className="min-w-[160px] flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Project
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              disabled={loadingProjects}
              className="h-[42px] w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 disabled:opacity-50 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
            >
              {projects.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px] flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              From Date
            </label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              className="h-[42px] w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="min-w-[150px] flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              To Date
            </label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              className="h-[42px] w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="flex min-w-[240px] flex-1 gap-2">
            <button
              onClick={fetchReport}
              disabled={isLoading || !fromDate || !toDate}
              className="h-[42px] flex-1 rounded-lg bg-[#13725A] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#105E4A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Get"}
            </button>
            <button
              onClick={handlePrint}
              disabled={!hasRows}
              className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <FiPrinter />
              Print
            </button>
          </div>
        </div>

        {/* Sheet */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : !hasFetched ? (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            Select a project and date range, then click "Get" to build the
            monthly report.
          </div>
        ) : !hasRows ? (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            No records found for the selected period.
          </div>
        ) : (
          <div className="flex justify-center overflow-x-auto rounded-2xl border border-gray-100 bg-gray-50/50 py-8 dark:border-gray-800 dark:bg-[#020d1a] print:hidden">
            <div className="w-full max-w-[210mm] origin-top scale-[0.9] transform sm:scale-100">
              <MonthlyReportSheet
                data={data!}
                periodLine={periodLine}
                printedOn={printedOn}
                projectLabel={projectLabel}
                unitLabel={unitLabel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
