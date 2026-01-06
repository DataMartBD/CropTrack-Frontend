import { useState, useMemo } from "react";
import { createRoot } from "react-dom/client";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { getData } from "../../../services/apiClient";
import { Spinner } from "../../../components/ui/ut/Spinner";
import { FiPrinter } from "react-icons/fi";
import axios from "axios";

interface LedgerItem {
  xvoucher: string;
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

interface LedgerResponse {
  deposits: LedgerItem[];
  expenses: LedgerItem[];
  summary: LedgerSummary;
  message: string;
}

// Helper to group data by Account Description (xdesc)
const groupData = (items: LedgerItem[]) => {
  const groups: Record<string, LedgerItem[]> = {};
  items.forEach((item) => {
    const key = item.xdesc || "Uncategorized";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });
  return groups;
};

// Helper to sum up a group
const getGroupTotal = (items: LedgerItem[], type: "deposit" | "expense") => {
  return items.reduce((sum, item) => {
    const val =
      parseFloat(type === "deposit" ? item.deposit : item.expense) || 0;
    return sum + val;
  }, 0);
};

// ----------------------------------------------------------------------
// Template Component (Used for both Screen View and Print)
// ----------------------------------------------------------------------
const GeneralLedgerTemplate = ({
  ledgerData,
  groupedDeposits,
  groupedExpenses,
  formattedDateRange,
  todayStr,
}: {
  ledgerData: LedgerResponse;
  groupedDeposits: Record<string, LedgerItem[]>;
  groupedExpenses: Record<string, LedgerItem[]>;
  formattedDateRange: string;
  todayStr: string;
}) => {
  const chitNo = ledgerData.deposits[0]?.xvoucher?.split("-")?.[2] || "---";

  return (
    <div className="bg-white p-6 rounded-xl ring-1 ring-gray-200 shadow-sm print:ring-0 print:shadow-none print:p-8 min-w-[210mm] mx-auto min-h-[297mm] print:w-full print:max-w-none print:min-h-0 text-gray-900">
      {/* Styled Header Section */}
      <div className="relative overflow-hidden text-center mb-4 py-4 px-4 bg-gradient-to-b from-green-50 to-white border-b-2 border-double border-green-800 rounded-t-lg">
        {/* Background Graphic Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h6 className="text-[10px] mb-1 text-zinc-600">
            বিসমিল্লাহির রাহমানির রাহিম
          </h6>

          <div className="inline-block px-2 py-0.5 mb-1 bg-green-800 text-white text-[9px] rounded-sm uppercase">
            রাহবার এগ্রো কমপ্লেক্স (প্রাঃ) লিমিটেড এর অঙ্গ প্রতিষ্ঠান
          </div>

          <div className="flex justify-center items-center gap-2 mb-1">
            <div className="hidden md:block h-px w-8 bg-green-800/30"></div>
            <h1 className="text-xl font-bold text-green-900">
              {ledgerData.deposits[0]?.business_name ||
                "রাহবার হিমাগার (প্রাঃ) লিমিটেড ইউনিট - ৪"}
            </h1>
            <div className="hidden md:block h-px w-8 bg-green-800/30"></div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <p className="text-xs text-zinc-700">বটতলী, বীরগঞ্জ, দিনাজপুর।</p>
            <div className="flex gap-4 mt-0.5">
              <p className="text-[10px] bg-white px-1.5 border border-zinc-200 rounded-sm">
                <span className="text-green-800 font-medium">Report Date:</span>{" "}
                {formattedDateRange}
              </p>
              <p className="text-[10px] bg-white px-1.5 border border-zinc-200 rounded-sm">
                <span className="text-green-800 font-medium">Print Date:</span>{" "}
                {todayStr}
              </p>
            </div>
          </div>

          {/*  Absolute */}
          {/* <div className="absolute top-4 left-4 text-xs font-bold border border-green-800 px-2 py-0.5 rounded shadow-sm bg-white hidden sm:block print:block">
            No: {chitNo}
          </div> */}

          {/* Total Balance Absolute */}
          {/* <div className="absolute top-4 right-4 text-xs font-bold border border-green-800 px-2 py-0.5 rounded shadow-sm bg-white hidden sm:block print:block">
            Balance: {ledgerData.summary.balance.toLocaleString()}/=
          </div> */}
        </div>
      </div>

      {/* Title Bar like Voucher */}
      <div className="flex items-center justify-between bg-green-50 border-y border-green-800 py-1 px-3 mb-4">
        <div className="font-semibold text-sm bg-green-800 text-white px-3 py-0.5 rounded-full">
          GENERAL LEDGER
        </div>
        <div className="text-sm font-medium text-gray-700">
          চিট নং: <span className="font-mono">{chitNo}</span>
        </div>
      </div>

      {/* Main Two-Column Table Layout */}
      <div className="grid grid-cols-2 gap-0 border border-black text-xs sm:text-sm">
        {/* LEFT COLUMN: DEPOSITS */}
        <div className="border-r border-black">
          {/* Column Header */}
          <div className="flex justify-between items-center border-b border-black px-2 py-1 font-bold bg-gray-100 print:bg-transparent">
            <span>Deposit/জমা</span>
            <span>Amount/টাকা</span>
          </div>

          {/* Groups */}
          {Object.keys(groupedDeposits).map((groupName) => {
            const items = groupedDeposits[groupName];
            const groupTotal = getGroupTotal(items, "deposit");

            return (
              <div
                key={groupName}
                className="border-b border-black last:border-b-0 break-inside-avoid"
              >
                {/* Group Header Row */}
                <div className="flex border-b border-gray-300 bg-gray-50/50 print:bg-transparent">
                  <div className="flex-1 px-2 py-1 font-semibold text-xs uppercase tracking-wide">
                    {groupName}
                  </div>
                  <div className="w-24 sm:w-32 px-2 py-1 text-right font-semibold text-xs border-l border-gray-300">
                    {/* Placeholder */}
                  </div>
                </div>

                {/* Items */}
                {items.map((item, idx) => (
                  <div
                    key={item.xvoucher + idx}
                    className="flex border-b border-gray-200 last:border-b-0 text-xs hover:bg-gray-50 print:hover:bg-transparent"
                  >
                    <div className="flex-1 px-2 py-1 pl-4 border-r border-gray-200 relative">
                      {/* Date & Account Code on top */}
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mb-0.5">
                        <span>{item.xdate}</span>
                        <span className="font-mono bg-gray-100 px-1 rounded">
                          Acc: {item.xacc}
                        </span>
                      </div>

                      <div className="font-medium text-gray-800">
                        {item.xnote}
                      </div>
                      {item.subaccname && (
                        <div className="text-[10px] text-gray-600">
                          {item.subaccname}
                        </div>
                      )}
                    </div>
                    <div className="w-24 sm:w-32 px-2 py-1 text-right font-mono flex items-end justify-end pb-1">
                      {parseFloat(item.deposit).toLocaleString()}
                    </div>
                  </div>
                ))}

                {/* Group Total Footer */}
                <div className="flex justify-end bg-gray-50 print:bg-transparent py-1">
                  <div className="px-2 text-xs font-bold w-24 sm:w-32 text-right border-t border-gray-300 border-dashed">
                    {groupTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: EXPENSES */}
        <div>
          {/* Column Header */}
          <div className="flex justify-between items-center border-b border-black px-2 py-1 font-bold bg-gray-100 print:bg-transparent">
            <span>Expense/খরচ</span>
            <span>Amount/টাকা</span>
          </div>

          {/* Groups */}
          {Object.keys(groupedExpenses).map((groupName) => {
            const items = groupedExpenses[groupName];
            const groupTotal = getGroupTotal(items, "expense");

            return (
              <div
                key={groupName}
                className="border-b border-black last:border-b-0 break-inside-avoid"
              >
                {/* Group Header Row */}
                <div className="flex border-b border-gray-300 bg-gray-50/50 print:bg-transparent">
                  <div className="flex-1 px-2 py-1 font-semibold text-xs uppercase tracking-wide">
                    {groupName}
                  </div>
                  <div className="w-24 sm:w-32 px-2 py-1 text-right font-semibold text-xs border-l border-gray-300"></div>
                </div>

                {/* Items */}
                {items.map((item, idx) => (
                  <div
                    key={item.xvoucher + idx}
                    className="flex border-b border-gray-200 last:border-b-0 text-xs hover:bg-gray-50 print:hover:bg-transparent"
                  >
                    <div className="flex-1 px-2 py-1 pl-4 border-r border-gray-200 relative">
                      {/* Date & Account Code on top */}
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mb-0.5">
                        <span>{item.xdate}</span>
                        <span className="font-mono bg-gray-100 px-1 rounded">
                          Acc: {item.xacc}
                        </span>
                      </div>

                      <div className="font-medium text-gray-800">
                        {item.xnote}
                      </div>
                      {item.subaccname && (
                        <div className="text-[10px] text-gray-600">
                          {item.subaccname}
                        </div>
                      )}
                    </div>
                    <div className="w-24 sm:w-32 px-2 py-1 text-right font-mono flex items-end justify-end pb-1">
                      {parseFloat(item.expense).toLocaleString()}
                    </div>
                  </div>
                ))}

                {/* Group Total Footer */}
                <div className="flex justify-end bg-gray-50 print:bg-transparent py-1">
                  <div className="px-2 text-xs font-bold w-24 sm:w-32 text-right border-t border-gray-300 border-dashed">
                    {groupTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grand Total Row */}
      <div className="grid grid-cols-2 border border-t-0 border-black font-bold text-sm bg-gray-100 print:bg-transparent">
        <div className="border-r border-black p-2 flex justify-between">
          <span>Total Deposit/মোট জমা</span>
          <span>{ledgerData.summary.total_deposit.toLocaleString()}</span>
        </div>
        <div className="p-2 flex justify-between">
          <span>Total Expense/মোট খরচ</span>
          <span>{ledgerData.summary.total_expense.toLocaleString()}</span>
        </div>
      </div>

      {/* Footer Summary Blocks */}
      <div className="mt-6 grid grid-cols-2 gap-8 break-inside-avoid">
        {/* Left Block: Summary */}
        <div className="border border-black p-4 text-sm shadow-sm print:shadow-none">
          <div className="flex justify-between mb-2">
            <span>Total Deposit:</span>
            <span className="font-bold">
              {ledgerData.summary.total_deposit.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between mb-2 pb-2 border-b border-gray-300">
            <span>Total Expense:</span>
            <span className="font-bold">
              {ledgerData.summary.total_expense.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-base mt-2">
            <span className="font-bold">Balance:</span>
            <span className="font-bold  border-b-2 border-double border-[#121312]">
              {ledgerData.summary.balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right Block: Denomination */}
        <div className="border border-black text-xs shadow-sm print:shadow-none">
          <div className="grid grid-cols-3 border-b border-black font-bold text-center bg-gray-50 print:bg-transparent">
            <div className="p-1 border-r border-black">Note</div>
            <div className="p-1 border-r border-black">Count</div>
            <div className="p-1">Amount</div>
          </div>
          {[1000, 500, 200, 100, 50, 20, 10, 5].map((note) => (
            <div
              key={note}
              className="grid grid-cols-3 border-b border-gray-300 last:border-b-0 text-right"
            >
              <div className="p-1 pr-2 border-r border-gray-300 font-medium">
                {note} x
              </div>
              <div className="p-1 border-r border-gray-300"></div>
              <div className="p-1"></div>
            </div>
          ))}
          <div className="grid grid-cols-2 border-t border-black font-bold">
            <div className="p-1 text-right px-2">Total Cash:</div>
            <div className="p-1 text-right px-2"></div>
          </div>
        </div>
      </div>

      {/* Signature Section */}
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

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function GeneralLedger() {
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState<LedgerResponse | null>(null);

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

      console.log(`Fetching ledger from ${from} to ${to}`);

      const response = await axios.get(
        `${apiBase}/accounts/report/daily-ledger/?from_date=${from}&to_date=${to}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("General Ledger Response:", response);

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

    // Google Fonts
    const fontLink = doc.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    fontLink.rel = "stylesheet";
    doc.head.appendChild(fontLink);

    // Print Specific CSS
    const printStyle = doc.createElement("style");
    printStyle.textContent = `
      @page { size: auto; margin: 0mm; }
      @media print {
        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
      body { font-family: 'Inter', sans-serif; background: #fff; }
    `;
    doc.head.appendChild(printStyle);

    // Render Template
    const root = createRoot(container);
    root.render(
      <GeneralLedgerTemplate
        ledgerData={ledgerData}
        groupedDeposits={groupedDeposits}
        groupedExpenses={groupedExpenses}
        formattedDateRange={formattedDateRange}
        todayStr={todayStr}
      />
    );

    // Execute Print
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
        title="General Ledger - Crop Track"
        description="General Ledger"
      />
      <PageBreadcrumb pageTitle="General Ledger" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Controls */}
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
            onClick={handleGetLedger}
            disabled={!fromDate || !toDate || loading}
            className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[42px]"
          >
            {loading ? "Loading..." : "Get GL"}
          </button>

          <button
            onClick={handlePrint}
            disabled={!ledgerData}
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
        ) : ledgerData ? (
          <div className="overflow-x-auto print:hidden  flex justify-center bg-gray-50/50 dark:bg-[#020d1a] py-8 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="max-w-[210mm] w-full transform scale-[0.9] sm:scale-100 origin-top">
              <GeneralLedgerTemplate
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
