import React, { ChangeEvent } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select from "../form/Select";

interface GLReportFilterProps {
  formData: {
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
        <div className="w-full sm:w-32">
          <Label className="mb-2 text-sm">Level</Label>
          <Select
            options={hlevelOptions}
            onChange={(value) => setFormData({ ...formData, hlevel: value })}
            placeholder="Select Level"
          />
        </div>
        <div className="w-full sm:w-40">
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
