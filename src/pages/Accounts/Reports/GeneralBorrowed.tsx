import { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Spinner } from "../../../components/ui/ut/Spinner";
import { FiPrinter } from "react-icons/fi";
import axios from "axios";
import { ReportHeader } from "../../../components/reports/ReportHeader";
import { useProjectOptionsWithAll } from "../../../hooks/useProjectOptions";

interface BorrowedItem {
  xvoucher: string;
  xproj?: string;
  xproj_name?: string;
  business_id_id: number;
  business_name: string;
  xdate: string;
  xlong: string;
  xnote: string;
  xaccusage: string;
  xacctype: string;
  xhrc1?: string;
  xacc: string;
  xdesc: string;
  xsub: string;
  subaccname: string | null;
  xprime: string;
}

interface BorrowedSummary {
  total_deposit: number;
  total_expense: number;
  balance: number;
}

interface BorrowedResponse {
  deposits: BorrowedItem[];
  expenses: BorrowedItem[];
  summary: BorrowedSummary;
  total_cash?: number;
  message: string;
}

/** The heading when the report spans every unit rather than naming one. */
const COMPANY_NAME = "রাহ্‌বার হিমাগার প্রাইভেট লিমিটেড";

/**
 * `xprime` keeps its sign: one side can hold both increases and decreases
 * (a পাওনা settled shows negative), and dropping the sign would make the rows
 * disagree with the totals.
 */
const formatAmount = (value: number) => (value ?? 0).toLocaleString();

const formatDate = (value: string) => {
  const [y, m, d] = value.split("-");
  return d && m && y ? `${d}/${m}/${y}` : value;
};

const cleanNote = (note: string) => (note && note.trim() !== "." ? note : "");

