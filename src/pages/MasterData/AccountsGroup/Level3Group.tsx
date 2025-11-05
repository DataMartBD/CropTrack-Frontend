/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../components/ui/modal";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import Swal from "sweetalert2";

import type {
  Level1Model,
  Level2Model,
  Level3Model,
  Level3Form,
  Level3GroupProps,
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

export default function Level3Group({
  preselectedLevel1,
  preselectedLevel2,
  onNavigateToLevel4,
}: Level3GroupProps) {
  const [l1Groups, setL1Groups] = useState<Level1Model[]>([]);
  const [l2Groups, setL2Groups] = useState<Level2Model[]>([]);
  const [l3Groups, setL3Groups] = useState<Level3Model[]>([]);
  const [selectedLevel1, setSelectedLevel1] = useState<string>(
    preselectedLevel1 || ""
  );
  const [selectedLevel2, setSelectedLevel2] = useState<string>(
    preselectedLevel2 || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingL1, setIsLoadingL1] = useState(false);
  const [isLoadingL2, setIsLoadingL2] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingL3Group, setEditingL3Group] = useState<Level3Model | null>(
    null
  );

  // Handle preselected levels
  useEffect(() => {
    if (preselectedLevel1) {
      setSelectedLevel1(preselectedLevel1);
    }
    if (preselectedLevel2) {
      setSelectedLevel2(preselectedLevel2);
    }
  }, [preselectedLevel1, preselectedLevel2]);

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
        setSelectedLevel2("");
        return;
      }

      setIsLoadingL2(true);
      try {
        const l2GroupsData: Level2Model[] = await getData(
          `/accounts/level-2/${selectedLevel1}/`
        );
        setL2Groups(l2GroupsData);

        // If preselected Level 2 doesn't exist in loaded data, clear it
        if (
          preselectedLevel2 &&
          !l2GroupsData.some((group) => group.xhrc2 === preselectedLevel2)
        ) {
          setSelectedLevel2("");
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load Level 2 groups", "error");
        setL2Groups([]);
        setSelectedLevel2("");
      } finally {
        setIsLoadingL2(false);
      }
    };

    loadLevel2Data();
  }, [selectedLevel1, preselectedLevel2]);

  // Load Level 3 groups when both Level 1 and Level 2 are selected
  useEffect(() => {
    const loadLevel3Data = async () => {
      if (!selectedLevel1 || !selectedLevel2) {
        setL3Groups([]);
        return;
      }

      setIsLoading(true);
      try {
        const l3GroupsData: Level3Model[] = await getData(
          `/accounts/level-3/${selectedLevel1}/${selectedLevel2}/`
        );
        setL3Groups(l3GroupsData);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load Level 3 groups", "error");
        setL3Groups([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLevel3Data();
  }, [selectedLevel1, selectedLevel2]);

  const handlePagination = (action: () => void) => {
    action();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const initialL3GState: Level3Form = {
    xhrc3: "",
    xdesc: "",
    xhrc1: selectedLevel1,
    xhrc2: selectedLevel2,
  };

  const [newL3Group, setNewL3Group] = useState<Level3Form>(initialL3GState);
  const [editL3G, setEditL3G] = useState<Level3Form>(initialL3GState);

  const resetForm = () =>
    setNewL3Group({
      xhrc3: "",
      xdesc: "",
      xhrc1: selectedLevel1,
      xhrc2: selectedLevel2,
    });

  const handleCreateInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewL3Group((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditL3G((prev) => ({ ...prev, [name]: value }));
  };

  const handleLevel1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevel1(e.target.value);
    setSelectedLevel2(""); // Reset Level 2 when Level 1 changes
  };

  const handleLevel2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevel2(e.target.value);
  };

  const handleOpenCreateModal = () => {
    if (!selectedLevel1 || !selectedLevel2) {
      Swal.fire(
        "Warning",
        "Please select both Level 1 and Level 2 groups first.",
        "warning"
      );
      return;
    }
    setNewL3Group({
      xhrc3: "",
      xdesc: "",
      xhrc1: selectedLevel1,
      xhrc2: selectedLevel2,
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleOpenEditModal = (group: Level3Model) => {
    setEditingL3Group(group);
    setEditL3G({
      xhrc3: group.xhrc3 || "",
      xdesc: group.xdesc || "",
      xhrc1: group.xhrc1 || selectedLevel1,
      xhrc2: group.xhrc2 || selectedLevel2,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingL3Group(null);
    setEditL3G(initialL3GState);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newL3Group.xhrc3 ||
      !newL3Group.xdesc ||
      !newL3Group.xhrc1 ||
      !newL3Group.xhrc2
    ) {
      Swal.fire("Warning", "Please fill all required fields.", "warning");
      return;
    }
    try {
      await postData(
        `/accounts/level-3/${newL3Group.xhrc1}/${newL3Group.xhrc2}/`,
        newL3Group
      );
      Swal.fire("Success", "Level 3 Group created successfully!", "success");
      handleCloseCreateModal();

      // Reload Level 3 data after creation
      if (selectedLevel1 && selectedLevel2) {
        const l3GroupsData: Level3Model[] = await getData(
          `/accounts/level-3/${selectedLevel1}/${selectedLevel2}/`
        );
        setL3Groups(l3GroupsData);
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
    if (!editL3G.xhrc3 || !editL3G.xdesc || !editL3G.xhrc1 || !editL3G.xhrc2) {
      Swal.fire("Warning", "Please fill all required fields.", "warning");
      return;
    }
    try {
      await putData(
        `/accounts/level-3/${editL3G.xhrc1}/${editL3G.xhrc2}/${editL3G.xhrc3}/`,
        editL3G
      );
      Swal.fire("Success", "Level 3 Group updated successfully!", "success");
      handleCloseEditModal();

      // Reload Level 3 data after update
      if (selectedLevel1 && selectedLevel2) {
        const l3GroupsData: Level3Model[] = await getData(
          `/accounts/level-3/${selectedLevel1}/${selectedLevel2}/`
        );
        setL3Groups(l3GroupsData);
      }
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update group.",
        "error"
      );
    }
  };

  const handleDeleteGroup = async (group: Level3Model) => {
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
        await deleteData(
          `/accounts/level-3/${group.xhrc1}/${group.xhrc2}/${group.xhrc3}/`
        );
        Swal.fire("Deleted!", "Level 3 Group has been deleted.", "success");

        // Reload Level 3 data after deletion
        if (selectedLevel1 && selectedLevel2) {
          const l3GroupsData: Level3Model[] = await getData(
            `/accounts/level-3/${selectedLevel1}/${selectedLevel2}/`
          );
          setL3Groups(l3GroupsData);
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

  const filteredLevel3GroupList = useMemo(() => {
    if (!searchQuery.trim()) return l3Groups;

    return l3Groups.filter((lg) =>
      lg.xdesc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [l3Groups, searchQuery]);

  const columnHelper = createColumnHelper<Level3Model>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("xhrc3", {
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
            {onNavigateToLevel4 && (
              <button
                onClick={() =>
                  onNavigateToLevel4(
                    info.row.original.xhrc1,
                    info.row.original.xhrc2,
                    info.row.original.xhrc3
                  )
                }
                className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-blue-400 dark:bg-gray-700 dark:hover:bg-[#13725A]"
                title="Go to Level 4"
              >
                <FiLogIn size={18} />
              </button>
            )}
          </div>
        ),
      }),
    ],
    [selectedLevel1, selectedLevel2, onNavigateToLevel4]
  );

  const table = useReactTable({
    data: filteredLevel3GroupList,
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
        {/* Left Section - Title and Filters */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white whitespace-nowrap">
            Level 3 Groups
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
          <div className="relative">
            <select
              value={selectedLevel2}
              onChange={handleLevel2Change}
              className="rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A] w-48"
              disabled={!selectedLevel1 || isLoadingL2}
            >
              <option value="">Select Level 2</option>
              {l2Groups.map((group) => (
                <option key={group.xhrc2} value={group.xhrc2}>
                  {group.xhrc2} - {group.xdesc}
                </option>
              ))}
            </select>
            {isLoadingL2 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-dotted border-gray-300 border-t-[#13725A] rounded-full animate-spin"></div>
              </div>
            )}
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
              disabled={!selectedLevel1 || !selectedLevel2}
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
            disabled={!selectedLevel1 || !selectedLevel2}
          >
            <FcPlus size={16} />
            New Group
          </button>
        </div>
      </div>

      {/* Info Message */}
      {(!selectedLevel1 || !selectedLevel2) && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            {!selectedLevel1
              ? "Please select a Level 1 group to view Level 2 groups."
              : "Please select a Level 2 group to view and manage Level 3 groups."}
          </p>
        </div>
      )}

      {/* Table */}
      {selectedLevel1 && selectedLevel2 && (
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
      {!isLoading &&
        selectedLevel1 &&
        selectedLevel2 &&
        l3Groups.length > 0 && (
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
                  New Level 3 Group
                </h2>
                <p className="text-sm text-emerald-100">
                  Create a new level 3 group for {selectedLevel1} /{" "}
                  {selectedLevel2}
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

              {/* Level 2 Selection (Read-only) */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level 2 Group <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={selectedLevel2}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Level 3 Code */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level 3 Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="xhrc3"
                  value={newL3Group.xhrc3}
                  onChange={handleCreateInputChange}
                  placeholder="Enter level 3 group code"
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
                  value={newL3Group.xdesc}
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
                  Edit Level 3 Group
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
                  value={editL3G.xhrc1}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Level 2 Selection (Read-only) */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level 2 Group <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={editL3G.xhrc2}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Level 3 Code */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level 3 Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="xhrc3"
                  value={editL3G.xhrc3}
                  onChange={handleEditInputChange}
                  placeholder="Enter level 3 group code"
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
                  value={editL3G.xdesc}
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
