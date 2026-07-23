import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getData } from "../../../services/apiClient";

interface ShareholderModel {
  pk: string;
  xrow: number;
  heir_name: string;
  xrelation: string;
  xproj: string;
  xproj_name?: string;
  xacc: string | null;
  xpercentage: string;
  xremarks: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  business_id: number;
  created_by: number;
  updated_by: number;
}

interface HeirRow {
  xrow: number;
  heir_name: string;
  xrelation: string;
  // percentage per project key
  percentages: Record<string, number>;
}

const formatPct = (val: number) =>
  val.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });

// The Central Account column holds the overall total, so it is rendered last
// and styled like a total column.
const isCentralAccount = (proj: string) =>
  (proj || "").trim().toLowerCase() === "central account";

export default function ShareholderList() {
  const { t } = useTranslation();
  const [shareholders, setShareholders] = useState<ShareholderModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Unique project columns (xproj), sorted with Central Account pinned last
  const projects = useMemo(() => {
    const unique = Array.from(
      new Set(shareholders.map((s) => s.xproj).filter(Boolean)),
    );
    return unique.sort((a, b) => {
      const aCentral = isCentralAccount(a);
      const bCentral = isCentralAccount(b);
      if (aCentral !== bCentral) return aCentral ? 1 : -1;
      return a.localeCompare(b);
    });
  }, [shareholders]);

  // Column headers read the unit name. The columns stay keyed by xproj — that
  // key is what the percentage map, the column totals and the Central Account
  // check all use, and it is the only value guaranteed to be present.
  const projectNames = useMemo(() => {
    const names: Record<string, string> = {};
    shareholders.forEach((s) => {
      if (s.xproj && s.xproj_name && !names[s.xproj]) {
        names[s.xproj] = s.xproj_name;
      }
    });
    return names;
  }, [shareholders]);

  // Pivot the flat list into one row per heir, with a column per project
  const heirRows = useMemo<HeirRow[]>(() => {
    const map = new Map<string, HeirRow>();

    shareholders.forEach((s) => {
      const key = s.heir_name || "—";
      let row = map.get(key);
      if (!row) {
        row = {
          xrow: s.xrow,
          heir_name: key,
          xrelation: s.xrelation || "",
          percentages: {},
        };
        map.set(key, row);
      }
      const pct = parseFloat(s.xpercentage) || 0;
      row.percentages[s.xproj] = (row.percentages[s.xproj] || 0) + pct;
      if (!row.xrelation && s.xrelation) row.xrelation = s.xrelation;
      // A heir spans several records (one per project); order by the earliest.
      if (s.xrow != null && (row.xrow == null || s.xrow < row.xrow))
        row.xrow = s.xrow;
    });

    return Array.from(map.values()).sort((a, b) => a.xrow - b.xrow);
  }, [shareholders]);

  // Name search (frontend)
  const filteredRows = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();
    if (!searchLower) return heirRows;
    return heirRows.filter((r) =>
      r.heir_name.toLowerCase().includes(searchLower),
    );
  }, [heirRows, searchQuery]);

  // Column totals (per project) across the filtered rows
  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredRows.forEach((row) => {
      projects.forEach((p) => {
        totals[p] = (totals[p] || 0) + (row.percentages[p] || 0);
      });
    });
    return totals;
  }, [filteredRows, projects]);

  const fetchShareholders = async () => {
    setIsLoading(true);
    try {
      const data = await getData<ShareholderModel[]>(
        "/accounts/Shareholder/create/",
      );
      setShareholders(data || []);
    } catch (error) {
      console.error("Error fetching shareholders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShareholders();
  }, []);

  return (
    <div>
      <PageMeta
        title="Shareholder List - CropTrack"
        description="Shareholder List - CropTrack"
      />
      <PageBreadcrumb pageTitle="Shareholder List" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-7">
        {/* Search */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
            {t("name")}
          </label>
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-[42px]"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                  Loading shareholder data...
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/20">
                  <th className="w-14 px-6 py-3 text-left text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    👤 Heir Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-blue-700 dark:text-blue-300">
                    🔗 Relation
                  </th>
                  {projects.map((p) => {
                    const central = isCentralAccount(p);
                    return (
                      <th
                        key={p}
                        className={`px-6 py-3 text-right text-xs uppercase ${
                          central
                            ? "font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/15"
                            : "font-semibold text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {projectNames[p] || p}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={projects.length + 3}
                      className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No shareholders found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, idx) => (
                    <tr
                      key={row.heir_name}
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
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300">
                        {row.xrelation}
                      </td>
                      {projects.map((p) => {
                        const central = isCentralAccount(p);
                        const value = row.percentages[p];
                        return (
                          <td
                            key={p}
                            className={`px-6 py-4 text-right text-sm ${
                              central
                                ? "font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10"
                                : "text-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {value != null ? `${formatPct(value)}%` : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
              {filteredRows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-blue-300 bg-blue-100 font-bold dark:border-blue-700 dark:bg-blue-900/30">
                    <td
                      colSpan={3}
                      className="px-6 py-3 text-sm uppercase tracking-wide text-blue-800 dark:text-blue-200"
                    >
                      Total
                    </td>
                    {projects.map((p) => {
                      const central = isCentralAccount(p);
                      return (
                        <td
                          key={p}
                          className={`px-6 py-3 text-right text-sm ${
                            central
                              ? "text-amber-800 dark:text-amber-200 bg-amber-200 dark:bg-amber-500/20"
                              : "text-blue-800 dark:text-blue-200"
                          }`}
                        >
                          {`${formatPct(columnTotals[p] || 0)}%`}
                        </td>
                      );
                    })}
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