const BorrowedColumn = ({
  title,
  items,
  total,
  accent,
}: {
  title: string;
  items: BorrowedItem[];
  total: number;
  accent: "green" | "rose";
}) => {
  const head =
    accent === "green"
      ? "bg-green-700 text-white"
      : "bg-rose-700 text-white";
  const foot =
    accent === "green"
      ? "bg-green-50 text-green-900"
      : "bg-rose-50 text-rose-900";

  return (
    <div className="flex flex-col">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className={`${head} print:bg-transparent print:text-black`}>
            <th className="w-7 border-b border-black px-1.5 py-1 text-left font-semibold">
              নং
            </th>
            <th className="w-[72px] border-b border-black px-1.5 py-1 text-left font-semibold">
              তারিখ
            </th>
            <th className="border-b border-black px-1.5 py-1 text-left font-semibold">
              {title}
            </th>
            <th className="w-24 border-b border-black px-1.5 py-1 text-right font-semibold">
              টাকা
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-2 py-4 text-center text-gray-500">
                কোনো লেনদেন নেই
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr
                key={item.xvoucher + idx}
                className="border-b border-gray-200 last:border-b-0 break-inside-avoid hover:bg-gray-50 print:hover:bg-transparent"
              >
                <td className="px-1.5 py-1 align-top text-gray-600">
                  {idx + 1}
                </td>
                <td className="px-1.5 py-1 align-top whitespace-nowrap text-gray-700">
                  {formatDate(item.xdate)}
                </td>
                <td className="px-1.5 py-1 align-top">
                  <div className="font-medium text-gray-800">
                    {item.xdesc}
                    {item.subaccname ? ` · ${item.subaccname}` : ""}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {cleanNote(item.xnote) && (
                      <span className="text-gray-600">
                        {cleanNote(item.xnote)} ·{" "}
                      </span>
                    )}
                    <span className="font-mono">{item.xvoucher}</span>
                  </div>
                </td>
                <td
                  className={`px-1.5 py-1 align-top text-right font-mono tabular-nums ${
                    (parseFloat(item.xprime) || 0) < 0 ? "text-red-600" : ""
                  }`}
                >
                  {formatAmount(parseFloat(item.xprime) || 0)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div
        className={`mt-auto flex justify-between border-t border-black px-2 py-1.5 text-sm font-bold ${foot} print:bg-transparent`}
      >
        <span>মোট</span>
        <span className="font-mono tabular-nums">{formatAmount(total)}</span>
      </div>
    </div>
  );
};

const GeneralBorrowedTemplate = ({
  data,
  formattedDateRange,
  todayStr,
  reportTitle,
}: {
  data: BorrowedResponse;
  formattedDateRange: string;
  todayStr: string;
  reportTitle: string;
}) => {
  const totalReceivable = data.summary?.total_deposit ?? 0;
  const totalPayable = data.summary?.total_expense ?? 0;
  const balance = data.summary?.balance ?? totalReceivable - totalPayable;

  return (
    <div className="bg-white p-6 rounded-xl ring-1 ring-gray-200 shadow-sm print:ring-0 print:shadow-none print:p-8 min-w-[210mm] mx-auto min-h-[297mm] print:w-full print:max-w-none print:min-h-0 text-gray-900">
      <ReportHeader title={reportTitle}>
        <p className="text-[10px] bg-white px-1.5 border border-zinc-200 rounded-sm">
          <span className="text-green-800 font-medium">Report Date:</span>{" "}
          {formattedDateRange}
        </p>
        <p className="text-[10px] bg-white px-1.5 border border-zinc-200 rounded-sm">
          <span className="text-green-800 font-medium">Print Date:</span>{" "}
          {todayStr}
        </p>
      </ReportHeader>

      <div className="flex items-center justify-between bg-amber-50 border-y border-amber-700 py-1 px-3 mb-4">
        <div className="font-semibold text-sm bg-amber-700 text-white px-3 py-0.5 rounded-full">
          জেনারেল হাওলাতি
        </div>
        <div className="text-xs font-medium text-gray-700">
          General Borrowed
        </div>
      </div>

      <div className="grid grid-cols-2 border border-black">
        <div className="border-r border-black">
          <BorrowedColumn
            title="পাওনা / Receivable"
            items={data.deposits ?? []}
            total={totalReceivable}
            accent="green"
          />
        </div>
        <BorrowedColumn
          title="দেনা / Payable"
          items={data.expenses ?? []}
          total={totalPayable}
          accent="rose"
        />
      </div>

      <div className="mt-4 border border-black break-inside-avoid text-sm">
        <div className="flex justify-between px-3 py-1.5 border-b border-gray-300">
          <span>মোট পাওনা / Total Receivable</span>
          <span className="font-mono tabular-nums text-green-800 font-semibold">
            {formatAmount(totalReceivable)}
          </span>
        </div>
        <div className="flex justify-between px-3 py-1.5 border-b border-gray-300">
          <span>মোট দেনা / Total Payable</span>
          <span className="font-mono tabular-nums text-rose-800 font-semibold">
            {formatAmount(totalPayable)}
          </span>
        </div>
        <div className="flex justify-between px-3 py-1.5 font-bold bg-amber-50 text-amber-900 print:bg-transparent">
          <span>ব্যালেন্স / Balance</span>
          <span className="font-mono tabular-nums">
            {formatAmount(balance)}
          </span>
        </div>
        {data.total_cash != null && (
          <div className="flex justify-between px-3 py-1.5 border-t border-black font-semibold">
            <span>নগদ অ্যামাউন্ট / Cash in Hand</span>
            <span className="font-mono tabular-nums">
              {formatAmount(data.total_cash)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-12 print:mt-16 pt-4 break-inside-avoid">
        <div className="grid grid-cols-2 gap-12 text-center text-xs">
          <div className="mt-8 pt-1 border-t border-black w-2/3 mx-auto" />
          <div className="mt-8 pt-1 border-t border-black w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default function GeneralBorrowed() {
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [project, setProject] = useState<string>("All");
  const { projects, loading: loadingProjects } = useProjectOptionsWithAll();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BorrowedResponse | null>(null);
  /**
   * The unit the loaded report actually covers, kept apart from `project` so
   * changing the dropdown without refetching cannot retitle the report.
   */
  const [loadedProject, setLoadedProject] = useState<string>("All");

  const handleFetch = async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    try {
      const toApiDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const apiBase = import.meta.env.VITE_API_BASE_URL;
      const token = window.localStorage.getItem("jwtToken");

      let url = `${apiBase}/accounts/report/general-borrowed/?from_date=${toApiDate(fromDate)}&to_date=${toApiDate(toDate)}`;
      if (project !== "All") {
        url += `&xproj=${encodeURIComponent(project)}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload =
        response.data?.deposits || response.data?.expenses
          ? response.data
          : response.data?.data;

      if (payload && (payload.deposits || payload.expenses)) {
        setData(payload as BorrowedResponse);
        setLoadedProject(project);
      } else {
        console.warn("Unexpected response structure:", response.data);
        setData(null);
      }
    } catch (error) {
      console.error("Failed to fetch general borrowed data:", error);
    } finally {
      setLoading(false);
    }
  };

  const reportTitle = useMemo(() => {
    if (loadedProject === "All") return COMPANY_NAME;
    const rows = [...(data?.deposits ?? []), ...(data?.expenses ?? [])];
    return (
      rows.find((row) => row.xproj_name)?.xproj_name ||
      projects.find((p) => p.code === loadedProject)?.label ||
      loadedProject
    );
  }, [loadedProject, data, projects]);

  const todayStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedDateRange = useMemo(() => {
    if (!fromDate || !toDate) return "";
    const f = fromDate.toLocaleDateString("en-GB");
    const t = toDate.toLocaleDateString("en-GB");
    return f === t ? f : `${f} to ${t}`;
  }, [fromDate, toDate]);

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

    const printStyle = doc.createElement("style");
    printStyle.textContent = `
      @page { size: auto; margin: 0mm; }
      @media print {
        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
      body { font-family: 'Inter', sans-serif; background: #fff; }
    `;
    doc.head.appendChild(printStyle);

    const root = createRoot(container);
    root.render(
      <GeneralBorrowedTemplate
        data={data}
        formattedDateRange={formattedDateRange}
        todayStr={todayStr}
        reportTitle={reportTitle}
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
        title="General Borrowed - Crop Track"
        description="General Borrowed"
      />
      <PageBreadcrumb pageTitle="General Borrowed" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex flex-wrap items-end gap-4 mb-8 print:hidden">
          <div className="flex-1 min-w-[150px]">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Unit
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              disabled={loadingProjects}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500 disabled:opacity-50 h-[42px]"
            >
              {projects.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              From Date
            </label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              To Date
            </label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="flex gap-2 flex-1 min-w-[200px]">
            <button
              onClick={handleFetch}
              disabled={!fromDate || !toDate || loading}
              className="flex-1 px-6 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[42px]"
            >
              {loading ? "Loading..." : "Get Report"}
            </button>

            <button
              onClick={handlePrint}
              disabled={!data}
              className="flex-1 px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50 h-[42px] flex items-center justify-center gap-2"
            >
              <FiPrinter />
              Print
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : data ? (
          <div className="overflow-x-auto print:hidden flex justify-center bg-gray-50/50 dark:bg-[#020d1a] py-8 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="max-w-[210mm] w-full transform scale-[0.9] sm:scale-100 origin-top">
              <GeneralBorrowedTemplate
                data={data}
                formattedDateRange={formattedDateRange}
                todayStr={todayStr}
                reportTitle={reportTitle}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            Please select a date range and click "Get Report" to view results.
          </div>
        )}
      </div>
    </div>
  );
}
