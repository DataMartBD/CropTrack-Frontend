import { useState, useRef } from "react";
import CrystalViewer from "../../cr/CrystalViewer";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TrialBalanceFilter from "../../components/Filters/TrialBalanceFilter";

const TrialBalancePage = () => {
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    zid: "1",
    year: new Date().getFullYear().toString(),
    period: (new Date().getMonth() + 1).toString(),
    project: "All",
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
        title={`Trial Balance`}
        description="View Crystal Reports Trial Balance"
      />
      <PageBreadcrumb pageTitle="Trial Balance" />

      <div className="w-full h-full pb-10">
        <TrialBalanceFilter
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
                reportName="gltbalnw.rpt"
                // reportName="trial_balance.rpt"
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

export default TrialBalancePage;
