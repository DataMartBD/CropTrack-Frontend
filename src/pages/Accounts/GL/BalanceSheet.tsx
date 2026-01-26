import { useState, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useSearchParams } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Spinner } from "../../../components/ui/ut/Spinner";
import { FiPrinter } from "react-icons/fi";
import axios from "axios";
import { ReportHeader } from "../../../components/reports/ReportHeader";

// ... (interfaces and helper functions remain the same)

interface BalanceSheetItem {
  business_id_id: number;
  xacctype: string;
  xhrc1: string;
  xdesc: string;
  liability: number;
  asset: number;
}

interface BalanceSheetResponse {
  liabilities: BalanceSheetItem[];
  assets: BalanceSheetItem[];
  summary: {
    total_asset: number;
    total_liability: number;
  };
  message: string;
}

const groupData = (items: BalanceSheetItem[]) => {
  const groups: Record<string, BalanceSheetItem[]> = {};
  items.forEach((item) => {
    const key = item.xhrc1 || "Uncategorized";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });
  return groups;
};

const getGroupTotal = (
  items: BalanceSheetItem[],
  type: "liability" | "asset",
) => {
  return items.reduce((sum, item) => {
    return sum + (type === "liability" ? item.liability : item.asset);
  }, 0);
};

const BalanceSheetTemplate = ({
  data,
  groupedLiabilities,
  groupedAssets,
  formattedDateRange,
  todayStr,
}: {
  data: BalanceSheetResponse;
  groupedLiabilities: Record<string, BalanceSheetItem[]>;
  groupedAssets: Record<string, BalanceSheetItem[]>;
  formattedDateRange: string;
  todayStr: string;
}) => {
  return (
    <div className="bg-white p-6 rounded-xl ring-1 ring-gray-200 shadow-sm print:ring-0 print:shadow-none print:p-8 min-w-[210mm] mx-auto min-h-[297mm] print:w-full print:max-w-none print:min-h-0 text-gray-900">
      <ReportHeader title="রাহবার হিমাগার (প্রাঃ) লিমিটেড ইউনিট - ৪">
        <p className="text-[10px] bg-white px-1.5 border border-zinc-200 rounded-sm">
          <span className="text-green-800 font-medium">Report Date:</span>{" "}
          {formattedDateRange}
        </p>
        <p className="text-[10px] bg-white px-1.5 border border-zinc-200 rounded-sm">
          <span className="text-green-800 font-medium">Print Date:</span>{" "}
          {todayStr}
        </p>
      </ReportHeader>

      <div className="flex items-center justify-between bg-green-50 border-y border-green-800 py-1 px-3 mb-4">
        <div className="font-semibold text-sm bg-green-800 text-white px-3 py-0.5 rounded-full">
          BALANCE SHEET
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 border border-black text-xs sm:text-sm">
        {/* Liabilities Column */}
        <div className="border-r border-black">
          <div className="flex justify-between items-center border-b border-black px-2 py-1 font-bold bg-gray-100 print:bg-transparent">
            <span>দেনা</span>
            <span>টাকা</span>
          </div>

          {Object.keys(groupedLiabilities).map((groupName) => {
            const items = groupedLiabilities[groupName];
            const groupTotal = getGroupTotal(items, "liability");

            return (
              <div
                key={groupName}
                className="border-b border-black last:border-b-0 break-inside-avoid"
              >
                <div className="flex border-b border-gray-300 bg-gray-50/50 print:bg-transparent">
                  <div className="flex-1 px-2 py-1 font-semibold text-xs uppercase tracking-wide">
                    {groupName}
                  </div>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex border-b border-gray-200 last:border-b-0 text-xs hover:bg-gray-50 print:hover:bg-transparent"
                  >
                    <div className="flex-1 px-2 py-1 pl-4 border-r border-gray-200 relative">
                      <div className="text-gray-800">{item.xdesc}</div>
                    </div>
                    <div className="w-24 sm:w-32 px-2 py-1 text-right font-mono flex items-end justify-end pb-1">
                      {item.liability.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end bg-gray-50 print:bg-transparent py-1">
                  <div className="px-2 text-xs font-bold w-24 sm:w-32 text-right border-t border-gray-300 border-dashed">
                    {groupTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assets Column */}
        <div>
          <div className="flex justify-between items-center border-b border-black px-2 py-1 font-bold bg-gray-100 print:bg-transparent">
            <span>পাওনা</span>
            <span>টাকা</span>
          </div>

          {Object.keys(groupedAssets).map((groupName) => {
            const items = groupedAssets[groupName];
            const groupTotal = getGroupTotal(items, "asset");

            return (
              <div
                key={groupName}
                className="border-b border-black last:border-b-0 break-inside-avoid"
              >
                <div className="flex border-b border-gray-300 bg-gray-50/50 print:bg-transparent">
                  <div className="flex-1 px-2 py-1 font-semibold text-xs uppercase tracking-wide">
                    {groupName}
                  </div>
                </div>

                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex border-b border-gray-200 last:border-b-0 text-xs hover:bg-gray-50 print:hover:bg-transparent"
                  >
                    <div className="flex-1 px-2 py-1 pl-4 border-r border-gray-200 relative">
                      <div className="text-gray-800">{item.xdesc}</div>
                    </div>
                    <div className="w-24 sm:w-32 px-2 py-1 text-right font-mono flex items-end justify-end pb-1">
                      {item.asset.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end bg-gray-50 print:bg-transparent py-1">
                  <div className="px-2 text-xs font-bold w-24 sm:w-32 text-right border-t border-gray-300 border-dashed">
                    {groupTotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 border border-t-0 border-black font-bold text-sm bg-gray-100 print:bg-transparent">
        <div className="border-r border-black p-2 flex justify-between">
          <span>মোট দেনা</span>
          <span>
            {data.summary.total_liability.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="p-2 flex justify-between">
          <span>মোট পাওনা</span>
          <span>
            {data.summary.total_asset.toLocaleString(undefined, {
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

export default function BalanceSheet() {
  const [searchParams] = useSearchParams();
  const initialFrom = searchParams.get("from_date");
  const initialTo = searchParams.get("to_date");

  const [fromDate, setFromDate] = useState<Date | null>(
    initialFrom ? new Date(initialFrom) : new Date(),
  );
  const [toDate, setToDate] = useState<Date | null>(
    initialTo ? new Date(initialTo) : new Date(),
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BalanceSheetResponse | null>(null);

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

      const response = await axios.get(
        `${apiBase}/accounts/report/balance-sheet/?from_date=${from}&to_date=${to}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data) {
        setData(response.data as BalanceSheetResponse);
      }
    } catch (error) {
      console.error("Failed to fetch balance sheet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialFrom && initialTo) {
      handleFetchReport();
    }
  }, []);

  const groupedLiabilities = useMemo(() => {
    return data ? groupData(data.liabilities) : {};
  }, [data]);

  const groupedAssets = useMemo(() => {
    return data ? groupData(data.assets) : {};
  }, [data]);

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
      <BalanceSheetTemplate
        data={data}
        groupedLiabilities={groupedLiabilities}
        groupedAssets={groupedAssets}
        formattedDateRange={formattedDateRange}
        todayStr={todayStr}
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
        title="Balance Sheet - Crop Track"
        description="Balance Sheet Report"
      />
      <PageBreadcrumb pageTitle="Balance Sheet" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex flex-col sm:flex-row items-end gap-4 mb-8 print:hidden">
          <div className="w-full sm:w-auto">
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

          <div className="w-full sm:w-auto">
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

          <button
            onClick={handleFetchReport}
            disabled={!fromDate || !toDate || loading}
            className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[42px]"
          >
            {loading ? "Loading..." : "Get Report"}
          </button>

          <button
            onClick={handlePrint}
            disabled={!data}
            className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50 h-[42px] ml-auto flex items-center justify-center gap-2"
          >
            <FiPrinter />
            Print Report
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : data ? (
          <div className="overflow-x-auto print:hidden  flex justify-center bg-gray-50/50 dark:bg-[#020d1a] py-8 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="max-w-[210mm] w-full transform scale-[0.9] sm:scale-100 origin-top">
              <BalanceSheetTemplate
                data={data}
                groupedLiabilities={groupedLiabilities}
                groupedAssets={groupedAssets}
                formattedDateRange={formattedDateRange}
                todayStr={todayStr}
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
