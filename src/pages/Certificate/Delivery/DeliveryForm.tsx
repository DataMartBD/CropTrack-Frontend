/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router";
import Swal from "sweetalert2";

interface DeliveryFormProps {
  tokenNo: string;
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

interface DeliveryItem {
  token_no: string;
  customer_code: string;
  customer_name: string;
  xunit: string;
  xfloor: string;
  xpocket: string;
  quantity: number;
}

interface ChargesForm {
  xpayloan: number;
  xemptysacks: number;
  xemptysackschgtot: number;
  xinterestamt: number;
  xchgtot: number;
  xfanchgtot: number;
}

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

const DeliveryForm = ({ tokenNo }: DeliveryFormProps) => {
  const location = useLocation();

  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [deliveryQty, setDeliveryQty] = useState<Record<number, number>>({});
  const initialDeliveryQtyRef = useRef<Record<number, number>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [charges, setCharges] = useState<ChargesForm>({
    xpayloan: 0,
    xemptysacks: 0,
    xemptysackschgtot: 0,
    xinterestamt: 0,
    xchgtot: 0,
    xfanchgtot: 0,
  });

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

        const initialQty: Record<number, number> = {};
        response.data.data.forEach((_: Stock, idx: number) => {
          initialQty[idx] = _.number_of_sacks; // deliveryQty
          initialDeliveryQtyRef.current[idx] = _.number_of_sacks; // store initial
        });
        setDeliveryQty(initialQty);
      } else {
        setStock([]);
      }
    } catch (error) {
      console.error("Error fetching stock", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStock([]);
    setLoading(true);
    setSelectedItems(new Set());
    setSelectAll(false);

    if (tokenNo) {
      fetchStock(tokenNo);
    } else {
      setLoading(false);
    }
  }, [tokenNo, location.key]);

  const handleSelectItem = (idx: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === stock.length && stock.length > 0);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIndices = new Set(stock.map((_, idx) => idx));
      setSelectedItems(allIndices);
      setSelectAll(true);
    }
  };

