import React, { ChangeEvent, useEffect, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { getData } from "../../services/apiClient";

interface ProjectCode {
  xtype: string;
  xcode: string;
}

interface TrialBalanceFilterProps {
  formData: {
    year: string;
    period: string;
    project: string;
    [key: string]: any;
  };
  setFormData: (data: any) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

const TrialBalanceFilter: React.FC<TrialBalanceFilterProps> = ({
  formData,
  setFormData,
  onGenerate,
  isLoading = false,
}) => {
  const [projects, setProjects] = useState<string[]>(["All"]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const data = await getData<ProjectCode[]>(
          "/masterdata/common-codes/list/",
          { xtype: "Project" },
        );
        const codes = (data || []).map((p) => p.xcode);
        setProjects(["All", ...codes]);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-5 rounded-xl mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-end gap-5">
        <div className="w-full sm:w-32">
          <Label className="mb-2 text-sm">Year</Label>
          <Input
            type="text"
            value={formData.year}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, year: e.target.value })
            }
            placeholder="2025"
            className="w-full h-11"
          />
        </div>
        <div className="w-full sm:w-32">
          <Label className="mb-2 text-sm">Period</Label>
          <Input
            type="text"
            value={formData.period}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, period: e.target.value })
            }
            placeholder="7"
            className="w-full h-11"
          />
        </div>
        <div className="w-full sm:w-56">
          <Label className="mb-2 text-sm">Project</Label>
          <select
            value={formData.project}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setFormData({ ...formData, project: e.target.value })
            }
            disabled={loadingProjects}
            className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-9 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50"
          >
            {projects.map((code) => (
              <option
                key={code}
                value={code}
                className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
              >
                {code}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto px-8 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-t-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            "Generate Report"
          )}
        </button>
      </div>
    </div>
  );
};

export default TrialBalanceFilter;
