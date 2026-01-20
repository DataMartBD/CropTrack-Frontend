import React, { useMemo, useState, useEffect } from "react";
import {
  FiRefreshCw,
  FiMaximize,
  FiMinimize,
  FiFileText,
} from "react-icons/fi";

// Define the shape of the props
interface CrystalViewerProps {
  reportName: string; // e.g., "gltbalance.rpt"
  parameters?: Record<string, string>; // e.g., { zid: "100000", year: "2025" }
  height?: string; // Optional height override
  serverUrl?: string; // Base URL of your IIS Express
}

const CrystalViewer: React.FC<CrystalViewerProps> = ({
  reportName,
  parameters = {},
  height = "80vh",
  serverUrl = "http://localhost:8080",
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Construct the full URL efficiently
  const reportUrl = useMemo(() => {
    try {
      const url = new URL("/Viewer.aspx", serverUrl);
      url.searchParams.append("rpt", reportName);
      Object.entries(parameters).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      // Add a random param to force iframe refresh when refreshKey changes
      if (refreshKey > 0) {
        url.searchParams.append("_r", refreshKey.toString());
      }
      return url.toString();
    } catch (e) {
      console.error("Invalid serverUrl or report configuration", e);
      return "";
    }
  }, [reportName, parameters, serverUrl, refreshKey]);

  // Handle parameter changes or refreshes
  useEffect(() => {
    setIsLoading(true);
  }, [reportUrl]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div
      className={`flex flex-col w-full transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl bg-white dark:bg-gray-900 overflow-hidden ${
        isFullscreen
          ? "fixed inset-0 z-[999999] rounded-none border-none"
          : "relative"
      }`}
    >
      {/* Premium Header Bar */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <FiFileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none">
              {reportName.replace(".rpt", "").toUpperCase()}
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
              Report Viewer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh Report"
            className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Refresh
            </span>
          </button>

          {/* Fullscreen Toggle / Minimize Button */}
          {isFullscreen ? (
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all shadow-lg animate-in zoom-in duration-300"
            >
              <FiMinimize className="w-4 h-4" />
              MINIMIZE
            </button>
          ) : (
            <button
              onClick={toggleFullscreen}
              title="Fullscreen"
              className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
            >
              <FiMaximize className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Fullscreen
              </span>
            </button>
          )}
        </div>
      </div>

      {/* The Report Iframe */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-950/50 relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10 animate-in fade-in duration-300">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Processing Report...
            </p>
          </div>
        )}

        {!reportUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500">
            Invalid Configuration
          </div>
        )}
        <iframe
          key={reportUrl}
          src={reportUrl}
          title={`Report: ${reportName}`}
          className="w-full h-full border-none bg-white"
          style={{ height: isFullscreen ? "calc(100vh - 64px)" : height }}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
};

export default CrystalViewer;
