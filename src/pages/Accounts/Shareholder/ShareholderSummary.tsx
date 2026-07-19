import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getData } from "../../../services/apiClient";

interface ProjectCode {
  xtype: string;
  xcode: string;
}

interface SummaryRow {
  heir_name: string;
  xproj: string;
  xacc: string;
  opening_balance: number;
  deposit: number;
  expense: number;
  closing_balance: number;
  receivable: number;
  payable: number;
}

interface SummaryTotals {
  deposit: number;
  expense: number;
  receivable: number;
  payable: number;
  net_total: number;
}

interface SummaryResponse {
  xproj: string;
  start_date: string;
  end_date: string;
  rows: SummaryRow[];
  totals: SummaryTotals;
}

const formatAmount = (val: number) =>
  (val || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const amountClass = (val: number) =>
  val < 0
    ? "text-red-600 dark:text-red-400"
    : val > 0
      ? "text-green-700 dark:text-green-400"
      : "text-gray-800 dark:text-gray-300";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ShareholderSummary() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [startDate, setStartDate] = useState<Date | null>(firstOfMonth);
  const [endDate, setEndDate] = useState<Date | null>(now);
  const [project, setProject] = useState<string>("");
  const [projects, setProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [data, setData] = useState<SummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Project options — the report is always scoped to a single project, so the
  // first one is selected by default.
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const result = await getData<ProjectCode[]>(
          "/masterdata/common-codes/list/",
          { xtype: "Project" },
        );
        const codes = Array.from(
          new Set((result || []).map((p) => p.xcode).filter(Boolean)),
        );
        setProjects(codes);
        setProject((prev) => prev || codes[0] || "");
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const fetchReport = async () => {
    if (!project || !startDate || !endDate) return;
    setIsLoading(true);
    try {
      const response = await axios.get("/accounts/Shareholder/summary/", {
        params: {
          xproj: project,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate),
        },
      });
      const payload = response.data?.data ?? response.data;
      setData(payload?.rows ? (payload as SummaryResponse) : null);
      setHasFetched(true);
    } catch (error) {
      console.error("Error fetching shareholder summary:", error);
      setData(null);
      setHasFetched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const rows = data?.rows || [];
  const totals = data?.totals || null;

  return (
    <div>
      <PageMeta
        title="Shareholder Summary - CropTrack"
        description="Shareholder Summary - CropTrack"
      />
      <PageBreadcrumb pageTitle="Shareholder Summary" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-7">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Project
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              disabled={loadingProjects}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500 disabled:opacity-50 h-[42px]"
            >
              {projects.length === 0 && <option value="">—</option>}
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500 h-[42px]"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500 h-[42px]"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <button
              onClick={fetchReport}
              disabled={isLoading || !project || !startDate || !endDate}
              className="w-full px-6 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[42px]"
            >
              {isLoading ? "Loading..." : "Get"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="flex flex-col items-center">
                <svg
                  className="w-10 h-10 animate-spin text-blue-500"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  Loading summary data...
                </p>
              </div>
            </div>
          ) : !hasFetched ? (
            <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
              Select Project, Start Date and End Date, then click "Get" to view
              the report.
            </div>
          ) : (
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20">
                  <th className="w-14 px-6 py-3 text-left text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    👤 Heir Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    Opening Balance
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    Deposit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    Expense
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    Payable
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    Receivable
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    Closing Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr
                      key={`${row.xacc}-${idx}`}
                      className={`transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-900/10 ${
                        idx % 2 === 0
                          ? "bg-white dark:bg-transparent"
                          : "bg-gray-50/70 dark:bg-white/[0.02]"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-300">
                        {row.heir_name}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm ${amountClass(row.opening_balance)}`}
                      >
                        {formatAmount(row.opening_balance)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-800 dark:text-gray-300">
                        {formatAmount(row.deposit)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-800 dark:text-gray-300">
                        {formatAmount(row.expense)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-800 dark:text-gray-300">
                        {formatAmount(row.payable)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-800 dark:text-gray-300">
                        {formatAmount(row.receivable)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm ${amountClass(row.closing_balance)}`}
                      >
                        {formatAmount(row.closing_balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {rows.length > 0 && totals && (
                <tfoot>
                  <tr className="border-t-2 border-blue-300 bg-blue-100 font-bold dark:border-blue-700 dark:bg-blue-900/30">
                    {/* Opening/Closing have no API-side total, so they stay blank */}
                    <td
                      colSpan={3}
                      className="px-6 py-3 text-sm uppercase tracking-wide text-blue-800 dark:text-blue-200"
                    >
                      Total
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-blue-800 dark:text-blue-200">
                      {formatAmount(totals.deposit)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-blue-800 dark:text-blue-200">
                      {formatAmount(totals.expense)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-blue-800 dark:text-blue-200">
                      {formatAmount(totals.payable)}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-blue-800 dark:text-blue-200">
                      {formatAmount(totals.receivable)}
                    </td>
                    <td className="px-6 py-3" />
                  </tr>
                  <tr className="bg-amber-100 font-bold dark:bg-amber-500/15">
                    <td
                      colSpan={7}
                      className="px-6 py-3 text-right text-sm uppercase tracking-wide text-amber-800 dark:text-amber-200"
                    >
                      Net Total
                    </td>
                    <td
                      className={`px-6 py-3 text-right text-sm bg-amber-200 dark:bg-amber-500/20 ${amountClass(totals.net_total)}`}
                    >
                      {formatAmount(totals.net_total)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
