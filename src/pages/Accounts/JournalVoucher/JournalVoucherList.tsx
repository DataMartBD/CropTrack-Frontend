/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getData } from "../../../services/apiClient";
import Badge from "../../../components/ui/badge/Badge";
import { Spinner } from "../../../components/ui/ut/Spinner";
import { FiPlusCircle, FiSearch, FiList, FiEdit } from "react-icons/fi";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { useNavigate } from "react-router";

interface GLDetailHeader {
  xrow: number;
  xacc: string;
  xcur: string;
  xprime: string;
  xlong: string;
}

interface JournalVoucher {
  business_id: number;
  xvoucher: string;
  xref: string;
  xdate: string;
  xlong: string;
  xyear: number;
  xper: number;
  xstatusjv: string;
  created_by_name?: string;
  gldetails_header?: GLDetailHeader[];
}

export default function JournalVoucherList() {
  const navigate = useNavigate();
  const [journalVouchers, setJournalVouchers] = useState<JournalVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // apiClient.getData returns response.data.data, which is the array
        const data: JournalVoucher[] = await getData(
          "/accounts/Journal-voucher/"
        );
        setJournalVouchers(data || []);
      } catch (err) {
        console.error("Failed to load journal vouchers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return journalVouchers;
    return journalVouchers.filter(
      (jv) =>
        jv.xvoucher.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jv.xlong?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [journalVouchers, searchQuery]);

  const columnHelper = createColumnHelper<JournalVoucher>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("xvoucher", {
        header: "Voucher No",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("xdate", {
        header: "Date",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("xyear", {
        header: "Year",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("xper", {
        header: "Period",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("xstatusjv", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <Badge
              color={
                status === "Balanced" || status === "Posted"
                  ? "success"
                  : status === "Open"
                  ? "warning"
                  : "light"
              }
            >
              {status}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => (
          <div className="flex gap-2 justify-end">
            <button
              onClick={() =>
                navigate(
                  `/accounts/journal-voucher/update/${info.row.original.xvoucher}`
                )
              }
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors"
              title="Edit"
            >
              <FiEdit size={16} />
              <span>Edit</span>
            </button>
            <button
              onClick={() =>
                navigate(
                  `/accounts/journal-voucher/view/${info.row.original.xvoucher}`
                )
              }
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              title="View"
            >
              <FiList size={16} />
              <span>View</span>
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handlePagination = (action: () => void) => {
    action();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <PageMeta
        title="Crop Track - Journal Voucher List"
        description="Journal Voucher List"
      />
      <PageBreadcrumb pageTitle="Journal Voucher List" />

      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header Actions */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Journal Vouchers
          </h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="search"
                className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-3 pl-10 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                placeholder="Search vouchers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Create Button */}
            <button
              onClick={() => navigate("/accounts/journal-voucher/new")}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:ring-offset-2 transition-colors whitespace-nowrap"
            >
              <FiPlusCircle size={18} />
              New Voucher
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-gray-200 bg-zinc-500 dark:bg-slate-700 text-white"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`px-6 py-3 text-sm font-medium cursor-pointer first:rounded-tl-lg last:rounded-tr-lg ${
                          header.id === "actions" ? "text-right" : "text-left"
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div
                          className={`flex items-center gap-1 ${
                            header.id === "actions" ? "justify-end" : ""
                          }`}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.id !== "actions" &&
                            ({
                              asc: " 🔼",
                              desc: " 🔽",
                            }[header.column.getIsSorted() as string] ??
                              null)}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-3 text-sm text-gray-800 dark:text-gray-100"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No journal vouchers found.
                    </td>
                  </tr>
                )}
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
      </div>
    </div>
  );
}
