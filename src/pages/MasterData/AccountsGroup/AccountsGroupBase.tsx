import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";

import Level1Group from "./Level1Group";
import Level2Group from "./Level2Group";
import Level3Group from "./Level3Group";
import Level4Group from "./Level4Group";
const tabs = [
  {
    id: "level1",
    label: "Level 1",
    component: <Level1Group />,
  },
  {
    id: "level2",
    label: "Level 2",
    component: <Level2Group />,
  },
  {
    id: "level3",
    label: "Level 3",
    component: <Level3Group />,
  },
  {
    id: "level4",
    label: "Level 4",
    component: <Level4Group />,
  },
];

export default function AccountsGroupBase() {
  const [activeTab, setActiveTab] = useState("level1");

  return (
    <div>
      <PageMeta
        title="Accounts Group - CropTrack"
        description="Masterdata for Accounts Group"
      />
      <PageBreadcrumb pageTitle="Accounts Group" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 sm:p-6">
        {/* Header + Tabs in same row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          {/* Header */}
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-xl mr-2">
            Accounts Group Setup
          </h3>

          {/* Tabs */}
          <div className="flex flex-1 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden w-full sm:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 relative text-center py-2 font-medium transition-colors duration-200
        ${
          activeTab === tab.id
            ? "text-[#13725A] border-b-4 border-[#13725A] font-semibold"
            : "text-gray-600 dark:text-gray-400 hover:text-[#13725A] bg-white dark:bg-gray-800"
        }`}
              >
                {tab.label}

                {/* Down arrow inside active tab
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
                )} */}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
}
