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

interface BorrowedBalanceItem {
  business_id_id: number;
  xproj?: string;
  xproj_name?: string;
  xacctype: string;
  xhrc1: string;
  xdesc: string;
  xprime: number;
}

interface BorrowedBalanceResponse {
  liabilities: BorrowedBalanceItem[];
  assets: BorrowedBalanceItem[];
  summary: {
    total_asset: number;
    total_liability: number;
  };
  message: string;
}

const groupData = (items: BorrowedBalanceItem[]) => {
  const groups: Record<string, Record<string, BorrowedBalanceItem[]>> = {};
  items.forEach((item) => {
    const projKey = item.xproj || "General";
    const accKey = item.xhrc1 || "Uncategorized";
    
    if (!groups[projKey]) {
      groups[projKey] = {};
    }
    if (!groups[projKey][accKey]) {
      groups[projKey][accKey] = [];
    }
    groups[projKey][accKey].push(item);
  });
  return groups;
};

/**
 * Heading for a project group. Rows group by `xproj` because the code is the
 * stable identity; the heading reads the name, searched across the group so one
 * row missing it does not blank the heading.
 */
const getProjectLabel = (items: BorrowedBalanceItem[], fallback: string) =>
  items.find((item) => item.xproj_name)?.xproj_name || fallback;

const getGroupTotal = (items: BorrowedBalanceItem[]) =>
  items.reduce((sum, item) => sum + (item.xprime || 0), 0);

/** The heading when the report spans every unit rather than naming one. */
const COMPANY_NAME = "রাহ্‌বার হিমাগার প্রাইভেট লিমিটেড";

