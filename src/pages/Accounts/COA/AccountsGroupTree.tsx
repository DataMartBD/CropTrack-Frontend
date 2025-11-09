// AccountsGroupTree.tsx
import { useState, useEffect } from "react";
import { getData } from "../../../services/apiClient";
import { FiPlus, FiMinus } from "react-icons/fi";
import type { AccountsGroup, AccountsGroupTreeProps } from "./types";

export default function AccountsGroupTree({
  selectedGroup,
  onSelectGroup,
}: AccountsGroupTreeProps) {
  const [accountsGroups, setAccountsGroups] = useState<AccountsGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response: AccountsGroup[] = await getData(
          "/accounts/groups/hierarchy/"
        );
        setAccountsGroups(response);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getGroupId = (group: AccountsGroup): string => {
    return group.xhrc4 || group.xhrc3 || group.xhrc2 || group.xhrc1 || "";
  };

  const getGroupCode = (group: AccountsGroup): string => {
    return group.xhrc4 || group.xhrc3 || group.xhrc2 || group.xhrc1 || "";
  };

const handleGroupClick = (group: AccountsGroup) => {
  const groupId = getGroupId(group);
  
  if (selectedGroup === groupId) {
    onSelectGroup(null, null);
  } else {
    // Pass the ID as string but also pass the full group data
    onSelectGroup(groupId, group);
  }
};

  const renderTreeItem = (group: AccountsGroup, level: number = 0) => {
    const groupId = getGroupId(group);
    const groupCode = getGroupCode(group);
    const hasChildren = group.children && group.children.length > 0;
    const isExpanded = expandedGroups.has(groupId);
    const isSelected = selectedGroup === groupId;

    return (
      <div key={groupId} className="select-none">
        <div
          className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${
            isSelected
              ? "bg-[#13725A] text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleGroup(groupId);
              }}
              className={`flex items-center justify-center w-5 h-5 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              } ${
                isSelected ? "text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {isExpanded ? (
                <FiMinus className="w-4 h-4" />
              ) : (
                <FiPlus className="w-4 h-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5 h-5" />}

          <span
            className="flex-1 text-sm truncate dark:text-white"
            onClick={() => handleGroupClick(group)}
          >
            {group.xdesc}
          </span>
          <span
            className={`text-xs ${
              isSelected ? "text-white" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {groupCode}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0">
            {group.children.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-3">
          Accounts Groups
        </h4>
        <div className="space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-3">
        Accounts Groups
      </h4>
      <div className="space-y-0">
        {accountsGroups.map((group) => renderTreeItem(group, 0))}
      </div>
    </div>
  );
}
