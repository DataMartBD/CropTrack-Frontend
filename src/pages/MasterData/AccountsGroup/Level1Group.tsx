/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../components/ui/modal";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Swal from "sweetalert2";

import type { Level1Model, Level1Form, Level1GroupProps } from "./types";

import {
  getData,
  postData,
  putData,
  deleteData,
} from "../../../services/apiClient";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";

import {
  FiEdit,
  FiTrash2,
  FiArrowRightCircle,
  FiPlusCircle,
} from "react-icons/fi";
import { Spinner } from "../../../components/ui/ut/Spinner";

export default function Level1Group({ onNavigateToLevel2 }: Level1GroupProps) {
  const [l1Groups, setL1Groups] = useState<Level1Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handlePagination = (action: () => void) => {
    action();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const l1GroupsData: Level1Model[] = await getData("/accounts/level-1/");
        setL1Groups(l1GroupsData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const initialL1GState: Level1Form = {
    xhrc1: "",
    xdesc: "",
  };

  const [newL1Group, setNewL1Group] = useState<Level1Form>(initialL1GState);
  const [editL1G, setEditL1G] = useState<Level1Form>(initialL1GState);

  const resetForm = () => setNewL1Group(initialL1GState);

  const handleCreateInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewL1Group((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditL1G((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleOpenEditModal = (group: Level1Model) => {
    setEditL1G({
      xhrc1: group.xhrc1 || "",
      xdesc: group.xdesc || "",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);

    setEditL1G(initialL1GState);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newL1Group.xhrc1 || !newL1Group.xdesc) {
      Swal.fire("Warning", "Please fill all required fields.", "warning");
      return;
    }
    try {
      await postData("/accounts/level-1/", newL1Group);
      Swal.fire("Success", "Level 1 Group created successfully!", "success");
      handleCloseCreateModal();

      // Reload data after creation
      const l1GroupsData: Level1Model[] = await getData("/accounts/level-1/");
      setL1Groups(l1GroupsData);
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to create group.",
        "error"
      );
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editL1G.xhrc1 || !editL1G.xdesc) {
      Swal.fire("Warning", "Please fill all required fields.", "warning");
      return;
    }
    try {
      await putData(`/accounts/level-1/${editL1G.xhrc1}/`, editL1G);
      Swal.fire("Success", "Level 1 Group updated successfully!", "success");
      handleCloseEditModal();

      // Reload data after update
      const l1GroupsData: Level1Model[] = await getData("/accounts/level-1/");
      setL1Groups(l1GroupsData);
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update group.",
        "error"
      );
    }
  };

  const handleDeleteGroup = async (xhrc1: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteData(`/accounts/level-1/${xhrc1}/`);
        Swal.fire("Deleted!", "Level 1 Group has been deleted.", "success");

        // Reload data after deletion
        const l1GroupsData: Level1Model[] = await getData("/accounts/level-1/");
        setL1Groups(l1GroupsData);
      } catch (err: any) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "Failed to delete group.",
          "error"
        );
      }
    }
  };

  const filteredLevel1GroupList = useMemo(() => {
    if (!searchQuery.trim()) return l1Groups;

    return l1Groups.filter((lg) =>
      lg.xdesc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [l1Groups, searchQuery]);

  const columnHelper = createColumnHelper<Level1Model>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("xhrc1", {
        header: "Code",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("xdesc", {
        header: "Description",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => (
          <div className="flex gap-1 justify-end">
            <button
              onClick={() => handleOpenEditModal(info.row.original)}
              className="flex px-1 py-1 text-sm rounded-sm hover:text-amber-600"
              title="Edit"
            >
              <FiEdit size={18} />
            </button>
            <button
              onClick={() => handleDeleteGroup(info.row.original.xhrc1)}
              className="flex px-1 py-1 text-sm rounded-sm hover:text-red-600"
              title="Delete"
            >
              <FiTrash2 size={18} />
            </button>
            {onNavigateToLevel2 && (
              <button
                onClick={() => onNavigateToLevel2(info.row.original.xhrc1)}
                className="flex px-1 py-1 text-sm rounded-sm  hover:text-blue-600"
                title="Go to Level 2"
              >
                <FiArrowRightCircle size={18} />
              </button>
            )}
          </div>
        ),
      }),
    ],
    [onNavigateToLevel2]
  );

  const table = useReactTable({
    data: filteredLevel1GroupList,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Level 1 Groups
        </h2>

        <div className="flex items-center gap-3">
          {/* Search Input with Icon */}
          <div className="relative">
            <input
              type="search"
              className="w-48 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:ring-offset-2 transition-colors"
          >
            <FiPlusCircle size={18} />
            New Group
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <Spinner />
        ) : (
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-gray-200 bg-zinc-500 dark:bg-slate-700 text-white"
                >
                  {headerGroup.headers.map((header, index) => (
                    <th
                      key={header.id}
                      className={`
                  px-6 py-2 text-left text-sm font-medium cursor-pointer
                  ${index === 0 ? "rounded-tl-lg" : ""}
                  ${
                    index === headerGroup.headers.length - 1
                      ? "rounded-tr-lg"
                      : ""
                  }
                `}
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
                      className="px-6 py-2 text-sm text-gray-800 dark:text-gray-100"
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

      {/* Create Group Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        className="max-w-md m-4"
      >
        <div className="relative w-full rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#13725A] to-[#0F5E48] px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  New Level 1 Group
                </h2>
                <p className="text-sm text-emerald-100">
                  Create a new level 1 group
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleCreateGroup} className="px-8 py-6">
            <div className="space-y-6">
              {/* Code */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="xhrc1"
                  value={newL1Group.xhrc1}
                  onChange={handleCreateInputChange}
                  placeholder="Enter group code"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm"
                />
              </div>

              {/* Description */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </Label>
                <textarea
                  name="xdesc"
                  value={newL1Group.xdesc}
                  onChange={handleCreateInputChange}
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm resize-none"
                  placeholder="Enter group description"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#13725A] transition-all shadow-sm"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        className="max-w-md m-4"
      >
        <div className="relative w-full rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-zinc-600 to-zinc-800 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Edit Level 1 Group
                </h2>
                <p className="text-sm text-white">Update group information</p>
              </div>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleUpdateGroup} className="px-8 py-6">
            <div className="space-y-6">
              {/* Code */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="xhrc1"
                  value={editL1G.xhrc1}
                  onChange={handleEditInputChange}
                  placeholder="Enter group code"
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm"
                />
              </div>

              {/* Description */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </Label>
                <textarea
                  name="xdesc"
                  value={editL1G.xdesc}
                  onChange={handleEditInputChange}
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm resize-none"
                  placeholder="Enter group description"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#13725A] transition-all shadow-sm"
              >
                Update Group
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
