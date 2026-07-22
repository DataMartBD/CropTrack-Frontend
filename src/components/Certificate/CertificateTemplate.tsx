import React from "react";

export interface CertificateModel {
  created_at: string;
  updated_at: string;
  booking_no: string;
  token_no: string;
  customer_code: string;
  customer_name: string;
  xmobile: string;
  father_name: string;
  district_name: string;
  upazila_name: string;
  union_name: string;
  post_office: string;
  village: string;
  number_of_sacks: number;
  potato_type: string;
  rent_per_sack: number;
  total_rent: number;
  advance_rent: number;
  remaining_rent: number;
  number_of_empty_sacks: number;
  price_of_empty_sacks: number;
  transportation: number;
  given_loan: number;
  total_amount_taka: number;
  xstatus: string;
}

interface CertificateTemplateProps {
  data: CertificateModel;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <div
      id="certificate-print-area"
      className="p-8 bg-white text-black font-serif text-sm border border-gray-300 mx-auto"
      style={{
        width: "210mm",
        minHeight: "297mm",
        fontFamily: '"Noto Serif Bengali", serif',
      }} // A4 size approximation
    >
      {/* Header */}
      <div className="relative overflow-hidden text-center mb-6 py-6 px-4 bg-gradient-to-b from-green-50 to-white border-b-4 border-double border-green-800 rounded-t-lg">
        {/* Background Graphic Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h6 className="text-xs mb-1 font-medium text-zinc-600">
            বিসমিল্লাহির রাহমানির রাহিম
          </h6>

          <div className="inline-block px-3 py-0.5 mb-2 bg-green-800 text-white text-[10px] rounded-full tracking-wider uppercase">
            রাহ্‌বার এগ্রো কমপ্লেক্স (প্রাঃ) লিমিটেড এর অঙ্গ প্রতিষ্ঠান
          </div>

          <div className="flex justify-center items-center gap-4 mb-2">
            {/* Decorative Line Left */}
            <div className="hidden md:block h-px w-12 bg-green-800/30"></div>

            <h1 className="text-3xl font-black text-green-900 tracking-tight drop-shadow-sm">
              রাহ্‌বার হিমাগার (প্রাঃ) লিমিটেড ইউনিট - ৪
            </h1>

            {/* Decorative Line Right */}
            <div className="hidden md:block h-px w-12 bg-green-800/30"></div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-bold text-zinc-700">
              বটতলী, বীরগঞ্জ, দিনাজপুর।
            </p>
            <div className="flex gap-4 mt-1">
              <p className="text-xs font-semibold bg-white px-2 py-0.5 border border-zinc-200 rounded shadow-sm">
                <span className="text-green-800">মোবাইল:</span> ০১৭০১৮৮৯০৪,
                ০১৭৪০১৩৩১৪৪
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Graphic Ornament */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-green-800 rounded-t-full"></div>
      </div>

      {/* Title Bar */}
      <div className="grid grid-cols-3 items-center bg-green-100 border-y-2 border-green-800 py-1 px-4 mb-4">
        <div className="font-semibold text-left">হস্তান্তর নিষিদ্ধ</div>

        <div className="flex justify-center">
          <div className="font-bold text-lg bg-green-800 text-white px-4 py-1 rounded-full whitespace-nowrap">
            আলু সংরক্ষণ দলিল
          </div>
        </div>

        <div className="font-semibold text-md text-right">
          দলিল নংঃ {data.token_no}
        </div>
      </div>

