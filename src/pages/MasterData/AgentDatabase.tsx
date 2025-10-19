import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
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
import { FcEditImage, FcPlus } from "react-icons/fc";
import AddAgentModal from "../../components/MasterData/AddAgentModal";
import EditAgentModal from "../../components/MasterData/EditAgentModal";

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

interface AgentModel {
  create_date: string;
  customer_code: string;
  customer_name: string;
  contact_person: string;
  xmobile: string;
  xemail: string;
  father_name: string;
  district_name: string;
  upazila_name: string;
  union_name: string;
  post_office: string;
  village: string;
  xaddress: number;
  trade_license_number: string;
  bin_number: number;
  tin_number: number;
  is_active: boolean;
}

export default function AgentDatabase() {
  const { t } = useTranslation();
  const [agentsData, setAgentsData] = useState<AgentModel[]>([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const handlePagination = (action: () => void) => {
    action();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return agentsData;

    return agentsData.filter((ag) => {
      const searchLower = searchQuery.toLowerCase();

      return (
        ag.customer_name.toString().toLowerCase().includes(searchLower) ||
        ag.xmobile.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [agentsData, searchQuery]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AgentModel | null>(
    null
  );

  const columnHelper = createColumnHelper<AgentModel>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("customer_code", {
        header: "🎫 Agent Code",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("customer_name", {
        header: "👤 Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("create_date", {
        header: "📆 Create Date",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("xmobile", {
        header: "📞 Mobile",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("district_name", {
        header: "District",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("upazila_name", {
        header: "Upazila",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("village", {
        header: "Village",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("is_active", {
        header: "Status",
        cell: (info) => (
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              info.getValue() ? "bg-green-500" : "bg-red-400"
            }`}
            title={info.getValue() ? "Active" : "Inactive"}
          ></span>
        ),
      }),
      //   columnHelper.accessor(
      //     (row) => `${row.district_name || ""}, ${row.upazila_name || ""}`,
      //     {
      //       id: "location",
      //       header: "📍 Address",
      //       cell: (info) => info.getValue(),
      //     }
      //   ),

      //   columnHelper.accessor("given_loan", {
      //     header: "💴 Loan",
      //     cell: (info) => Number(info.getValue()).toFixed(2),
      //   }),

      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCustomer(info.row.original);
                setIsEditOpen(true);
              }}
              className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-[#13725A]"
            >
              <FcEditImage size={20} /> Edit
            </button>
            {/* <button
              //   onClick={() => {
              //     setEditData({
              //       token_no: info.row.original.token_no,
              //       sack_no: info.row.original.xsack,
              //     });
              //     setIsEditModalOpen(true);
              //   }}
              className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-[#13725A]"
            >
              <FcDeleteRow size={20} /> Delete
            </button> */}
          </div>
        ),
      }),
    ],
    [columnHelper, navigate]
  );

  const table = useReactTable({
    data: filteredCustomers,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const fetchCustomers = async () => {
    const token = window.localStorage.getItem("jwtToken");
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${api.base}/masterdata/customers/list/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            customer_type: "Agent",
          },
        }
      );
      setAgentsData(response.data.data);
      //   setTotal(response.data.meta.total_count);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div>
      <PageMeta
        title="Agent Database - CropTrack"
        description="Agent Database - CropTrack"
      />
      <PageBreadcrumb pageTitle="Agent Database" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-7">
        {/* Header with Add Button */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {t("agent_database")}
          </h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-1 py-1 text-sm font-medium text-gray-700  dark:bg-gray-700 dark:text-white rounded-lg hover:text-white hover:bg-[#49ae56] dark:hover:bg-[#13503E]"
          >
            <FcPlus size={20} /> Add Agent
          </button>
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
                  Loading agent data...
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

        {/* Edit Modal */}
        <EditAgentModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onUpdated={fetchCustomers}
          agent={selectedCustomer}
        />
        {/* Add Modal */}

        <AddAgentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdded={fetchCustomers}
        />
      </div>
    </div>
  );
}
