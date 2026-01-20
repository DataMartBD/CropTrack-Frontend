import { useState, useRef } from "react";
import CrystalViewer from "../../cr/CrystalViewer";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
// import { useTranslation } from "react-i18next";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";

const GLTBalancePage = () => {
  //   const { t } = useTranslation();
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  // Live input state
  const [formData, setFormData] = useState({
    zid: "100000",
    year: new Date().getFullYear().toString(),
    period: (new Date().getMonth() + 1).toString(),
  });

  // Submitted parameters state
  const [activeParams, setActiveParams] = useState<typeof formData | null>(
    null
  );

  const handleGenerate = () => {
    setActiveParams({ ...formData });
    setShowReport(true);

    // Smooth scroll to the report area after a short delay to allow rendering
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div>
      <PageMeta
        title={`Crystal Report - GL Balance`}
        description="View Crystal Reports GL Balance"
      />
      <PageBreadcrumb pageTitle="General Ledger Crystal Report" />

      <div className="w-full h-full pb-10">
        {/* Input Form Area */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-5 rounded-xl mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-end gap-5">
            <div className="w-full sm:w-32">
              <Label className="mb-2 text-sm">Year</Label>
              <Input
                type="text"
                value={formData.year}
                onChange={(e) =>
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
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
                placeholder="7"
                className="w-full h-11"
              />
            </div>

            <button
              onClick={handleGenerate}
              className="w-full sm:w-auto px-8 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md flex items-center justify-center whitespace-nowrap"
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* Render the Viewer with Max Width */}
        <div
          ref={reportRef}
          className="scroll-mt-24 transition-all duration-500"
        >
          {showReport && activeParams && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <CrystalViewer
                reportName="gltbal.rpt"
                parameters={activeParams}
                height="75vh"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GLTBalancePage;
