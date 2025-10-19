import { useEffect, useState } from "react";
import axios from "axios";
import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Swal from "sweetalert2";

const api = {
  base: import.meta.env.VITE_API_BASE_URL,
};

export default function AddCustomerModal({ isOpen, onClose, onAdded }: any) {
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [unions, setUnions] = useState([]);
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
    // bin_number: "",
    tin_number: "",
    customer_type: "Farmer",
  });

  // Fetch districts on mount
  useEffect(() => {
    if (isOpen) {
      fetchDistricts();
    }
  }, [isOpen]);

  const fetchDistricts = async () => {
    const token = window.localStorage.getItem("jwtToken");
    try {
      const response = await axios.get(
        `${api.base}/masterdata/geo/districts/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDistricts(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch districts:", error);
    }
  };

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

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "district_name") {
      setUpazilas([]);
      setUnions([]);
      fetchUpazilas(value);
    }

    if (name === "upazila_name") {
      setUnions([]);
      fetchUnions(formData.district_name, value);
    }
  };

  //  Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = window.localStorage.getItem("jwtToken");

    try {
      await axios.post(`${api.base}/masterdata/customers/create/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "Customer added successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      onAdded(); // refresh customer list
      onClose(); // close modal
      setFormData({
        customer_name: "",
        xmobile: "",
        father_name: "",
        district_name: "",
        upazila_name: "",
        union_name: "",
        post_office: "",
        village: "",
        trade_license_number: "",
        // bin_number: "",
        tin_number: "",
        customer_type: "Farmer",
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error adding customer",
        text: error.response?.data?.message || "Failed to add customer",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[900px] m-4">
      <div className="no-scrollbar relative w-full max-w-[900px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          Add New Customer
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

            {/* District dropdown */}
            <div>
              <Label>District</Label>
              <select
                name="district_name"
                value={formData.district_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">Select district</option>
                {districts.map((d: any) => (
                  <option key={d.district_name} value={d.district_name}>
                    {d.district_bn} ({d.district_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Upazila dropdown */}
            <div>
              <Label>Upazila</Label>
              <select
                name="upazila_name"
                value={formData.upazila_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">Select upazila</option>
                {upazilas.map((u: any) => (
                  <option key={u.upazila_name} value={u.upazila_name}>
                    {u.upazila_bn} ({u.upazila_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Union dropdown */}
            <div>
              <Label>Union</Label>
              <select
                name="union_name"
                value={formData.union_name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="">Select union</option>
                {unions.map((u: any) => (
                  <option key={u.union_name} value={u.union_name}>
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
            {/* <div>
              <Label>BIN Number</Label>
              <Input
                type="text"
                name="bin_number"
                value={formData.bin_number}
                onChange={handleChange}
                placeholder="Enter BIN number"
              />
            </div> */}
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
              {isLoading ? "Adding..." : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
