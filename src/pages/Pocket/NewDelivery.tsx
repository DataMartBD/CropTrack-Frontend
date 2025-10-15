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
    loan_payment: string;
    bank_interest: string;
    bank_interest_day: string;
    fanning_charge: string;
    remaining_sacks: string;

}

export default function NewDelivery() {
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
        pocket_no: "",
        loan_payment: "",
        bank_interest: "",
        bank_interest_day: "",
        fanning_charge: "",
        remaining_sacks: "",
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
            pocket_no: "",
            loan_payment: "",
            bank_interest: "",
            bank_interest_day: "",
            fanning_charge: "",
            remaining_sacks: "",
        });
    };

    return (
        <div>
            <PageMeta title="Delivery - CropTrack" description="New Certificate Page - CropTrack" />
            <PageBreadcrumb pageTitle="New Dekivery" />

            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-8 dark:border-gray-800 dark:bg-gray-900 xl:px-10">

                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center text-[#1D2939] dark:text-white mb-10">
                    {t("issue")}
                </h1>


                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        {[
                            { label: t('certificate_no'), name: "certificate_no", type: "text", placeholder: t('certificate_no'), disabled: false },
                            { label: t('loading_no'), name: "loading_no", type: "text", placeholder: "LOAD-4595", disabled: true },
                            // { label: t('booking_no'), name: "booking_no", type: "text", placeholder: "456545", disabled: true },
                            { label: t('date'), name: "date", type: "text", placeholder: "23-07-2025", disabled: true },
                            { label: t('phone'), name: "phone", type: "tel", placeholder: t('phone_ph') },
                            { label: t('name'), name: "name", type: "text", placeholder: t('name_ph'), disabled: true },                     
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
                                htmlFor="loan_payment"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('loan_payment')}
                            </label>
                            <input
                                id="loan_payment"
                                name="loan_payment"
                                type="text"
                                value={formData.loan_payment}
                                onChange={handleChange}
                                placeholder={t('loan_payment')}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="bank_interest_day"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('bank_interest_day')}
                            </label>
                            <input
                                id="bank_interest_day"
                                name="bank_interest_day"
                                type="text"
                                value={formData.bank_interest_day}
                                onChange={handleChange}
                                placeholder={t('bank_interest_day')}
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="bank_interest"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('bank_interest')}
                            </label>
                            <input
                                id="bank_interest"
                                name="bank_interest"
                                type="text"
                                value={formData.bank_interest}
                                onChange={handleChange}
                                placeholder={t('bank_interest')}
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
                                htmlFor="fanning_charge"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('fanning_charge')}
                            </label>
                            <input
                                id="fanning_charge"
                                name="fanning_charge"
                                type="text"
                                value={formData.fanning_charge}
                                onChange={handleChange}
                                placeholder={t('fanning_charge')}
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
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="remaining_sacks"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('remaining_sacks')}
                            </label>
                            <input
                                id="remaining_sacks"
                                name="remaining_sacks"
                                type="text"
                                value={formData.remaining_sacks}
                                onChange={handleChange}
                                placeholder={t('remaining_sacks')}
                                disabled
                                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#13725A] focus:outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="remainingAmount"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                            >
                                {t('remainingAmount')}
                            </label>
                            <input
                                id="remainingAmount"
                                name="remainingAmount"
                                type="text"
                                value={formData.remainingAmount}
                                onChange={handleChange}
                                disabled
                                placeholder={t('remainingAmount')}
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
