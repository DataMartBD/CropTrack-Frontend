// ControllerAccounts.tsx
export default function ControllerAccounts() {
  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-semibold text-gray-800 dark:text-white/90">
          Controller Accounts
        </h4>
        <button className="bg-[#13725A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0f5f4a] transition-colors">
          Add Controller Account
        </button>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Account Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Group
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Table Row Skeletons */}
            {[1, 2, 3].map((item) => (
              <tr key={item} className="animate-pulse">
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
