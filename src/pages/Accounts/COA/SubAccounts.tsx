// SubAccounts.tsx
import { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlusCircle } from "react-icons/fi";
import { Spinner } from "../../../components/ui/ut/Spinner";
import { Modal } from "../../../components/ui/modal";
import Label from "../../../components/form/Label";
import Swal from "sweetalert2";
import {
  getData,
  postData,
  putData,
  deleteData,
} from "../../../services/apiClient";
import {
  SubAccountModel,
  SubAccountForm,
  ControllerAccountModel,
} from "./types";

interface SubAccountsProps {
  controllerAccount: ControllerAccountModel | null;
  onBackToController: () => void;
}

export default function SubAccounts({
  controllerAccount,
  // onBackToController,
}: SubAccountsProps) {
  const [subAccounts, setSubAccounts] = useState<SubAccountModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initialSubAccountState: SubAccountForm = {
    xacc: controllerAccount?.xacc || "",
    xsub: "",
    xdesc: "",
  };

  const [newSubAccount, setNewSubAccount] = useState<SubAccountForm>(
    initialSubAccountState
  );
  const [editSubAccount, setEditSubAccount] = useState<SubAccountForm>(
    initialSubAccountState
  );

  useEffect(() => {
    if (controllerAccount) {
      loadSubAccounts();

      setNewSubAccount((prev) => ({ ...prev, xacc: controllerAccount.xacc }));
    }
  }, [controllerAccount]);

  const loadSubAccounts = async () => {
    if (!controllerAccount) return;

    setIsLoading(true);
    try {
      const subAccountsData: SubAccountModel[] = await getData(
        `/accounts/subaccounts/${controllerAccount.xacc}/`
      );
      setSubAccounts(subAccountsData);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load sub accounts.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewSubAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setEditSubAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSubAccount.xsub || !newSubAccount.xdesc) {
      Swal.fire(
        "Warning",
        "Please fill Sub Account Number and Description.",
        "warning"
      );
      return;
    }

    try {
      const createData = {
        xacc: newSubAccount.xacc,
        xsub: newSubAccount.xsub,
        xdesc: newSubAccount.xdesc,
      };

      await postData(
        `/accounts/subaccounts/${controllerAccount?.xacc}/`,
        createData
      );
      Swal.fire("Success", "Sub Account created successfully!", "success");
      setIsCreateModalOpen(false);
      setNewSubAccount(initialSubAccountState);
      await loadSubAccounts();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to create sub account.",
        "error"
      );
    }
  };

  const handleUpdateSubAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubAccount.xdesc) {
      Swal.fire("Warning", "Please fill Description.", "warning");
      return;
    }
    try {
      const updateData = {
        xacc: editSubAccount.xacc,
        xsub: editSubAccount.xsub,
        xdesc: editSubAccount.xdesc,
      };

      await putData(
        `/accounts/subaccounts/${editSubAccount.xacc}/${editSubAccount.xsub}/`,
        updateData
      );
      Swal.fire("Success", "Sub Account updated successfully!", "success");
      setIsEditModalOpen(false);
      await loadSubAccounts();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to update sub account.",
        "error"
      );
    }
  };

  const handleDeleteSubAccount = async (xacc: string, xsub: string) => {
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
        await deleteData(`/accounts/subaccounts/${xacc}/${xsub}/`);
        Swal.fire("Deleted!", "Sub Account has been deleted.", "success");
        await loadSubAccounts();
      } catch (err: any) {
        Swal.fire(
          "Error",
          err.response?.data?.message || "Failed to delete sub account.",
          "error"
        );
      }
    }
  };

  const handleOpenEditModal = (account: SubAccountModel) => {
    setEditSubAccount({
      xacc: account.xacc,
      xsub: account.xsub,
      xdesc: account.xdesc,
    });
    setIsEditModalOpen(true);
  };

  const filteredSubAccounts = subAccounts.filter(
    (account) =>
      account.xdesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.xsub.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.xacc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!controllerAccount) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Please select a controller account first.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white/90">
            Sub Accounts - {controllerAccount.xacc}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {controllerAccount.xdesc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="search"
              className="w-48 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
              placeholder="Search sub accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#13725A] focus:ring-offset-2 transition-colors"
          >
            <FiPlusCircle size={18} />
            Sub Account
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <Spinner />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="border-b border-gray-200 bg-zinc-500 dark:bg-slate-700 text-white">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Controller Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Sub Account Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubAccounts.map((account) => (
                <tr
                  key={`${account.xacc}-${account.xsub}`}
                  className="bg-white dark:bg-transparent"
                >
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
                    {account.xacc}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
                    {account.xsub}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
                    {account.xdesc}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 dark:text-gray-100">
                    {new Date(account.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEditModal(account)}
                        className="flex px-1 py-1 text-sm rounded-sm hover:text-amber-600"
                        title="Edit"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteSubAccount(account.xacc, account.xsub)
                        }
                        className="flex px-1 py-1 text-sm rounded-sm hover:text-red-600"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubAccounts.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No sub accounts found. Create your first sub account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        className="max-w-md"
      >
        <div className="relative w-full rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#13725A] to-[#0F5E48] px-6 py-4">
            <h2 className="text-xl font-bold text-white">New Sub Account</h2>
            <p className="text-xs text-emerald-100 mt-1">
              Controller: {controllerAccount.xacc} - {controllerAccount.xdesc}
            </p>
          </div>

          <form onSubmit={handleCreateSubAccount} className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sub Account Number <span className="text-red-500">*</span>
                </Label>
                <input
                  type="text"
                  name="xsub"
                  value={newSubAccount.xsub}
                  onChange={handleCreateInputChange}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                  placeholder="Enter sub account number"
                />
              </div>

              <div>
                <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </Label>
                <input
                  type="text"
                  name="xdesc"
                  value={newSubAccount.xdesc}
                  onChange={handleCreateInputChange}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                  placeholder="Enter account description"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-[#13725A] hover:bg-[#105E4A] rounded-lg transition-colors"
              >
                Create Sub Account
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="max-w-md"
      >
        <div className="relative w-full rounded-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Edit Sub Account</h2>
            <p className="text-xs text-amber-100 mt-1">
              {editSubAccount.xacc} - {editSubAccount.xsub}
            </p>
          </div>

          <form onSubmit={handleUpdateSubAccount} className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Controller Account
                </Label>
                <div className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {editSubAccount.xacc}
                </div>
              </div>

              <div>
                <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sub Account Number
                </Label>
                <div className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {editSubAccount.xsub}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sub account number cannot be changed
                </p>
              </div>

              <div>
                <Label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </Label>
                <input
                  type="text"
                  name="xdesc"
                  value={editSubAccount.xdesc}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#13725A]"
                  placeholder="Enter account description"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                Update Sub Account
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
