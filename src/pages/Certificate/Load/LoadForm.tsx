/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

interface LoadFormProps {
  tokenNo: string;
}
interface CommonCodes {
  xcode: string;
  xdesc: string;
}

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

const LoadForm = ({ tokenNo }: LoadFormProps) => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
    {
      xunit: "",
      xfloor: "",
      xpocket: "",
      number_of_sacks: "",
      xitem: "01-01-001-0001",
    },
  ]);

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        xunit: "",
        xfloor: "",
        xpocket: "",
        number_of_sacks: "",
        xitem: "01-01-001-0001",
      },
    ]);
  };

  const handleDeleteRow = (index: number) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("Submitted Rows:", rows);
    const payLoad = {
      details: rows,
    };
    try {
      const token = window.localStorage.getItem("jwtToken");
      const response = await axios.post(
        `${api.base}/ops/certificate-details/create/${tokenNo}/`,
        payLoad,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success === true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Items Loaded Successfully!",
          confirmButtonText: "OK",
        }).then(() => {
          navigate(-1); // Go back to previous page after user clicks OK
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error Loading Items.",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Failed to Load Items. Please check input.",
      });
    }
  };

  const [unitOptions, setUnitOptions] = useState<CommonCodes[]>([]);
  const [floorOptions, setFloorOptions] = useState<CommonCodes[]>([]);
  const [pocketOptions, setPocketOptions] = useState<CommonCodes[]>([]);

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
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      {rows.map((row, index) => (
        <div
          key={index}
          className="relative grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-white/[0.03]"
        >
          {/* Delete Button */}
          {rows.length > 1 && (
            <button
              type="button"
              onClick={() => handleDeleteRow(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm dark:text-red-400 dark:hover:text-red-300"
              title="Remove row"
            >
              ❌
            </button>
          )}

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Unit
            </label>
            <select
              value={row.xunit}
              onChange={(e) => handleChange(index, "xunit", e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select Unit</option>
              {unitOptions.map((unit) => (
                <option key={unit.xcode} value={unit.xcode}>
                  {unit.xcode}
                </option>
              ))}
            </select>
          </div>

          {/* Floor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Floor
            </label>
            <select
              value={row.xfloor}
              onChange={(e) => handleChange(index, "xfloor", e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select Floor</option>
              {floorOptions.map((floor) => (
                <option key={floor.xcode} value={floor.xcode}>
                  {floor.xcode}
                </option>
              ))}
            </select>
          </div>

          {/* Pocket */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Pocket
            </label>
            <select
              value={row.xpocket}
              onChange={(e) => handleChange(index, "xpocket", e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select Pocket</option>
              {pocketOptions.map((pocket) => (
                <option key={pocket.xcode} value={pocket.xcode}>
                  {pocket.xcode}
                </option>
              ))}
            </select>
          </div>

          {/* Sacks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Number of Sacks
            </label>
            <input
              type="number"
              value={row.number_of_sacks}
              onChange={(e) =>
                handleChange(index, "number_of_sacks", e.target.value)
              }
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              min="1"
            />
          </div>
        </div>
      ))}

      <div className="flex justify-between flex-wrap gap-4">
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        >
          ➕ Add Row
        </button>

        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-[#13725A] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#13503E] focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Submit
        </button>
      </div>
      {/* <Toaster position="bottom-right" /> */}
    </form>
  );
};

export default LoadForm;
