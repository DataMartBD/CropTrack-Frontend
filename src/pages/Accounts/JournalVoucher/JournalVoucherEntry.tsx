import { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getData, postData } from "../../../services/apiClient";
import { Spinner } from "../../../components/ui/ut/Spinner";
import {
  FiPlusCircle,
  FiTrash2,
  FiSave,
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiFileText,
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";
import SearchableSelect from "../../../components/ui/ut/SearchableSelect";

const ButtonSpinner = () => (
  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

interface Account {
  xacc: string;
  xdesc: string;
  xacctype: string;
  xaccusage: string;
  xaccsource: string;
}

interface SubAccount {
  xacc: string;
  xsub: string;
  xdesc: string;
  customer_code?: string;
  customer_name?: string;
}

interface ProjectCode {
  xtype: string;
  xcode: string;
}

interface JournalHeader {
  xdate: Date;
  xlong: string;
  xyear: number;
  xper: number;
  xstatusjv: string;
  xtrngl: string;
}

interface JournalDetail {
  id: string;
  xrow: number;
  xacc: string;
  xsub: string;
  xproj: string;
  xprime: number;
  xlong: string;
  xqty: string;
  debit: string;
  credit: string;
  accountName: string;
  accountSource: string;
}

const formatAmount = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function JournalVoucherEntry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [projects, setProjects] = useState<ProjectCode[]>([]);

  const [subAccountCache, setSubAccountCache] = useState<
    Record<string, SubAccount[]>
  >({});

  const [header, setHeader] = useState<JournalHeader>({
    xdate: new Date(),
    xlong: "",
    xyear: new Date().getFullYear(),
    xper: new Date().getMonth() + 1,
    xstatusjv: "Open",
    xtrngl: "JV--",
  });

  const [details, setDetails] = useState<JournalDetail[]>([
    {
      id: Math.random().toString(36).substring(2, 9),
      xrow: 1,
      xacc: "",
      xsub: "",
      xproj: "",
      xprime: 0,
      xlong: "",
      xqty: "",
      debit: "",
      credit: "",
      accountName: "",
      accountSource: "",
    },
  ]);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const [accountsData, projectsData] = await Promise.all([
          getData<Account[]>("/accounts/chartofaccounts/"),
          getData<ProjectCode[]>("/masterdata/common-codes/list/", {
            xtype: "Project",
          }),
        ]);
        setAccounts(accountsData || []);
        setProjects(projectsData || []);
      } catch (err) {
        console.error("Failed to load initial data", err);
        toast.error("Failed to load accounts or projects");
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const accountOptions = useMemo(() => {
    return accounts.map((acc) => ({
      ...acc,
      customer_code: acc.xacc,
      customer_name: acc.xdesc,
    }));
  }, [accounts]);

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setHeader((prev) => ({
        ...prev,
        xdate: date,
        xyear: date.getFullYear(),
        xper: date.getMonth() + 1,
      }));
    }
  };

  const addRow = () => {
    setDetails((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        xrow: prev.length + 1,
        xacc: "",
        xsub: "",
        xproj: "",
        xprime: 0,
        xlong: "",
        xqty: "",
        debit: "",
        credit: "",
        accountName: "",
        accountSource: "",
      },
    ]);
  };

  const removeRow = (id: string) => {
    if (details.length === 1) return;
    setDetails((prev) => {
      const filtered = prev.filter((row) => row.id !== id);
      return filtered.map((row, index) => ({ ...row, xrow: index + 1 }));
    });
  };

  const handleDetailChange = (
    id: string,
    field: keyof JournalDetail,
    value: any,
  ) => {
    setDetails((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          if (field === "debit") {
            const debVal = parseFloat(value) || 0;
            updatedRow.credit = "";
            updatedRow.xprime = debVal;
          } else if (field === "credit") {
            const credVal = parseFloat(value) || 0;
            updatedRow.debit = "";
            updatedRow.xprime = -credVal;
          }

          return updatedRow;
        }
        return row;
      }),
    );
  };

  const handleAccountSelect = async (id: string, xacc: string) => {
    const account = accounts.find((a) => a.xacc === xacc);
    if (!account) return;

    setDetails((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              xacc: account.xacc,
              accountName: account.xdesc,
              accountSource: account.xaccsource,
              xsub: "",
            }
          : row,
      ),
    );

    if (
      account.xaccsource === "Subaccount" ||
      account.xaccsource === "Customer"
    ) {
      fetchSubAccounts(account.xacc, account.xaccsource);
    }
  };

  const fetchSubAccounts = async (xacc: string, source: string) => {
    const cacheKey = `${xacc}-${source}`;
    if (subAccountCache[cacheKey]) return;

    try {
      let endpoint = "";
      if (source === "Subaccount") {
        endpoint = `/accounts/subaccounts/${xacc}/`;
      } else if (source === "Customer") {
        endpoint = `/masterdata/customers/list/`;
      }

      const response: any = await getData(endpoint);
      let normalizedData: SubAccount[] = [];

      if (source === "Subaccount") {
        normalizedData = (response as any[]).map((s) => ({
          ...s,
          customer_code: s.xsub,
          customer_name: s.xdesc,
        }));
      } else if (source === "Customer") {
        normalizedData = (response as any[]).map((c) => ({
          xacc: xacc,
          xsub: c.customer_code,
          xdesc: c.customer_name,
          customer_code: c.customer_code,
          customer_name: c.customer_name,
        }));
      }

      setSubAccountCache((prev) => ({ ...prev, [cacheKey]: normalizedData }));
    } catch (err) {
      console.error(`Failed to load ${source} data`, err);
      toast.error(`Failed to load ${source} options`);
    }
  };

  const getSubOptions = (row: JournalDetail) => {
    if (!row.xacc || !row.accountSource) return [];
    const cacheKey = `${row.xacc}-${row.accountSource}`;
    return subAccountCache[cacheKey] || [];
  };

  const totals = useMemo(() => {
    const totalDebit = details.reduce(
      (sum, row) => sum + (parseFloat(row.debit) || 0),
      0,
    );
    const totalCredit = details.reduce(
      (sum, row) => sum + (parseFloat(row.credit) || 0),
      0,
    );
    return {
      debit: totalDebit,
      credit: totalCredit,
      diff: totalDebit - totalCredit,
    };
  }, [details]);

  const handleSubmit = async () => {
    setTriedSubmit(true);
    if (!header.xlong.trim()) {
      toast.error("Narration is required");
      return;
    }

    if (Math.abs(totals.diff) > 0.01) {
      toast.error("Debit and Credit must be equal");
      return;
    }
    if (details.some((d) => !d.xacc)) {
      toast.error("All rows must have an account selected");
      return;
    }
    if (details.some((d) => !d.xproj)) {
      toast.error("All rows must have a project selected");
      return;
    }
    if (details.some((d) => d.xprime === 0)) {
      toast.error("All rows must have a debit or credit value");
      return;
    }

    setSubmitting(true);
    try {
      const year = header.xdate.getFullYear();
      const month = String(header.xdate.getMonth() + 1).padStart(2, "0");
      const day = String(header.xdate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const payload = {
        xdate: formattedDate,
        xlong: header.xlong,
        xyear: year,
        xper: header.xdate.getMonth() + 1,
        xtrngl: header.xtrngl,
        xref: "",
        details: details.map((d) => ({
          xrow: d.xrow,
          xacc: d.xacc,
          xsub: d.xsub,
          xproj: d.xproj,
          xprime: d.xprime,
          xbase: d.xprime,
          xqty: d.xqty.trim() === "" ? null : parseFloat(d.xqty) || 0,
          xlong: d.xlong || header.xlong,
        })),
      };

      await postData("/accounts/Journal-voucher/", payload);
      toast.success("Journal Voucher created successfully");
      navigate("/accounts/journal-voucher");
    } catch (err) {
      console.error("Failed to create JV", err);
      toast.error("Failed to create Journal Voucher");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="pb-32">
      <Toaster
        position="top-right"
        containerStyle={{ top: 80 }}
        toastOptions={{
          duration: 4000,
          error: { duration: 6000 },
        }}
      />
      <PageMeta
        title="Crop Track - New Journal Voucher"
        description="Create New Journal Voucher"
      />
      <PageBreadcrumb pageTitle="New Journal Voucher" />

      {/* Top Header Card */}
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 dark:from-white/[0.03] dark:to-white/[0.01] dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02] px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Go Back"
            >
              <FiArrowLeft
                size={20}
                className="text-gray-600 dark:text-gray-300"
              />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-500/10 text-brand-500">
                <FiBookOpen size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                  New Journal Voucher
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Record a general-ledger entry
                </p>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Draft · {header.xstatusjv}
          </span>
        </div>

        {/* Header fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 px-5 py-5">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <FiCalendar size={12} /> Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={header.xdate}
              onChange={handleDateChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Fiscal Year / Period
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={header.xyear}
                className="w-1/2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                title="Year"
              />
              <input
                type="text"
                readOnly
                value={header.xper}
                className="w-1/2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                title="Period"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <FiFileText size={12} /> Narration <span className="text-red-500">*</span>
            </label>
            <textarea
              name="xlong"
              value={header.xlong}
              onChange={(e) =>
                setHeader((prev) => ({ ...prev, xlong: e.target.value }))
              }
              rows={2}
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:ring-0 dark:bg-gray-900 dark:text-gray-200 resize-y ${
                triedSubmit && !header.xlong.trim()
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              }`}
              placeholder="Being... (describe the nature of this entry)"
            />
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-5 py-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Transaction Details
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Debits must equal credits before saving
            </p>
          </div>
          <button
            onClick={addRow}
            className="flex items-center gap-2 rounded-lg border border-brand-500 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold text-brand-500 transition-colors hover:bg-brand-500 hover:text-white"
          >
            <FiPlusCircle size={14} /> Add Line
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/60 text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <th className="px-3 py-2.5 font-semibold w-10 text-center">#</th>
                <th className="px-3 py-2.5 font-semibold w-40 ">
                  Project <span className="text-red-500">*</span>
                </th>
                <th className="px-3 py-2.5 font-semibold w-72 ">
                  Account <span className="text-red-500">*</span>
                </th>
                <th className="px-3 py-2.5 font-semibold w-44">
                  Sub / Customer 
                </th>
                <th className="px-3 py-2.5 font-semibold w-48">Description</th>
                <th className="px-3 py-2.5 font-semibold w-28 text-right">
                  Qty
                </th>
                <th className="px-3 py-2.5 font-semibold w-32 text-right">
                  Debit
                </th>
                <th className="px-3 py-2.5 font-semibold w-32 text-right">
                  Credit
                </th>
                <th className="px-3 py-2.5 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {details.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-brand-500/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-3 py-2 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-mono text-gray-600 dark:text-gray-300">
                      {row.xrow}
                    </span>
                  </td>

                  <td className="px-3 py-2">
                    <select
                      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-0 dark:bg-gray-900 dark:text-gray-200 ${
                        triedSubmit && !row.xproj
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                      value={row.xproj}
                      onChange={(e) =>
                        handleDetailChange(row.id, "xproj", e.target.value)
                      }
                    >
                      <option value="">Select Project</option>
                      {projects.map((p) => (
                        <option key={p.xcode} value={p.xcode}>
                          {p.xcode}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-3 py-2">
                    <SearchableSelect
                      options={accountOptions}
                      value={row.xacc}
                      onChange={(val) => handleAccountSelect(row.id, val)}
                      placeholder="Select Account"
                      labelRenderer={(opt) => (
                        <span className="text-sm">
                          <span className="font-mono text-gray-500">
                            {opt.xacc}
                          </span>{" "}
                          — {opt.xdesc}
                        </span>
                      )}
                    />
                  </td>

                  <td className="px-3 py-2">
                    {row.accountSource === "Subaccount" ||
                    row.accountSource === "Customer" ? (
                      <SearchableSelect
                        options={getSubOptions(row) as any}
                        value={row.xsub}
                        onChange={(val) =>
                          handleDetailChange(row.id, "xsub", val)
                        }
                        placeholder={`--- Select ${row.accountSource}`}
                        labelRenderer={(opt) => (
                          <span className="text-sm">
                            <span className="font-mono text-gray-500">
                              {opt.xsub}
                            </span>{" "}
                            — {opt.xdesc}
                          </span>
                        )}
                      />
                    ) : (
                      <span className="inline-flex items-center justify-center w-full text-gray-300 dark:text-gray-600 text-xs italic">
                        n/a
                      </span>
                    )}
                  </td>

                  

                  <td className="px-3 py-2">
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                      value={row.xlong}
                      onChange={(e) =>
                        handleDetailChange(row.id, "xlong", e.target.value)
                      }
                      placeholder="Line memo"
                    />
                  </td>

                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-right font-mono text-sm focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                      value={row.xqty}
                      onChange={(e) =>
                        handleDetailChange(row.id, "xqty", e.target.value)
                      }
                      placeholder="0"
                    />
                  </td>

                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className={`w-full rounded-lg border bg-white px-3 py-2 text-right font-mono text-sm focus:border-brand-500 focus:ring-0 dark:bg-gray-900 dark:text-gray-200 ${
                        triedSubmit && row.xprime === 0
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                      value={row.debit}
                      onChange={(e) =>
                        handleDetailChange(row.id, "debit", e.target.value)
                      }
                      placeholder="0.00"
                      min="0"
                    />
                  </td>

                  <td className="px-3 py-2">
                    <input
                      type="number"
                      className={`w-full rounded-lg border bg-white px-3 py-2 text-right font-mono text-sm focus:border-brand-500 focus:ring-0 dark:bg-gray-900 dark:text-gray-200 ${
                        triedSubmit && row.xprime === 0
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                      value={row.credit}
                      onChange={(e) =>
                        handleDetailChange(row.id, "credit", e.target.value)
                      }
                      placeholder="0.00"
                      min="0"
                    />
                  </td>

                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={details.length === 1}
                      className="p-1.5 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors dark:hover:bg-red-500/10"
                      title="Remove Row"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-900/40 font-semibold text-gray-900 dark:text-gray-100">
              <tr>
                <td colSpan={6} className="px-3 py-3 text-right">
                  Totals:
                </td>
                <td className="px-3 py-3 text-right font-mono">
                  {formatAmount(totals.debit)}
                </td>
                <td className="px-3 py-3 text-right font-mono">
                  {formatAmount(totals.credit)}
                </td>
                <td></td>
              </tr>
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-2 text-right text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  Difference:
                </td>
                <td
                  colSpan={2}
                  className={`px-3 py-2 text-center font-mono ${
                    Math.abs(totals.diff) < 0.01
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatAmount(Math.abs(totals.diff))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
        <div className="mx-auto flex max-w-[1600px] items-center justify-end gap-4 px-6 py-3">
          <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
            {details.length} line{details.length !== 1 ? "s" : ""} ·{" "}
            <span className="font-mono">{formatAmount(totals.debit)}</span> Dr ·{" "}
            <span className="font-mono">{formatAmount(totals.credit)}</span> Cr
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/accounts/journal-voucher")}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`flex items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-md transition-all w-[170px] ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-brand-500 hover:bg-brand-600 shadow-brand-500/20"
              }`}
            >
              {submitting ? <ButtonSpinner /> : <FiSave size={16} />}
              <span>{submitting ? "Saving..." : "Save Voucher"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
