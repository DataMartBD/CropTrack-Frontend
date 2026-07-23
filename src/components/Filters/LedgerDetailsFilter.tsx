import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getData } from "../../services/apiClient";
import SearchableSelect from "../ui/ut/SearchableSelect";
import { useProjectOptionsWithAll } from "../../hooks/useProjectOptions";

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

interface LedgerDetailsFilterProps {
  formData: {
    frdate: string;
    todate: string;
    project: string;
    facc: string;
    subacc: string;
    [key: string]: any;
  };
  setFormData: (data: any) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

const LedgerDetailsFilter: React.FC<LedgerDetailsFilterProps> = ({
  formData,
  setFormData,
  onGenerate,
  isLoading = false,
}) => {
  const { projects, loading: loadingProjects } = useProjectOptionsWithAll();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
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
    setFormData({ ...formData, facc: xacc, subacc: "" });
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

  const handleDateChange = (field: string, date: Date | null) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setFormData({ ...formData, [field]: `${year}-${month}-${day}` });
    }
  };

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-6 rounded-xl mb-6 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {/* Project Picker */}
        <div className="flex-1 min-w-[150px]">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Unit
          </label>
          <select
            value={formData.project}
            onChange={(e) =>
              setFormData({ ...formData, project: e.target.value })
            }
            disabled={loadingProjects}
            className="h-[42px] w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white disabled:opacity-50"
          >
            {projects.map((p) => (
              <option key={p.code} value={p.code} className="dark:bg-gray-900">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* From Date */}
        <div className="flex-1 min-w-[150px]">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
            From Date
          </label>
          <DatePicker
            selected={formData.frdate ? new Date(formData.frdate) : null}
            onChange={(date) => handleDateChange("frdate", date)}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500 h-[42px]"
            dateFormat="yyyy-MM-dd"
          />
        </div>

        {/* To Date */}
        <div className="flex-1 min-w-[150px]">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
            To Date
          </label>
          <DatePicker
            selected={formData.todate ? new Date(formData.todate) : null}
            onChange={(date) => handleDateChange("todate", date)}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:text-white dark:focus:border-brand-500 h-[42px]"
            dateFormat="yyyy-MM-dd"
          />
        </div>

        {/* Account */}
        <div className="flex-1 min-w-[150px]">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Account
          </label>
          <SearchableSelect
            options={accountOptions}
            value={formData.facc}
            onChange={(val) => handleAccountChange(val)}
            placeholder="All Accounts"
            labelRenderer={(opt) => (
              <span className="text-sm">
                {opt.xacc ? `${opt.xacc} - ${opt.xdesc}` : opt.xdesc}
              </span>
            )}
          />
        </div>

        {/* Sub Account */}
        <div className="flex-1 min-w-[150px]">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Sub Account
          </label>
          <SearchableSelect
            options={subAccountOptions}
            value={formData.subacc}
            onChange={(val) => setFormData({ ...formData, subacc: val })}
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

        {/* Generate Button */}
        <div className="flex-1 min-w-[150px]">
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="w-full h-[42px] bg-[#13725A] hover:bg-[#105E4A] text-white font-medium rounded-lg transition-all shadow-sm flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-t-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Generate Report"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LedgerDetailsFilter;
