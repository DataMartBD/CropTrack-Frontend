/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../components/ui/modal";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Swal from "sweetalert2";

import type {
  Level1Model,
  Level2Model,
  Level2Form,
  Level2GroupProps,
} from "./types";

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

import { FcPlus } from "react-icons/fc";
import { FiEdit, FiDelete, FiLogIn } from "react-icons/fi";
import { Spinner } from "../../../components/ui/ut/Spinner";

export default function Level2Group({
  preselectedLevel1,
  onNavigateToLevel3,
}: Level2GroupProps) {
  const [l1Groups, setL1Groups] = useState<Level1Model[]>([]);
  const [l2Groups, setL2Groups] = useState<Level2Model[]>([]);
  const [selectedLevel1, setSelectedLevel1] = useState<string>(
    preselectedLevel1 || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingL1, setIsLoadingL1] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  useEffect(() => {
    if (preselectedLevel1) {
      setSelectedLevel1(preselectedLevel1);
    }
  }, [preselectedLevel1]);

  useEffect(() => {
    const loadLevel2Data = async () => {
      if (!selectedLevel1) {
        setL2Groups([]);
        return;
      }

      setIsLoading(true);
      try {
        const l2GroupsData: Level2Model[] = await getData(
          `/accounts/level-2/${selectedLevel1}/`
        );
        setL2Groups(l2GroupsData);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load Level 2 groups", "error");
        setL2Groups([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLevel2Data();
  }, [selectedLevel1]);

  const handlePagination = (action: () => void) => {
    action();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Load Level 1 groups
  useEffect(() => {
    const loadLevel1Data = async () => {
      setIsLoadingL1(true);
      try {
        const l1GroupsData: Level1Model[] = await getData("/accounts/level-1/");
        setL1Groups(l1GroupsData);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load Level 1 groups", "error");
      } finally {
        setIsLoadingL1(false);
      }
    };

    loadLevel1Data();
  }, []);

  // Load Level 2 groups when Level 1 is selected
  useEffect(() => {
    const loadLevel2Data = async () => {
      if (!selectedLevel1) {
        setL2Groups([]);
        return;
      }

      setIsLoading(true);
      try {
        const l2GroupsData: Level2Model[] = await getData(
          `/accounts/level-2/${selectedLevel1}/`
        );
        setL2Groups(l2GroupsData);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load Level 2 groups", "error");
        setL2Groups([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLevel2Data();
  }, [selectedLevel1]);

  const initialL2GState: Level2Form = {
    xhrc2: "",
    xdesc: "",
    xhrc1: selectedLevel1,
  };

  const [newL2Group, setNewL2Group] = useState<Level2Form>(initialL2GState);
  const [editL2G, setEditL2G] = useState<Level2Form>(initialL2GState);

  const resetForm = () =>
    setNewL2Group({
      xhrc2: "",
      xdesc: "",
      xhrc1: selectedLevel1,
    });

  const handleCreateInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewL2Group((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditL2G((prev) => ({ ...prev, [name]: value }));
  };

  const handleLevel1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevel1(e.target.value);
  };

  const handleOpenCreateModal = () => {
    if (!selectedLevel1) {
      Swal.fire("Warning", "Please select a Level 1 group first.", "warning");
      return;
    }
    setNewL2Group({
      xhrc2: "",
      xdesc: "",
      xhrc1: selectedLevel1,
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleOpenEditModal = (group: Level2Model) => {

    setEditL2G({
      xhrc2: group.xhrc2 || "",
      xdesc: group.xdesc || "",
      xhrc1: group.xhrc1 || selectedLevel1,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);

    setEditL2G(initialL2GState);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newL2Group.xhrc2 || !newL2Group.xdesc || !newL2Group.xhrc1) {
      Swal.fire("Warning", "Please fill all required fields.", "warning");
      return;
    }
    try {
      await postData(`/accounts/level-2/${newL2Group.xhrc1}/`, newL2Group);
      Swal.fire("Success", "Level 2 Group created successfully!", "success");
      handleCloseCreateModal();

      // Reload Level 2 data after creation
      if (selectedLevel1) {
        const l2GroupsData: Level2Model[] = await getData(
          `/accounts/level-2/${selectedLevel1}/`
        );
        setL2Groups(l2GroupsData);
      }
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
    if (!editL2G.xhrc2 || !editL2G.xdesc || !editL2G.xhrc1) {
      Swal.fire("Warning", "Please fill all required fields.", "warning");
      return;
    }
    try {
      await putData(
        `/accounts/level-2/${editL2G.xhrc1}/${editL2G.xhrc2}/`,
        editL2G
      );
      Swal.fire("Success", "Level 2 Group updated successfully!", "success");
      handleCloseEditModal();

      // Reload Level 2 data after update
      if (selectedLevel1) {
        const l2GroupsData: Level2Model[] = await getData(
          `/accounts/level-2/${selectedLevel1}/`
        );
        setL2Groups(l2GroupsData);
      }
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update group.",
        "error"
      );
    }
  };

  const handleDeleteGroup = async (group: Level2Model) => {
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
        // Use xhrc1 from the group data, not selectedLevel1
        await deleteData(`/accounts/level-2/${group.xhrc1}/${group.xhrc2}/`);
        Swal.fire("Deleted!", "Level 2 Group has been deleted.", "success");

        // Reload Level 2 data after deletion
        if (selectedLevel1) {
          const l2GroupsData: Level2Model[] = await getData(
            `/accounts/level-2/${selectedLevel1}/`
          );
          setL2Groups(l2GroupsData);
        }
      } catch (err: any) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "Failed to delete group.",
          "error"
        );
      }
    }
  };

  const filteredLevel2GroupList = useMemo(() => {
    if (!searchQuery.trim()) return l2Groups;

    return l2Groups.filter((lg) =>
      lg.xdesc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [l2Groups, searchQuery]);

  const columnHelper = createColumnHelper<Level2Model>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("xhrc2", {
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
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => handleOpenEditModal(info.row.original)}
              className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-amber-400 dark:bg-gray-700 dark:hover:bg-[#13725A]"
              title="Edit"
            >
              <FiEdit size={18} />
            </button>
            <button
              onClick={() => handleDeleteGroup(info.row.original)}
              className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-red-400 dark:bg-gray-700 dark:hover:bg-[#13725A]"
              title="Delete"
            >
              <FiDelete size={18} />
            </button>
            {onNavigateToLevel3 && (
              <button
                onClick={() =>
                  onNavigateToLevel3(
                    info.row.original.xhrc1,
                    info.row.original.xhrc2
                  )
                }
                className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-blue-400 dark:bg-gray-700 dark:hover:bg-[#13725A]"
                title="Go to Level 3"
              >
                <FiLogIn size={18} />
              </button>
            )}
          </div>
        ),
      }),
    ],
    [selectedLevel1]
  );

  const table = useReactTable({
    data: filteredLevel2GroupList,
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
        {/* Left Section - Title and Filter */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white whitespace-nowrap">
            Level 2 Groups
          </h2>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <div className="relative">
            <select
              value={selectedLevel1}
              onChange={handleLevel1Change}
              className="rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A] w-48"
              disabled={isLoadingL1}
            >
              <option value="">Select Level 1</option>
              {l1Groups.map((group) => (
                <option key={group.xhrc1} value={group.xhrc1}>
                  {group.xhrc1} - {group.xdesc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Section - Search and Actions */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <input
              type="search"
              className="w-48 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!selectedLevel1}
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
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:ring-offset-2 transition-colors"
            disabled={!selectedLevel1}
          >
            <FcPlus size={16} />
            New Group
          </button>
        </div>
      </div>
      {/* Info Message */}
      {!selectedLevel1 && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            Please select a Level 1 group to view and manage Level 2 groups.
          </p>
        </div>
      )}

      {/* Table */}
      {selectedLevel1 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <Spinner />
          ) : (
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-gray-200 bg-zinc-500 text-white"
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
      )}

      {/* Pagination Controls */}
      {!isLoading && selectedLevel1 && l2Groups.length > 0 && (
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
                  New Level 2 Group
                </h2>
                <p className="text-sm text-emerald-100">
                  Create a new level 2 group for {selectedLevel1}
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
              {/* Level 1 Selection (Read-only) */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level 1 Group <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={selectedLevel1}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Code */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level 2 Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="xhrc2"
                  value={newL2Group.xhrc2}
                  onChange={handleCreateInputChange}
                  placeholder="Enter level 2 group code"
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
                  value={newL2Group.xdesc}
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
                  Edit Level 2 Group
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
              {/* Level 1 Selection (Read-only) */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level 1 Group <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={editL2G.xhrc1}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Code */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level 2 Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="xhrc2"
                  value={editL2G.xhrc2}
                  onChange={handleEditInputChange}
                  placeholder="Enter level 2 group code"
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
                  value={editL2G.xdesc}
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
