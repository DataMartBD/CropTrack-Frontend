// ChartOfAccountsBase.tsx
import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import AccountsGroupTree from "./AccountsGroupTree";
import ControllerAccounts from "./ControllerAccounts";
import SubAccounts from "./SubAccounts";
import { AccountsGroup } from "./types";

export default function ChartOfAccountsBase() {
  const [activeTab, setActiveTab] = useState<"controller" | "subaccount">(
    "controller"
  );
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedGroupData, setSelectedGroupData] =
    useState<AccountsGroup | null>(null);

  const tabs = [
    { id: "controller", label: "Controller Account" },
    { id: "subaccount", label: "Sub Account" },
  ];

  const handleSelectGroup = (groupId: string, groupData: AccountsGroup) => {
    setSelectedGroup(groupId);
    setSelectedGroupData(groupData);
  };

  return (
    <div>
      <PageMeta
        title="Chart of Accounts - CropTrack"
        description="Manage your Chart of Accounts"
      />
      <PageBreadcrumb pageTitle="Chart of Accounts" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 sm:p-6">
        {/* <div className="mb-6">
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-xl">
            Chart of Accounts Setup
          </h3>
        </div> */}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="lg:w-1/5">
            <AccountsGroupTree
              selectedGroup={selectedGroup}
              onSelectGroup={handleSelectGroup}
            />
          </div>

          {/* Right Content Area */}
          <div className="lg:w-4/5">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setActiveTab(tab.id as "controller" | "subaccount")
                      }
                      className={`relative px-6 py-3 font-medium transition-colors duration-200 ${
                        activeTab === tab.id
                          ? "text-[#13725A] border-b-2 border-[#13725A] font-semibold"
                          : "text-gray-600 dark:text-gray-400 hover:text-[#13725A]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "controller" && (
                  <ControllerAccounts selectedGroup={selectedGroupData} />
                )}
                {activeTab === "subaccount" && <SubAccounts />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
