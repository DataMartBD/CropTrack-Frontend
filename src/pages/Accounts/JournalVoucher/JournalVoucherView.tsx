import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getData } from "../../../services/apiClient";
import { Spinner } from "../../../components/ui/ut/Spinner";
import { FiArrowLeft, FiPrinter, FiEdit } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { createRoot } from "react-dom/client";
import { toWords } from "number-to-words";
import { ReportHeader } from "../../../components/reports/ReportHeader";

interface JournalVoucherData {
  xvoucher: string;
  xdate: string;
  xref: string;
  xlong: string;
  xyear: number;
  xper: number;
  xstatusjv: string;
  xpostflag: string;
  created_by_name?: string;
  created_at?: string;
  posted_by?: string;
  posted_at?: string;
  gldetails_header: {
    xrow: number;
    xacc: string;
    xdesc_acc?: string;
    xsub: string;
    xprime: string | number;
    xlong: string;
  }[];
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

const JournalVoucherTemplate = ({
  voucher,
  accountsMap,
  subAccountsMap,
  totals,
}: {
  voucher: JournalVoucherData;
  accountsMap: Record<string, string>;
  subAccountsMap: Record<string, string>;
  totals: { debit: number; credit: number };
}) => {
  return (
    <div className="bg-white p-6 rounded-xl ring-1 ring-gray-200 shadow-sm print:ring-0 print:shadow-none print:p-0 max-w-[210mm] mx-auto min-h-[297mm] print:w-full print:max-w-none print:min-h-0 text-gray-900">
      <ReportHeader title="রাহবার হিমাগার (প্রাঃ) লিমিটেড ইউনিট - ৪">
        <p className="text-[10px] bg-white px-1.5 border border-zinc-200 rounded-sm">
          <span className="text-green-800 font-medium">মোবাইল:</span>{" "}
          ০১৭০১৮৮৯০৪, ০১৭৪০১৩৩১৪৪
        </p>
      </ReportHeader>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between bg-green-50 border-y border-green-800 py-1 px-3 mb-4">
          <div className="font-semibold text-sm bg-green-800 text-white px-3 py-0.5 rounded-full">
            JOURNAL VOUCHER
          </div>

          <div className="text-sm flex gap-4 text-gray-700">
            <span>
              Voucher:{" "}
              <span className="font-mono font-medium text-black">
                {voucher.xvoucher}
              </span>
            </span>
            <span className="text-xs border-l border-green-800 pl-4">
              Status:{" "}
              <span
                className={
                  voucher.xstatusjv === "Posted"
                    ? "text-green-700 font-medium"
                    : "text-amber-700 font-medium"
                }
              >
                {voucher.xstatusjv}
              </span>
            </span>
          </div>
        </div>

        <div className="border-b border-gray-100 pb-4 mb-4">
          <div className="flex justify-between items-start text-sm">
            <div className="flex-1 pr-4">
              <div className="grid grid-cols-[80px_1fr] gap-1 mb-1">
                <span className="text-gray-500">Reference:</span>
                <span className="text-gray-900">{voucher.xref || "N/A"}</span>
              </div>
              <div className="grid grid-cols-[80px_1fr] gap-1">
                <span className="text-gray-500">Narration:</span>
                <span className="text-gray-900 whitespace-pre-wrap leading-tight">
                  {voucher.xlong || "N/A"}
                </span>
              </div>
            </div>
            <div className="text-right min-w-[120px]">
              <div className="mb-1">
                <span className="text-gray-500 text-xs block">Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(voucher.xdate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                <th className="px-2 py-1.5 w-10 text-center font-medium">#</th>
                <th className="px-2 py-1.5 font-medium">Account Details</th>
                <th className="px-2 py-1.5 font-medium">Description</th>
                <th className="px-2 py-1.5 text-right w-28 font-medium">
                  Debit
                </th>
                <th className="px-2 py-1.5 text-right w-28 font-medium">
                  Credit
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {voucher.gldetails_header?.map((row, index) => {
                const debit =
                  parseFloat(String(row.xprime)) > 0
                    ? parseFloat(String(row.xprime))
                    : 0;
                const credit =
                  parseFloat(String(row.xprime)) < 0
                    ? Math.abs(parseFloat(String(row.xprime)))
                    : 0;
                const subName = row.xsub
                  ? subAccountsMap[`${row.xacc}-${row.xsub}`]
                  : "";

                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50/50 print:hover:bg-transparent text-[13px]"
                  >
                    <td className="px-2 py-1.5 text-center text-gray-400">
                      {row.xrow}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="text-gray-900">
                        {accountsMap[row.xacc] || "Unknown Account"}
                      </div>
                      <div className="text-gray-500 text-[10px]">
                        {row.xacc}
                        {row.xsub ? ` - ${subName || row.xsub}` : ""}
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-gray-600 max-w-xs truncate print:whitespace-normal print:overflow-visible">
                      {row.xlong}
                    </td>
                    <td className="px-2 py-1.5 text-right text-gray-700">
                      {debit > 0 ? debit.toFixed(2) : "-"}
                    </td>
                    <td className="px-2 py-1.5 text-right text-gray-700">
                      {credit > 0 ? credit.toFixed(2) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-gray-300 bg-gray-50/30 text-[13px]">
              <tr>
                <td
                  colSpan={5}
                  className="px-2 py-2 text-left border-b border-gray-100 pl-4"
                >
                  <span className="text-xs text-gray-500 mr-2">In Words:</span>
                  <span className="italic text-gray-700 capitalize">
                    {toWords(Math.floor(totals.debit))} Taka only
                  </span>
                </td>
              </tr>
              <tr className="font-medium text-gray-900">
                <td colSpan={3} className="px-2 py-1.5 text-right">
                  Total
                </td>
                <td className="px-2 py-1.5 text-right border-l border-gray-100">
                  {totals.debit.toFixed(2)}
                </td>
                <td className="px-2 py-1.5 text-right border-l border-gray-100">
                  {totals.credit.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-12 print:mt-auto pt-4">
          <div className="grid grid-cols-2 gap-12 text-center text-xs">
            <div className="mt-8 pt-1 border-t border-gray-300">
              <p className="font-medium text-gray-600">Prepared By</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {voucher.created_by_name || "System"}
              </p>
            </div>
            <div className="mt-8 pt-1 border-t border-gray-300">
              <p className="font-medium text-gray-600">Approved By</p>
            </div>
          </div>
          <div className="mt-4 text-center text-[9px] text-gray-300 print:text-gray-400 italic">
            Printed on {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};


export default function JournalVoucherView() {
  const { xvoucher } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState<JournalVoucherData | null>(null);
  const [accountsMap, setAccountsMap] = useState<Record<string, string>>({});
  const [subAccountsMap, setSubAccountsMap] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jvData, accountsData] = await Promise.all([
          getData<any>(`/accounts/Journal-voucher/${xvoucher}/`),
          getData<Account[]>("/accounts/chartofaccounts/"),
        ]);

        if (jvData) {
          setVoucher(jvData);

          const accMap: Record<string, string> = {};
          const accountsList = accountsData || [];
          accountsList.forEach((acc) => {
            accMap[acc.xacc] = acc.xdesc;
          });
          setAccountsMap(accMap);

          const uniqueSubLookups: { xacc: string; source: string }[] = [];
          jvData.gldetails_header?.forEach((row: any) => {
            const acc = accountsList.find((a) => a.xacc === row.xacc);
            if (
              acc &&
              (acc.xaccsource === "Subaccount" ||
                acc.xaccsource === "Customer") &&
              row.xsub
            ) {
              if (!uniqueSubLookups.some((u) => u.xacc === row.xacc)) {
                uniqueSubLookups.push({
                  xacc: row.xacc,
                  source: acc.xaccsource,
                });
              }
            }
          });

          const subMap: Record<string, string> = {};
          await Promise.all(
            uniqueSubLookups.map(async ({ xacc, source }) => {
              try {
                let endpoint = "";
                if (source === "Subaccount") {
                  endpoint = `/accounts/subaccounts/${xacc}/`;
                  const subs = await getData<SubAccount[]>(endpoint);
                  if (Array.isArray(subs)) {
                    subs.forEach(
                      (s) => (subMap[`${xacc}-${s.xsub}`] = s.xdesc)
                    );
                  }
                } else if (source === "Customer") {
                  endpoint = `/masterdata/customers/list/`;
                  const customers: any[] = await getData(endpoint);
                  customers.forEach(
                    (c) =>
                      (subMap[`${xacc}-${c.customer_code}`] = c.customer_name)
                  );
                }
              } catch (e) {
                console.warn("Failed to fetch sub info for", xacc);
              }
            })
          );
          setSubAccountsMap(subMap);
        }
      } catch (err) {
        console.error("Failed to load data", err);
        toast.error("Failed to load voucher data");
      } finally {
        setLoading(false);
      }
    };

    if (xvoucher) {
      fetchData();
    }
  }, [xvoucher]);

  const totals = useMemo(() => {
    if (!voucher?.gldetails_header) return { debit: 0, credit: 0 };
    return voucher.gldetails_header.reduce(
      (acc, row) => {
        const val = parseFloat(String(row.xprime));
        if (val > 0) acc.debit += val;
        else acc.credit += Math.abs(val);
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [voucher]);

  const handlePrint = () => {
    if (!voucher) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Inject styles (Tailwind + Custom)
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
      <JournalVoucherTemplate
        voucher={voucher}
        accountsMap={accountsMap}
        subAccountsMap={subAccountsMap}
        totals={totals}
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!voucher) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          Voucher Not Found
        </h2>
        <button
          className="mt-4 text-blue-600 hover:underline"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title={`View Voucher - ${voucher.xvoucher}`}
        description="Journal Voucher Details"
      />
      <PageBreadcrumb pageTitle={`View Voucher`} />


      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/accounts/journal-voucher")}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            title="Back to List"
          >
            <FiArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {voucher.xvoucher}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              navigate(`/accounts/journal-voucher/update/${voucher.xvoucher}`)
            }
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 transition-colors"
          >
            <FiEdit size={16} />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg transition-colors shadow-sm"
          >
            <FiPrinter size={16} />
            <span>Print</span>
          </button>
        </div>
      </div>


      <div className="flex justify-center bg-gray-50/50 dark:bg-[#020d1a] py-8 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="w-full max-w-[210mm] transform scale-[0.9] sm:scale-100 origin-top">
          <JournalVoucherTemplate
            voucher={voucher}
            accountsMap={accountsMap}
            subAccountsMap={subAccountsMap}
            totals={totals}
          />
        </div>
      </div>
    </div>
  );
}
