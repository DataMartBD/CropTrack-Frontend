/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";

import { useLocation } from "react-router";
import Swal from "sweetalert2";
import { RiDeleteBinLine } from "react-icons/ri";

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
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const [inputs, setInputs] = useState<Record<number, { quantity: string }>>(
    {}
  );

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

        const initialInputs: Record<number, any> = {};
        response.data.data.forEach((item: Stock, idx: number) => {
          initialInputs[idx] = { quantity: item.number_of_sacks.toString() };
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

  const handleInputChange = (idx: number, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], quantity: value },
    }));
  };

  const handleAddItem = (idx: number) => {
    const item = stock[idx];
    const itemInputs = inputs[idx];
    if (!itemInputs) return;

    const quantity = Number(itemInputs.quantity || "0");

    if (quantity <= 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Quantity",
        text: "Please enter a quantity greater than 0",
      });
      return;
    }
    if (quantity > item.number_of_sacks) {
      Swal.fire({
        icon: "error",
        title: "Exceeds Available",
        text: `Maximum available: ${item.number_of_sacks} sacks`,
      });
      return;
    }

    const itemKey = `${item.token_no}-${item.customer_code}-${item.xunit}-${item.xfloor}-${item.xpocket}`;

    const newDeliveryItem: DeliveryItem = {
      token_no: item.token_no,
      customer_code: item.customer_code,
      customer_name: item.customer_name,
      xunit: item.xunit,
      xfloor: item.xfloor,
      xpocket: item.xpocket,
      quantity: quantity,
    };

    setDeliveryItems((prev) => [...prev, newDeliveryItem]);

    setAddedItems((prev) => {
      const newSet = new Set(prev);
      newSet.add(itemKey);
      return newSet;
    });

    setInputs((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], quantity: "" },
    }));
  };

  const handleChargeChange = (field: keyof ChargesForm, value: string) => {
    const numValue = value === "" ? 0 : Number(value);
    setCharges((prev) => ({
      ...prev,
      [field]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const handleRemoveItem = (index: number) => {
    const removedItem = deliveryItems[index];
    const itemKey = `${removedItem.token_no}-${removedItem.customer_code}-${removedItem.xunit}-${removedItem.xfloor}-${removedItem.xpocket}`;

    setDeliveryItems((prev) => prev.filter((_, i) => i !== index));

    setAddedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemKey);
      return newSet;
    });
  };

  const handleConfirmDelivery = async () => {
    if (deliveryItems.length === 0) {
      Swal.fire({
        icon: "error",
        title: "No Items",
        text: "Please add at least one item to deliver",
      });
      return;
    }

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
          setDeliveryItems([]);
          setAddedItems(new Set());
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

  const totalQuantity = deliveryItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Selection */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Stock Items{" "}
              <span className="ml-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                {" "}
                {
                  stock.filter(
                    (_, idx) =>
                      !addedItems.has(
                        `${stock[idx].token_no}-${stock[idx].customer_code}-${stock[idx].xunit}-${stock[idx].xfloor}-${stock[idx].xpocket}`
                      )
                  ).length
                }{" "}
                available
              </span>
            </h2>
          </div>

          <div className="p-4 max-h-[500px] overflow-y-auto">
            {stock.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                No stock available
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stock.map((item, idx) => {
                  const itemKey = `${item.token_no}-${item.customer_code}-${item.xunit}-${item.xfloor}-${item.xpocket}`;
                  const isAdded = addedItems.has(itemKey);
                  const itemInputs = inputs[idx] || { quantity: "" };

                  if (isAdded) return null;

                  return (
                    <div
                      key={`${item.token_no}-${idx}`}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.customer_name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {item.customer_code} • {item.xmobile}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900 dark:text-white bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                            {item.number_of_sacks}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                        {item.xunit} • {item.xfloor} • {item.xpocket}
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={0}
                          max={item.number_of_sacks}
                          value={itemInputs.quantity}
                          onChange={(e) =>
                            handleInputChange(idx, e.target.value)
                          }
                          placeholder="Qty"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleAddItem(idx)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Delivery Items & Charges */}
        <div className="space-y-6">
          {/* Delivery Items */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Delivery Items{" "}
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total: {totalQuantity} sacks
                </span>
              </h2>
            </div>

            <div className="p-4 max-h-[200px] overflow-y-auto">
              {deliveryItems.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No items added
                </p>
              ) : (
                <div className="space-y-1">
                  {deliveryItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {index + 1}.
                          </span>{" "}
                          {item.xunit}, {item.xfloor}, {item.xpocket} •{" "}
                          {item.quantity} sacks
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-700 ml-2 flex-shrink-0"
                      >
                        <RiDeleteBinLine size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Charges */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Charges & Deductions
              </h2>
            </div>

            <div className="p-4 space-y-3 grid grid-cols-3 gap-3">
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
                disabled={submitting || deliveryItems.length === 0}
                className="col-span-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded transition mt-2"
              >
                {submitting ? "Processing..." : "Complete Delivery"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryForm;
