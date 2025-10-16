/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "react-router";

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

interface CertificateFormData {
  name: string;
  fatherName: string;
  mobile: string;
  village: string;
  postOffice: string;
  upazila: string;
  district: string;
  advance_rent: number;
  totalBags: number;
  rent_per_sack: number;
  total_rent: number;
  total_amount_taka: number;
  booking_no: string;
  potato_type: string;
  token_no: string;
  number_of_empty_sacks: number;
}

interface District {
  district_name: string;
  district_bn: string;
}
interface Upazila {
  upazila_name: string;
  upazila_bn: string;
}

interface Customer {
  customer_name: string;
  xmobile: string;
  father_name: string;
  district_name: string;
  upazila_name: string;
  post_office: string;
  village: string;
}

interface BookingModel {
  create_date: string;
  created_at: string;
  updated_at: string;
  booking_no: string;
  customer_code: string;
  xmobile: string;
  xname: string;
  district_name: string;
  upazila_name: string;
  union_name: string;
  xadvance: string;
  xsack: number;
  xstatus: string;
  created_by: string;
  updated_by: string;
  business_id: string;
}

export default function NewCertificate() {
  const [searchParams] = useSearchParams();
  const tokenNoFromUrl = searchParams.get("token_no");

  const { t } = useTranslation();
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);

  const [bookings, setBookings] = useState<BookingModel[]>([]);

  const [formData, setFormData] = useState<CertificateFormData>({
    name: "",
    fatherName: "",
    mobile: "",
    village: "",
    postOffice: "",
    upazila: "",
    district: "",
    advance_rent: 0,
    totalBags: 0,
    rent_per_sack: 0.0,
    total_rent: 0.0,
    total_amount_taka: 0.0,
    booking_no: "",
    potato_type: "",
    token_no: "",
    number_of_empty_sacks: 0,
  });

  useEffect(() => {
    const fetchDistricts = async () => {
      const token = window.localStorage.getItem("jwtToken");
      try {
        const response = await axios.get(
          `${api.base}/masterdata/geo/districts/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDistricts(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchRentPerSack = async () => {
      const token = window.localStorage.getItem("jwtToken");
      try {
        const response = await axios.get(
          `${api.base}/masterdata/rate/all-rent/RENT_PER_SACK/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const rentRate = response.data.data?.xrate || 0;
        setFormData((prev) => ({
          ...prev,
          rent_per_sack: rentRate,
        }));
      } catch (error) {
        console.error("Failed to fetch rent per sack:", error);
      }
    };
    fetchRentPerSack();
  }, []);

  useEffect(() => {
    if (tokenNoFromUrl) {
      setFormData((prev) => ({
        ...prev,
        token_no: tokenNoFromUrl,
      }));

      fetchToken(tokenNoFromUrl).then((bags) => {
        setFormData((prev) => ({
          ...prev,
          totalBags: bags,
        }));
      });
    }
  }, [tokenNoFromUrl]);

  const fetchUpazila = async (district: string) => {
    const token = window.localStorage.getItem("jwtToken");
    if (!district) {
      setUpazilas([]);
      return;
    }
    try {
      const response = await axios.get(
        `${api.base}/masterdata/geo/upazilas/${district}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUpazilas(response.data.data || []);
    } catch (error) {
      console.error("Error fetching upazilas:", error);
    }
  };

  const fetchCustomerData = async (mobile: string) => {
    const token = window.localStorage.getItem("jwtToken");
    if (!mobile) {
      return;
    }
    try {
      const response = await axios.get(`${api.base}/ops/customers/search/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          xmobile: mobile.trim(),
        },
      });
      return response.data.data || {};
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };

  const fetchBookings = async (xmobile: string) => {
    const token = window.localStorage.getItem("jwtToken");
    try {
      const response = await axios.get(`${api.base}/ops/bookings/list/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          xstatus: "Pending",
          xmobile: xmobile.trim(),
        },
      });
      setBookings(response.data.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const fetchToken = async (token_no: string) => {
    const token = window.localStorage.getItem("jwtToken");
    try {
      const response = await axios.get(`${api.base}/ops/token/counted/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          token_no: token_no.trim(),
        },
      });
      const tokenArr = response.data?.data;
      return tokenArr[0]?.xsack || 0;
    } catch (error) {
      console.error("Error fetching token:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const recalculateAmounts = (
      data: CertificateFormData
    ): CertificateFormData => {
      const total_rent = Number(data.rent_per_sack) * Number(data.totalBags);
      const total_amount_taka = total_rent - Number(data.advance_rent);

      return {
        ...data,
        total_rent,
        total_amount_taka,
      };
    };

    if (name === "district") {
      setUpazilas([]);
      fetchUpazila(value);
    }

    if (name === "mobile") {
      setFormData((prev) => ({
        ...prev,
        name: "",
        fatherName: "",
        district: "",
        upazila: "",
        postOffice: "",
        village: "",
        mobile: value,
      }));

      setBookings([]);
      if (value.length === 11) {
        fetchBookings(value);
        fetchCustomerData(value).then((customerData: Customer | undefined) => {
          if (customerData) {
            if (customerData.district_name) {
              fetchUpazila(customerData.district_name);
            }
            setFormData((prev) => ({
              ...prev,
              name: customerData.customer_name || "",
              fatherName: customerData.father_name || "",
              district: customerData.district_name || "",
              upazila: customerData.upazila_name || "",
              postOffice: customerData.post_office || "",
              village: customerData.village || "",
            }));
          }
        });
      }
      return;
    }

    if (name === "booking_no") {
      const selectedBooking = bookings.find(
        (booking) => booking.booking_no === value
      );

      if (selectedBooking) {
        setFormData((prev) => {
          const updated: CertificateFormData = {
            ...prev,
            booking_no: value,
            advance_rent: Number(selectedBooking.xadvance),
          };
          return recalculateAmounts(updated);
        });
      } else {
        setFormData((prev) => {
          const updated: CertificateFormData = {
            ...prev,
            booking_no: "",
            advance_rent: 0,
          };
          return recalculateAmounts(updated);
        });
      }
      return;
    }

    if (name === "totalBags") {
      setFormData((prev) => {
        const updated: CertificateFormData = {
          ...prev,
          totalBags: Number(value),
        };
        return recalculateAmounts(updated);
      });
      return;
    }

    if (name === "token_no") {
      const tokenNo = value;

      // Update token_no immediately
      setFormData((prev) => ({ ...prev, token_no: tokenNo }));

      const tokenPattern = /^\d{2}-\d{5,}$/;
      const isValid = tokenPattern.test(tokenNo);

      if (isValid) {
        fetchToken(tokenNo).then((bags) => {
          setFormData((prev) => {
            const updated: CertificateFormData = {
              ...prev,
              totalBags: bags,
              booking_no: "", // clear booking reference
              advance_rent: 0, // reset advance
            };
            return recalculateAmounts(updated);
          });
        });
      } else {
        setFormData((prev) => {
          const updated: CertificateFormData = {
            ...prev,
            totalBags: 0,
            booking_no: "",
            advance_rent: 0,
          };
          return recalculateAmounts(updated);
        });
      }

      return;
    }

    // Generic fallback for all other fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation checks
    const errors: string[] = [];

    const tokenPattern = /^\d{2}-\d{5,}$/;
    if (!tokenPattern.test(formData.token_no)) {
      errors.push("Invalid token number. Format must be like 25-00006.");
    }

    if (!formData.name.trim()) errors.push("Name is required.");
    if (!formData.fatherName.trim()) errors.push("Father's name is required.");
    if (!formData.village.trim()) errors.push("Village is required.");

    if (!/^\d{11}$/.test(formData.mobile)) {
      errors.push("Mobile number must be 11 digits.");
    }

    if (formData.totalBags <= 0)
      errors.push("Total bags must be greater than 0.");
    if (!formData.potato_type.trim()) errors.push("Potato type is required.");
    if (formData.rent_per_sack <= 0)
      errors.push("Rent per sack must be greater than 0.");
    if (formData.total_rent < 0) errors.push("Total rent cannot be negative.");
    if (formData.total_amount_taka < 0)
      errors.push("Total amount cannot be negative.");

    if (errors.length > 0) {
      errors.forEach((msg) => toast.error(msg));
      return;
    }

    const payLoad = {
      token_no: formData.token_no,
      booking_no: formData.booking_no,
      customer_name: formData.name,
      xmobile: formData.mobile,
      father_name: formData.fatherName,
      district_name: formData.district,
      upazila_name: formData.upazila,
      village: formData.village,
      post_office: formData.postOffice,
      number_of_sacks: formData.totalBags,
      potato_type: formData.potato_type,
      rent_per_sack: formData.rent_per_sack,
      total_rent: formData.total_rent,
      advance_rent: formData.advance_rent,
      total_amount_taka: formData.total_amount_taka,
      number_of_empty_sacks: formData.number_of_empty_sacks,
    };

    try {
      const token = window.localStorage.getItem("jwtToken");
      const response = await axios.post(
        `${api.base}/ops/certificates/create/`,
        payLoad,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success === true) {
        handleClear();
        toast.success("Certificate created successfully!");
      } else {
        toast.error("Error creating certificate.");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to create certificate. Please check input."
      );
    }
  };

  const handleClear = () => {
    setUpazilas([]);
    setFormData((prev) => ({
      name: "",
      fatherName: "",
      mobile: "",
      village: "",
      postOffice: "",
      upazila: "",
      district: "",
      advance_rent: 0,
      totalBags: 0,
      rent_per_sack: prev.rent_per_sack, // Keep the rent_per_sack value
      total_rent: 0.0,
      total_amount_taka: 0.0,
      booking_no: "",
      potato_type: "",
      token_no: "",
      number_of_empty_sacks: 0,
    }));
  };

  return (
    <div>
      <PageMeta
        title="Certificate - CropTrack"
        description="New Certificate Page - CropTrack"
      />
      <PageBreadcrumb pageTitle="New Certificate" />

      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 dark:border-gray-800 dark:bg-gray-900 xl:px-10">
        <Toaster position="bottom-right" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center text-[#1D2939] dark:text-white mb-10">
          {t("certificate_new_header")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
            {[
              {
                label: t("token"),
                name: "token_no",
                type: "text",
                placeholder: t("token"),
              },
              {
                label: t("mobile"),
                name: "mobile",
                type: "tel",
                placeholder: t("mobile_ph"),
              },
            ].map((input) => (
              <div key={input.name}>
                <label
                  htmlFor={input.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  {input.label}
                </label>
                <input
                  id={input.name}
                  name={input.name}
                  type={input.type}
                  value={(formData as any)[input.name]}
                  onChange={handleChange}
                  placeholder={input.placeholder}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>
            ))}
            <div>
              <label
                htmlFor="booking_no"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                {t("booking_no")}
              </label>
              <select
                id="booking_no"
                name="booking_no"
                value={formData.booking_no}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                <option value="">{t("select_booking")}</option>
                {bookings.map((booking) => (
                  <option key={booking.booking_no} value={booking.booking_no}>
                    {booking.booking_no} | {booking.create_date}
                  </option>
                ))}
              </select>
            </div>
            {[
              {
                label: t("name"),
                name: "name",
                type: "text",
                placeholder: t("name_ph"),
              },
              {
                label: t("fathers_name"),
                name: "fatherName",
                type: "text",
                placeholder: t("fathers_name_ph"),
              },
            ].map((input) => (
              <div key={input.name}>
                <label
                  htmlFor={input.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  {input.label}
                </label>
                <input
                  id={input.name}
                  name={input.name}
                  type={input.type}
                  value={(formData as any)[input.name]}
                  onChange={handleChange}
                  placeholder={input.placeholder}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>
            ))}
            <div>
              <label
                htmlFor="district"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                {t("district")}
              </label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                <option value="">{t("district")}</option>
                {districts.map((d) => (
                  <option key={d.district_name} value={d.district_name}>
                    {d.district_bn} - ({d.district_name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="upazila"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                {t("upazila")}
              </label>
              <select
                id="upazila"
                name="upazila"
                value={formData.upazila}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                <option value="">{t("upazila")}</option>
                {upazilas.map((d) => (
                  <option key={d.upazila_name} value={d.upazila_name}>
                    {d.upazila_bn} - ({d.upazila_name})
                  </option>
                ))}
              </select>
            </div>
            {[
              {
                label: t("post_office"),
                name: "postOffice",
                type: "text",
                placeholder: t("post_office_ph"),
              },
              {
                label: t("village"),
                name: "village",
                type: "text",
                placeholder: t("village_ph"),
              },
              {
                label: t("total_sacks"),
                name: "totalBags",
                type: "number",
                placeholder: t("total_sacks_ph"),
                disabled: true,
              },
            ].map((input) => (
              <div key={input.name}>
                <label
                  htmlFor={input.name}
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                >
                  {input.label}
                </label>
                <input
                  id={input.name}
                  name={input.name}
                  type={input.type}
                  value={(formData as any)[input.name]}
                  onChange={handleChange}
                  placeholder={input.placeholder}
                  disabled={input.disabled ?? false}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                />
              </div>
            ))}

            <div>
              <label
                htmlFor="potato_type"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                {t("potato_type")}
              </label>
              <select
                id="potato_type"
                name="potato_type"
                value={formData.potato_type}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                <option value="">{t("potato_type_def")}</option>
                <option value="ডায়মন্ড">ডায়মন্ড</option>
                <option value="কার্ডিনাল">কার্ডিনাল</option>
                <option value="স্টোরিজ">স্টোরিজ</option>
                <option value="দেশী">দেশী</option>
                <option value="গ্যানোলা">গ্যানোলা</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="rent_per_sack"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                {t("rent_per_sack")}
              </label>
              <input
                id="rent_per_sack"
                name="rent_per_sack"
                type="text"
                value={formData.rent_per_sack}
                onChange={handleChange}
                placeholder={t("rent_per_sack")}
                disabled
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label
                htmlFor="total_rent"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                {t("total_rent")}
              </label>
              <input
                id="total_rent"
                name="total_rent"
                type="text"
                value={formData.total_rent}
                onChange={handleChange}
                placeholder={t("total_rent")}
                disabled
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label
                htmlFor="advanceAmount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                {t("advance_rent")}
              </label>
              <input
                id="advance_rent"
                name="advance_rent"
                type="text"
                value={formData.advance_rent}
                onChange={handleChange}
                placeholder={t("advance_rent")}
                disabled
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label
                htmlFor="total_amount_taka"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                {t("total_amount")}
              </label>
              <input
                id="total_amount_taka"
                name="total_amount_taka"
                type="text"
                value={formData.total_amount_taka}
                onChange={handleChange}
                placeholder={t("total_amount")}
                disabled
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              Clear
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-[#13725A] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#13503E] focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
