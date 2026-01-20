import React, { ChangeEvent } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";

interface YearPeriodProps {
  formData: {
    year: string;
    period: string;
    [key: string]: any;
  };
  setFormData: (data: any) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

const YearPeriod: React.FC<YearPeriodProps> = ({
  formData,
  setFormData,
  onGenerate,
  isLoading = false,
}) => {
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

export default YearPeriod;
