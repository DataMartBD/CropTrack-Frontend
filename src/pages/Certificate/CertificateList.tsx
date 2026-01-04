import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState, useMemo } from "react";
import { Modal } from "../../components/ui/modal";
import CertificateTemplate from "../../components/Certificate/CertificateTemplate";
import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import DatePicker from "react-datepicker";
// import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";
import { createRoot } from "react-dom/client";

import { useNavigate } from "react-router";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { FcFinePrint, FcInTransit, FcPaid, FcRefresh } from "react-icons/fc";

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

interface CertificateModel {
  //   create_date: string;
  created_at: string;
  updated_at: string;
  booking_no: string;
  token_no: string;
  customer_code: string;
  customer_name: string;
  xmobile: string;
  father_name: string;
  district_name: string;
  upazila_name: string;
  union_name: string;
  post_office: string;
  village: string;
  number_of_sacks: number;
  potato_type: string;
  rent_per_sack: number;
  total_rent: number;
  advance_rent: number;
  remaining_rent: number;
  number_of_empty_sacks: number;
  price_of_empty_sacks: number;
  transportation: number;
  given_loan: number;
  total_amount_taka: number;
  xstatus: string;
}

export default function CertificateList() {
  const { t } = useTranslation();
  const [certificatesData, setCertificatesData] = useState<CertificateModel[]>(
    []
  );
  const navigate = useNavigate();
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<CertificateModel | null>(null);

  const handlePagination = (action: () => void) => {
    action();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const filteredCertificates = useMemo(() => {
    if (!searchQuery.trim()) return certificatesData;

    return certificatesData.filter((certificate) => {
      const searchLower = searchQuery.toLowerCase();

      return (
        certificate.token_no &&
        certificate.token_no.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [certificatesData, searchQuery]);

  const handleView = (certificate: CertificateModel) => {
    setSelectedCertificate(certificate);
    setIsViewModalOpen(true);
  };

  const handlePrint = () => {
    if (!selectedCertificate) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Get all style sheets from the main document to ensure Tailwind styles are applied
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

    // Create a container for the React component
    const container = doc.createElement("div");
    doc.body.appendChild(container);

    // Inject styles
    const styleElement = doc.createElement("style");
    styleElement.textContent = styles;
    doc.head.appendChild(styleElement);

    // Inject Google Fonts for Bengali
    const fontLink = doc.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@100..900&display=swap";
    fontLink.rel = "stylesheet";
    doc.head.appendChild(fontLink);

    // Add specific print styles
    const printStyle = doc.createElement("style");
    printStyle.textContent = `
      @page { size: auto;  margin: 0mm; }
      @media print {
        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
      body {
        font-family: 'Noto Serif Bengali', serif;
      }
    `;
    doc.head.appendChild(printStyle);

    // Render the CertificateTemplate into the iframe
    const root = createRoot(container);
    root.render(<CertificateTemplate data={selectedCertificate} />);

    // Wait for content to render then print
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Cleanup after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  const columnHelper = createColumnHelper<CertificateModel>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("token_no", {
        header: "🎫 Token No",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("created_at", {
        header: "📆 Date",
        cell: (info) => {
          const date = new Date(info.getValue());
          return date.toISOString().split("T")[0]; // Outputs: "YYYY-MM-DD"
        },
      }),
      columnHelper.accessor("customer_name", {
        header: "👤 Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("xmobile", {
        header: "📞 Mobile",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("xstatus", {
        header: "⭕ Status",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("number_of_sacks", {
        header: "💰 Sacks",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("total_amount_taka", {
        header: "💵 Total",
        cell: (info) => Number(info.getValue()).toFixed(2),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleView(info.row.original)}
              className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-[#13725A]"
            >
              <FcFinePrint size={20} /> View
            </button>
            {info.row.original.xstatus === "Open" && (
              <button
                onClick={() =>
                  navigate(
                    `/certificate/load?token_no=${info.row.original.token_no}`
                  )
                }
                className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-[#13725A]"
              >
                <FcPaid size={20} /> Load
              </button>
            )}
            {info.row.original.xstatus !== "Open" && (
              <>
                <button
                  onClick={() =>
                    navigate(
                      `/certificate/delivery?token_no=${info.row.original.token_no}`
                    )
                  }
                  className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-[#13725A]"
                >
                  <FcInTransit size={20} /> Delivery
                </button>
                <button
                  onClick={() =>
                    navigate(
                      `/certificate/exchange?token_no=${info.row.original.token_no}`
                    )
                  }
                  className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-[#13725A]"
                >
                  <FcRefresh size={20} /> Exchange
                </button>
              </>
            )}
          </div>
        ),
      }),
    ],
    [columnHelper, navigate]
  );

  const table = useReactTable({
    data: filteredCertificates,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    const token = window.localStorage.getItem("jwtToken");
    const fetchCertficates = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${api.base}/ops/certificates/list/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          //   params: {
          //     xstatus: "Pending",
          //   },
        });
        setCertificatesData(response.data.data);
        setTotal(response.data.meta.count);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertficates();
  }, []);

  return (
    <div>
      <PageMeta
        title="Certificate List - CropTrack"
        description="Certificate List - CropTrack"
      />
      <PageBreadcrumb pageTitle="Certificate List" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-7">
        {/* Header with Add Button */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {t("certificate_list")} ({total})
          </h2>
        </div>

        {/* Search Filter */}
        <div className="mb-4">
          <div className="relative">
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
              className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search"
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
                  Loading bookings data...
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400 cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: " 🔼",
                          desc: " 🔽",
                        }[header.column.getIsSorted() as string] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="bg-white dark:bg-transparent">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 text-sm text-gray-800 dark:text-gray-300"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => handlePagination(() => table.setPageIndex(0))}
                disabled={!table.getCanPreviousPage()}
                title="First Page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => handlePagination(() => table.previousPage())}
                disabled={!table.getCanPreviousPage()}
                title="Previous Page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="px-2 text-sm text-gray-700 dark:text-gray-300">
                Page{" "}
                <span className="font-medium">
                  {table.getState().pagination.pageIndex + 1}
                </span>{" "}
                of <span className="font-medium">{table.getPageCount()}</span>
              </span>
              <button
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => handlePagination(() => table.nextPage())}
                disabled={!table.getCanNextPage()}
                title="Next Page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() =>
                  handlePagination(() =>
                    table.setPageIndex(table.getPageCount() - 1)
                  )
                }
                disabled={!table.getCanNextPage()}
                title="Last Page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            <select
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          className="max-w-[900px] m-4"
        >
          <div className="relative w-full overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 overflow-hidden">
            <div className="sticky top-0 right-0 z-50 flex justify-end p-4 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 pt-0 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {selectedCertificate && (
                <CertificateTemplate data={selectedCertificate} />
              )}
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
