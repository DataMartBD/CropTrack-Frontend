import { useState, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getData } from "../../../services/apiClient";
import { Spinner } from "../../../components/ui/ut/Spinner";
import { FiPrinter } from "react-icons/fi";
import axios from "axios";
import { ReportHeader } from "../../../components/reports/ReportHeader";

interface ProjectCode {
  xtype: string;
  xcode: string;
}

interface LedgerItem {
  xvoucher: string;
  xproj?: string;
  business_id_id: number;
  business_name: string;
  xdate: string;
  xlong: string;
  xnote: string;
  xaccusage: string;
  xacctype: string;
  xacc: string;
  xdesc: string;
  xsub: string;
  subaccname: string | null;
  deposit: string;
  expense: string;
}

interface LedgerSummary {
  total_deposit: number;
  total_expense: number;
  balance: number;
}

interface BankBalance {
  xacc: string;
  xdesc: string;
  xbalance: number;
}

interface LedgerResponse {
  deposits: LedgerItem[];
  expenses: LedgerItem[];
  summary: LedgerSummary;
  message: string;
  /** Closing position, added by the API after the sheet shipped. */
  total_cash?: number;
  banks?: BankBalance[];
}

const formatAmount = (value: number) => Math.abs(value).toLocaleString();

/**
 * Balances keep their sign — an overdrawn account reading as a positive figure
 * would be read as money the business has.
 */
const formatBalance = (value: number) => (value ?? 0).toLocaleString();

