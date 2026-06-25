import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getData } from "../../../services/apiClient";

interface ProjectCode {
  xtype: string;
  xcode: string;
}

type ReportType = "summary" | "details";

interface IncomeRow {
  xproj: string;
  xhrc1?: string; // present in summary rows
  xacc?: string; // present in details rows
  xdesc: string;
  total_income: number;
  total_expenditure: number;
  totalpl: number;
}

interface IncomeTotals {
  total_income: number;
  total_expenditure: number;
  totalpl: number;
}

interface IncomeResponse {
  type: ReportType;
  from_date: string;
  to_date: string;
  rows: IncomeRow[];
  totals: IncomeTotals;
}

const PAGE_SIZE = 20;

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

export default function DayWiseIncome() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [fromDate, setFromDate] = useState<Date | null>(firstOfMonth);
  const [toDate, setToDate] = useState<Date | null>(now);
  const [project, setProject] = useState<string>("All");
  const [projects, setProjects] = useState<string[]>(["All"]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("summary");

  const [data, setData] = useState<IncomeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [page, setPage] = useState(1);

  // Project options
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const result = await getData<ProjectCode[]>(
          "/masterdata/common-codes/list/",
          { xtype: "Project" },
        );
        const codes = (result || []).map((p) => p.xcode).filter(Boolean);
        setProjects(["All", ...Array.from(new Set(codes))]);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Re-fetch automatically when the report type is toggled (after first Get)
  useEffect(() => {
    if (!hasFetched) return;
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType]);

  const fetchReport = async () => {
    if (!fromDate || !toDate) return;
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        from_date: formatDate(fromDate),
        to_date: formatDate(toDate),
        report_type: reportType,
      };
      if (project !== "All") {
        params.xproj = project;
      }

      const response = await axios.get(
        "/accounts/report/income-statement/",
        { params },
      );
      setData((response.data?.data as IncomeResponse) || null);
      setPage(1);
      setHasFetched(true);
    } catch (error) {
      console.error("Error fetching day-wise income:", error);
      setData(null);
      setHasFetched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const rows = data?.rows || [];
  const totals = data?.totals || null;
  const isDetails = data?.type === "details";

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);

  return (
    <div>
      <PageMeta
        title="Day-wise Income - CropTrack"
        description="Day-wise Income Statement - CropTrack"
      />
      <PageBreadcrumb pageTitle="Day-wise Income" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-7">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              From Date
            </label>
            <DatePicker
              selected={fromDate}
              onChange={(date) => setFromDate(date)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500 h-[42px]"
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
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500 h-[42px]"
              dateFormat="yyyy-MM-dd"
            />
          </div>

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
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Summary / Details toggle */}
          <div className="flex-1 min-w-[200px]">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Report Type
            </label>
            <div className="inline-flex h-[42px] w-full rounded-lg border border-gray-300 bg-gray-50 p-1 dark:border-gray-700 dark:bg-white/[0.03]">
              {(["summary", "details"] as ReportType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setReportType(type)}
                  className={`flex-1 rounded-md text-sm font-medium capitalize transition-colors ${
                    reportType === type
                      ? "bg-[#13725A] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-[140px]">
            <button
              onClick={fetchReport}
              disabled={isLoading || !fromDate || !toDate}
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
                  Loading income data...
                </p>
              </div>
            </div>
          ) : !hasFetched ? (
            <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
              Select a date range, project and report type, then click "Get" to
              view the report.
            </div>
          ) : (
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    🏷️ Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    {isDetails ? "Account" : "Level"}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    Income
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    Expenditure
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold uppercase text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/15">
                    Total P/L
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, idx) => (
                    <tr
                      key={`${row.xacc || row.xhrc1}-${idx}`}
                      className={`transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-900/10 ${
                        idx % 2 === 0
                          ? "bg-white dark:bg-transparent"
                          : "bg-gray-50/70 dark:bg-white/[0.02]"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300">
                        {row.xproj}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-gray-300">
                        {isDetails ? row.xacc : row.xhrc1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300">
                        {row.xdesc}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm ${amountClass(row.total_income)}`}
                      >
                        {formatAmount(row.total_income)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm ${amountClass(row.total_expenditure)}`}
                      >
                        {formatAmount(row.total_expenditure)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm font-bold bg-amber-50 dark:bg-amber-500/10 ${amountClass(row.totalpl)}`}
                      >
                        {formatAmount(row.totalpl)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {rows.length > 0 && totals && (
                <tfoot>
                  <tr className="border-t-2 border-blue-300 bg-blue-100 font-bold dark:border-blue-700 dark:bg-blue-900/30">
                    <td
                      colSpan={3}
                      className="px-6 py-3 text-sm uppercase tracking-wide text-blue-800 dark:text-blue-200"
                    >
                      Total ({rows.length})
                    </td>
                    <td
                      className={`px-6 py-3 text-right text-sm ${amountClass(totals.total_income)}`}
                    >
                      {formatAmount(totals.total_income)}
                    </td>
                    <td
                      className={`px-6 py-3 text-right text-sm ${amountClass(totals.total_expenditure)}`}
                    >
                      {formatAmount(totals.total_expenditure)}
                    </td>
                    <td
                      className={`px-6 py-3 text-right text-sm bg-amber-200 dark:bg-amber-500/20 ${amountClass(totals.totalpl)}`}
                    >
                      {formatAmount(totals.totalpl)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && rows.length > PAGE_SIZE && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, rows.length)} of {rows.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[36px] px-3 py-1.5 text-sm font-medium rounded-lg border ${
                    p === page
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
