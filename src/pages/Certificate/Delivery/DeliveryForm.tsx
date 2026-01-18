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
  xinterestrate: number;
  xchgtot: number;
  xfanchgtpersack: number;
}

interface LoanStatus {
  principal: number;
  loan_pay: number;
  disbursement_date: string;
  days_elapsed: number;
  interest_rate: number;
  interest_amount: number;
  total_payable: number;
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
    xinterestrate: 0,
    xchgtot: 0,
    xfanchgtpersack: 0,
  });

  const [loanStatus, setLoanStatus] = useState<LoanStatus | null>(null);

  const [emptySackPrice, setEmptySackPrice] = useState<number>(0);
  const [rentPerSack, setRentPerSack] = useState<number>(0);

  useEffect(() => {
    const token = window.localStorage.getItem("jwtToken");
    const fetchEmptySackPrice = async () => {
      try {
        const res = await axios.get(
          `${api.base}/masterdata/rate/all-rent/EMPTY_SACK_PRICE/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success && res.data.data?.xrate) {
          console.log(res.data.data.xrate);
          setEmptySackPrice(res.data.data.xrate);
        }
      } catch (err) {
        console.error("Failed to fetch EMPTY_SACK_PRICE", err);
        setEmptySackPrice(0);
      }
    };
    const fetchRentPerSack = async () => {
      try {
        const res = await axios.get(
          `${api.base}/masterdata/rate/all-rent/RENT_PER_SACK/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success && res.data.data?.xrate) {
          setRentPerSack(res.data.data.xrate);
        }
      } catch (err) {
        console.error("Failed to fetch RENT_PER_SACK", err);
        setRentPerSack(0);
      }
    };
    fetchEmptySackPrice();
    fetchRentPerSack();
  }, []);

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
          initialQty[idx] = _.number_of_sacks;
          initialDeliveryQtyRef.current[idx] = _.number_of_sacks;
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

  useEffect(() => {
    if (stock.length > 0) {
      fetchLoanStatus();
    }
  }, [stock]);

  const fetchLoanStatus = async () => {
    const customerCode = stock[0]?.customer_code;
    const interestRate = charges.xinterestrate;
    const loanPay = charges.xpayloan;

    if (!customerCode) return;

    let url = `${api.base}/ops/loan-status/?customer_id=${customerCode}`;
    if (interestRate && interestRate > 0) {
      url += `&interest_rate=${interestRate}`;
    }
    if (loanPay && loanPay > 0) {
      url += `&loan_pay=${loanPay}`;
    }

    try {
      const token = window.localStorage.getItem("jwtToken");
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setLoanStatus(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch loan status", err);
    }
  };

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
    if (value === "") {
      setDeliveryQty((prev) => ({
        ...prev,
        [idx]: value as unknown as number,
      }));
      return;
    }

    let numValue = Number(value);
    if (isNaN(numValue)) numValue = 1;

    const max = stock[idx].number_of_sacks;
    const finalValue = Math.min(Math.max(numValue, 1), max);

    setDeliveryQty((prev) => ({
      ...prev,
      [idx]: finalValue,
    }));
  };

  const handleChargeChange = (field: keyof typeof charges, value: string) => {
    setCharges((prev) => ({
      ...prev,
      [field]: Number(value) || 0,
    }));
  };

  const totalDeliveryQty = Array.from(selectedItems).reduce(
    (sum, idx) => sum + (deliveryQty[idx] || 0),
    0
  );

  const totalFanningCharge = totalDeliveryQty * charges.xfanchgtpersack;
  const emptySacksCharge = charges.xemptysacks * emptySackPrice;
  const rentTotal = totalDeliveryQty * rentPerSack;
  const subtotal =
    charges.xpayloan +
    (loanStatus?.interest_amount || 0) +
    emptySacksCharge +
    // charges.xinterestrate +
    charges.xchgtot +
    totalFanningCharge +
    rentTotal;

  const isDeliveryValid =
    selectedItems.size > 0 &&
    totalDeliveryQty > 0 &&
    Array.from(selectedItems).every((idx) => (deliveryQty[idx] || 0) > 0);

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

    const result = await Swal.fire({
      title: "Confirm Delivery?",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Total Sacks:</strong> ${totalDeliveryQty}</p>
          <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)} Tk.</p>
          <p class="text-sm text-gray-500 mt-2">Are you sure you want to proceed with this delivery?</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d9488", // teal-600
      cancelButtonColor: "#6b7280", // gray-500
      confirmButtonText: "Yes, Confirm",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      const token = window.localStorage.getItem("jwtToken");
      const response = await axios.post(
        `${api.base}/ops/delivery-challan/create/`,
        {
          token_no: tokenNo,
          delivery_items: deliveryItems,
          xpayloan: Number(charges.xpayloan) || 0,
          xemptysack: Number(charges.xemptysacks) || 0,
          xemptsrate: Number(emptySackPrice) || 0,
          xemptysackchgtot: Number(emptySacksCharge) || 0,
          xinterest: Number(charges.xinterestrate) || 0,
          xinterestamt: loanStatus?.interest_amount || 0,
          xchgtot: Number(charges.xchgtot) || 0,
          xfanchg: Number(charges.xfanchgtpersack) || 0,
          xdtwotax: Number(rentTotal) || 0,
          xrate: Number(rentPerSack) || 0,
          xlineamt: Number(subtotal) || 0,
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
            xinterestrate: 0,
            xchgtot: 0,
            xfanchgtpersack: 0,
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Table - Left Side */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border-b border-l border-r border-gray-300 dark:border-gray-800">
          <div className="bg-slate-500 dark:bg-gray-600 rounded-t-lg border-gray-300 dark:border-gray-800 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="font-semibold text-white dark:text-white">
                Stock Items
              </h2>
              <p className="text-xs text-white dark:text-gray-400 mt-0.5">
                {selectedItems.size} selected
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-white dark:text-white">
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
                            onClick={(e) => e.stopPropagation()}
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
                            min={0}
                            max={item.number_of_sacks}
                            value={deliveryQty[idx]}
                            onChange={(e) => {
                              const rawValue = e.target.value;
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
            <div className="border-b bg-stone-500 dark:bg-gray-600 rounded-t-lg border-gray-300 dark:border-gray-800 px-4 py-2">
              <h3 className="font-semibold text-white dark:text-white">
                Summary
              </h3>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Pockets Selected:{" "}
                    <span className="ml-2 text-base font-semibold text-gray-900 dark:text-white leading-tight">
                      {selectedItems.size}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Total Delivery Qty:{" "}
                    <span className="ml-2 text-base font-semibold text-gray-900 dark:text-white leading-tight">
                      {totalDeliveryQty} sacks
                    </span>
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    Rent Total ({totalDeliveryQty} × {rentPerSack})
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {rentTotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    Interest Amount{" "}
                    {loanStatus?.days_elapsed
                      ? `(${loanStatus.days_elapsed} days)`
                      : ""}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(loanStatus?.interest_amount || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    Loan Pay
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(charges.xpayloan || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    Transportation Fee
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {charges.xchgtot.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    Empty Sacks ({charges.xemptysacks} × {emptySackPrice})
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {emptySacksCharge.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    Total Fanning Charge ({totalDeliveryQty} ×{" "}
                    {charges.xfanchgtpersack})
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {totalFanningCharge.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between items-center text-sm font-semibold">
                  <span className="text-gray-900 dark:text-white">
                    Subtotal
                  </span>
                  <span className="text-lg text-gray-900 dark:text-white">
                    {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Details Box */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border-b border-l border-r border-gray-300 dark:border-gray-800">
            <div className="border-b bg-zinc-600 dark:bg-gray-600 rounded-t-lg border-gray-300 dark:border-gray-800 px-6 py-2">
              <h2 className="font-semibold text-white dark:text-white">
                Loan Details
              </h2>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 lg:col-span-3">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Interest Rate
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={charges.xinterestrate || ""}
                      onChange={(e) =>
                        handleChargeChange("xinterestrate", e.target.value)
                      }
                      onBlur={fetchLoanStatus}
                      className="w-full pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center bg-gray-100 dark:bg-gray-700 px-2 rounded-r border border-gray-300 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-300 sm:text-xs">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6 lg:col-span-3">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Loan Pay
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={charges.xpayloan || ""}
                      onChange={(e) =>
                        handleChargeChange("xpayloan", e.target.value)
                      }
                      onBlur={fetchLoanStatus}
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center bg-gray-100 dark:bg-gray-700 px-2 rounded-r border border-gray-300 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-300 sm:text-xs">
                        Tk.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6 lg:col-span-3">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Payable with Interest
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      disabled
                      value={
                        loanStatus ? loanStatus.total_payable.toFixed(2) : ""
                      }
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center bg-gray-200 dark:bg-gray-600 px-2 rounded-r border border-gray-300 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-300 sm:text-xs">
                        Tk.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6 lg:col-span-3">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Principal
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      disabled
                      value={loanStatus ? loanStatus.principal.toFixed(2) : ""}
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none "
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center bg-gray-200 dark:bg-gray-600 px-2 rounded-r border border-gray-300 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-300 sm:text-xs">
                        Tk.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Charges Box */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border-b border-l border-r border-gray-300 dark:border-gray-800">
            <div className="border-b bg-slate-600 dark:bg-gray-600 rounded-t-lg border-gray-300 dark:border-gray-800 px-6 py-2">
              <h2 className="font-semibold text-white dark:text-white">
                Other Charges
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 lg:col-span-4">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Empty Sacks
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={charges.xemptysacks || ""}
                      onChange={(e) =>
                        handleChargeChange("xemptysacks", e.target.value)
                      }
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center bg-gray-100 dark:bg-gray-700 px-2 rounded-r border border-gray-300 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-300 sm:text-xs">
                        Pcs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6 lg:col-span-4">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Transportation Fee
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={charges.xchgtot || ""}
                      onChange={(e) =>
                        handleChargeChange("xchgtot", e.target.value)
                      }
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center bg-gray-100 dark:bg-gray-700 px-2 rounded-r border border-gray-300 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-300 sm:text-xs">
                        Tk.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-12 lg:col-span-4">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Fanning Charge Per Sack
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      value={charges.xfanchgtpersack || ""}
                      onChange={(e) =>
                        handleChargeChange("xfanchgtpersack", e.target.value)
                      }
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center bg-gray-100 dark:bg-gray-700 px-2 rounded-r border border-gray-300 dark:border-gray-600">
                      <span className="text-gray-500 dark:text-gray-300 sm:text-xs">
                        Tk.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleConfirmDelivery}
              disabled={submitting || !isDeliveryValid}
              className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded transition shadow-md"
            >
              {submitting ? "Submitting..." : "Confirm Delivery"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryForm;
