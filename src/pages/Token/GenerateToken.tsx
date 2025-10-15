/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

interface TokenModel {
  create_date: string;
  token_no: string;
  xsack: string;
  xstatus: string;
}

export default function GenerateToken() {
  const [tokens, setTokens] = useState<TokenModel[]>([]);
  const [tokenCount, setTokenCount] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!tokenCount || tokenCount <= 0) {
      setErrorMsg("Please enter a valid number of tokens.");
      return;
    }

    setTokens([]);

    const jwtToken = window.localStorage.getItem("jwtToken");
    if (!jwtToken) {
      setErrorMsg("Authentication token missing.");
      return;
    }
    // console.log(jwtToken);

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await axios.post(
        `${api.base}/ops/token/generate/`,
        { number_of_tokens: tokenCount },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      // console.log(res.data);

      setTokens(res.data.tokens || []);
      setSuccessMsg(res.data.message || "Tokens generated successfully!");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to generate tokens.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Token Generate - CropTrack"
        description="Token Generate - CropTrack"
      />
      <PageBreadcrumb pageTitle="Token Generate" />

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-7 xl:px-10 xl:py-12">
        {/* Input Section */}
        <section className="px-6 py-5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Generate New Tokens
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <input
                type="number"
                id="number"
                value={tokenCount}
                onChange={(e) =>
                  setTokenCount(e.target.value ? parseInt(e.target.value) : "")
                }
                placeholder="Enter Number of Tokens"
                className="w-64 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:outline-none focus:border-[#13725A] dark:focus:border-green-500 transition"
              />
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="bg-[#13725A] text-white px-6 py-2 rounded-md hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>

            {errorMsg && (
              <p className="text-red-600 dark:text-red-400 mt-4 text-center">
                ⚠ {errorMsg}
              </p>
            )}
            {!errorMsg && tokens.length > 0 && (
              <p className="text-green-600 dark:text-green-400 mt-4 text-center">
                {successMsg}
              </p>
            )}
          </div>
        </section>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500 dark:border-gray-700"></div>
          </div>
        )}

        {/* Token Grid Section */}
        {tokens.length > 0 && (
          <section className="px-6 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {tokens.map((token) => (
                  <div key={token.token_no} className="relative">
                    <span className="absolute top-0 left-0 w-full h-full mt-1 ml-1 bg-red-400 rounded-lg" />
                    <div className="relative h-full p-5 bg-white dark:bg-gray-800 border-2 border-red-400 rounded-lg">
                      <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        {token.token_no}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Status: {token.xstatus}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Date: {token.create_date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
