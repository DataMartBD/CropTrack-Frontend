import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
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
import { FcFinePrint, FcPrint } from "react-icons/fc";
import { createRoot } from "react-dom/client";
import DeliveryChallanTemplate from "../../../components/Delivery/DeliveryChallanTemplate";

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

interface DeliveryModel {
  created_at: string;
  xchlnum: string;
  token_no: string;
  certificate_no: string | null;
  xcus: string;
  xstatus: string;
}

export default function DeliveryList() {
  const { t } = useTranslation();
  const [deliveryData, setDeliveryData] = useState<DeliveryModel[]>([]);
  const navigate = useNavigate();
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handlePagination = (action: () => void) => {
    action();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return deliveryData;

    return deliveryData.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (item.xchlnum && item.xchlnum.toLowerCase().includes(searchLower)) ||
        (item.token_no && item.token_no.toLowerCase().includes(searchLower)) ||
        (item.xcus && item.xcus.toLowerCase().includes(searchLower))
      );
    });
  }, [deliveryData, searchQuery]);

  const handlePrint = async (xchlnum: string) => {
    setIsPrinting(true);
    const token = window.localStorage.getItem("jwtToken");

    try {
      const response = await axios.get(
        `${api.base}/ops/delivery-challan/${xchlnum}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Handle both {parent, child} and {success, data: {parent, child}}
        const challanData = response.data.parent
          ? response.data
          : response.data.data;

        if (!challanData || !challanData.parent) {
          console.error("Invalid challan data structure:", response.data);
          return;
        }

        const iframe = document.createElement("iframe");
        iframe.style.position = "absolute";
        iframe.style.width = "0px";
        iframe.style.height = "0px";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        // Get all style sheets
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
          "https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@100..900&display=swap";
        fontLink.rel = "stylesheet";
        doc.head.appendChild(fontLink);

        const printStyle = doc.createElement("style");
        printStyle.textContent = `
          @page { size: A4; margin: 0mm; }
          @media print {
            html, body { 
              margin: 0 !important; 
              padding: 0 !important; 
              height: 100%;
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
            }
          }
          body {
            font-family: 'Noto Serif Bengali', serif;
            margin: 0;
            padding: 0;
          }
        `;
        doc.head.appendChild(printStyle);

        const root = createRoot(container);
        root.render(<DeliveryChallanTemplate data={challanData} />);

        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      }
    } catch (error) {
      console.error("Error printing delivery challan:", error);
      alert(
        "Failed to prepare challan for printing. Please check console for details."
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const columnHelper = createColumnHelper<DeliveryModel>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("xchlnum", {
        header: "📄 Challan No",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("token_no", {
        header: "🎫 Token No",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("certificate_no", {
        header: "📜 Certificate No",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("xcus", {
        header: "👤 Customer",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("created_at", {
        header: "📆 Date",
        cell: (info) => {
          const date = new Date(info.getValue());
          return date.toISOString().split("T")[0];
        },
      }),
      columnHelper.accessor("xstatus", {
        header: "⭕ Status",
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                status === "Issued"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/certificate/delivery?token_no=${info.row.original.token_no}`
                )
              }
              className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-[#13725A]"
            >
              <FcFinePrint size={20} /> View Stock
            </button>
            <button
              type="button"
              onClick={() => handlePrint(info.row.original.xchlnum)}
              disabled={isPrinting}
              className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-[#13725A]"
            >
              <FcPrint className="text-blue-500" size={20} />{" "}
              {isPrinting ? "Wait..." : "Challan"}
            </button>
          </div>
        ),
      }),
    ],
    [columnHelper, navigate, handlePrint, isPrinting]
  );

  const table = useReactTable({
    data: filteredData,
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
    const fetchDeliveryData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${api.base}/ops/delivery-challan/list/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDeliveryData(response.data.data);
        setTotal(response.data.meta.count);
      } catch (error) {
        console.error("Error fetching delivery data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeliveryData();
  }, []);

  return (
    <div>
      <PageMeta
        title={`${t("delivery_list")} - CropTrack`}
        description="Delivery List - CropTrack"
      />
      <PageBreadcrumb pageTitle={t("delivery_list")} />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-7">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {t("delivery_list")} ({total})
          </h2>
        </div>

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
                  Loading delivery data...
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

        {!isLoading && deliveryData.length > 0 && (
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
      </div>
    </div>
  );
}
