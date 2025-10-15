/* eslint-disable @typescript-eslint/no-explicit-any */
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState, useMemo } from "react";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import "react-datepicker/dist/react-datepicker.css";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { FcPlus } from "react-icons/fc";

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

interface TokenModel {
  create_date: string;
  created_at: string;
  updated_at: string;
  token_no: string;
  xsack: number;
  xstatus: string;
  created_by: string;
  updated_by: string;
  business_id: string;
}

export default function PendingTokens() {
  const [tokensData, setTokensData] = useState<TokenModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    token_no: "",
    sack_no: 0,
  });
  const handlePagination = (action: () => void) => {
    action();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokensData;

    return tokensData.filter((token) => {
      const searchLower = searchQuery.toLowerCase();

      return (
        token.token_no &&
        token.token_no.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [tokensData, searchQuery]);
  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = window.localStorage.getItem("jwtToken");

    // const bodyData = {
    //   xsack: editData.sack_no,
    // };
    // console.log(bodyData);

    try {
      await axios.put(
        `${api.base}/ops/token/sack_input/${editData.token_no}/`,
        {
          xsack: editData.sack_no,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsEditModalOpen(false);
      // Refresh the students list
      const response = await axios.get(`${api.base}/ops/token/pending/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTokensData(response.data.data);
      Swal.fire({
        title: "Updated!",
        text: "Token has been updated successfully.",
        icon: "success",
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to update token",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columnHelper = createColumnHelper<TokenModel>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("token_no", {
        header: "🎫 Token No",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("create_date", {
        header: "📆 Create Date",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("created_by", {
        header: "👤Created By",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("xstatus", {
        header: "⭕ Status",
        cell: (info) => info.getValue(),
      }),
      //   columnHelper.accessor("xsack", {
      //     header: "No. of Sacks",
      //     cell: (info) => info.getValue(),
      //   }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditData({
                  token_no: info.row.original.token_no,
                  sack_no: info.row.original.xsack,
                });
                setIsEditModalOpen(true);
              }}
              className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-[#13725A]"
            >
              <FcPlus size={20} /> Sack Number
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredTokens,
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
    const fetchTokens = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${api.base}/ops/token/pending/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTokensData(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTokens();
  }, []);

  return (
    <div>
      <PageMeta
        title="Pending Tokens - CropTrack"
        description="Pending Tokens - CropTrack"
      />
      <PageBreadcrumb pageTitle="Pending Tokens" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-7">
        {/* Header with Add Button */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Pending Tokens and Sack Input
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
              placeholder="Search by Token No."
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
                  Loading tokens data...
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

        {/* Edit Student Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          className="max-w-[700px] m-4"
        >
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                Sack Number Entry
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
                Update the number of sacks for the token.
              </p>
            </div>
            <form onSubmit={handleUpdate} className="flex flex-col">
              <div className="custom-scrollbar overflow-y-auto px-2 pb-3">
                <div className="mt-7">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Token No.</Label>
                      <Input
                        type="text"
                        name="token_no"
                        value={editData.token_no}
                        onChange={handleEditInputChange}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>No. of Sacks</Label>
                      <Input
                        type="text"
                        name="sack_no"
                        value={editData.sack_no}
                        onChange={handleEditInputChange}
                        placeholder="Enter Number of Sacks"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#13725A] rounded-lg hover:bg-[#13503E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#13503E]dark:hover:bg-[#13725A]"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 animate-spin"
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
                      Updating...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </Modal>
        {/* Add User Modal */}
      </div>
    </div>
  );
}