      {/* Customer Details */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
        <div className="flex">
          <span className="w-32 font-semibold">তারিখঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {formatDate(data.created_at)}
          </span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold">কাস্টমার আইডিঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {data.customer_code}
          </span>
        </div>

        <div className="flex col-span-2">
          <span className="w-32 font-semibold">আলু দাতার নামঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {data.customer_name}
          </span>
        </div>

        <div className="flex col-span-2">
          <span className="w-32 font-semibold">পিতার নামঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {data.father_name}
          </span>
        </div>

        <div className="flex col-span-2">
          <span className="w-32 font-semibold">গ্রামঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1 mr-4">
            {data.village}
          </span>
          <span className="w-20 font-semibold">ডাকঘরঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {data.post_office}
          </span>
        </div>
        <div className="flex col-span-2">
          <span className="w-32 font-semibold">উপজেলাঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1 mr-4">
            {data.upazila_name}
          </span>
          <span className="w-20 font-semibold">জেলাঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {data.district_name}
          </span>
        </div>

        <div className="flex col-span-2">
          <span className="w-32 font-semibold">মোবাইল নংঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {data.xmobile}
          </span>
        </div>
        <div className="flex col-span-2">
          <span className="w-32 font-semibold">আলুর জাতঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {data.potato_type}
          </span>
        </div>
      </div>

      {/* Details Table */}
      <div className="mb-6">
        <h3 className="text-center font-bold text-white bg-green-800 py-1 mb-0 rounded-t-md">
          আলু জমার বিবরণ
        </h3>
        <table className="w-full border-collapse border border-gray-800 text-center text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-800 p-1">বস্তার সংখ্যা</th>
              <th className="border border-gray-800 p-1">প্রতি বস্তার ভাড়া</th>
              <th className="border border-gray-800 p-1">মোট ভাড়া</th>
              <th className="border border-gray-800 p-1">অগ্রিম ভাড়া</th>
              <th className="border border-gray-800 p-1">অবশিষ্ট ভাড়া</th>
              <th className="border border-gray-800 p-1">খালি বস্তার সংখ্যা</th>
              <th className="border border-gray-800 p-1">খালি বস্তার মূল্য</th>
              <th className="border border-gray-800 p-1">পরিবহণ</th>
              <th className="border border-gray-800 p-1">প্রদানকৃত লোন</th>
              <th className="border border-gray-800 p-1">সর্বমোট টাকা</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-800 p-2 h-16 align-middle font-bold">
                {data.number_of_sacks}
              </td>
              <td className="border border-gray-800 p-2 h-16 align-middle">
                {data.rent_per_sack}
              </td>
              <td className="border border-gray-800 p-2 h-16 align-middle">
                {data.total_rent}
              </td>
              <td className="border border-gray-800 p-2 h-16 align-middle">
                {data.advance_rent}
              </td>
              <td className="border border-gray-800 p-2 h-16 align-middle">
                {data.remaining_rent}
              </td>
              <td className="border border-gray-800 p-2 h-16 align-middle">
                {data.number_of_empty_sacks}
              </td>
              <td className="border border-gray-800 p-2 h-16 align-middle">
                {data.price_of_empty_sacks}
              </td>
              <td className="border border-gray-800 p-2 h-16 align-middle">
                {data.transportation}
              </td>
              <td className="border border-gray-800 p-2 h-16 align-middle">
                {data.given_loan}
              </td>
              <td className="border border-gray-800 p-2 h-16 align-middle font-bold">
                {data.total_amount_taka}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Delivery Table (Structure Only as per image usually implies this is filled later) */}
      {/* <div className="mb-8 opacity-50">
        <h3 className="text-center font-bold text-white bg-purple-800 py-1 mb-0 rounded-t-md">
          ডেলিভারী বিবরণ
        </h3>
        <table className="w-full border-collapse border border-gray-800 text-center text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-800 p-1">তারিখ</th>
              <th className="border border-gray-800 p-1">ডিও নং</th>
              <th className="border border-gray-800 p-1">ডেলিভারী বস্তা</th>
              <th className="border border-gray-800 p-1">বস্তার ভাড়া</th>
              <th className="border border-gray-800 p-1">খালি বস্তার সংখ্যা</th>
              <th className="border border-gray-800 p-1">Loan Repay</th>
              <th className="border border-gray-800 p-1">Total</th>
              <th className="border border-gray-800 p-1">Signature</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((_, i) => (
              <tr key={i}>
                <td className="border border-gray-800 p-2 h-8"></td>
                <td className="border border-gray-800 p-2 h-8"></td>
                <td className="border border-gray-800 p-2 h-8"></td>
                <td className="border border-gray-800 p-2 h-8"></td>
                <td className="border border-gray-800 p-2 h-8"></td>
                <td className="border border-gray-800 p-2 h-8"></td>
                <td className="border border-gray-800 p-2 h-8"></td>
                <td className="border border-gray-800 p-2 h-8"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      {/* Footer / Terms */}
      <div className="mt-12 flex justify-between items-end">
        <div className="text-center">
          <p className="border-t border-black px-4 pt-1 font-bold">
            অফিস সহকারী
          </p>
        </div>
        <div className="text-center">
          <p className="border-t border-black px-4 pt-1 font-bold">
            স্টোর কিপার
          </p>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-red-600 font-bold">
        বিঃদ্রঃ অফিস সহকারী ও স্টোর কিপারের স্বাক্ষর ব্যতিত এই দলিল বৈধ বলে
        বিবেচিত হবে না।
      </div>
    </div>
  );
};

export default CertificateTemplate;
