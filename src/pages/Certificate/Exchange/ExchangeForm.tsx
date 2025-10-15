/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdDoubleArrow } from "react-icons/md";


import { useLocation } from "react-router";
import Swal from "sweetalert2";

interface ExchangeFormProps {
  tokenNo: string;
}
interface CommonCodes {
  xcode: string;
  xdesc: string;
}
interface Stock {
  token_no: string;
  customer_code: string;
  customer_name: string;
  xmobile: string;
  xunit: string;
  xfloor: string;
  xpocket: string;
  number_of_sacks: number;
}

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

const ExchangeForm = ({ tokenNo }: ExchangeFormProps) => {
  const location = useLocation();

  const [stock, setStock] = useState<Stock[]>([]);
  const [unitOptions, setUnitOptions] = useState<CommonCodes[]>([]);
  const [floorOptions, setFloorOptions] = useState<CommonCodes[]>([]);
  const [pocketOptions, setPocketOptions] = useState<CommonCodes[]>([]);
  const [loading, setLoading] = useState(false);

  // inputs state now stores sacksToTransfer as string to allow empty input
  const [inputs, setInputs] = useState<
    Record<
      number,
      {
        sacksToTransfer: string;
        inputUnit: string;
        inputFloor: string;
        inputPocket: string;
      }
    >
  >({});

  const fetchStock = async (tokenNo: string) => {
    const token = window.localStorage.getItem("jwtToken");
    try {
      const response = await axios.get(
        `${api.base}/inventory/current-stock/?token_no=${tokenNo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setStock(response.data.data);

        const initialInputs: Record<number, any> = {};
        response.data.data.forEach((item: Stock, idx: number) => {
          initialInputs[idx] = {
            sacksToTransfer: "", // empty string instead of 0
            inputUnit: item.xunit,
            inputFloor: item.xfloor,
            inputPocket: item.xpocket,
          };
        });
        setInputs(initialInputs);
      } else {
        setStock([]);
      }
    } catch (error) {
      console.error("Error fetching stock", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stock and initialize inputs
  useEffect(() => {
    setStock([]);
    setLoading(true);
    setInputs({});

    if (tokenNo) {
      fetchStock(tokenNo);
    } else {
      setLoading(false);
    }
  }, [tokenNo, location.key]);

  // Fetch dropdown options once on mount
  useEffect(() => {
    const token = window.localStorage.getItem("jwtToken");

    const fetchOptions = async (
      xtype: string,
      setter: React.Dispatch<React.SetStateAction<CommonCodes[]>>
    ) => {
      try {
        const response = await axios.get(
          `${api.base}/masterdata/common-codes/list/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { xtype },
          }
        );
        setter(response.data.data);
      } catch (error) {
        console.error(`Error fetching ${xtype} options:`, error);
      }
    };

    fetchOptions("Stock Unit", setUnitOptions);
    fetchOptions("Floor", setFloorOptions);
    fetchOptions("Pocket", setPocketOptions);
  }, []);

  const handleInputChange = (
    idx: number,
    field: "sacksToTransfer" | "inputUnit" | "inputFloor" | "inputPocket",
    value: string
  ) => {
    setInputs((prev) => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        [field]: value,
      },
    }));
  };

  // Just console.log for now, no post request
  const handleTransfer = async (idx: number) => {
    const item = stock[idx];
    const itemInputs = inputs[idx];
    if (!itemInputs) return;

    const sacksNumber = Number(itemInputs.sacksToTransfer || "0");

    if (sacksNumber <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter a valid number of sacks to transfer",
      });
      return;
    }
    if (sacksNumber > item.number_of_sacks) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Cannot transfer more sacks than available",
      });
      return;
    }

    // Ensure all three are selected (non-empty)
    if (
      !itemInputs.inputUnit?.trim() ||
      !itemInputs.inputFloor?.trim() ||
      !itemInputs.inputPocket?.trim()
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please select unit, floor, and pocket",
      });
      return;
    }

    // Check that the entire combination is different
    if (
      item.xunit === itemInputs.inputUnit &&
      item.xfloor === itemInputs.inputFloor &&
      item.xpocket === itemInputs.inputPocket
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Transfer destination (unit, floor, pocket) must be different from current",
      });
      return;
    }

    const dataToSend = {
      xdocnum: item.token_no,
      token_no: item.token_no,
      number_of_sacks: sacksNumber,
      xfunit: item.xunit,
      xffloor: item.xfloor,
      xfpocket: item.xpocket,
      xtunit: itemInputs.inputUnit,
      xtfloor: itemInputs.inputFloor,
      xtpocket: itemInputs.inputPocket,
    };
    // console.log(dataToSend);

    try {
      const token = window.localStorage.getItem("jwtToken");
      const response = await axios.post(
        `${api.base}/inventory/transfer-order-entry/`,
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success === true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Items Transferred Successfully!",
          confirmButtonText: "OK",
        }).then(() => {
          fetchStock(tokenNo);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error Transferring Items.",
        });
      }
    } catch (error: unknown) {
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
        // It's an axios error, safe to access response data
        if (
          error.response &&
          error.response.data &&
          typeof error.response.data.message === "string"
        ) {
          message = error.response.data.message;
        } else if (error.message) {
          message = error.message;
        }
      } else if (error instanceof Error) {
        // It's a normal JS error
        message = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stock.length === 0 && <p>No stock data available.</p>}
      {stock.map((item, idx) => {
        const itemInputs = inputs[idx] || {
          sacksToTransfer: "",
          inputUnit: item.xunit,
          inputFloor: item.xfloor,
          inputPocket: item.xpocket,
        };

        return (
          <div
            key={`${item.token_no}-${idx}`} // key uses idx because token_no is not unique
            className="flex border rounded-lg shadow-sm bg-white dark:bg-gray-900 hover:shadow-md transition-shadow duration-200 p-3 mb-4 items-center"
          >
            {/* Left: Stock info */}
            <div className="w-1/3 pr-4 flex flex-col justify-center">
              <div className="flex flex-wrap gap-3 text-base font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                <span className="bg-indigo-100 dark:bg-indigo-900 px-3 py-1 rounded-full shadow-sm">
                  Unit: {item.xunit}
                </span>
                <span className="bg-indigo-100 dark:bg-indigo-900 px-3 py-1 rounded-full shadow-sm">
                  Floor: {item.xfloor}
                </span>
                <span className="bg-indigo-100 dark:bg-indigo-900 px-3 py-1 rounded-full shadow-sm">
                  Pocket: {item.xpocket}
                </span>
              </div>

              <p className="text-lg text-red-700 dark:text-green-400">
                Number of sacks: {item.number_of_sacks} 
              </p>
              <h2 className="text-md text-gray-900 dark:text-gray-100 mb-2 truncate">
                Customer Name: {item.customer_name} 
              </h2>
              <h2 className="text-md text-gray-900 dark:text-gray-100 mb-2 truncate">
                Mobile: {item.xmobile}
              </h2>
            </div>

            {/* Middle: Icon */}
            <div className="w-1/6 flex justify-center items-center text-indigo-600 dark:text-indigo-400">
              <MdDoubleArrow className="text-4xl" />
            </div>

            {/* Right: Transfer form */}
            <div className="w-1/2 pl-4 flex flex-col justify-center space-y-4">
              {/* Row 1: three dropdowns side by side */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label
                    htmlFor={`unit-${idx}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    New Unit
                  </label>
                  <select
                    id={`unit-${idx}`}
                    value={itemInputs.inputUnit}
                    onChange={(e) =>
                      handleInputChange(idx, "inputUnit", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="">Select Unit</option>
                    {unitOptions.map((unit) => (
                      <option key={unit.xcode} value={unit.xcode}>
                        {unit.xcode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label
                    htmlFor={`floor-${idx}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    New Floor
                  </label>
                  <select
                    id={`floor-${idx}`}
                    value={itemInputs.inputFloor}
                    onChange={(e) =>
                      handleInputChange(idx, "inputFloor", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="">Select Floor</option>
                    {floorOptions.map((floor) => (
                      <option key={floor.xcode} value={floor.xcode}>
                        {floor.xcode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label
                    htmlFor={`pocket-${idx}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    New Pocket
                  </label>
                  <select
                    id={`pocket-${idx}`}
                    value={itemInputs.inputPocket}
                    onChange={(e) =>
                      handleInputChange(idx, "inputPocket", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="">Select Pocket</option>
                    {pocketOptions.map((pocket) => (
                      <option key={pocket.xcode} value={pocket.xcode}>
                        {pocket.xcode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: input field + button side by side */}
              <div className="flex space-x-4 items-end">
                <div className="flex-1">
                  <label
                    htmlFor={`sacks-${idx}`}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Sacks to transfer
                  </label>
                  <input
                    id={`sacks-${idx}`}
                    type="number"
                    min={0}
                    max={item.number_of_sacks}
                    value={itemInputs.sacksToTransfer}
                    onChange={(e) =>
                      handleInputChange(idx, "sacksToTransfer", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>

                <button
                  onClick={() => handleTransfer(idx)}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2 text-base font-semibold transition whitespace-nowrap"
                  style={{ minHeight: "44px" }}
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExchangeForm;
