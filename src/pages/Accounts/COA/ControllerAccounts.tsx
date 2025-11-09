import {
  ControllerAccountsProps,
  ControllerAccountModel,
  ControllerAccountForm,
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
import { FiEdit, FiTrash2, FiPlusCircle } from "react-icons/fi";
import { Spinner } from "../../../components/ui/ut/Spinner";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import Swal from "sweetalert2";

import type {
  Level1Model,
  Level2Model,
  Level3Model,
  Level4Model,
} from "../AccountsGroup/types";
import { LuFolderTree } from "react-icons/lu";

export default function ControllerAccounts({
  selectedGroup,
  onSwitchToSubAccount,
}: ControllerAccountsProps) {
  const [controllerAccounts, setControllerAccounts] = useState<
    ControllerAccountModel[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [l1Groups, setL1Groups] = useState<Level1Model[]>([]);
  const [l2Groups, setL2Groups] = useState<Level2Model[]>([]);
  const [l3Groups, setL3Groups] = useState<Level3Model[]>([]);
  const [l4Groups, setL4Groups] = useState<Level4Model[]>([]);
  const [selectedLevel1, setSelectedLevel1] = useState<string>("");
  const [selectedLevel2, setSelectedLevel2] = useState<string>("");
  const [selectedLevel3, setSelectedLevel3] = useState<string>("");
  const [selectedLevel4, setSelectedLevel4] = useState<string>("");
  const [isLoadingL1, setIsLoadingL1] = useState(false);
  const [isLoadingL2, setIsLoadingL2] = useState(false);
  const [isLoadingL3, setIsLoadingL3] = useState(false);
  const [isLoadingL4, setIsLoadingL4] = useState(false);

  const [editSelectedLevel1, setEditSelectedLevel1] = useState<string>("");
  const [editSelectedLevel2, setEditSelectedLevel2] = useState<string>("");
  const [editSelectedLevel3, setEditSelectedLevel3] = useState<string>("");
  const [editSelectedLevel4, setEditSelectedLevel4] = useState<string>("");

  // Dropdown options
  const accountTypeOptions = [
    { value: "", label: "Select Account Type" },
    { value: "Asset", label: "Asset" },
    { value: "Expenditure", label: "Expenditure" },
    { value: "Income", label: "Income" },
    { value: "Liability", label: "Liability" },
  ];

  const accountUsageOptions = [
    { value: "", label: "Select Account Usage" },
    { value: "AP", label: "AP" },
    { value: "AR", label: "AR" },
    { value: "Bank", label: "Bank" },
    { value: "Cash", label: "Cash" },
    { value: "Ledger", label: "Ledger" },
  ];

  const accountSourceOptions = [
    { value: "", label: "Select Account Source" },
    { value: "Customer", label: "Customer" },
    { value: "Employee", label: "Employee" },
    { value: "LC", label: "LC" },
    { value: "None", label: "None" },
    { value: "Subaccount", label: "Subaccount" },
    { value: "Supplier", label: "Supplier" },
  ];

  const initialControllerAccountState: ControllerAccountForm = {
    xacc: "",
    xdesc: "",
    xacctype: "",
    xaccusage: "",
    xaccsource: "",
    xaccgroup: "",
    xhrc1: "",
    xhrc2: "",
    xhrc3: "",
    xhrc4: "",
    xhrc5: "",
    zactive: true,
  };

  const [newControllerAccount, setNewControllerAccount] =
    useState<ControllerAccountForm>(initialControllerAccountState);
  const [editControllerAccount, setEditControllerAccount] =
    useState<ControllerAccountForm>(initialControllerAccountState);

  // Load L1 Groups
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
  }, [selectedLevel1]);

  useEffect(() => {
    const loadLevel3Data = async () => {
      if (!selectedLevel1 || !selectedLevel2) {
        setL3Groups([]);
        setSelectedLevel3("");
        return;
      }

      setIsLoadingL3(true);
      try {
        const l3GroupsData: Level3Model[] = await getData(
          `/accounts/level-3/${selectedLevel1}/${selectedLevel2}/`
        );
        setL3Groups(l3GroupsData);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load Level 3 groups", "error");
        setL3Groups([]);
        setSelectedLevel3("");
      } finally {
        setIsLoadingL3(false);
      }
    };

    loadLevel3Data();
  }, [selectedLevel1, selectedLevel2]);

  useEffect(() => {
    const loadLevel4Data = async () => {
      if (!selectedLevel1 || !selectedLevel2 || !selectedLevel3) {
        setL4Groups([]);
        setSelectedLevel4("");
        return;
      }

      setIsLoadingL4(true);
      try {
        const l4GroupsData: Level4Model[] = await getData(
          `/accounts/level-4/${selectedLevel1}/${selectedLevel2}/${selectedLevel3}/`
        );
        setL4Groups(l4GroupsData);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load Level 4 groups", "error");
        setL4Groups([]);
        setSelectedLevel4("");
      } finally {
        setIsLoadingL4(false);
      }
    };

    loadLevel4Data();
  }, [selectedLevel1, selectedLevel2, selectedLevel3]);

  useEffect(() => {
    const loadEditLevel2Data = async () => {
      if (!editSelectedLevel1) {
        setL2Groups([]);
        return;
      }

      setIsLoadingL2(true);
      try {
        const l2GroupsData: Level2Model[] = await getData(
          `/accounts/level-2/${editSelectedLevel1}/`
        );
        setL2Groups(l2GroupsData);
      } catch (err) {
        console.error(err);
        setL2Groups([]);
      } finally {
        setIsLoadingL2(false);
      }
    };

    if (isEditModalOpen) {
      loadEditLevel2Data();
    }
  }, [editSelectedLevel1, isEditModalOpen]);

  useEffect(() => {
    const loadEditLevel3Data = async () => {
      if (!editSelectedLevel1 || !editSelectedLevel2) {
        setL3Groups([]);
        return;
      }

      setIsLoadingL3(true);
      try {
        const l3GroupsData: Level3Model[] = await getData(
          `/accounts/level-3/${editSelectedLevel1}/${editSelectedLevel2}/`
        );
        setL3Groups(l3GroupsData);
      } catch (err) {
        console.error(err);
        setL3Groups([]);
      } finally {
        setIsLoadingL3(false);
      }
    };

    if (isEditModalOpen) {
      loadEditLevel3Data();
    }
  }, [editSelectedLevel1, editSelectedLevel2, isEditModalOpen]);

  useEffect(() => {
    const loadEditLevel4Data = async () => {
      if (!editSelectedLevel1 || !editSelectedLevel2 || !editSelectedLevel3) {
        setL4Groups([]);
        return;
      }

      setIsLoadingL4(true);
      try {
        const l4GroupsData: Level4Model[] = await getData(
          `/accounts/level-4/${editSelectedLevel1}/${editSelectedLevel2}/${editSelectedLevel3}/`
        );
        setL4Groups(l4GroupsData);
      } catch (err) {
        console.error(err);
        setL4Groups([]);
      } finally {
        setIsLoadingL4(false);
      }
    };

    if (isEditModalOpen) {
      loadEditLevel4Data();
    }
  }, [
    editSelectedLevel1,
    editSelectedLevel2,
    editSelectedLevel3,
    isEditModalOpen,
  ]);

  useEffect(() => {
    if (isCreateModalOpen) {
      resetForm();
    }
  }, [isCreateModalOpen]);

  const handlePagination = (action: () => void) => {
    action();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const resetForm = () => {
    setNewControllerAccount(initialControllerAccountState);
    setSelectedLevel1("");
    setSelectedLevel2("");
    setSelectedLevel3("");
    setSelectedLevel4("");
  };

  const handleCreateInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setNewControllerAccount((prev) => ({ ...prev, [name]: checked }));
    } else {
      setNewControllerAccount((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setEditControllerAccount((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEditControllerAccount((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLevel1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedLevel1(value);
    setSelectedLevel2("");
    setSelectedLevel3("");
    setSelectedLevel4("");
    setNewControllerAccount((prev) => ({
      ...prev,
      xhrc1: value,
      xhrc2: "",
      xhrc3: "",
      xhrc4: "",
    }));
  };

  const handleLevel2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedLevel2(value);
    setSelectedLevel3("");
    setSelectedLevel4("");
    setNewControllerAccount((prev) => ({
      ...prev,
      xhrc2: value,
      xhrc3: "",
      xhrc4: "",
    }));
  };

  const handleLevel3Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedLevel3(value);
    setSelectedLevel4("");
    setNewControllerAccount((prev) => ({
      ...prev,
      xhrc3: value,
      xhrc4: "",
    }));
  };

  const handleLevel4Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedLevel4(value);
    setNewControllerAccount((prev) => ({
      ...prev,
      xhrc4: value,
    }));
  };

  const handleEditLevel1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEditSelectedLevel1(value);
    setEditSelectedLevel2("");
    setEditSelectedLevel3("");
    setEditSelectedLevel4("");
    setEditControllerAccount((prev) => ({
      ...prev,
      xhrc1: value,
      xhrc2: "",
      xhrc3: "",
      xhrc4: "",
    }));
  };

  const handleEditLevel2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEditSelectedLevel2(value);
    setEditSelectedLevel3("");
    setEditSelectedLevel4("");
    setEditControllerAccount((prev) => ({
      ...prev,
      xhrc2: value,
      xhrc3: "",
      xhrc4: "",
    }));
  };

  const handleEditLevel3Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEditSelectedLevel3(value);
    setEditSelectedLevel4("");
    setEditControllerAccount((prev) => ({
      ...prev,
      xhrc3: value,
      xhrc4: "",
    }));
  };

  const handleEditLevel4Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setEditSelectedLevel4(value);
    setEditControllerAccount((prev) => ({
      ...prev,
      xhrc4: value,
    }));
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleOpenEditModal = (account: ControllerAccountModel) => {
    setEditControllerAccount({
      xacc: account.xacc || "",
      xdesc: account.xdesc || "",
      xacctype: account.xacctype || "",
      xaccusage: account.xaccusage || "",
      xaccsource: account.xaccsource || "",
      xaccgroup: account.xaccgroup || "",
      xhrc1: account.xhrc1 || "",
      xhrc2: account.xhrc2 || "",
      xhrc3: account.xhrc3 || "",
      xhrc4: account.xhrc4 || "",
      xhrc5: account.xhrc5 || "",
      zactive: account.zactive || true,
    });

    setEditSelectedLevel1(account.xhrc1 || "");
    setEditSelectedLevel2(account.xhrc2 || "");
    setEditSelectedLevel3(account.xhrc3 || "");
    setEditSelectedLevel4(account.xhrc4 || "");

    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditControllerAccount(initialControllerAccountState);
    setEditSelectedLevel1("");
    setEditSelectedLevel2("");
    setEditSelectedLevel3("");
    setEditSelectedLevel4("");
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newControllerAccount.xacc ||
      !newControllerAccount.xdesc ||
      !newControllerAccount.xacctype ||
      !newControllerAccount.xaccusage ||
      !newControllerAccount.xaccsource
    ) {
      Swal.fire("Warning", "Please fill all required fields.", "warning");
      return;
    }

    if (
      !selectedLevel1 &&
      !selectedLevel2 &&
      !selectedLevel3 &&
      !selectedLevel4
    ) {
      Swal.fire(
        "Warning",
        "Please select at least one account group level.",
        "warning"
      );
      return;
    }

    try {
      await postData("/accounts/chartofaccounts/", newControllerAccount);
      Swal.fire(
        "Success",
        "Controller Account created successfully!",
        "success"
      );
      handleCloseCreateModal();
      await loadControllerAccounts();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to create account.",
        "error"
      );
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editControllerAccount.xdesc) {
      Swal.fire("Warning", "Please fill Description field.", "warning");
      return;
    }
    try {
      await putData(
        `/accounts/chartofaccounts/${editControllerAccount.xacc}/`,
        editControllerAccount
      );
      Swal.fire(
        "Success",
        "Controller Account updated successfully!",
        "success"
      );
      handleCloseEditModal();
      await loadControllerAccounts();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update account.",
        "error"
      );
    }
  };

  const handleDeleteAccount = async (xacc: string) => {
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
        await deleteData(`/accounts/chartofaccounts/${xacc}/`);
        Swal.fire(
          "Deleted!",
          "Controller Account has been deleted.",
          "success"
        );
        await loadControllerAccounts();
      } catch (err: any) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "Failed to delete account.",
          "error"
        );
      }
    }
  };

  const loadControllerAccounts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const xhrcValue =
        selectedGroup?.xhrc1 ||
        selectedGroup?.xhrc2 ||
        selectedGroup?.xhrc3 ||
        selectedGroup?.xhrc4;

      if (xhrcValue) {
        params.append("xhrc", xhrcValue);
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";
      const url = `/accounts/chartofaccounts/${queryString}`;

      const controllerAccs: ControllerAccountModel[] = await getData(url);
      setControllerAccounts(controllerAccs);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load controller accounts.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadControllerAccounts();
  }, [selectedGroup]);

  const filteredControllerAccountList = useMemo(() => {
    if (!searchQuery.trim()) return controllerAccounts;

    return controllerAccounts.filter(
      (account) =>
        account.xdesc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.xacc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.xacctype?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.xaccgroup?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [controllerAccounts, searchQuery]);

  const columnHelper = createColumnHelper<ControllerAccountModel>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("xacc", {
        header: "Account Code",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("xdesc", {
        header: "Description",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("xacctype", {
        header: "Account Type",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("xaccusage", {
        header: "Usage",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("xaccsource", {
        header: "Source",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("zactive", {
        header: "Status",
        cell: (info) => (
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              info.getValue()
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {info.getValue() ? "Active" : "Inactive"}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => {
          const account = info.row.original;
          const isSubaccount = account.xaccsource === "Subaccount";
          return (
            <div className="flex gap-1 justify-end">
              {isSubaccount && (
                <button
                  onClick={() => onSwitchToSubAccount?.(account)}
                  className="flex px-1 py-1 text-sm rounded-sm hover:text-blue-600"
                  title="Open Sub Accounts"
                >
                  <LuFolderTree size={18} />
                </button>
              )}
              <button
                onClick={() => handleOpenEditModal(info.row.original)}
                className="flex px-1 py-1 text-sm rounded-sm hover:text-amber-600"
                title="Edit"
              >
                <FiEdit size={18} />
              </button>
              <button
                onClick={() => handleDeleteAccount(info.row.original.xacc)}
                className="flex px-1 py-1 text-sm rounded-sm hover:text-red-600"
                title="Delete"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredControllerAccountList,
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
        <div>
          {selectedGroup ? (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Controller Accounts
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Showing accounts filtered by:{" "}
                {selectedGroup.xhrc1 ||
                  selectedGroup.xhrc2 ||
                  selectedGroup.xhrc3 ||
                  selectedGroup.xhrc4}{" "}
                - {selectedGroup.xdesc}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                All Controller Accounts
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Please select a group to filter accounts
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="search"
              className="w-48 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
              placeholder="Search accounts..."
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

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:ring-offset-2 transition-colors"
          >
            <FiPlusCircle size={18} />
            Controller Account
          </button>
        </div>
      </div>

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

      {/* Create Controller Account Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        className="max-w-4xl m-4"
      >
        <div className="relative w-full rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#13725A] to-[#0F5E48] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  New Controller Account
                </h2>
                <p className="text-xs text-emerald-100 mt-1">
                  Create a new controller account
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
              >
                <svg
                  className="w-5 h-5"
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

          <form onSubmit={handleCreateAccount} className="px-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Code <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      name="xacc"
                      value={newControllerAccount.xacc}
                      onChange={handleCreateInputChange}
                      rows={1}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A] resize-none"
                      placeholder="Enter account code"
                    />
                  </div>
                </div>

                <div className="col-span-2 space-y-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      name="xdesc"
                      value={newControllerAccount.xdesc}
                      onChange={handleCreateInputChange}
                      rows={1}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A] resize-none"
                      placeholder="Enter account description"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="xacctype"
                    value={newControllerAccount.xacctype}
                    onChange={handleCreateInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                  >
                    {accountTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Usage <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="xaccusage"
                    value={newControllerAccount.xaccusage}
                    onChange={handleCreateInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                  >
                    {accountUsageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Source <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="xaccsource"
                    value={newControllerAccount.xaccsource}
                    onChange={handleCreateInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                  >
                    {accountSourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Account Group Assignment{" "}
                  <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (Select at least one level)
                  </span>
                </Label>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level 1
                    </Label>
                    <div className="relative">
                      <select
                        value={selectedLevel1}
                        onChange={handleLevel1Change}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                        disabled={isLoadingL1}
                      >
                        <option value="">Select Level 1</option>
                        {l1Groups.map((group) => (
                          <option key={group.xhrc1} value={group.xhrc1}>
                            {group.xhrc1} - {group.xdesc}
                          </option>
                        ))}
                      </select>
                      {isLoadingL1 && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="w-3 h-3 border-2 border-dotted border-gray-300 border-t-[#13725A] rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level 2
                    </Label>
                    <div className="relative">
                      <select
                        value={selectedLevel2}
                        onChange={handleLevel2Change}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
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
                          <div className="w-3 h-3 border-2 border-dotted border-gray-300 border-t-[#13725A] rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level 3
                    </Label>
                    <div className="relative">
                      <select
                        value={selectedLevel3}
                        onChange={handleLevel3Change}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                        disabled={!selectedLevel2 || isLoadingL3}
                      >
                        <option value="">Select Level 3</option>
                        {l3Groups.map((group) => (
                          <option key={group.xhrc3} value={group.xhrc3}>
                            {group.xhrc3} - {group.xdesc}
                          </option>
                        ))}
                      </select>
                      {isLoadingL3 && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="w-3 h-3 border-2 border-dotted border-gray-300 border-t-[#13725A] rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level 4
                    </Label>
                    <div className="relative">
                      <select
                        value={selectedLevel4}
                        onChange={handleLevel4Change}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                        disabled={!selectedLevel3 || isLoadingL4}
                      >
                        <option value="">Select Level 4</option>
                        {l4Groups.map((group) => (
                          <option key={group.xhrc4} value={group.xhrc4}>
                            {group.xhrc4} - {group.xdesc}
                          </option>
                        ))}
                      </select>
                      {isLoadingL4 && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="w-3 h-3 border-2 border-dotted border-gray-300 border-t-[#13725A] rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseCreateModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Edit Controller Account Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        className="max-w-4xl m-4"
      >
        <div className="relative w-full rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Edit Controller Account
                </h2>
                <p className="text-xs text-amber-100 mt-1">
                  Update controller account details
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-all"
              >
                <svg
                  className="w-5 h-5"
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

          <form onSubmit={handleUpdateAccount} className="px-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Account Code
                    </Label>
                    <div className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {editControllerAccount.xacc}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Account code cannot be changed
                    </p>
                  </div>
                </div>

                <div className="col-span-2 space-y-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      name="xdesc"
                      value={editControllerAccount.xdesc}
                      onChange={handleEditInputChange}
                      rows={1}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A] resize-none"
                      placeholder="Enter account description"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="xacctype"
                    value={editControllerAccount.xacctype}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                  >
                    {accountTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Usage <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="xaccusage"
                    value={editControllerAccount.xaccusage}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                  >
                    {accountUsageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Source <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="xaccsource"
                    value={editControllerAccount.xaccsource}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                  >
                    {accountSourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Account Group Assignment{" "}
                  <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (Select at least one level)
                  </span>
                </Label>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level 1
                    </Label>
                    <div className="relative">
                      <select
                        value={editSelectedLevel1}
                        onChange={handleEditLevel1Change}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                        disabled={isLoadingL1}
                      >
                        <option value="">Select Level 1</option>
                        {l1Groups.map((group) => (
                          <option key={group.xhrc1} value={group.xhrc1}>
                            {group.xhrc1} - {group.xdesc}
                          </option>
                        ))}
                      </select>
                      {isLoadingL1 && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="w-3 h-3 border-2 border-dotted border-gray-300 border-t-[#13725A] rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level 2
                    </Label>
                    <div className="relative">
                      <select
                        value={editSelectedLevel2}
                        onChange={handleEditLevel2Change}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                        disabled={!editSelectedLevel1 || isLoadingL2}
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
                          <div className="w-3 h-3 border-2 border-dotted border-gray-300 border-t-[#13725A] rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level 3
                    </Label>
                    <div className="relative">
                      <select
                        value={editSelectedLevel3}
                        onChange={handleEditLevel3Change}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                        disabled={!editSelectedLevel2 || isLoadingL3}
                      >
                        <option value="">Select Level 3</option>
                        {l3Groups.map((group) => (
                          <option key={group.xhrc3} value={group.xhrc3}>
                            {group.xhrc3} - {group.xdesc}
                          </option>
                        ))}
                      </select>
                      {isLoadingL3 && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="w-3 h-3 border-2 border-dotted border-gray-300 border-t-[#13725A] rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Level 4
                    </Label>
                    <div className="relative">
                      <select
                        value={editSelectedLevel4}
                        onChange={handleEditLevel4Change}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                        disabled={!editSelectedLevel3 || isLoadingL4}
                      >
                        <option value="">Select Level 4</option>
                        {l4Groups.map((group) => (
                          <option key={group.xhrc4} value={group.xhrc4}>
                            {group.xhrc4} - {group.xdesc}
                          </option>
                        ))}
                      </select>
                      {isLoadingL4 && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="w-3 h-3 border-2 border-dotted border-gray-300 border-t-[#13725A] rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Account Status
                </Label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="zactive"
                    checked={editControllerAccount.zactive}
                    onChange={handleEditInputChange}
                    className="rounded border-gray-300 text-[#13725A] focus:ring-[#13725A]"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Active Account
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                Update Account
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
