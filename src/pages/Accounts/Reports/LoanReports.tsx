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
import { Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import SearchableSelect, {
  OptionItem,
} from "../../../components/ui/ut/SearchableSelect";

interface LoanReportItem {
  xamount: string;
  xref: string;
  customer_name: string;
  certificate_no: string;
  loan_type: string;
  interest_frequency: string;
  payment_type: string;
  payment_method: string;
  interest_rate: string;
  xtrnnum: string;
  business_id: number;
  created_by: number;
  created_at: string;
  xnote: string | null;
}

const LoanReportTemplate = ({
  data,
  formattedDateRange,
  todayStr,
  totalAmount,
}: {
  data: LoanReportItem[];
  formattedDateRange: string;
  todayStr: string;
  totalAmount: number;
}) => {
  const businessName = "রাহবার হিমাগার (প্রাঃ) লিমিটেড";

  return (
    <div className="bg-white p-6 rounded-xl ring-1 ring-gray-200 shadow-sm print:ring-0 print:shadow-none print:p-8 min-w-[210mm] mx-auto min-h-[297mm] print:w-full print:max-w-none print:min-h-0 text-gray-900 font-inter border border-black">
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
          Loan Report
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse border border-black text-[10px]">
          <thead>
            <tr className="bg-gray-100 font-bold border-b border-black print:bg-transparent text-center">
              <th className="border-r border-black p-2 w-[5%]">SL</th>
              <th className="border-r border-black p-2 w-[15%]">Trn No</th>
              <th className="border-r border-black p-2 w-[20%] text-left">
                Customer
              </th>
              <th className="border-r border-black p-2 w-[11%]">Cert No</th>
              <th className="border-r border-black p-2 w-[11%]">Loan Type</th>
              <th className="border-r border-black p-2 w-[11%]">Pmt Type</th>
              <th className="border-r border-black p-2 w-[11%] text-right">
                Int Rate
              </th>
              <th className="p-2 w-[16%] text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr
                key={idx}
                className="border-b border-black hover:bg-gray-50 print:hover:bg-transparent"
              >
                <td className="border-r border-black p-2 text-center font-mono">
                  {idx + 1}
                </td>
                <td className="border-r border-black p-2 font-mono whitespace-nowrap">
                  {item.xtrnnum}
                </td>
                <td className="border-r border-black p-2 leading-tight">
                  <div className="font-semibold">{item.customer_name}</div>
                  <div className="text-[8px] text-gray-500">{item.xref}</div>
                </td>
                <td className="border-r border-black p-2 text-center font-mono">
                  {item.certificate_no || "-"}
                </td>
                <td className="border-r border-black p-2 text-center">
                  <span className="px-1.5 py-0.5 rounded-sm  text-[8px] font-medium uppercase">
                    {item.loan_type}
                  </span>
                </td>
                <td className="border-r border-black p-2 text-center">
                  <span
                    className={`px-1.5 py-0.5 rounded-sm text-[8px] font-medium uppercase 
                        `}
                  >
                    {item.payment_type}
                  </span>
                </td>
                <td className="border-r border-black p-2 text-right font-mono">
                  {parseFloat(item.interest_rate).toFixed(2)}%
                </td>
                <td className="p-2 text-right font-mono font-semibold">
                  {parseFloat(item.xamount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold border-t border-black print:bg-transparent">
              <td colSpan={7} className="border-r border-black p-2 text-right">
                Total Amount:
              </td>
              <td className="p-2 text-right font-mono">
                {totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-[9px] text-gray-400">
        * This is a computer generated report.
      </div>
    </div>
  );
};

export default function LoanReports() {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<LoanReportItem[] | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const [customers, setCustomers] = useState<OptionItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL;
        const token = window.localStorage.getItem("jwtToken");
        const response = await axios.get(
          `${apiBase}/masterdata/customers/list/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data && response.data.data) {
          setCustomers(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    };
    fetchCustomers();
  }, []);

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

      let url = `${apiBase}/accounts/report/loan-list/?from_date=${from}&to_date=${to}`;
      if (selectedCustomer) {
        url += `&customer_code=${selectedCustomer}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        setReportData(response.data.data);
        setTotalAmount(response.data.meta?.total_amount || 0);
      } else {
        setReportData([]);
        setTotalAmount(0);
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      setReportData([]);
      setTotalAmount(0);
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
      <LoanReportTemplate
        data={reportData}
        formattedDateRange={formattedDateRange}
        todayStr={todayStr}
        totalAmount={totalAmount}
      />
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
      <PageMeta title="Loan Report - Crop Track" description="Loan Report" />
      <PageBreadcrumb pageTitle={t("loan_report")} />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 print:hidden bg-gray-50/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 font-inter">
          <div className="flex flex-col sm:flex-row items-end gap-4 overflow-visible">
            <div className="w-full sm:w-[160px]">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                From Date
              </label>
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div className="w-full sm:w-[160px]">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                To Date
              </label>
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div className="w-full sm:w-[300px]">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Search Customer
              </label>
              <SearchableSelect
                options={customers}
                value={selectedCustomer}
                onChange={(val) => setSelectedCustomer(val)}
                placeholder="All Customers"
              />
            </div>
          </div>

          <div className="flex gap-2 w-full lg:w-auto lg:ml-auto">
            <button
              onClick={handleGetReport}
              disabled={!fromDate || !toDate || loading}
              className="flex-1 lg:w-[140px] px-6 py-2.5 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[42px]"
            >
              {loading ? "Loading..." : "Get Report"}
            </button>

            <button
              onClick={handlePrint}
              disabled={!reportData || reportData.length === 0}
              className="flex-1 lg:w-[120px] px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50 h-[42px] flex items-center justify-center gap-2"
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
              <LoanReportTemplate
                data={reportData}
                formattedDateRange={formattedDateRange}
                todayStr={todayStr}
                totalAmount={totalAmount}
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
