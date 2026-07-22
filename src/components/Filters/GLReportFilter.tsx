import React, { ChangeEvent } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";
import { useProjectOptionsWithAll } from "../../hooks/useProjectOptions";

interface GLReportFilterProps {
  formData: {
    project: string;
    year: string;
    period: string;
    hlevel: string;
    rpttype: string;
    [key: string]: any;
  };
  setFormData: (data: any) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

const GLReportFilter: React.FC<GLReportFilterProps> = ({
  formData,
  setFormData,
  onGenerate,
  isLoading = false,
}) => {
  const { projects, loading: loadingProjects } = useProjectOptionsWithAll();

  const hlevelOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
  ];

  const rptTypeOptions = [
    { value: "Summary", label: "Summary" },
    { value: "Detail", label: "Detail" },
  ];

  const isFormValid =
    formData.hlevel && formData.rpttype && formData.year && formData.period;

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-5 rounded-xl mb-6 shadow-sm">
      <div className="flex flex-wrap items-end gap-5">
         <div className="flex-1 min-w-[150px]">
          <Label className="mb-2 text-sm">Project</Label>
          <select
            value={formData.project}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setFormData({ ...formData, project: e.target.value })
            }
            disabled={loadingProjects}
            className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-9 text-sm shadow-theme-xs text-gray-800 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50"
          >
            {projects.map((p) => (
              <option
                key={p.code}
                value={p.code}
                className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
              >
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[120px]">
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
        <div className="flex-1 min-w-[120px]">
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
        <div className="flex-1 min-w-[150px]">
          <Label className="mb-2 text-sm">Level</Label>
          <Select
            options={hlevelOptions}
            onChange={(value) => setFormData({ ...formData, hlevel: value })}
            placeholder="Select Level"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <Label className="mb-2 text-sm">Report Type</Label>
          <Select
            options={rptTypeOptions}
            onChange={(value) => setFormData({ ...formData, rpttype: value })}
            placeholder="Select Type"
          />
        </div>

        <button
          onClick={onGenerate}
          disabled={isLoading || !isFormValid}
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

export default GLReportFilter;
