import { useState, useRef } from "react";
import CrystalViewer from "../../cr/CrystalViewer";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import LedgerDetailsFilter from "../../components/Filters/LedgerDetailsFilter";

const LedgerDetails = () => {
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    zid: "1",
    project: "All",
    frdate: today,
    todate: today,
    facc: "",
    subacc: "",
  });

  // Submitted parameters state
  const [activeParams, setActiveParams] = useState<typeof formData | null>(
    null,
  );

  const handleGenerate = () => {
    setActiveParams({ ...formData });
    setShowReport(true);
    // console.log(formData);

    // Smooth scroll to the report area after a short delay to allow rendering
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div>
      <PageMeta
        title={`Ledger Details`}
        description="View Crystal Reports Ledger Details"
      />
      <PageBreadcrumb pageTitle="Ledger Details" />

      <div className="w-full h-full pb-10">
        <LedgerDetailsFilter
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
                reportName="glledger.rpt"
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

export default LedgerDetails;
