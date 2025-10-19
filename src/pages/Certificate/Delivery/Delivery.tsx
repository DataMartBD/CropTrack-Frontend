import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useSearchParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import DeliveryForm from "./DeliveryForm";
import toast, { Toaster } from "react-hot-toast";
// import axios from "axios";

// const api = {
//   base: import.meta.env.VITE_API_BASE_URL,
// };

export default function DeliveryPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tokenNo = params.get("token_no");

  const [selectedToken, setSelectedToken] = useState("");

  useEffect(() => {
    if (tokenNo) setSelectedToken(tokenNo);
  }, [tokenNo]);

  return (
    <div>
      <PageMeta
        title="Delivery - CropTrack"
        description="Delivery Page - CropTrack"
      />
      <PageBreadcrumb pageTitle="Delivery" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-8">
        <Toaster position="bottom-right" />
        {!tokenNo ? (
          <>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Enter Token/Certificate number to get the stock information.
            </h2>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Enter Token No"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="border px-4 py-2 rounded-md dark:bg-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  const tokenPattern = /^\d{2}-\d{5,}$/;
                  const isValid = tokenPattern.test(selectedToken);
                  if (!isValid) {
                    toast.error(
                      "Invalid Token Format. Please use format like 25-00000."
                    );

                    return;
                  }
                  navigate(`/certificate/delivery?token_no=${selectedToken}`);
                }}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Go
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Delivery for <span className="text-blue-700 dark:text-blue-500">{tokenNo}</span>
              </h2>
            </div>
            <DeliveryForm tokenNo={selectedToken} />
          </>
        )}
      </div>
    </div>
  );
}
