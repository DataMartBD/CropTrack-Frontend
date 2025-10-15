import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { useSearchParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import LoadForm from "./LoadForm";
import axios from "axios";

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

export default function LoadPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tokenNo = params.get("token_no");
  const [readyTokens, setReadyTokens] = useState<[]>([]);

  const [selectedToken, setSelectedToken] = useState("");

  useEffect(() => {
    if (tokenNo) setSelectedToken(tokenNo);
  }, [tokenNo]);

  useEffect(() => {
    const token = window.localStorage.getItem("jwtToken");
    const fetchReadyTokens = async () => {
      try {
        const response = await axios.get(
          `${api.base}/ops/certificates/ready-list/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            //   params: {
            //     xstatus: "Pending",
            //   },
          }
        );
        setReadyTokens(response.data.data);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      }
    };
    fetchReadyTokens();
  }, []);

  const handleTokenSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedToken(selected);
    if (selected) {
      navigate(`/certificate/load?token_no=${selected}`);
    }
  };

  return (
    <div>
      <PageMeta title="Load - CropTrack" description="Load Page - CropTrack" />
      <PageBreadcrumb pageTitle="Load" />
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {!tokenNo ? (
          <>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Select a Token to Load
            </h2>
            <select
              className="border px-4 py-2 rounded-md dark:bg-gray-900 dark:text-white"
              onChange={handleTokenSelect}
              defaultValue=""
            >
              <option value="" disabled>
                -- Select Token No --
              </option>
              {readyTokens.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Load Items <span className="text-blue-700">{tokenNo}</span>
              </h2>
            </div>
            <LoadForm tokenNo={selectedToken} />
          </>
        )}
      </div>
    </div>
  );
}
