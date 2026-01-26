import CrystalViewer from "../../cr/CrystalViewer";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const CodeManual = () => {
  return (
    <div>
      <PageMeta
        title={`Report - Code Manual`}
        description="View Crystal Reports Code Manual"
      />
      <PageBreadcrumb pageTitle="Chart of Account Code Manual" />

      <div className="w-full h-full pb-10">
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <CrystalViewer
            reportName="glcode.rpt"
            parameters={{ zid: "1" }}
            height="75vh"
          />
        </div>
      </div>
    </div>
  );
};

export default CodeManual;
