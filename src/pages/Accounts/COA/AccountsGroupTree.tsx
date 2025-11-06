// AccountsGroupTree.tsx
import { useState } from "react";

interface AccountsGroupTreeProps {
  selectedGroup: string | null;
  onSelectGroup: (groupId: string) => void;
}

export default function AccountsGroupTree({
  selectedGroup,
  onSelectGroup,
}: AccountsGroupTreeProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["1", "2", "3"])
  );

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Mock tree structure
  const renderTreeItem = (
    id: string,
    name: string,
    code: string,
    level: number = 0,
    hasChildren: boolean = false
  ) => (
    <div key={id} className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer transition-colors ${
          selectedGroup === id
            ? "bg-[#13725A] text-white"
            : "hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleGroup(id);
            }}
            className="w-4 h-4 flex items-center justify-center text-xs"
          >
            {expandedGroups.has(id) ? "−" : "+"}
          </button>
        )}
        {!hasChildren && <span className="w-4"></span>}
        <span
          className="flex-1 text-sm truncate"
          onClick={() => onSelectGroup(id)}
        >
          {name}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{code}</span>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h4 className="font-semibold text-gray-800 dark:text-white/90 mb-4">
        Accounts Groups
      </h4>
      <div className="space-y-1">
        {/* Level 1 - Assets */}
        {renderTreeItem("1", "Assets", "1", 0, true)}
        {expandedGroups.has("1") && (
          <>
            {/* Level 2 - Current Assets */}
            {renderTreeItem("1.1", "Current Assets", "1.1", 1, true)}
            {expandedGroups.has("1.1") && (
              <>
                {/* Level 3 */}
                {renderTreeItem("1.1.1", "Cash & Bank", "1.1.1", 2, false)}
                {renderTreeItem(
                  "1.1.2",
                  "Accounts Receivable",
                  "1.1.2",
                  2,
                  false
                )}
              </>
            )}
            {/* Level 2 - Fixed Assets */}
            {renderTreeItem("1.2", "Fixed Assets", "1.2", 1, true)}
          </>
        )}

        {/* Level 1 - Liabilities */}
        {renderTreeItem("2", "Liabilities", "2", 0, true)}
        {expandedGroups.has("2") && (
          <>
            {/* Level 2 - Current Liabilities */}
            {renderTreeItem("2.1", "Current Liabilities", "2.1", 1, true)}
          </>
        )}

        {/* Level 1 - Equity */}
        {renderTreeItem("3", "Equity", "3", 0, true)}
        {expandedGroups.has("3") && (
          <>
            {/* Level 2 */}
            {renderTreeItem("3.1", "Share Capital", "3.1", 1, false)}
            {renderTreeItem("3.2", "Retained Earnings", "3.2", 1, false)}
          </>
        )}
      </div>
    </div>
  );
}
