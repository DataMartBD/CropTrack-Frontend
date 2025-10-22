import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import axios from "axios";

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

interface RateData {
  xyear: number;
  [key: string]: number;
}

export default function RateSetup() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedType, setSelectedType] = useState("");
  const [rateValue, setRateValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [isRateAlreadySetup, setIsRateAlreadySetup] = useState(false);
  const [isCheckingRate, setIsCheckingRate] = useState(false);

  const [historicalRates, setHistoricalRates] = useState<RateData[]>([]);

  useEffect(() => {
    const fetchRateSetup = async () => {
      if (!selectedYear || !selectedType) {
        setErrorMessage("");
        setIsRateAlreadySetup(false);
        setIsCheckingRate(false);
        return;
      }

      setErrorMessage("");
      setIsRateAlreadySetup(false);
      setIsCheckingRate(true);

      const token = localStorage.getItem("jwtToken");
      if (!token) {
        setErrorMessage("Unauthorized: No token found.");
        setIsCheckingRate(false);
        return;
      }

      try {
        const response = await axios.get(`${api.base}/masterdata/rate/setup/`, {
          params: { xyear: selectedYear, xtype: selectedType },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const result = response.data;

        if (result.success && result.data && result.data.length > 0) {
          setIsRateAlreadySetup(true);
          setErrorMessage("Rate already setup for this year and type.");
        } else {
          setIsRateAlreadySetup(false);
        }
      } catch (err: unknown) {
        console.error("Error fetching rate setup:", err);
        // type guard
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setErrorMessage("Unauthorized: Please log in again.");
          } else {
            setErrorMessage("Failed to check existing rate setup.");
          }
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      } finally {
        setIsCheckingRate(false);
      }
    };

    fetchRateSetup();
  }, [selectedYear, selectedType]);

  const fetchHistoricalRates = async () => {
    const token = localStorage.getItem("jwtToken");
    try {
      const res = await axios.get(`${api.base}/masterdata/rate/setup/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        // console.log(res.data.data);

        setHistoricalRates(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch historical rates:", err);
    }
  };

  useEffect(() => {
    fetchHistoricalRates();
  }, []);

  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  const rateTypes = [
    { value: "RENT_PER_SACK", label: "Rent Per Sack" },
    { value: "EMPTY_SACK_PRICE", label: "Empty Sack Price" },
  ];

  const handleSubmit = async () => {
    if (!rateValue) return;

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setErrorMessage("Unauthorized: Please log in again.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        `${api.base}/masterdata/rate/setup/`,
        {
          xyear: parseInt(selectedYear),
          xtype: selectedType,
          xrate: parseFloat(rateValue),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Rate saved successfully!");
        setIsRateAlreadySetup(true);
        setRateValue("");
        fetchHistoricalRates();
      } else {
        setErrorMessage(response.data.message || "Failed to save rate.");
      }
    } catch (err: unknown) {
      console.error("Error saving rate:", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setErrorMessage("Unauthorized: Please log in again.");
        } else {
          setErrorMessage(
            err.response?.data?.message ||
              "Failed to save rate. Please try again."
          );
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRateLabel = () => {
    const type = rateTypes.find((t) => t.value === selectedType);
    return type ? type.label : "Rate";
  };

  return (
    <div>
      <PageMeta
        title="Rate Setup - CropTrack"
        description="Configure rates for rent per sack and empty sack pricing"
      />
      <PageBreadcrumb pageTitle="Rate Setup" />

      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h3 className="mb-3 text-2xl font-semibold text-gray-800 dark:text-white/90 sm:text-3xl">
            Rate Setup
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Set up annual rates and view historical pricing data
          </p>
        </div>

        {/* Success Message
        {successMessage && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {errorMessage}
          </div>
        )} */}

        {/* Main Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Side - Rate Configuration */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-white/[0.02]">
            <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
              Rate Configuration
            </h4>

            <div className="space-y-6">
              {/* Year and Type Selection Row */}
              {/* Dropdowns */}
              <div className="flex flex-col gap-4 md:flex-row">
                {/* Year Dropdown */}
                <div className="w-full md:w-1/2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSuccessMessage("");
                      setErrorMessage("");
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Dropdown */}
                <div className="w-full md:w-1/2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Rate Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      setSuccessMessage("");
                      setErrorMessage("");
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                  >
                    <option value="">Select Type</option>
                    <option value="RENT_PER_SACK">Rent Per Sack</option>
                    <option value="EMPTY_SACK_PRICE">Empty Sack Price</option>
                  </select>
                </div>
              </div>

              {/* ✅ Messages appear here */}
              {(errorMessage || successMessage) && (
                <div className="mt-4">
                  {errorMessage && (
                    <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                      {errorMessage}
                    </div>
                  )}
                  {successMessage && (
                    <div className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {successMessage}
                    </div>
                  )}
                </div>
              )}

              {/* Rate Value Input - Shows after type selection */}
              {selectedType && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  {isCheckingRate ? (
                    <div className="flex items-center justify-center gap-2 py-6 text-blue-600 dark:text-blue-400">
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                      Checking existing rate...
                    </div>
                  ) : !isRateAlreadySetup ? (
                    <>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getRateLabel()} Amount (BDT){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          ৳
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={rateValue}
                          onChange={(e) => setRateValue(e.target.value)}
                          placeholder="Enter rate amount"
                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Set the {getRateLabel().toLowerCase()} for{" "}
                        {selectedYear}
                      </p>
                    </>
                  ) : null}
                </div>
              )}

              {/* Submit Button - Shows after rate value is entered */}
              {selectedType && rateValue && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save Rate"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
              <div className="flex gap-3">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium">Rate Management Tips</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Rates are applied annually.</li>
                    <li>
                      • Previous rates are preserved for historical records
                    </li>
                    <li>• All amounts should be in Bangladeshi Taka (BDT)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Historical Rates */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-white/[0.02]">
            <h4 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white">
              Historical Rates
            </h4>

            <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent dark:scrollbar-thumb-gray-600">
              <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300 border-collapse">
                <thead className="border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                  <tr>
                    <th className="py-2 font-semibold">Year</th>
                    <th className="py-2 font-semibold text-right">
                      Rent / Sack (৳)
                    </th>
                    <th className="py-2 font-semibold text-right">
                      Empty Sack (৳)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historicalRates.length > 0 ? (
                    historicalRates.map((rate) => (
                      <tr
                        key={rate.xyear}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100/50 dark:hover:bg-white/5 transition"
                      >
                        <td className="py-2">{rate.xyear}</td>
                        <td className="py-2 text-right">
                          {rate.RENT_PER_SACK
                            ? rate.RENT_PER_SACK.toFixed(2)
                            : "-"}
                        </td>
                        <td className="py-2 text-right">
                          {rate.EMPTY_SACK_PRICE
                            ? rate.EMPTY_SACK_PRICE.toFixed(2)
                            : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-3 text-center text-gray-500 dark:text-gray-400"
                      >
                        No historical data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
