import { useState, useMemo, useEffect } from "react";
import { createRoot } from "react-dom/client";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Spinner } from "../../../components/ui/ut/Spinner";
import { FiPrinter } from "react-icons/fi";
import axios from "axios";
import { ReportHeader } from "../../../components/reports/ReportHeader";
import { getData } from "../../../services/apiClient";
import { Toaster } from "react-hot-toast";
import SearchableSelect from "../../../components/ui/ut/SearchableSelect";

interface BalanceSheetItem {
  business_id: number;
  business_name: string;
  xacc: string;
  xdesc: string;
  xsub: string;
  subaccname: string | null;
  opening_balance: string;
  debit_amount: string;
  credit_amount: string;
  closing_balance: string;
}

interface Account {
  xacc: string;
  xdesc: string;
  xaccsource: string;
}

interface SubAccount {
  xacc: string;
  xsub: string;
  xdesc: string;
}

const BankCashTemplate = ({
  data,
  formattedDateRange,
  todayStr,
}: {
  data: BalanceSheetItem[];
  formattedDateRange: string;
  todayStr: string;
}) => {
  const businessName = data[0]?.business_name || "Business Name";
  const totalClosingBalance = data.reduce(
    (sum, item) => sum + (parseFloat(item.closing_balance) || 0),
    0,
  );

  return (
    <div className="bg-white p-6 rounded-xl ring-1 ring-gray-200 shadow-sm print:ring-0 print:shadow-none print:p-8 min-w-[210mm] mx-auto min-h-[297mm] print:w-full print:max-w-none print:min-h-0 text-gray-900">
      <ReportHeader title={businessName}>
        <p className="text-[10px] bg-white px-1.5 border border-zinc-200 rounded-sm">
          <span className="text-green-800 font-medium">Report Date:</span>{" "}
          {formattedDateRange}
        </p>
        <p className="text-[10px] bg-white px-1.5 border border-zinc-200 rounded-sm">
          <span className="text-green-800 font-medium">Print Date:</span>{" "}
          {todayStr}
        </p>
      </ReportHeader>

      <div className="flex items-center justify-center bg-green-50 border-y border-green-800 py-1 px-3 mb-4">
        <div className="font-semibold text-sm bg-green-800 text-white px-3 py-0.5 rounded-full">
          Ledger Report
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-gray-100 font-bold border-b border-black print:bg-transparent">
              <th className="border-r border-black p-2 text-left whitespace-nowrap w-[8%]">
                Account
              </th>
              <th className="border-r border-black p-2 text-left w-[20%]">
                Name
              </th>
              <th className="border-r border-black p-2 text-left whitespace-nowrap w-[8%]">
                Sub Acc
              </th>
              <th className="border-r border-black p-2 text-left w-[20%]">
                Sub Acc Name
              </th>
              <th className="border-r border-black p-2 text-right whitespace-nowrap w-[11%]">
                Opening
              </th>
              <th className="border-r border-black p-2 text-right whitespace-nowrap w-[11%]">
                Debit
              </th>
              <th className="border-r border-black p-2 text-right whitespace-nowrap w-[11%]">
                Credit
              </th>
              <th className="p-2 text-right whitespace-nowrap w-[11%]">
                Closing
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 print:hover:bg-transparent"
              >
                <td className="border-r border-gray-200 p-2 font-mono">
                  {item.xacc}
                </td>
                <td className="border-r border-gray-200 p-2 leading-tight">
                  {item.xdesc}
                </td>
                <td className="border-r border-gray-200 p-2 font-mono">
                  {item.xsub}
                </td>
                <td className="border-r border-gray-200 p-2 leading-tight">
                  {item.subaccname || "-"}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  {parseFloat(item.opening_balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  {parseFloat(item.debit_amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  {parseFloat(item.credit_amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="p-2 text-right font-mono">
                  {parseFloat(item.closing_balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold border-t border-black print:bg-transparent">
              <td colSpan={7} className="border-r border-black p-2 text-right">
                Total Closing Balance:
              </td>
              <td className="p-2 text-right font-mono">
                {totalClosingBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signature Section */}
      {/* <div className="mt-12 print:mt-16 pt-4 break-inside-avoid">
        <div className="grid grid-cols-2 gap-12 text-center text-xs">
          <div className="mt-8 pt-1 border-t border-black w-2/3 mx-auto">
            <p className="font-bold text-gray-800">Prepared By</p>
          </div>
          <div className="mt-8 pt-1 border-t border-black w-2/3 mx-auto">
            <p className="font-bold text-gray-800">Approved By</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default function BankCashBalanceSheet() {
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<BalanceSheetItem[] | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAcc, setSelectedAcc] = useState("");
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [selectedSub, setSelectedSub] = useState("");
  const [accSource, setAccSource] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getData<Account[]>("/accounts/chartofaccounts/");
        setAccounts(data || []);
      } catch (err) {
        console.error("Failed to load accounts", err);
      }
    };
    fetchAccounts();
  }, []);

  const accountOptions = useMemo(() => {
    return [
      {
        customer_code: "",
        customer_name: "All Accounts",
        xacc: "",
        xdesc: "All Accounts",
      },
      ...accounts.map((acc) => ({
        ...acc,
        customer_code: acc.xacc,
        customer_name: acc.xdesc,
      })),
    ];
  }, [accounts]);

  const subAccountOptions = useMemo(() => {
    return [
      {
        customer_code: "",
        customer_name: `All ${accSource || "Sub-accounts"}`,
        xsub: "",
        xdesc: `All ${accSource || "Sub-accounts"}`,
      },
      ...subAccounts.map((sub) => ({
        ...sub,
        customer_code: sub.xsub,
        customer_name: sub.xdesc,
      })),
    ];
  }, [subAccounts, accSource]);

  const handleAccountChange = async (xacc: string) => {
    setSelectedAcc(xacc);
    setSelectedSub("");
    setSubAccounts([]);

    const account = accounts.find((a) => a.xacc === xacc);
    if (!account) {
      setAccSource("");
      return;
    }

    setAccSource(account.xaccsource);

    if (
      account.xaccsource === "Subaccount" ||
      account.xaccsource === "Customer"
    ) {
      try {
        let endpoint = "";
        if (account.xaccsource === "Subaccount") {
          endpoint = `/accounts/subaccounts/${xacc}/`;
        } else if (account.xaccsource === "Customer") {
          endpoint = `/masterdata/customers/list/`;
        }

        const response: any = await getData(endpoint);
        let normalizedData: SubAccount[] = [];

        if (account.xaccsource === "Subaccount") {
          normalizedData = response;
        } else if (account.xaccsource === "Customer") {
          normalizedData = (response as any[]).map((c) => ({
            xacc: xacc,
            xsub: c.customer_code,
            xdesc: c.customer_name,
          }));
        }
        setSubAccounts(normalizedData);
      } catch (err) {
        console.error(`Failed to load sub-accounts`, err);
      }
    }
  };

  const handleGetReport = async () => {
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

      let url = `${apiBase}/accounts/report/bank-cash/?from_date=${from}&to_date=${to}`;
      if (selectedAcc) url += `&xacc=${selectedAcc}`;
      if (selectedSub) url += `&xsub=${selectedSub}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setReportData(response.data.data);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

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
    if (!reportData) return;

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
      <BankCashTemplate
        data={reportData}
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
      <Toaster position="top-right" />
      <PageMeta
        title="Ledger Report - Crop Track"
        description="Ledger Report"
      />
      <PageBreadcrumb pageTitle="Ledger Report" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 items-end gap-4 mb-8 pb-32 print:hidden relative z-10">
          <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              From Date
            </label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              To Date
            </label>
            <DatePicker
              selected={toDate}
              onChange={(date) => setToDate(date)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Account
            </label>
            <SearchableSelect
              options={accountOptions}
              value={selectedAcc}
              onChange={(val) => handleAccountChange(val)}
              placeholder="All Accounts"
              labelRenderer={(opt) => (
                <span className="text-sm">
                  {opt.xacc ? `${opt.xacc} - ${opt.xdesc}` : opt.xdesc}
                </span>
              )}
            />
          </div>

          <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Sub Account
            </label>
            <SearchableSelect
              options={subAccountOptions}
              value={selectedSub}
              onChange={(val) => setSelectedSub(val)}
              placeholder={`All ${accSource || "Sub-accounts"}`}
              disabled={
                !accSource ||
                (accSource !== "Subaccount" && accSource !== "Customer")
              }
              labelRenderer={(opt) => (
                <span className="text-sm">
                  {opt.xsub ? `${opt.xsub} - ${opt.xdesc}` : opt.xdesc}
                </span>
              )}
            />
          </div>

          <div className="flex gap-2 lg:col-span-1 xl:col-span-2">
            <button
              onClick={handleGetReport}
              disabled={!fromDate || !toDate || loading}
              className="flex-1 px-6 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[42px]"
            >
              {loading ? "Loading..." : "Get Report"}
            </button>

            <button
              onClick={handlePrint}
              disabled={!reportData || reportData.length === 0}
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
        ) : reportData ? (
          <div className="overflow-x-auto print:hidden flex justify-center bg-gray-50/50 dark:bg-[#020d1a] py-8 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="max-w-[210mm] w-full transform scale-[0.9] sm:scale-100 origin-top">
              <BankCashTemplate
                data={reportData}
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