const handleDeliveryQtyChange = (idx: number, value: string) => {
  // allow empty string so user can type
  if (value === "") {
    setDeliveryQty((prev) => ({
      ...prev,
      [idx]: value as unknown as number, // temporarily store empty
    }));
    return;
  }

  let numValue = Number(value);
  if (isNaN(numValue)) numValue = 1;

  const max = stock[idx].number_of_sacks;
  const finalValue = Math.min(Math.max(numValue, 1), max); // clamp 1..max

  setDeliveryQty((prev) => ({
    ...prev,
    [idx]: finalValue,
  }));
};

  const handleChargeChange = (field: keyof ChargesForm, value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    setCharges((prev) => ({
      ...prev,
      [field]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const handleConfirmDelivery = async () => {
    if (selectedItems.size === 0) {
      Swal.fire({
        icon: "error",
        title: "No Items",
        text: "Please select at least one item to deliver",
      });
      return;
    }

    const deliveryItems: DeliveryItem[] = Array.from(selectedItems).map(
      (idx) => {
        const item = stock[idx];
        return {
          token_no: item.token_no,
          customer_code: item.customer_code,
          customer_name: item.customer_name,
          xunit: item.xunit,
          xfloor: item.xfloor,
          xpocket: item.xpocket,
          quantity: deliveryQty[idx],
        };
      }
    );

    setSubmitting(true);
    try {
      const token = window.localStorage.getItem("jwtToken");
      const response = await axios.post(
        `${api.base}/ops/delivery-challan/create/`,
        {
          token_no: tokenNo,
          delivery_items: deliveryItems,
          xpayloan: charges.xpayloan,
          xemptysacks: charges.xemptysacks,
          xemptysackschgtot: charges.xemptysackschgtot,
          xinterestamt: charges.xinterestamt,
          xchgtot: charges.xchgtot,
          xfanchgtot: charges.xfanchgtot,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success === true) {
        Swal.fire({
          icon: "success",
          title: "Delivery Completed",
          text: "Delivery challan created successfully!",
        }).then(() => {
          setSelectedItems(new Set());
          setSelectAll(false);
          setDeliveryQty({});
          setCharges({
            xpayloan: 0,
            xemptysacks: 0,
            xemptysackschgtot: 0,
            xinterestamt: 0,
            xchgtot: 0,
            xfanchgtot: 0,
          });
          fetchStock(tokenNo);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to process delivery",
        });
      }
    } catch (error: unknown) {
      let message = "Something went wrong";

      if (axios.isAxiosError(error)) {
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
        message = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-white"></div>
      </div>
    );
  }

  const totalDeliveryQty = Array.from(selectedItems).reduce(
    (sum, idx) => sum + (deliveryQty[idx] || 0),
    0
  );
  {
    /* Compute valid state for button */
  }
  const isDeliveryValid =
    selectedItems.size > 0 &&
    totalDeliveryQty > 0 &&
    Array.from(selectedItems).every((idx) => (deliveryQty[idx] || 0) > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Table - Left Side */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border-b border-l border-r border-gray-300 dark:border-gray-800">
          <div className=" bg-slate-500 dark:bg-gray-600 rounded-t-lg border-gray-300 dark:border-gray-800 px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {/* Left side */}
            <div>
              <h2 className="font-semibold text-white dark:text-white">
                Stock Items
              </h2>
              <p className="text-xs text-white dark:text-gray-400 mt-0.5">
                {selectedItems.size} selected
              </p>
            </div>

            {/* Right side */}
            <div className="text-right">
              <p className="text-sm  text-white dark:text-white">
                Customer Name: {stock[0]?.customer_name || "-"}
              </p>
              <p className="text-xs text-white dark:text-gray-400">
                {stock[0]?.customer_code || "-"} • {stock[0]?.xmobile || "-"}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  {/* <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">
                    Customer
                  </th> */}
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">
                    Floor
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold">
                    Pocket
                  </th>
                  <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold">
                    Available Qty
                  </th>
                  <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold">
                    Delivery Qty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stock.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No stock available
                    </td>
                  </tr>
                ) : (
                  stock.map((item, idx) => {
                    const isSelected = selectedItems.has(idx);
                    return (
                      <tr
                        key={idx}
                        onClick={(e) => {
                          // prevent double-trigger when clicking on input
                          if (
                            (e.target as HTMLElement).tagName !== "INPUT" &&
                            (e.target as HTMLElement).tagName !== "BUTTON"
                          ) {
                            handleSelectItem(idx);
                          }
                        }}
                        className={`cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectItem(idx)}
                            className="w-4 h-4 cursor-pointer"
                            onClick={(e) => e.stopPropagation()} // avoid row toggle twice
                          />
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {item.xunit}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {item.xfloor}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {item.xpocket}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-3 py-1 rounded text-xs font-semibold">
                            {item.number_of_sacks}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min={0} // allow typing 0 temporarily
                            max={item.number_of_sacks}
                            value={deliveryQty[idx]}
                            onChange={(e) => {
                              const rawValue = e.target.value;
                              // allow empty string for editing
                              const numValue =
                                rawValue === ""
                                  ? ""
                                  : Math.min(
                                      Number(rawValue),
                                      item.number_of_sacks
                                    );
                              handleDeliveryQtyChange(idx, String(numValue));
                            }}
                            onBlur={() => {
                              if (!deliveryQty[idx] || deliveryQty[idx] === 0) {
                                // reset to initial quantity on blur
                                setDeliveryQty((prev) => ({
                                  ...prev,
                                  [idx]: initialDeliveryQtyRef.current[idx],
                                }));
                              }
                            }}
                            disabled={!isSelected}
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side - Charges & Summary */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border-b border-l border-r border-gray-300 dark:border-gray-800">
            <div className="border-b bg-stone-500 dark:bg-gray-600 rounded-t-lg border-gray-300 dark:border-gray-800 px-4 py-2.5">
              <h3 className="font-semibold text-white dark:text-white">
                Summary
              </h3>
            </div>

            <div className="p-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Pockets Selected
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                  {selectedItems.size}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Total Delivery Qty
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white leading-tight">
                  {totalDeliveryQty} sacks
                </p>
              </div>
            </div>
          </div>

          {/* Charges */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border-b border-l border-r border-gray-300 dark:border-gray-800">
            <div className="border-b bg-zinc-600 dark:bg-gray-600 rounded-t-lg border-gray-300 dark:border-gray-800 px-6 py-4">
              <h2 className="font-semibold text-white dark:text-white">
                Charges & Deductions
              </h2>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Loan Pay
                </label>
                <input
                  type="number"
                  value={charges.xpayloan}
                  onChange={(e) =>
                    handleChargeChange("xpayloan", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Empty Sacks
                </label>
                <input
                  type="number"
                  value={charges.xemptysacks}
                  onChange={(e) =>
                    handleChargeChange("xemptysacks", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Empty Sacks Price
                </label>
                <input
                  type="number"
                  value={charges.xemptysackschgtot}
                  onChange={(e) =>
                    handleChargeChange("xemptysackschgtot", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Interest Amount
                </label>
                <input
                  type="number"
                  value={charges.xinterestamt}
                  onChange={(e) =>
                    handleChargeChange("xinterestamt", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Transportation Fee
                </label>
                <input
                  type="number"
                  value={charges.xchgtot}
                  onChange={(e) =>
                    handleChargeChange("xchgtot", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Fanning Charge
                </label>
                <input
                  type="number"
                  value={charges.xfanchgtot}
                  onChange={(e) =>
                    handleChargeChange("xfanchgtot", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  placeholder="0"
                />
              </div>

              <button
                onClick={handleConfirmDelivery}
                disabled={submitting || !isDeliveryValid}
                className="col-span-2 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800  disabled:bg-gray-400  dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition"
              >
                {submitting ? "Submitting..." : "Confirm Delivery"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryForm;
