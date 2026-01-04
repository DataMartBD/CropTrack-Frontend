import { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getData, postData } from "../../../services/apiClient";
import { Spinner } from "../../../components/ui/ut/Spinner";
import { FiPlusCircle, FiTrash2, FiSave, FiArrowLeft } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router";

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

interface JournalHeader {
  xdate: Date;
  xlong: string;
  xyear: number;
  xper: number;
  xref: string;
  xstatusjv: string;
  xtrngl: string;
}

interface JournalDetail {
  id: string;
  xrow: number;
  xacc: string;
  xsub: string;
  xprime: number;
  xlong: string;
  debit: string;
  credit: string;
  accountName: string;
  accountSource: string;
}

export default function JournalVoucherEntry() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [subAccountCache, setSubAccountCache] = useState<
    Record<string, SubAccount[]>
  >({});

  const [header, setHeader] = useState<JournalHeader>({
    xdate: new Date(),
    xlong: "",
    xyear: new Date().getFullYear(),
    xper: new Date().getMonth() + 1,
    xref: "",
    xstatusjv: "Open",
    xtrngl: "JV--",
  });

  const [details, setDetails] = useState<JournalDetail[]>([
    {
      id: crypto.randomUUID(),
      xrow: 1,
      xacc: "",
      xsub: "",
      xprime: 0,
      xlong: "",
      debit: "",
      credit: "",
      accountName: "",
      accountSource: "",
    },
  ]);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const data = await getData<Account[]>("/accounts/chartofaccounts/");
        setAccounts(data || []);
      } catch (err) {
        console.error("Failed to load accounts", err);
        toast.error("Failed to load accounts list");
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

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

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const addRow = () => {
    setDetails((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        xrow: prev.length + 1,
        xacc: "",
        xsub: "",
        xprime: 0,
        xlong: "",
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
    value: any
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
      })
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
          : row
      )
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
        normalizedData = response;
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
      0
    );
    const totalCredit = details.reduce(
      (sum, row) => sum + (parseFloat(row.credit) || 0),
      0
    );
    return {
      debit: totalDebit,
      credit: totalCredit,
      diff: totalDebit - totalCredit,
    };
  }, [details]);

  const handleSubmit = async () => {
    setTriedSubmit(true);
    if (!header.xref.trim()) {
      toast.error("Reference is required");
      return;
    }
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
        xref: header.xref,
        details: details.map((d) => ({
          xrow: d.xrow,
          xacc: d.xacc,
          xsub: d.xsub,
          xprime: d.xprime,
          xbase: d.xprime,
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
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Crop Track - New Journal Voucher"
        description="Create New Journal Voucher"
      />
      <PageBreadcrumb pageTitle="New Journal Voucher" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] xl:p-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Go Back"
          >
            <FiArrowLeft
              size={24}
              className="text-gray-600 dark:text-gray-300"
            />
          </button>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Voucher Header
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={header.xdate}
              onChange={handleDateChange}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:ring-0 dark:border-gray-700 dark:text-gray-200"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Year / Period
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={header.xyear}
                className="w-1/2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800"
                title="Year"
              />
              <input
                type="text"
                readOnly
                value={header.xper}
                className="w-1/2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800"
                title="Period"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Reference <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="xref"
              value={header.xref}
              onChange={handleHeaderChange}
              className={`w-full rounded-lg border px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:ring-0 dark:bg-transparent dark:text-gray-200 ${
                triedSubmit && !header.xref.trim()
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              }`}
              placeholder="Ref No"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Narration <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="xlong"
              value={header.xlong}
              onChange={handleHeaderChange}
              className={`w-full rounded-lg border px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:ring-0 dark:bg-transparent dark:text-gray-200 ${
                triedSubmit && !header.xlong.trim()
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              }`}
              placeholder="Voucher Narrative"
            />
          </div>
        </div>

        <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white flex justify-between items-center">
          <span>Transaction Details</span>
          <button
            onClick={addRow}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <FiPlusCircle size={16} /> Add Row
          </button>
        </h3>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <table className="w-full min-w-[1000px] border-collapse bg-white text-left text-sm dark:bg-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-900 dark:text-white w-12">
                  #
                </th>
                <th className="px-4 py-3 font-medium text-gray-900 dark:text-white w-64">
                  Account <span className="text-red-500">*</span>
                </th>
                <th className="px-4 py-3 font-medium text-gray-900 dark:text-white w-48">
                  Sub Account / Customer
                </th>
                <th className="px-4 py-3 font-medium text-gray-900 dark:text-white w-48">
                  Description
                </th>
                <th className="px-4 py-3 font-medium text-gray-900 dark:text-white w-32 text-right">
                  Debit
                </th>
                <th className="px-4 py-3 font-medium text-gray-900 dark:text-white w-32 text-right">
                  Credit
                </th>
                <th className="px-4 py-3 font-medium text-gray-900 dark:text-white w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 border-t border-gray-200 dark:border-gray-700">
              {details.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {row.xrow}
                  </td>

                  <td className="px-4 py-3">
                    <select
                      className={`w-full rounded border bg-transparent px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-0 dark:text-gray-200 ${
                        triedSubmit && !row.xacc
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      value={row.xacc}
                      onChange={(e) =>
                        handleAccountSelect(row.id, e.target.value)
                      }
                    >
                      <option value="">Select Account</option>
                      {accounts.map((acc) => (
                        <option key={acc.xacc} value={acc.xacc}>
                          {acc.xacc} - {acc.xdesc}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    {row.accountSource === "Subaccount" ||
                    row.accountSource === "Customer" ? (
                      <select
                        className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-0 dark:border-gray-600 dark:text-gray-200"
                        value={row.xsub}
                        onChange={(e) =>
                          handleDetailChange(row.id, "xsub", e.target.value)
                        }
                      >
                        <option value="">Select {row.accountSource}</option>
                        {getSubOptions(row).map((sub, idx) => (
                          <option key={idx} value={sub.xsub}>
                            {sub.xdesc}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="text"
                      className="w-full rounded border border-gray-300 bg-transparent px-3 py-1.5 text-sm focus:border-brand-500 focus:ring-0 dark:border-gray-600 dark:text-gray-200"
                      value={row.xlong}
                      onChange={(e) =>
                        handleDetailChange(row.id, "xlong", e.target.value)
                      }
                      placeholder="Description"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      className={`w-full rounded border bg-transparent px-3 py-1.5 text-right text-sm focus:border-brand-500 focus:ring-0 dark:text-gray-200 ${
                        triedSubmit && row.xprime === 0
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      value={row.debit}
                      onChange={(e) =>
                        handleDetailChange(row.id, "debit", e.target.value)
                      }
                      placeholder="0.00"
                      min="0"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <input
                      type="number"
                      className={`w-full rounded border bg-transparent px-3 py-1.5 text-right text-sm focus:border-brand-500 focus:ring-0 dark:text-gray-200 ${
                        triedSubmit && row.xprime === 0
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      value={row.credit}
                      onChange={(e) =>
                        handleDetailChange(row.id, "credit", e.target.value)
                      }
                      placeholder="0.00"
                      min="0"
                    />
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-red-500 hover:text-red-700 transition"
                      title="Remove Row"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-gray-100">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right">
                  Totals:
                </td>
                <td className="px-4 py-3 text-right">
                  {totals.debit.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  {totals.credit.toFixed(2)}
                </td>
                <td></td>
              </tr>
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-2 text-right text-xs uppercase tracking-wide text-gray-500"
                >
                  Difference:
                </td>
                <td
                  colSpan={2}
                  className={`px-4 py-2 text-center ${
                    Math.abs(totals.diff) === 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {Math.abs(totals.diff).toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => navigate("/accounts/journal-voucher")}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all w-[160px]
    ${
      submitting
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-brand-500 hover:bg-brand-600 shadow-brand-500/20"
    }`}
          >
            {submitting ? <ButtonSpinner /> : <FiSave size={18} />}
            <span>{submitting ? "Saving..." : "Save Voucher"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
