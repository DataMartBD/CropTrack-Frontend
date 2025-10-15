/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useTranslation } from "react-i18next";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

interface BookingFormData {
  name: string;
  fatherName: string;
  mobile: string;
  village: string;
  postOffice: string;
  union: string;
  upazila: string;
  district: string;
  advanceAmount: number;
  totalBags: number;
}

interface District {
  district_name: string;
  district_bn: string;
}
interface Upazila {
  upazila_name: string;
  upazila_bn: string;
}
interface Union {
  union_name: string;
  union_bn: string;
}

interface Customer {
  customer_name: string;
  xmobile: string;
  father_name: string;
  district_name: string;
  upazila_name: string;
  union_name: string;
  post_office: string;
  village: string;
}

export default function NewBooking() {
  const { t } = useTranslation();

  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);

  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    fatherName: "",
    mobile: "",
    village: "",
    postOffice: "",
    union: "",
    upazila: "",
    district: "",
    advanceAmount: 0,
    totalBags: 0,
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

  const fetchUnions = async (district: string, upazila: string) => {
    const token = window.localStorage.getItem("jwtToken");
    if (!upazila && !district) {
      setUnions([]);
      return;
    }
    try {
      const response = await axios.get(
        `${api.base}/masterdata/geo/unions/${district}/${upazila}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUnions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching unions:", error);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "district") {
      setUnions([]);
      setUpazilas([]);
      fetchUpazila(value);
    }

    if (name === "upazila") {
      setUnions([]);
      fetchUnions(formData.district, value);
    }

    if (name === "mobile") {
      setFormData((prev) => ({
        ...prev,
        name: "",
        fatherName: "",
        district: "",
        upazila: "",
        union: "",
        postOffice: "",
        village: "",
      }));
      if (value.length === 11) {
        fetchCustomerData(value).then((customerData: Customer | undefined) => {
          if (customerData) {
            if (customerData.district_name) {
              fetchUpazila(customerData.district_name);
            }
            if (customerData.upazila_name) {
              fetchUnions(
                customerData.district_name,
                customerData.upazila_name
              );
            }
            setFormData((prev) => ({
              ...prev,
              name: customerData.customer_name || "",
              fatherName: customerData.father_name || "",
              district: customerData.district_name || "",
              upazila: customerData.upazila_name || "",
              union: customerData.union_name || "",
              postOffice: customerData.post_office || "",
              village: customerData.village || "",
            }));
          }
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataObj = {
      xname: formData.name,
      father_name: formData.fatherName,
      xmobile: formData.mobile,
      district_name: formData.district,
      upazila_name: formData.upazila,
      union_name: formData.union,
      post_office: formData.postOffice,
      village: formData.village,
      xadvance: formData.advanceAmount,
      xsack: formData.totalBags,
    };

    try {
      const token = window.localStorage.getItem("jwtToken");
      const response: any = await axios.post(
        `${api.base}/ops/bookings/create/`,
        dataObj,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success === true) {
        handleClear();
        toast.success("Booking created successfully!");
      } else {
        toast.error("Error creating booking.");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to create booking. Please check input."
      );
    }
  };

  const handleClear = () => {
    setDistricts([]);
    setUpazilas([]);
    setUnions([]);
    setFormData({
      name: "",
      fatherName: "",
      mobile: "",
      village: "",
      postOffice: "",
      upazila: "",
      district: "",
      advanceAmount: 0,
      totalBags: 0,
      union: "",
    });
  };

  return (
    <div>
      <PageMeta
        title="Booking - CropTrack"
        description="New Booking Page - CropTrack"
      />
      <PageBreadcrumb pageTitle="New Booking" />

      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 dark:border-gray-800 dark:bg-gray-900 xl:px-10">
        <Toaster position="bottom-right" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center text-[#1D2939] dark:text-white mb-10">
          {t("booking_new_header")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                label: t("mobile"),
                name: "mobile",
                type: "tel",
                placeholder: t("mobile_ph"),
              },
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
            <div>
              <label
                htmlFor="union"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                {t("union")}
              </label>
              <select
                id="union"
                name="union"
                value={formData.union}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                <option value="">{t("union")}</option>
                {unions.map((d) => (
                  <option key={d.union_name} value={d.union_name}>
                    {d.union_bn} - ({d.union_name})
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
                label: t("advance_amount"),
                name: "advanceAmount",
                type: "number",
                placeholder: t("advance_amount_ph"),
              },
              {
                label: t("total_sacks"),
                name: "totalBags",
                type: "number",
                placeholder: t("total_sacks_ph"),
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