const BorrowedBalanceTemplate = ({
  data,
  groupedLiabilities,
  groupedAssets,
  formattedDateRange,
  todayStr,
  reportTitle,
}: {
  data: BorrowedBalanceResponse;
  groupedLiabilities: Record<string, Record<string, BorrowedBalanceItem[]>>;
  groupedAssets: Record<string, Record<string, BorrowedBalanceItem[]>>;
  formattedDateRange: string;
  todayStr: string;
  reportTitle: string;
}) => {
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
          জেনারেল হাওলাতি ব্যাল্যান্স
        </div>
        <div className="text-xs font-medium text-gray-700">
          General Borrowed Balance
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 border border-black text-xs sm:text-sm">
        {/* Liabilities Column */}
        <div className="border-r border-black">
          <div className="flex justify-between items-center border-b border-black px-2 py-1 font-bold bg-rose-700 text-white print:bg-transparent print:text-black">
            <span>দেনা / Payable</span>
            <span>টাকা</span>
          </div>

          {Object.keys(groupedLiabilities).map((projName) => {
            const projGroups = groupedLiabilities[projName];
            const projItems = Object.values(projGroups).flat();
            const projTotal = getGroupTotal(projItems);

            return (
              <div
                key={projName}
                className="border-b border-black last:border-b-0"
              >
                <div className="flex border-b border-gray-400 bg-gray-200 print:bg-transparent">
                  <div className="flex-1 px-2 py-1 font-bold text-xs uppercase tracking-wide">
                    {getProjectLabel(projItems, projName)}
                  </div>
                  <div className="w-24 sm:w-32 px-2 py-1 text-right font-bold text-xs border-l border-gray-400">
                    {projTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                {Object.keys(projGroups).map((groupName) => {
                  const items = projGroups[groupName];

                  return (
                    <div
                      key={groupName}
                      className="border-b border-gray-300 last:border-b-0 break-inside-avoid"
                    >
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex border-b border-gray-100 last:border-b-0 text-xs hover:bg-gray-50 print:hover:bg-transparent ${
                            item.xprime ? "" : "text-gray-400"
                          }`}
                        >
                          <div className="flex-1 px-2 py-1 pl-4 border-r border-gray-100 relative">
                            <div className={item.xprime ? "text-gray-800" : ""}>
                              {item.xdesc}
                            </div>
                          </div>
                          <div className="w-24 sm:w-32 px-2 py-1 text-right font-mono flex items-end justify-end pb-1">
                            {(item.xprime || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Assets Column */}
        <div>
          <div className="flex justify-between items-center border-b border-black px-2 py-1 font-bold bg-green-700 text-white print:bg-transparent print:text-black">
            <span>পাওনা / Receivable</span>
            <span>টাকা</span>
          </div>

          {Object.keys(groupedAssets).map((projName) => {
            const projGroups = groupedAssets[projName];
            const projItems = Object.values(projGroups).flat();
            const projTotal = getGroupTotal(projItems);

            return (
              <div
                key={projName}
                className="border-b border-black last:border-b-0"
              >
                <div className="flex border-b border-gray-400 bg-gray-200 print:bg-transparent">
                  <div className="flex-1 px-2 py-1 font-bold text-xs uppercase tracking-wide">
                    {getProjectLabel(projItems, projName)}
                  </div>
                  <div className="w-24 sm:w-32 px-2 py-1 text-right font-bold text-xs border-l border-gray-400">
                    {projTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                {Object.keys(projGroups).map((groupName) => {
                  const items = projGroups[groupName];

                  return (
                    <div
                      key={groupName}
                      className="border-b border-gray-300 last:border-b-0 break-inside-avoid"
                    >
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex border-b border-gray-100 last:border-b-0 text-xs hover:bg-gray-50 print:hover:bg-transparent ${
                            item.xprime ? "" : "text-gray-400"
                          }`}
                        >
                          <div className="flex-1 px-2 py-1 pl-4 border-r border-gray-100 relative">
                            <div className={item.xprime ? "text-gray-800" : ""}>
                              {item.xdesc}
                            </div>
                          </div>
                          <div className="w-24 sm:w-32 px-2 py-1 text-right font-mono flex items-end justify-end pb-1">
                            {(item.xprime || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 border border-t-0 border-black font-bold text-sm bg-gray-100 print:bg-transparent">
        <div className="border-r border-black p-2 flex justify-between bg-rose-50 text-rose-900 print:bg-transparent">
          <span>মোট দেনা</span>
          <span>
            {(data.summary?.total_liability ?? 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="p-2 flex justify-between bg-green-50 text-green-900 print:bg-transparent">
          <span>মোট পাওনা</span>
          <span>
            {(data.summary?.total_asset ?? 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      <div className="mt-12 print:mt-16 pt-4 break-inside-avoid">
        <div className="grid grid-cols-2 gap-12 text-center text-xs">
          <div className="mt-8 pt-1 border-t border-black w-2/3 mx-auto">
            <p className="font-bold text-gray-800">Prepared By</p>
          </div>
          <div className="mt-8 pt-1 border-t border-black w-2/3 mx-auto">
            <p className="font-bold text-gray-800">Approved By</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GeneralBorrowedBalance() {
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [project, setProject] = useState<string>("All");
  const { projects, loading: loadingProjects } = useProjectOptionsWithAll();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BorrowedBalanceResponse | null>(null);
  /**
   * The unit the loaded report actually covers, kept apart from `project` so
   * changing the dropdown without refetching cannot retitle the report.
   */
  const [loadedProject, setLoadedProject] = useState<string>("All");

  const handleFetchReport = async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    try {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const from = formatDate(fromDate);
      const to = formatDate(toDate);

      const apiBase = import.meta.env.VITE_API_BASE_URL;
      const token = window.localStorage.getItem("jwtToken");

      let url = `${apiBase}/accounts/report/general-borrowed-summary/?from_date=${from}&to_date=${to}`;
      if (project !== "All") {
        url += `&xproj=${encodeURIComponent(project)}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && (response.data.assets || response.data.liabilities)) {
        setData(response.data as BorrowedBalanceResponse);
        setLoadedProject(project);
      } else {
        console.warn("Unexpected response structure:", response.data);
        setData(null);
      }
    } catch (error) {
      console.error("Failed to fetch general borrowed balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupedLiabilities = useMemo(() => {
    return data ? groupData(data.liabilities) : {};
  }, [data]);

  const groupedAssets = useMemo(() => {
    return data ? groupData(data.assets) : {};
  }, [data]);

  const reportTitle = useMemo(() => {
    if (loadedProject === "All") return COMPANY_NAME;
    const rows = [...(data?.liabilities ?? []), ...(data?.assets ?? [])];
    return (
      rows.find((row) => row.xproj === loadedProject)?.xproj_name ||
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
      <BorrowedBalanceTemplate
        data={data}
        groupedLiabilities={groupedLiabilities}
        groupedAssets={groupedAssets}
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
        title="General Borrowed Balance - Crop Track"
        description="General Borrowed Balance"
      />
      <PageBreadcrumb pageTitle="General Borrowed Balance" />

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
              onClick={handleFetchReport}
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
              Print Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : data ? (
          <div className="overflow-x-auto print:hidden  flex justify-center bg-gray-50/50 dark:bg-[#020d1a] py-8 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="max-w-[210mm] w-full transform scale-[0.9] sm:scale-100 origin-top">
              <BorrowedBalanceTemplate
                data={data}
                groupedLiabilities={groupedLiabilities}
                groupedAssets={groupedAssets}
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
