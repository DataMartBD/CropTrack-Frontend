/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
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

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

const DeliveryForm = ({ tokenNo }: DeliveryFormProps) => {
  const location = useLocation();

  const [stock, setStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [deliveryItems, setDeliveryItems] = useState<DeliveryItem[]>([]);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  // inputs state stores quantity as string to allow empty input
  const [inputs, setInputs] = useState<
    Record<
      number,
      {
        quantity: string;
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
        response.data.data.forEach(
          (
            // item: Stock,
            idx: number
          ) => {
            initialInputs[idx] = {
              quantity: "", // empty string instead of 0
            };
          }
        );
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

  const handleInputChange = (idx: number, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        quantity: value,
      },
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
        title: "Error",
        text: "Please enter a valid quantity",
      });
      return;
    }
    if (quantity > item.number_of_sacks) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Cannot add more sacks than available",
      });
      return;
    }

    // Create a unique identifier for this stock item
    const itemKey = `${item.token_no}-${item.customer_code}-${item.xunit}-${item.xfloor}-${item.xpocket}`;

    // Add the item to the delivery items array
    const newDeliveryItem: DeliveryItem = {
      token_no: item.token_no,
      customer_code: item.customer_code,
      customer_name: item.customer_name,
      xunit: item.xunit,
      xfloor: item.xfloor,
      xpocket: item.xpocket,
      quantity: quantity,
    };

    setDeliveryItems((prev) => {
      const newItems = [...prev, newDeliveryItem];
      // Use setTimeout to prevent double toast in React.StrictMode
      //   setTimeout(() => {
      //     toast.success("Items added for delivery");
      //   }, 0);
      return newItems;
    });

    // Mark this item as added
    setAddedItems((prev) => {
      const newSet = new Set(prev);
      newSet.add(itemKey);
      return newSet;
    });

    // Reset the input field
    setInputs((prev) => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        quantity: "",
      },
    }));
  };

  const handleSubmitDelivery = async () => {
    if (deliveryItems.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please add at least one item to deliver",
      });
      return;
    }

    // Calculate total items and quantity for display
    const totalItems = deliveryItems.length;
    const totalQuantity = deliveryItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Create HTML content for the modal showing delivery items
    const itemsHtml = deliveryItems
      .map((item, index) => {
        return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.customer_name}</td>
          <td>${item.xunit}, ${item.xfloor}, ${item.xpocket}</td>
          <td>${item.quantity} sacks</td>
        </tr>
      `;
      })
      .join("");

    const result = await Swal.fire({
      title: "Process Delivery",
      html: `
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">Delivery Summary</h3>
          <p>Total Items: ${totalItems} | Total Quantity: ${totalQuantity} sacks</p>
          
          <div class="mt-3 max-h-60 overflow-auto">
            <table class="w-full text-sm text-left">
              <thead class="text-xs uppercase bg-gray-100">
                <tr>
                  <th class="px-2 py-2">#</th>
                  <th class="px-2 py-2">Customer</th>
                  <th class="px-2 py-2">Location</th>
                  <th class="px-2 py-2">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="loan-pay" class="block text-sm font-medium text-gray-700 text-left mb-1">Loan Pay</label>
            <input id="loan-pay" type="number" class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="0">
          </div>
          
          <div>
            <label for="empty-sacks" class="block text-sm font-medium text-gray-700 text-left mb-1">Number of Empty Sacks</label>
            <input id="empty-sacks" type="number" class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="0">
          </div>
          
          <div>
            <label for="empty-sacks-charge" class="block text-sm font-medium text-gray-700 text-left mb-1">Total Price of Empty Sacks</label>
            <input id="empty-sacks-charge" type="number" class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="0">
          </div>
          
          <div>
            <label for="interest-amount" class="block text-sm font-medium text-gray-700 text-left mb-1">Interest Amount</label>
            <input id="interest-amount" type="number" class="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="0">
          </div>
          
          <div>
            <label for="transportation-fee" class="block text-sm font-medium text-gray-700 text-left mb-1">Transportation Fee</label>
            <input id="transportation-fee" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="0">
          </div>
          
          <div>
            <label for="fanning-charge" class="block text-sm font-medium text-gray-700 text-left mb-1">Fanning Charge</label>
            <input id="fanning-charge" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="0">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Submit Delivery",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#4f46e5",
      preConfirm: () => {
        const popup = Swal.getPopup();
        if (!popup) return false;

        // Get all input values
        const loanPay = popup.querySelector("#loan-pay") as HTMLInputElement;
        const emptySacks = popup.querySelector(
          "#empty-sacks"
        ) as HTMLInputElement;
        const emptySacksCharge = popup.querySelector(
          "#empty-sacks-charge"
        ) as HTMLInputElement;
        const interestAmount = popup.querySelector(
          "#interest-amount"
        ) as HTMLInputElement;
        const transportationFee = popup.querySelector(
          "#transportation-fee"
        ) as HTMLInputElement;
        const fanningCharge = popup.querySelector(
          "#fanning-charge"
        ) as HTMLInputElement;

        // Convert values to numbers, defaulting to 0 if empty or invalid
        const getNumberValue = (input: HTMLInputElement) => {
          const value = input.value.trim();
          return value && !isNaN(Number(value)) ? Number(value) : 0;
        };

        return {
          xpayloan: getNumberValue(loanPay),
          xemptysacks: getNumberValue(emptySacks),
          xemptysackschgtot: getNumberValue(emptySacksCharge),
          xinterestamt: getNumberValue(interestAmount),
          xchgtot: getNumberValue(transportationFee),
          xfanchgtot: getNumberValue(fanningCharge),
        };
      },
    });

    if (result.isConfirmed && result.value) {
      // Destructure all the values from the form
      const {
        xpayloan,
        xemptysacks,
        xemptysackschgtot,
        xinterestamt,
        xchgtot,
        xfanchgtot,
      } = result.value;

      // For now, just console log the data as requested
      console.log({
        // Header information
        token_no: tokenNo,
        // stock: stock,

        // Delivery information
        delivery_items: deliveryItems,

        // Payment and charges information
        xpayloan,
        xemptysacks,
        xemptysackschgtot,
        xinterestamt,
        xchgtot,
        xfanchgtot,
      });

      // In the future, this would be an API call:

      try {
        const token = window.localStorage.getItem("jwtToken");
        const response = await axios.post(
          `${api.base}/ops/delivery-challan/create/`,
          {
            token_no: tokenNo,
            delivery_items: deliveryItems,
            xpayloan,
            xemptysacks,
            xemptysackschgtot,
            xinterestamt,
            xchgtot,
            xfanchgtot,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success === true) {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Delivery processed successfully!",
            confirmButtonText: "OK",
          }).then(() => {
            // Clear delivery items and refresh stock
            setDeliveryItems([]);
            setAddedItems(new Set()); // Clear the added items set
            fetchStock(tokenNo);
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error processing delivery.",
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

      // Show success message and clear the form
      //   Swal.fire({
      //     icon: "success",
      //     title: "Success",
      //     text: "Delivery processed successfully!",
      //     confirmButtonText: "OK",
      //   }).then(() => {
      //     // Clear delivery items and refresh stock
      //     setDeliveryItems([]);
      //     setAddedItems(new Set()); // Clear the added items set
      //     fetchStock(tokenNo);
      //   });
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {stock.length === 0 && (
          <p className="col-span-full">No stock data available.</p>
        )}
        {stock.map((item, idx) => {
          const itemInputs = inputs[idx] || {
            quantity: "",
          };

          // Create a unique identifier for this stock item
          const itemKey = `${item.token_no}-${item.customer_code}-${item.xunit}-${item.xfloor}-${item.xpocket}`;

          // Skip rendering this item if it's already been added to delivery
          if (addedItems.has(itemKey)) return null;

          return (
            <div
              key={`${item.token_no}-${idx}`}
              className="border rounded-lg shadow-sm bg-white dark:bg-gray-900 hover:shadow-md transition-shadow duration-200 p-3"
            >
              {/* Card Header - Horizontal layout for name and mobile */}
              <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate mr-2">
                    {item.customer_name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {item.xmobile}
                  </p>
                </div>
              </div>

              {/* Card Body - Compact layout */}
              <div className="mb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                  {/* Left Side: Unit, Floor, Pocket */}
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                    <span className="bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-full text-sm font-medium text-indigo-800 dark:text-indigo-200">
                      {item.xunit}
                    </span>
                    <span className="bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-full text-sm font-medium text-indigo-800 dark:text-indigo-200">
                      {item.xfloor}
                    </span>
                    <span className="bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-full text-sm font-medium text-indigo-800 dark:text-indigo-200">
                      {item.xpocket}
                    </span>

                    {/* Sacks Count Tag (Different Highlight) */}
                    <span className="bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 rounded-full text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {item.number_of_sacks} sacks
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer - Input and Add Button */}
              <div className="flex space-x-2 items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <label
                      htmlFor={`quantity-${idx}`}
                      className="text-xs font-medium text-gray-700 dark:text-gray-300 mr-2 whitespace-nowrap"
                    >
                      Qty:
                    </label>
                    <input
                      id={`quantity-${idx}`}
                      type="number"
                      min={0}
                      max={item.number_of_sacks}
                      value={itemInputs.quantity}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="0"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddItem(idx)}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-md px-3 py-1 text-sm font-medium transition flex items-center"
                >
                  <FaPlus className="mr-1 text-xs" /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delivery Items Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Delivery Items ({deliveryItems.length})
          </h2>
          <button
            onClick={handleSubmitDelivery}
            disabled={deliveryItems.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2 text-base font-semibold transition"
          >
            Process Delivery
          </button>
        </div>

        {deliveryItems.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No items added to delivery yet. Add items from the cards above.
          </p>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Floor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Pocket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {deliveryItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.customer_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.customer_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {item.xunit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {item.xfloor}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {item.xpocket}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {item.quantity} sacks
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          // Get the item being removed
                          const removedItem = deliveryItems[index];

                          // Create the unique key for this item
                          const itemKey = `${removedItem.token_no}-${removedItem.customer_code}-${removedItem.xunit}-${removedItem.xfloor}-${removedItem.xpocket}`;

                          // Remove from delivery items
                          setDeliveryItems((prev) =>
                            prev.filter((_, i) => i !== index)
                          );

                          // Remove from added items set to make it visible again
                          setAddedItems((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(itemKey);
                            return newSet;
                          });
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryForm;
