import { useEffect, useState } from "react";
import axios from "axios";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Swal from "sweetalert2";

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  customer: any; // replace with proper Customer type if available
}

export default function EditCustomerModal({
  isOpen,
  onClose,
  onUpdated,
  customer,
}: EditCustomerModalProps) {
  const [districts, setDistricts] = useState<any[]>([]);
  const [upazilas, setUpazilas] = useState<any[]>([]);
  const [unions, setUnions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    xmobile: "",
    father_name: "",
    district_name: "",
    upazila_name: "",
    union_name: "",
    post_office: "",
    village: "",
    trade_license_number: "",
    tin_number: "",
    is_active: true, // <-- new field for active status
  });

  // Fetch districts
  const fetchDistricts = async () => {
    const token = window.localStorage.getItem("jwtToken");
    try {
      const response = await axios.get(
        `${api.base}/masterdata/geo/districts/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDistricts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch districts:", error);
    }
  };

  // Fetch upazilas
  const fetchUpazilas = async (district: string) => {
    const token = window.localStorage.getItem("jwtToken");
    if (!district) return;
    try {
      const response = await axios.get(
        `${api.base}/masterdata/geo/upazilas/${district}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUpazilas(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch upazilas:", error);
    }
  };

  // Fetch unions
  const fetchUnions = async (district: string, upazila: string) => {
    const token = window.localStorage.getItem("jwtToken");
    if (!district || !upazila) return;
    try {
      const response = await axios.get(
        `${api.base}/masterdata/geo/unions/${district}/${upazila}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnions(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch unions:", error);
    }
  };

  // Prefill form and fetch dependent dropdowns
  useEffect(() => {
    if (isOpen && customer) {
      setFormData({
        customer_name: customer.customer_name || "",
        xmobile: customer.xmobile || "",
        father_name: customer.father_name || "",
        district_name: customer.district_name || "",
        upazila_name: customer.upazila_name || "",
        union_name: customer.union_name || "",
        post_office: customer.post_office || "",
        village: customer.village || "",
        trade_license_number: customer.trade_license_number || "",
        tin_number: customer.tin_number || "",
        is_active: customer.is_active ?? true,
      });

      fetchDistricts().then(() => {
        if (customer.district_name) {
          fetchUpazilas(customer.district_name).then(() => {
            if (customer.upazila_name) {
              fetchUnions(customer.district_name, customer.upazila_name);
            }
          });
        }
      });
    }
  }, [isOpen, customer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === "checkbox") {
      // checkbox
      const checked = e.target.checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      // text/number/select
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "district_name") {
      setUpazilas([]);
      setUnions([]);
      if (value) fetchUpazilas(value);
    }

    if (name === "upazila_name") {
      setUnions([]);
      const district = formData.district_name;
      if (district && value) fetchUnions(district, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer?.customer_code) {
      Swal.fire({
        icon: "error",
        title: "Invalid customer record!",
        timer: 1000,
        showConfirmButton: false,
      });
      return;
    }

    setIsLoading(true);
    const token = window.localStorage.getItem("jwtToken");

    try {
      await axios.put(
        `${api.base}/masterdata/customers/update/${customer.customer_code}/`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Customer updated successfully",
        timer: 1000,
        showConfirmButton: false,
      });

      onUpdated();
      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error updating customer",
        text: error.response?.data?.message || "Failed to update customer",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[900px] m-4">
      <div className="no-scrollbar relative w-full max-w-[900px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Edit Customer
        </h4>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <div>
              <Label>
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <Label>
                Mobile <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                name="xmobile"
                value={formData.xmobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
              />
            </div>

            <div>
              <Label>Father's Name</Label>
              <Input
                type="text"
                name="father_name"
                value={formData.father_name}
                onChange={handleChange}
                placeholder="Enter father's name"
              />
            </div>

            <div>
              <Label>District</Label>
              <select
                name="district_name"
                value={formData.district_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">Select district</option>
                {districts.map((d) => (
                  <option key={d.district_code} value={d.district_name}>
                    {d.district_bn} ({d.district_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Upazila</Label>
              <select
                name="upazila_name"
                value={formData.upazila_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">Select upazila</option>
                {upazilas.map((u) => (
                  <option key={u.upazila_code} value={u.upazila_name}>
                    {u.upazila_bn} ({u.upazila_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Union</Label>
              <select
                name="union_name"
                value={formData.union_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">Select union</option>
                {unions.map((u) => (
                  <option key={u.union_code} value={u.union_name}>
                    {u.union_bn} ({u.union_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Post Office</Label>
              <Input
                type="text"
                name="post_office"
                value={formData.post_office}
                onChange={handleChange}
                placeholder="Enter post office"
              />
            </div>

            <div>
              <Label>Village</Label>
              <Input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="Enter village"
              />
            </div>

            <div>
              <Label>Trade License Number</Label>
              <Input
                type="text"
                name="trade_license_number"
                value={formData.trade_license_number}
                onChange={handleChange}
                placeholder="Enter trade license number"
              />
            </div>

            <div>
              <Label>TIN Number</Label>
              <Input
                type="text"
                name="tin_number"
                value={formData.tin_number}
                onChange={handleChange}
                placeholder="Enter TIN number"
              />
            </div>

            {/* Active Status Toggle */}
            <div className="flex items-center mt-2">
              <Label className="mr-4">Active Status</Label>
              <div
                className={`relative inline-block w-12 h-6 transition duration-200 ease-linear ${
                  formData.is_active ? "bg-green-500" : "bg-gray-300"
                } rounded-full cursor-pointer`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: !prev.is_active,
                  }))
                }
              >
                <span
                  className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ease-linear ${
                    formData.is_active ? "translate-x-6" : "translate-x-0"
                  }`}
                ></span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-[#13725A] text-white hover:bg-[#13503E] disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
