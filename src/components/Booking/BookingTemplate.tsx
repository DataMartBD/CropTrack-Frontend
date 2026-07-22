import React from "react";

export interface BookingModel {
  create_date: string;
  created_at: string;
  updated_at: string;
  booking_no: string;
  customer_code: string;
  xmobile: string;
  xname: string;
  father_name: string;
  district_name: string;
  division_name: string | null;
  upazila_name: string;
  union_name: string;
  village: string;
  post_office: string;
  xadvance: string;
  xsack: number;
  xstatus: string;
  created_by: number;
  updated_by: number;
  business_id: number;
}

interface BookingTemplateProps {
  data: BookingModel;
}

const BookingTemplate: React.FC<BookingTemplateProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <div
      id="booking-print-area"
      className="p-8 bg-white text-black font-serif text-sm border border-gray-300 mx-auto"
      style={{
        width: "210mm",
        height: "296mm", // Slightly less than 297mm to avoid blank 2nd page
        fontFamily: '"Noto Serif Bengali", serif',
        boxSizing: "border-box",
        overflow: "hidden",
        margin: "0 auto",
      }}
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
            <div className="hidden md:block h-px w-12 bg-green-800/30"></div>
            <h1 className="text-3xl font-black text-green-900 tracking-tight drop-shadow-sm">
              রাহ্‌বার হিমাগার (প্রাঃ) লিমিটেড ইউনিট - ৪
            </h1>
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
            বুকিং রশিদ
          </div>
        </div>

        <div className="font-semibold text-md text-right">
          বুকিং নংঃ {data.booking_no}
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
        <div className="flex">
          <span className="w-32 font-semibold">তারিখঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {formatDate(data.create_date)}
          </span>
        </div>
        <div className="flex">
          <span className="w-32 font-semibold">কাস্টমার আইডিঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {data.customer_code}
          </span>
        </div>

        <div className="flex col-span-2">
          <span className="w-32 font-semibold">দাতার নামঃ</span>
          <span className="border-b border-dotted border-gray-600 flex-1">
            {data.xname}
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
      </div>

      {/* Booking Details Table */}
      <div className="mb-6">
        <h3 className="text-center font-bold text-white bg-green-800 py-1 mb-0 rounded-t-md">
          বুকিং ও অগ্রিম বিবরণ
        </h3>
        <table className="w-full border-collapse border border-gray-800 text-center text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-800 p-2">বস্তার সংখ্যা</th>
              <th className="border border-gray-800 p-2">অগ্রীম টাকা</th>

              <th className="border border-gray-800 p-2">মন্তব্য</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-800 p-4 font-bold text-lg">
                {data.xsack}
              </td>
              <td className="border border-gray-800 p-4 font-bold text-lg text-green-800">
                {Number(data.xadvance).toFixed(2)}
              </td>
              <td className="border border-gray-800 p-4"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer / Terms */}
      <div className="mt-12 flex justify-between items-end">
        <div className="text-center">
          <p className="border-t border-black px-4 pt-1 font-bold">
            গ্রাহকের স্বাক্ষর
          </p>
        </div>
        <div className="text-center">
          <p className="border-t border-black px-4 pt-1 font-bold">
            কর্তৃপক্ষের স্বাক্ষর
          </p>
        </div>
      </div>

      <div className="mt-8 text-[11px] text-zinc-600 leading-relaxed border-t border-zinc-200 pt-4">
        <p className="font-bold text-red-600 mb-1">সতর্কবার্তা :</p>
        <p>
          আলু সংরক্ষণের সময় এই রশিদের বিনিময়ে হিমাগার কর্তৃপক্ষের নিকট হতে আলু
          সংরক্ষণ দলিল নিতে হবে অন্যথায় এই রশিদ কার্যকর হবে না।
        </p>
      </div>
    </div>
  );
};

export default BookingTemplate;
