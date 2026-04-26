import { useState, useRef } from "react";
import CrystalViewer from "../../cr/CrystalViewer";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import GLReportFilter from "../../components/Filters/GLReportFilter";


const BalanceSheetCrystal = () => {
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    zid: "1",
    project: "All",
    year: new Date().getFullYear().toString(),
    period: (new Date().getMonth() + 1).toString(),
    hlevel: "",
    rpttype: "",
  });

  // Submitted parameters state
  const [activeParams, setActiveParams] = useState<typeof formData | null>(
    null,
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
        title={`Balance Sheet (Crystal)`}
        description="View Balance Sheet Crystal Report"
      />
      <PageBreadcrumb pageTitle="Balance Sheet" />

      <div className="w-full h-full pb-10">
        <GLReportFilter
          formData={formData}
          setFormData={setFormData}
          onGenerate={handleGenerate}
        />

        <div
          ref={reportRef}
          className="scroll-mt-24 transition-all duration-500"
        >
          {showReport && activeParams && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <CrystalViewer
                reportName="glbalshtnw.rpt"
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

export default BalanceSheetCrystal;
