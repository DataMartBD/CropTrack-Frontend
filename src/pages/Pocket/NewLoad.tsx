import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
// import Input from "../../components/ui/input/Input";
import { useTranslation } from "react-i18next";

interface LoadingFormData {
    name: string;
    fatherName: string;
    phone: string;
    advanceAmount: string;
    total_sacks: string;
    potato_type: string;
    rent_per_sack: string;
    total_rent: string;
    remainingAmount: string;
    empty_sacks_no: string;
    empty_sacks_price: string;
    transportation: string;
    given_loan: string;
    total_amount: string;
    unit: string;
    floor: string;
    pocket_no: string;

}

export default function NewLoad() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<LoadingFormData>({
        name: "",
        fatherName: "",
        phone: "",
        advanceAmount: "",
        total_sacks: "",
        potato_type: "",
        rent_per_sack: "",
        total_rent: "",
        remainingAmount: "",
        empty_sacks_no: "",
        empty_sacks_price: "",
        transportation: "",
        given_loan: "",
        total_amount: "",
        unit: "",
        floor: "",
        pocket_no: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log(formData);
    };

    const handleClear = () => {
        setFormData({
            name: "",
            fatherName: "",
            phone: "",
            advanceAmount: "",
            total_sacks: "",
            potato_type: "",
            rent_per_sack: "",
            total_rent: "",
            remainingAmount: "",
            empty_sacks_no: "",
            empty_sacks_price: "",
            transportation: "",
            given_loan: "",
            total_amount: "",
            unit: "",
            floor: "",
            pocket_no: ""
        });
    };

    return (
        <div>
            <PageMeta title="Load - CropTrack" description="New Certificate Page - CropTrack" />
            <PageBreadcrumb pageTitle="New Load" />

            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 dark:border-gray-800 dark:bg-gray-900 xl:px-10">

                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center text-[#1D2939] dark:text-white mb-10">
                    {t("load_new_header")}
                </h1>


                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        {[
                            { label: t('certificate_no'), name: "certificate_no", type: "text", placeholder: t('certificate_no'), disabled: false },
                            { label: t('loading_no'), name: "loading_no", type: "text", placeholder: "LOAD-4595", disabled: true },
                            { label: t('booking_no'), name: "booking_no", type: "text", placeholder: "456545", disabled: true },
                            { label: t('date'), name: "date", type: "text", placeholder: "23-07-2025", disabled: true },
                            { label: t('phone'), name: "phone", type: "tel", placeholder: t('phone_ph') },
                            { label: t('name'), name: "name", type: "text", placeholder: t('name_ph'), disabled: true },
                            
                            // { label: t('village'), name: "village", type: "text", placeholder: t('village_ph') },
                            // { label: t('post_office'), name: "postOffice", type: "text", placeholder: t('post_office_ph') },
                            // { label: t('upazila'), name: "upazila", type: "text", placeholder: t('upazila_ph') },
                            // { label: t('district'), name: "district", type: "text", placeholder: t('district_ph') },
                            // { label: t('total_sacks'), name: "totalBags", type: "number", placeholder: t('total_sacks_ph') },
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
                                htmlFor="unit"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('unit')}
                            </label>
                            <select
                                id="unit"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            >
                                <option value="">{t('unit')}</option>
                                <option value="1">Unit 1</option>
                                <option value="2">Unit 2</option>
                                
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="floor"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('floor')}
                            </label>
                            <select
                                id="floor"
                                name="floor"
                                value={formData.floor}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            >
                                <option value="">{t('floor')}</option>
                                <option value="1">Floor 1</option>
                                <option value="2">Floor 2</option>
                                
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="pocket_no"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('pocket_no')}
                            </label>
                            <select
                                id="pocket_no"
                                name="pocket_no"
                                value={formData.pocket_no}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            >
                                <option value="">{t('pocket_no')}</option>
                                <option value="1">Pocket 54</option>
                                <option value="2">Pocket 55</option>
                                
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="total_sacks"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('total_sacks')}
                            </label>
                            <input
                                id="total_sacks"
                                name="total_sacks"
                                type="text"
                                value={formData.total_sacks}
                                onChange={handleChange}
                                placeholder={t('total_sacks_ph')}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="rent_per_sack"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('rent_per_sack')}
                            </label>
                            <input
                                id="rent_per_sack"
                                name="rent_per_sack"
                                type="text"
                                value={formData.rent_per_sack}
                                onChange={handleChange}
                                placeholder={t('rent_per_sack')}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="total_rent"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('total_rent')}
                            </label>
                            <input
                                id="total_rent"
                                name="total_rent"
                                type="text"
                                value={formData.total_rent}
                                onChange={handleChange}
                                placeholder={t('total_rent')}
                                disabled
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="advanceAmount"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('advance_rent')}
                            </label>
                            <input
                                id="advanceAmount"
                                name="advanceAmount"
                                type="text"
                                value={formData.advanceAmount}
                                onChange={handleChange}
                                placeholder={t('advance_rent')}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="remainingAmount"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('remaining_rent')}
                            </label>
                            <input
                                id="remainingAmount"
                                name="remainingAmount"
                                type="text"
                                value={formData.remainingAmount}
                                onChange={handleChange}
                                placeholder={t('remaining_rent')}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="empty_sacks_no"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('empty_sacks_no')}
                            </label>
                            <input
                                id="empty_sacks_no"
                                name="empty_sacks_no"
                                type="text"
                                value={formData.empty_sacks_no}
                                onChange={handleChange}
                                placeholder={t('empty_sacks_no')}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="empty_sacks_price"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('empty_sacks_price')}
                            </label>
                            <input
                                id="empty_sacks_price"
                                name="empty_sacks_price"
                                type="text"
                                value={formData.empty_sacks_price}
                                onChange={handleChange}
                                placeholder={t('empty_sacks_price')}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="transportation"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('transportation')}
                            </label>
                            <input
                                id="transportation"
                                name="transportation"
                                type="text"
                                value={formData.transportation}
                                onChange={handleChange}
                                placeholder={t('transportation')}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="given_loan"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('given_loan')}
                            </label>
                            <input
                                id="given_loan"
                                name="given_loan"
                                type="text"
                                value={formData.given_loan}
                                onChange={handleChange}
                                placeholder={t('given_loan')}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="total_amount"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('total_amount')}
                            </label>
                            <input
                                id="total_amount"
                                name="total_amount"
                                type="text"
                                value={formData.total_amount}
                                onChange={handleChange}
                                placeholder={t('total_amount')}
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
