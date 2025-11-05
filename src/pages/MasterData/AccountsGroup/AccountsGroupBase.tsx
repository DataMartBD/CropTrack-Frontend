import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";

import Level1Group from "./Level1Group";
import Level2Group from "./Level2Group";
import Level3Group from "./Level3Group";
import Level4Group from "./Level4Group";

export default function AccountsGroupBase() {
  const [activeTab, setActiveTab] = useState("level1");

  // Navigation states for Level 2
  const [selectedLevel1ForLevel2, setSelectedLevel1ForLevel2] = useState("");

  // Navigation states for Level 3
  const [selectedLevel1ForLevel3, setSelectedLevel1ForLevel3] = useState("");
  const [selectedLevel2ForLevel3, setSelectedLevel2ForLevel3] = useState("");

  // Navigation states for Level 4
  const [selectedLevel1ForLevel4, setSelectedLevel1ForLevel4] = useState("");
  const [selectedLevel2ForLevel4, setSelectedLevel2ForLevel4] = useState("");
  const [selectedLevel3ForLevel4, setSelectedLevel3ForLevel4] = useState("");

  // Navigation handlers
  const handleNavigateToLevel2 = (level1Code: string) => {
    setSelectedLevel1ForLevel2(level1Code);
    setActiveTab("level2");
  };

  const handleNavigateToLevel3 = (level1Code: string, level2Code: string) => {
    setSelectedLevel1ForLevel3(level1Code);
    setSelectedLevel2ForLevel3(level2Code);
    setActiveTab("level3");
  };

  const handleNavigateToLevel4 = (
    level1Code: string,
    level2Code: string,
    level3Code: string
  ) => {
    setSelectedLevel1ForLevel4(level1Code);
    setSelectedLevel2ForLevel4(level2Code);
    setSelectedLevel3ForLevel4(level3Code);
    setActiveTab("level4");
  };

  // Reset navigation states when manually changing tabs
  const handleManualTabChange = (tabId: string) => {
    // Clear navigation states when manually switching tabs
    if (tabId !== "level2") {
      setSelectedLevel1ForLevel2("");
    }
    if (tabId !== "level3") {
      setSelectedLevel1ForLevel3("");
      setSelectedLevel2ForLevel3("");
    }
    if (tabId !== "level4") {
      setSelectedLevel1ForLevel4("");
      setSelectedLevel2ForLevel4("");
      setSelectedLevel3ForLevel4("");
    }
    setActiveTab(tabId);
  };

  const tabs = [
    {
      id: "level1",
      label: "Level 1",
      component: <Level1Group onNavigateToLevel2={handleNavigateToLevel2} />,
    },
    {
      id: "level2",
      label: "Level 2",
      component: (
        <Level2Group
          preselectedLevel1={selectedLevel1ForLevel2}
          onNavigateToLevel3={handleNavigateToLevel3}
        />
      ),
    },
    {
      id: "level3",
      label: "Level 3",
      component: (
        <Level3Group
          preselectedLevel1={selectedLevel1ForLevel3}
          preselectedLevel2={selectedLevel2ForLevel3}
          onNavigateToLevel4={handleNavigateToLevel4}
        />
      ),
    },
    {
      id: "level4",
      label: "Level 4",
      component: (
        <Level4Group
          preselectedLevel1={selectedLevel1ForLevel4}
          preselectedLevel2={selectedLevel2ForLevel4}
          preselectedLevel3={selectedLevel3ForLevel4}
        />
      ),
    },
  ];

  return (
    <div>
      <PageMeta
        title="Accounts Group - CropTrack"
        description="Masterdata for Accounts Group"
      />
      <PageBreadcrumb pageTitle="Accounts Group" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 sm:p-6">
        {/* Header + Tabs */}
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
                onClick={() => handleManualTabChange(tab.id)}
                className={`flex-1 relative text-center py-2 font-medium transition-colors duration-200
                  ${
                    activeTab === tab.id
                      ? "text-[#13725A] border-b-4 border-[#13725A] font-semibold"
                      : "text-gray-600 dark:text-gray-400 hover:text-[#13725A] bg-gray-100 dark:bg-gray-800"
                  }`}
              >
                {tab.label}
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