const groupData = (items: LedgerItem[]) => {
  const groups: Record<string, Record<string, LedgerItem[]>> = {};
  items.forEach((item) => {
    const projKey = item.xproj || "General";
    const accKey = item.xdesc || "Uncategorized";
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

const getGroupTotal = (items: LedgerItem[], type: "deposit" | "expense") => {
  return items.reduce((sum, item) => {
    const val =
      parseFloat(type === "deposit" ? item.deposit : item.expense) || 0;
    return sum + val;
  }, 0);
};

const ChitSheetTemplate = ({
  ledgerData,
  groupedDeposits,
  groupedExpenses,
  formattedDateRange,
  todayStr,
}: {
  ledgerData: LedgerResponse;
  groupedDeposits: Record<string, Record<string, LedgerItem[]>>;
  groupedExpenses: Record<string, Record<string, LedgerItem[]>>;
  formattedDateRange: string;
  todayStr: string;
}) => {
  const chitNo = ledgerData.deposits[0]?.xvoucher?.split("-")?.[2] || "---";

  const banks = ledgerData.banks ?? [];
  const bankTotal = banks.reduce((sum, bank) => sum + (bank.xbalance || 0), 0);
  const cashTotal = ledgerData.total_cash ?? 0;

  return (
    <div className="bg-white p-6 rounded-xl ring-1 ring-gray-200 shadow-sm print:ring-0 print:shadow-none print:p-8 min-w-[210mm] mx-auto min-h-[297mm] print:w-full print:max-w-none print:min-h-0 text-gray-900">
      <ReportHeader
        title={
          ledgerData.deposits[0]?.business_name ||
          "রাহ্‌বার হিমাগার (প্রাঃ) লিমিটেড"
        }
      >
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
          চিট শিট
        </div>
        <div className="text-sm font-medium text-gray-700">
          চিট নং: <span className="font-mono">{chitNo}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-0 border border-black text-xs sm:text-sm">
        <div className="border-r border-black">
          <div className="flex justify-between items-center border-b border-black px-2 py-1 font-bold bg-gray-100 print:bg-transparent">
            <span>Deposit/জমা</span>
            <span>Amount/টাকা</span>
          </div>

          {Object.keys(groupedDeposits).map((projName) => {
            const projGroups = groupedDeposits[projName];
            const projItems = Object.values(projGroups).flat();
            const projTotal = getGroupTotal(projItems, "deposit");

            return (
              <div
                key={projName}
                className="border-b border-black last:border-b-0 break-inside-avoid"
              >
                <div className="flex border-b border-gray-400 bg-gray-200 print:bg-transparent">
                  <div className="flex-1 px-2 py-1 font-bold text-xs uppercase tracking-wide">
                     {projName}
                  </div>
                  <div className="w-24 sm:w-32 px-2 py-1 text-right font-bold text-xs border-l border-gray-400">
                    {formatAmount(projTotal)}
                  </div>
                </div>

                {Object.keys(projGroups).map((accName) => {
                  const items = projGroups[accName];
                  const accTotal = getGroupTotal(items, "deposit");
                  return (
                    <div
                      key={accName}
                      className="border-b border-gray-300 last:border-b-0"
                    >
                      <div className="flex border-b border-gray-200 bg-gray-50/50 print:bg-transparent">
                        <div className="flex-1 px-2 py-1 font-semibold text-[11px] uppercase tracking-wide text-gray-700">
                          {accName}
                        </div>
                        <div className="w-24 sm:w-32 px-2 py-1 text-right font-semibold text-[11px] border-l border-gray-200"></div>
                      </div>

                      {items.map((item, idx) => (
                        <div
                          key={item.xvoucher + idx}
                          className="flex border-b border-gray-100 last:border-b-0 text-xs hover:bg-gray-50 print:hover:bg-transparent"
                        >
                          <div className="flex-1 px-2 py-1 pl-4 border-r border-gray-100 relative">
                            <div className="flex justify-between items-center text-[10px] text-gray-700 mb-0.5">
                              {/* <span>{item.xdate}</span> */}
                              {item.subaccname && (
                                <div className="text-[10px] text-gray-600">
                                  {item.subaccname}
                                </div>
                              )}
                            </div>
                            <div className="text-gray-800">{item.xnote}</div>
                          </div>
                          <div className="w-24 sm:w-32 px-2 py-1 text-right font-mono flex items-end justify-end pb-1">
                            {formatAmount(parseFloat(item.deposit) || 0)}
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-end bg-gray-50 print:bg-transparent py-0.5">
                        <div className="px-2 text-xs font-bold w-24 sm:w-32 text-right border-t border-gray-200 border-dashed">
                          {formatAmount(accTotal)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div>
          <div className="flex justify-between items-center border-b border-black px-2 py-1 font-bold bg-gray-100 print:bg-transparent">
            <span>Expense/খরচ</span>
            <span>Amount/টাকা</span>
          </div>

          {Object.keys(groupedExpenses).map((projName) => {
            const projGroups = groupedExpenses[projName];
            const projItems = Object.values(projGroups).flat();
            const projTotal = getGroupTotal(projItems, "expense");

            return (
              <div
                key={projName}
                className="border-b border-black last:border-b-0"
              >
                <div className="flex border-b border-gray-400 bg-gray-200 print:bg-transparent">
                  <div className="flex-1 px-2 py-1 font-bold text-xs uppercase tracking-wide">
                    {projName}
                  </div>
                  <div className="w-24 sm:w-32 px-2 py-1 text-right font-bold text-xs border-l border-gray-400">
                    {formatAmount(projTotal)}
                  </div>
                </div>

                {Object.keys(projGroups).map((accName) => {
                  const items = projGroups[accName];
                  const accTotal = getGroupTotal(items, "expense");

                  return (
                    <div
                      key={accName}
                      className="border-b border-gray-300 last:border-b-0 break-inside-avoid"
                    >
                      <div className="flex border-b border-gray-200 bg-gray-50/50 print:bg-transparent">
                        <div className="flex-1 px-2 py-1 font-semibold text-[11px] uppercase tracking-wide text-gray-700">
                          {accName}
                        </div>
                        <div className="w-24 sm:w-32 px-2 py-1 text-right font-semibold text-[11px] border-l border-gray-200"></div>
                      </div>

                      {items.map((item, idx) => (
                        <div
                          key={item.xvoucher + idx}
                          className="flex border-b border-gray-100 last:border-b-0 text-xs hover:bg-gray-50 print:hover:bg-transparent"
                        >
                          <div className="flex-1 px-2 py-1 pl-4 border-r border-gray-100 relative">
                            <div className="flex justify-between items-center text-[10px] text-gray-700 mb-0.5">
                              {/* <span>{item.xdate}</span> */}
                              {item.subaccname && (
                                <div className="text-[10px] text-gray-600">
                                  {item.subaccname}
                                </div>
                              )}
                            </div>
                            <div className="text-gray-800">{item.xnote}</div>
                          </div>
                          <div className="w-24 sm:w-32 px-2 py-1 text-right font-mono flex items-end justify-end pb-1">
                            {formatAmount(parseFloat(item.expense) || 0)}
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-end bg-gray-50 print:bg-transparent py-0.5">
                        <div className="px-2 text-xs font-bold w-24 sm:w-32 text-right border-t border-gray-200 border-dashed">
                          {formatAmount(accTotal)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 border border-t-0 border-black font-bold text-sm bg-gray-100 print:bg-transparent">
        <div className="border-r border-black p-2 flex justify-between">
          <span>Total Deposit/মোট জমা</span>
          <span>{formatAmount(ledgerData.summary.total_deposit)}</span>
        </div>
        <div className="p-2 flex justify-between">
          <span>Total Expense/মোট খরচ</span>
          <span>{formatAmount(ledgerData.summary.total_expense)}</span>
        </div>
      </div>

      {/* Closing position. Rendered only when the API sends it, so a backend
          that has not been updated yet still prints a valid chit. */}
      {(banks.length > 0 || ledgerData.total_cash != null) && (
        <div className="mt-4 border border-black break-inside-avoid">
          <div className="border-b border-black bg-gray-100 print:bg-transparent px-2 py-1 text-sm font-bold">
            ব্যাংক ও নগদ অ্যামাউন্ট / Bank &amp; Cash Position
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-400 bg-gray-50 print:bg-transparent">
                <th className="w-8 border-r border-gray-300 px-2 py-1 text-left font-semibold">
                  নং
                </th>
                <th className="w-20 border-r border-gray-300 px-2 py-1 text-left font-semibold">
                  A/C
                </th>
                <th className="border-r border-gray-300 px-2 py-1 text-left font-semibold">
                  হিসাবের বিবরণ
                </th>
                <th className="w-32 px-2 py-1 text-right font-semibold">
                  অ্যামাউন্ট
                </th>
              </tr>
            </thead>
            <tbody>
              {banks.map((bank, idx) => (
                <tr
                  key={bank.xacc}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <td className="border-r border-gray-100 px-2 py-1 text-gray-600">
                    {idx + 1}
                  </td>
                  <td className="border-r border-gray-100 px-2 py-1 font-mono text-gray-700">
                    {bank.xacc}
                  </td>
                  <td className="border-r border-gray-100 px-2 py-1">
                    {bank.xdesc}
                  </td>
                  <td className="px-2 py-1 text-right font-mono tabular-nums">
                    {formatBalance(bank.xbalance)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-400 font-semibold">
                <td colSpan={3} className="px-2 py-1 text-right">
                  মোট ব্যাংক অ্যামাউন্ট
                </td>
                <td className="border-t border-gray-300 px-2 py-1 text-right font-mono tabular-nums">
                  {formatBalance(bankTotal)}
                </td>
              </tr>
              <tr className="font-semibold">
                <td colSpan={3} className="px-2 py-1 text-right">
                  নগদ অ্যামাউন্ট / Cash in Hand
                </td>
                <td className="px-2 py-1 text-right font-mono tabular-nums">
                  {formatBalance(cashTotal)}
                </td>
              </tr>
              <tr className="border-t border-black bg-gray-100 print:bg-transparent font-bold">
                <td colSpan={3} className="px-2 py-1 text-right">
                  সর্বমোট অ্যামাউন্ট
                </td>
                <td className="px-2 py-1 text-right font-mono tabular-nums">
                  {formatBalance(bankTotal + cashTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-12 print:mt-16 pt-4 break-inside-avoid">
        <div className="grid grid-cols-2 gap-12 text-center text-xs">
          <div className="mt-8 pt-1 border-t border-black w-2/3 mx-auto">
            {/* <p className="font-bold text-gray-800">Prepared By</p> */}
          </div>
          <div className="mt-8 pt-1 border-t border-black w-2/3 mx-auto">
            {/* <p className="font-bold text-gray-800">Approved By</p> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ChitSheet() {
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [project, setProject] = useState<string>("All");
  const [projects, setProjects] = useState<string[]>(["All"]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState<LedgerResponse | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const data = await getData<ProjectCode[]>(
          "/masterdata/common-codes/list/",
          { xtype: "Project" },
        );
        const codes = (data || []).map((p) => p.xcode);
        setProjects(["All", ...codes]);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleGetLedger = async () => {
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

      let url = `${apiBase}/accounts/report/daily-ledger/?from_date=${from}&to_date=${to}`;
      if (project !== "All") {
        url += `&xproj=${encodeURIComponent(project)}`;
      }

      console.log(
        `Fetching ledger from ${from} to ${to} for project ${project}`,
      );

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Chit Sheet Response:", response);

      if (response.data && (response.data.deposits || response.data.expenses)) {
        setLedgerData(response.data as LedgerResponse);
      } else if (
        response.data &&
        response.data.data &&
        (response.data.data.deposits || response.data.data.expenses)
      ) {
        setLedgerData(response.data.data as LedgerResponse);
      } else {
        console.warn("Unexpected response structure:", response.data);
        setLedgerData(null);
      }
    } catch (error) {
      console.error("Failed to fetch ledger data:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupedDeposits = useMemo(() => {
    return ledgerData ? groupData(ledgerData.deposits) : {};
  }, [ledgerData]);

  const groupedExpenses = useMemo(() => {
    return ledgerData ? groupData(ledgerData.expenses) : {};
  }, [ledgerData]);

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
    if (!ledgerData) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Inject styles
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
      <ChitSheetTemplate
        ledgerData={ledgerData}
        groupedDeposits={groupedDeposits}
        groupedExpenses={groupedExpenses}
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
      <PageMeta title="Chit Sheet - Crop Track" description="Chit Sheet" />
      <PageBreadcrumb pageTitle="Chit Sheet" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex flex-wrap items-end gap-4 mb-8 print:hidden">
          <div className="flex-1 min-w-[150px]">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Project
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              disabled={loadingProjects}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500 disabled:opacity-50 h-[42px]"
            >
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
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
              onClick={handleGetLedger}
              disabled={!fromDate || !toDate || loading}
              className="flex-1 px-6 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[42px]"
            >
              {loading ? "Loading..." : "Get GL"}
            </button>

            <button
              onClick={handlePrint}
              disabled={!ledgerData}
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
        ) : ledgerData ? (
          <div className="overflow-x-auto print:hidden  flex justify-center bg-gray-50/50 dark:bg-[#020d1a] py-8 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="max-w-[210mm] w-full transform scale-[0.9] sm:scale-100 origin-top">
              <ChitSheetTemplate
                ledgerData={ledgerData}
                groupedDeposits={groupedDeposits}
                groupedExpenses={groupedExpenses}
                formattedDateRange={formattedDateRange}
                todayStr={todayStr}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            Please select a date range and click "Get Ledger" to view results.
          </div>
        )}
      </div>
    </div>
  );
}
