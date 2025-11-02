/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Modal } from "../../../components/ui/modal";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
// import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import SearchableSelect from "../../../components/ui/ut/SearchableSelect";
import type { LoanModel, CustomerModel, LoanForm } from "./types";
import { numberToWords } from "./helper";
import { fetchData, postData } from "../../../services/apiClient";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { FcEditImage, FcOk, FcPlus } from "react-icons/fc";
import { Spinner } from "../../../components/ui/ut/Spinner";

export default function LoanManagement() {
  //   const navigate = useNavigate();

  const certificateNumbers = [
    { value: "C001", label: "Certificate 001" },
    { value: "C002", label: "Certificate 002" },
    { value: "C003", label: "Certificate 003" },
  ];

  const [loanListData, setLoanListData] = useState<LoanModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [customersData, setCustomersData] = useState<CustomerModel[]>([]);
  const [agentsData, setAgentsData] = useState<CustomerModel[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const loanData: LoanModel[] = await fetchData("/accounts/loan/list/");
        setLoanListData(loanData);

        const customers: CustomerModel[] = await fetchData(
          "/masterdata/customers/list/",
          { customer_type: "Farmer" }
        );
        setCustomersData(customers);

        const agents: CustomerModel[] = await fetchData(
          "/masterdata/customers/list/",
          { customer_type: "Agent" }
        );
        setAgentsData(agents);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const initialLoanState: LoanForm = {
    loan_type: "",
    xref: "",
    certificate_no: "",
    xamount: "",
    interest_rate: "",
    interest_frequency: "",
    payment_type: "",
    payment_method: "",
    xnote: "",
  };

  const [newLoan, setNewLoan] = useState<LoanForm>(initialLoanState);

  const resetForm = () => setNewLoan(initialLoanState);

  const handleCreateInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewLoan((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  const filteredLoanListData = useMemo(() => {
    if (!searchQuery.trim()) return loanListData;

    return loanListData.filter((loan) =>
      loan.xref.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [loanListData, searchQuery]);

  const columnHelper = createColumnHelper<LoanModel>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("xtrnnum", {
        header: "Code",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("xref", {
        header: "Reference",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("certificate_no", {
        header: "Certificate",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("disbursement_date", {
        header: "Disbursement Date",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("interest_date", {
        header: "Effective From",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("xamount", {
        header: "Amount",
        cell: (info) => {
          const amount = Number(info.getValue());
          const amountText = numberToWords(Math.round(amount)) + " Taka";

          return (
            <span title={amountText}>{`${amount.toLocaleString("en-BD", {
              maximumFractionDigits: 2,
            })}`}</span>
          );
        },
      }),
      columnHelper.accessor("interest_rate", {
        header: "Interest Rate",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("xnote", {
        header: "Remarks",
        cell: (info) => info.getValue() || "N/A",
      }),
      columnHelper.accessor("xstatus", {
        header: "Status",
        cell: (info) => {
          const status = info.getValue();
          const getStatusStyle = (status: string) => {
            switch (status) {
              case "PENDING":
                return "bg-yellow-100 text-yellow-800 border border-yellow-300";
              case "POSTED":
                return "bg-green-100 text-green-800 border border-green-300";
              case "REJECTED":
                return "bg-red-100 text-red-800 border border-red-300";
              case "In Progress":
                return "bg-blue-100 text-blue-800 border border-blue-300";
              default:
                return "bg-gray-100 text-gray-800 border border-gray-300";
            }
          };
          return (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusStyle(
                status
              )}`}
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
          <div className="flex gap-2">
            {info.row.original.xstatus !== "POSTED" && (
              <>
                <button className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-[#13725A]">
                  <FcEditImage size={20} /> Edit
                </button>
                <button className="flex gap-1 px-2 py-1 text-sm rounded-sm bg-gray-200 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-[#13725A]">
                  <FcOk size={20} /> Post
                </button>
              </>
            )}
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredLoanListData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newLoan.loan_type ||
      !newLoan.xref ||
      (newLoan.loan_type === "CERTIFICATE" && !newLoan.certificate_no) ||
      !newLoan.xamount ||
      !newLoan.interest_rate
    ) {
      Swal.fire("Warning", "Please fill all required fields.", "warning");
      return;
    }
    try {
      await postData("/accounts/loan/create/", {
        ...newLoan,
        xamount: parseFloat(newLoan.xamount),
        interest_rate: parseFloat(newLoan.interest_rate),
      });
      Swal.fire("Success", "Loan created successfully!", "success");
      handleCloseCreateModal();
      const loanData: LoanModel[] = await fetchData("/accounts/loan/list/");
      setLoanListData(loanData);
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to create loan.",
        "error"
      );
    }
  };

  return (
    <div>
      <PageMeta
        title="Loan Management - CropTrack"
        description="Loan Management"
      />
      <PageBreadcrumb pageTitle="Accounts" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-7">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Loan Management
          </h2>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="relative w-64">
            <input
              type="search"
              className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 p-2 text-gray-800 dark:text-gray-100"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md bg-gray-200 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-[#13725A]"
          >
            <FcPlus size={18} /> Create Loan
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <Spinner />
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-gray-200 bg-zinc-500 text-white"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-2 text-left text-sm font-medium cursor-pointer"
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
                        className="px-6 py-4 text-sm text-gray-800 dark:text-gray-100"
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

        {/* Create Loan Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          className="max-w-[750px] m-4"
        >
          <div className="relative w-full rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#13725A] to-[#0F5E48] px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Create New Loan
                  </h2>
                  <p className="text-sm text-emerald-100">
                    Fill out the form below to create a new loan record
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
            <form onSubmit={handleCreateLoan} className="px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loan Type */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loan Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="loan_type"
                    value={newLoan.loan_type}
                    onChange={handleCreateInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm"
                  >
                    <option value="">Select loan type</option>
                    <option value="CERTIFICATE">Certificate Loan</option>
                    <option value="ADVANCE">Advance Loan</option>
                  </select>
                </div>

                {/* Reference */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference <span className="text-red-500">*</span>
                  </Label>

                  <SearchableSelect
                    options={
                      newLoan.loan_type === "CERTIFICATE"
                        ? customersData
                        : newLoan.loan_type === "ADVANCE"
                        ? agentsData
                        : []
                    }
                    value={newLoan.xref}
                    onChange={(val) =>
                      setNewLoan((prev) => ({ ...prev, xref: val }))
                    }
                    placeholder="Search customer or agent..."
                    disabled={!newLoan.loan_type}
                    // optional: customize how an option is displayed
                    labelRenderer={(opt) => (
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{opt.customer_code}</span>
                        <span className="text-gray-500">
                          — {opt.customer_name}
                        </span>
                      </span>
                    )}
                  />
                </div>

                {/* Certificate Number (only for CERTIFICATE loans) */}
                {newLoan.loan_type === "CERTIFICATE" && (
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Certificate Number <span className="text-red-500">*</span>
                    </Label>
                    <select
                      name="certificate_no"
                      value={newLoan.certificate_no}
                      onChange={handleCreateInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm"
                    >
                      <option value="">Select certificate</option>
                      {certificateNumbers.map((cert) => (
                        <option key={cert.value} value={cert.value}>
                          {cert.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loan Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="xamount"
                    value={newLoan.xamount}
                    onChange={handleCreateInputChange}
                    placeholder="0.00"
                    // step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm"
                  />
                </div>

                {/* Interest Rate */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interest Rate (%) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="interest_rate"
                    value={newLoan.interest_rate}
                    onChange={handleCreateInputChange}
                    placeholder="0.00"
                    // step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm"
                  />
                </div>

                {/* Interest Frequency */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interest Frequency <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="interest_frequency"
                    value={newLoan.interest_frequency}
                    onChange={handleCreateInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm"
                  >
                    <option value="">Select frequency</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>

                {/* Payment Type */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="payment_type"
                    value={newLoan.payment_type}
                    onChange={handleCreateInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm"
                  >
                    <option value="">Select payment type</option>
                    <option value="PRINCIPAL">Principal</option>
                    <option value="INTEREST">Interest</option>
                    <option value="FEES">Fees</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="payment_method"
                    value={newLoan.payment_method}
                    onChange={handleCreateInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm"
                  >
                    <option value="">Select payment method</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHECK">Check</option>
                    <option value="MFS">Mobile Financial Service</option>
                  </select>
                </div>

                {/* Note */}
                <div className="md:col-span-2">
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Notes
                  </Label>
                  <textarea
                    name="xnote"
                    value={newLoan.xnote}
                    onChange={handleCreateInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:border-transparent transition-all shadow-sm resize-none"
                    placeholder="Enter any additional notes or comments..."
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
                  Create Loan
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}
